import { createHash } from 'node:crypto'
import { realpath } from 'node:fs/promises'
import { isAbsolute } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { SkillRegistry, SkillSummary, SkillProviderControl } from '@deepseek-ai/dsh-skill'
import { FileSystemSkillProvider } from '@deepseek-ai/dsh-skill-filesystem'
import { isMissingFile } from './files.ts'
import type { FolderDiscovery } from './discovery.ts'

export interface LibraryFolder { path: string; enabled: boolean; label?: string; automatic?: boolean }

export interface SkillLibraryState {
  version: 1
  folders: { path: string; enabled: boolean }[]
  indexes: string[]
  disabled: Record<string, SkillSummary>
  automaticDisabled?: string[]
}
export interface LibraryStorage {
  read(): Promise<string>
  write(value: string): Promise<void>
  isDirectory(path: string): Promise<boolean>
  discover?: () => Promise<FolderDiscovery>
}
export const DISABLED_PROVIDER = 'skill-dossier-disabled'

/** Own only preferences. Discovery, YAML parsing, watching and invocation policy belong to DSH. */
export function createSkillLibrary(ctx: Context, skills: SkillRegistry, storage: LibraryStorage) {
  let state: SkillLibraryState = { version: 1, folders: [], indexes: [], disabled: {} }
  let revision = 0
  let control: SkillProviderControl | undefined
  let closed = false
  let discovered: FolderDiscovery = { folders: [], issues: [] }
  const folderPreferences = (): LibraryFolder[] => [
    ...discovered.folders.map((item) => ({ ...item, automatic: true,
      enabled: state.folders.find((folder) => folder.path === item.path)?.enabled ?? !state.automaticDisabled?.includes(item.path) })),
    ...state.folders.filter((item) => !discovered.folders.some((folder) => folder.path === item.path)),
  ]
  const folders = new Map<string, () => void>()
  const syncFolders = () => {
    if (closed) return
    const enabled = new Set(folderPreferences().filter((folder) => folder.enabled).map((folder) => folder.path))
    for (const [path, dispose] of folders) if (!enabled.has(path)) { dispose(); folders.delete(path) }
    for (const path of enabled) {
      if (folders.has(path)) continue
      const providerName = `skill-library-${createHash('sha256').update(path).digest('hex').slice(0, 12)}`
      folders.set(path, skills.registerProvider((lifetime) => {
        const provider = new FileSystemSkillProvider(ctx, lifetime, {
          providerName, includeDefaultRoots: false, customSkillDirs: [path], watch: true,
        })
        lifetime.signal.addEventListener('abort', () => { void provider.dispose() }, { once: true })
        return provider
      }))
    }
  }
  const ready = (async () => {
    try {
      const parsed = JSON.parse(await storage.read()) as SkillLibraryState
      if (parsed.version !== 1 || !Array.isArray(parsed.folders) || !Array.isArray(parsed.indexes) ||
          !parsed.disabled || typeof parsed.disabled !== 'object' || Array.isArray(parsed.disabled) ||
          (parsed.automaticDisabled !== undefined && (!Array.isArray(parsed.automaticDisabled) || parsed.automaticDisabled.some((path) => typeof path !== 'string'))))
        throw new Error('技能库配置损坏')
      state = parsed
    } catch (error) { if (!isMissingFile(error)) throw error }
    if (storage.discover) discovered = await storage.discover()
    if (!closed) syncFolders()
  })()
  void ready.catch(() => {}) // Consumers surface corrupt preferences; avoid an unhandled startup rejection.
  // A disabled entry masks invocation without moving bundled or user files.
  // Registry consumers already enforce both invocation flags.
  if (skills.registerProvider) skills.registerProvider((lifetime) => {
    control = lifetime
    return {
      name: DISABLED_PROVIDER,
      async list() {
        await ready
        return Object.values(state.disabled).map((skill) => ({
          ...skill, provider: DISABLED_PROVIDER, invocation: { modelInvocable: false, userInvocable: false },
          rank: -1, locator: skill.name,
        }))
      },
      async get(candidate) { return { ...candidate, content: '' } },
    }
  })
  ctx.on('skills/change', () => { revision += 1 })
  let discoveryPending: Promise<void> | undefined
  function refresh() {
    return discoveryPending ??= (async () => {
      await ready
      if (!storage.discover || closed) return
      const next = await storage.discover()
      if (closed || JSON.stringify(next) === JSON.stringify(discovered)) return
      discovered = next
      syncFolders()
      revision += 1
    })().finally(() => { discoveryPending = undefined })
  }
  ctx.effect(() => {
    const timer = storage.discover ? setInterval(() => { void refresh().catch(() => {}) }, 30_000) : undefined
    timer?.unref()
    return () => { closed = true; clearInterval(timer); for (const dispose of folders.values()) dispose(); folders.clear() }
  })
  let pending = Promise.resolve()
  function enqueue<T>(action: () => Promise<T>) {
    const operation = pending.then(async () => {
      await ready
      if (closed) throw new Error('技能服务已关闭')
      return action()
    })
    pending = operation.then(() => {}, () => {})
    return operation
  }
  async function save(next: SkillLibraryState) {
    await storage.write(JSON.stringify(next, null, 2))
    state = next
    syncFolders()
    control?.invalidate()
    revision += 1
  }
  function update(mutator: (next: SkillLibraryState) => void) {
    return enqueue(async () => {
      const next = structuredClone(state)
      mutator(next)
      await save(next)
    })
  }
  return {
    async read() { await ready; await pending; return structuredClone({ ...state, folders: folderPreferences(), discoveryIssues: discovered.issues }) },
    refresh,
    revision: () => revision,
    async setEnabled(name: string, enabled: boolean, options: Parameters<SkillRegistry['list']>[0]) {
      return enqueue(async () => {
        const skill = (await skills.list(options)).find((item) => item.name === name)
        const wasDisabled = Object.hasOwn(state.disabled, name)
        if (!skill && !wasDisabled) throw new Error('技能已不在目录中，请刷新')
        const scopeError = '该技能由当前 Agent 的独立技能层管理，请在对应 Agent 配置中调整'
        if (!enabled && wasDisabled) {
          if (skill?.provider !== DISABLED_PROVIDER) throw new Error(scopeError)
          return { ok: true }
        }
        const previous = state
        const next = structuredClone(state)
        if (enabled) delete next.disabled[name]
        else if (skill) next.disabled = { ...next.disabled, [name]: skill }
        await save(next)
        if (!enabled && (await skills.list(options)).find((item) => item.name === name)?.provider !== DISABLED_PROVIDER) {
          await save(previous)
          throw new Error(scopeError)
        }
        return { ok: true }
      })
    },
    async addFolder(input: string) {
      if (!isAbsolute(input)) throw new Error('请输入技能文件夹的绝对路径')
      const path = await realpath(input)
      if (!await storage.isDirectory(path)) throw new Error('所选路径不是文件夹')
      await update((next) => {
        if (discovered.folders.some((item) => item.path === path)) {
          next.automaticDisabled = (next.automaticDisabled ?? []).filter((item) => item !== path)
          next.folders = next.folders.filter((item) => item.path !== path)
          return
        }
        const old = next.folders.find((folder) => folder.path === path)
        if (old) old.enabled = true
        else next.folders.push({ path, enabled: true })
      })
      return { ok: true }
    },
    async setFolder(path: string, enabled: boolean | null) {
      await update((next) => {
        if (discovered.folders.some((item) => item.path === path)) {
          if (enabled === null) throw new Error('自动发现的目录可通过开关停用')
          next.folders = next.folders.filter((item) => item.path !== path)
          next.automaticDisabled = [...new Set([...(next.automaticDisabled ?? []).filter((item) => item !== path), ...(enabled ? [] : [path])])]
          return
        }
        const folder = next.folders.find((item) => item.path === path)
        if (!folder) throw new Error('技能文件夹未登记')
        if (enabled === null) next.folders = next.folders.filter((item) => item.path !== path)
        else folder.enabled = enabled
      })
      return { ok: true }
    },
    async setIndexes(indexes: string[]) { await update((next) => { next.indexes = indexes }) },
  }
}
export type SkillLibrary = ReturnType<typeof createSkillLibrary>
