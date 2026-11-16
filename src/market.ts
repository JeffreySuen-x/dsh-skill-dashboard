import { homedir } from 'node:os'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import type { Context } from '@deepseek-ai/cordis'
import PluginMarketService from '@deepseek-ai/dsh-plugin-market'
import type { SkillLibrary } from './library.ts'
import type { PluginManager as PluginManagerService } from '@deepseek-ai/dsh-plugin-manager'
import { INDEX_PATH, type SkillMarketResult } from './remote.ts'

// Only immutable public catalog data uses HTTP. All management uses authenticated Remote.
export function registerBuiltinIndex(ctx: Context, server: { register(route: any): () => void }): void {
  const body = readFileSync(new URL('../indexes/skills.json', import.meta.url), 'utf8')
  ctx.effect(() =>
    server.register({
      kind: 'exact',
      path: INDEX_PATH,
      handler(req: any, res: any) {
        res.setHeader('content-type', 'application/json; charset=utf-8')
        res.setHeader('cache-control', 'public, max-age=300')
        res.statusCode = req.method === 'GET' || req.method === 'HEAD' ? 200 : 405
        res.end(req.method === 'GET' ? body : '')
      },
    }),
  )
}

type MarketReader = Pick<PluginMarketService, 'listIndexes' | 'search' | 'entry' | 'setIndexes'>

/** Same native engine, isolated service identity and plugin-owned source preferences. */
export function independentMarket(ctx: Context, library: SkillLibrary): () => Promise<MarketReader> {
  let pending: Promise<MarketReader> | undefined
  return () => pending ??= (async (): Promise<MarketReader> => {
    const isolated = ctx.isolate('pluginMarket').isolate('webServer')
    const { indexes } = await library.read()
    const config = { indexes, detailCacheDir: join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'skill-manager', 'market-cache') }
    const fiber = isolated.plugin(PluginMarketService, config)
    await fiber.await()
    const service = () => {
      const value = isolated.get('pluginMarket')
      if (!value) throw new Error('技能索引服务尚未就绪')
      return value
    }
    return {
      listIndexes: () => service().listIndexes(),
      search: (url, query) => service().search(url, query),
      entry: (url, name) => service().entry(url, name),
      async setIndexes(urls) {
        for (const value of urls) {
          const url = new URL(value)
          if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
            throw new Error('请输入有效的 HTTP(S) 技能索引地址')
        }
        await library.setIndexes([...new Set(urls)])
        await fiber.update({ ...config, indexes: urls }, true)
      },
    }
  })().catch((error) => { pending = undefined; throw error })
}

export function marketHandlers(ctx: Context, market: () => Promise<MarketReader>) {
  // Serialize source changes so two windows cannot overwrite one another's additions.
  let changes = Promise.resolve()
  const changeSource = (url: string, remove: boolean) => {
    const operation = changes.then(async () => {
      const service = await market()
      const urls = service.listIndexes().map((index) => index.url)
      await service.setIndexes(remove ? urls.filter((value) => value !== url) : [...new Set([...urls, url])])
      return service.listIndexes()
    })
    changes = operation.then(
      () => {},
      () => {},
    )
    return operation
  }
  return {
    async marketSources() {
      const operation = changes.then(async () => {
        const service = await market()
        const server = ctx.get('webServer') as { getOrigin(): string } | undefined
        const current = server ? new URL(INDEX_PATH, server.getOrigin()).href : undefined
        const sources = service.listIndexes()
        // A desktop restart may bind a different port; local examples follow this host.
        const urls = sources.map((source) => {
          const url = new URL(source.url)
          return current &&
            ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) &&
            url.pathname === INDEX_PATH
            ? current
            : source.url
        })
        if (urls.some((url, index) => url !== sources[index]?.url))
          await service.setIndexes([...new Set(urls)])
        return service.listIndexes()
      })
      changes = operation.then(
        () => {},
        () => {},
      )
      return operation
    },
    async marketAddBuiltin() {
      const server = ctx.get('webServer') as { getOrigin(): string } | undefined
      if (!server) throw new Error('当前宿主不提供本地索引地址，请添加已托管的索引 URL')
      const url = new URL(INDEX_PATH, server.getOrigin()).href
      await changeSource(url, false)
      return url
    },
    async marketAdd(args: any) {
      return changeSource(args.url, false)
    },
    async marketRemove(args: any) {
      return changeSource(args.url, true)
    },
    async marketSearch(args: any): Promise<SkillMarketResult> {
      const manager = ctx.get('pluginManager') as PluginManagerService | undefined
      const [page, bundles] = await Promise.all([
        (await market()).search(args.url, {
          category: 'skills',
          text: args.text ?? '',
          sort: { kind: 'relevance' },
          offset: args.offset ?? 0,
          limit: 30,
          refresh: args.refresh === true,
          ...(args.fetchedAt !== undefined ? { fetchedAt: args.fetchedAt } : {}),
        }),
        manager?.listBundles() ?? [],
      ])
      const enabled = new Set(bundles.filter((bundle) => bundle.enabled).map((bundle) => bundle.name))
      return {
        ...page,
        entries: page.entries.map((entry) => ({
          ...entry,
          enabled: enabled.has(entry.name),
          available: bundles.some(
            (bundle) => bundle.name === entry.name && bundle.availability !== 'missing',
          ),
        })),
      }
    },
    async marketSetEnabled(args: any) {
      const entry = await (await market()).entry(args.url, args.name)
      if (entry?.metadata.category !== 'skills') throw new Error('索引中没有这个技能包')
      if (typeof args.enabled !== 'boolean') throw new Error('无效的开关状态')
      const manager = ctx.get('pluginManager') as PluginManagerService | undefined
      if (!manager) throw new Error('插件管理服务不可用')
      const bundle = (await manager.listBundles()).find((item) => item.name === entry.name)
      if (!bundle || bundle.availability === 'missing') throw new Error('请先安装技能包')
      if (
        args.enabled &&
        !entry.versions.some((item) => item.version === bundle.version && item.compatibility.compatible)
      )
        throw new Error('已安装版本与当前 DSH 不兼容，请在插件页更新')
      return manager.setBundleEnabled(entry.name, args.enabled)
    },
    async marketInstall(args: any) {
      const entry = await (await market()).entry(args.url, args.name)
      if (entry?.metadata.category !== 'skills') throw new Error('索引中没有这个技能包')
      const version = entry.versions.find((item) => item.version === args.version)
      if (!version?.compatibility.compatible) throw new Error('该版本与当前 DSH 不兼容')
      const manager = ctx.get('pluginManager') as PluginManagerService | undefined
      if (!manager) throw new Error('插件安装服务不可用')
      const existing = (await manager.listBundles()).find((bundle) => bundle.name === entry.name)
      if (existing && existing.availability !== 'missing' && existing.version === version.version && !args.approvedBuilds?.length) {
        return manager.setBundleEnabled(entry.name, true)
      }
      return manager.installBundle(version.install.spec, {
        saveExact: true,
        expected: { name: entry.name, version: version.version },
        ...(version.install.registry ? { registry: version.install.registry } : {}),
        ...(args.approvedBuilds ? { approvedBuilds: args.approvedBuilds } : {}),
      })
    },
  }
}
