import { useEffect, useRef, useState } from 'react'
import { Button, Input, Modal, Switch, PluginArtworkDefault, IconPlusOutlineRegular, IconRefreshOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import type { MarketIndexSummary } from '@deepseek-ai/dsh-plugin-market/types'
import type { ChangeResult } from '@deepseek-ai/dsh-plugin-manager/types'
import { type Call, type SkillMarketEntry, type SkillMarketResult } from '../remote.ts'
import { ChoiceMenu } from './ChoiceMenu.tsx'
import { SkillIcon } from './Icon.tsx'
import css from './Panel.module.css'

export function localized(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const text = value as Record<string, string>
    return text['zh-CN'] ?? text.zh ?? text.en ?? Object.values(text)[0] ?? fallback
  }
  return fallback
}
export function Discover({
  call,
  manage,
  onManage,
}: {
  call: Call
  manage: boolean
  onManage: (open: boolean) => void
}) {
  const [revision, setRevision] = useState(0)
  const [sources, setSources] = useState<MarketIndexSummary[]>([])
  const [selected, setSelected] = useState('')
  const [url, setUrl] = useState('')
  const [page, setPage] = useState<SkillMarketResult | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [install, setInstall] = useState<(SkillMarketEntry & { indexUrl: string }) | null>(null)
  const [result, setResult] = useState<ChangeResult | null>(null)
  const [changes, setChanges] = useState(0)
  const searchKey = `${selected}\n${revision}\n${changes}`
  const lastRefresh = useRef(revision)
  const currentSearch = useRef(searchKey)
  currentSearch.current = searchKey
  useEffect(() => {
    let current = true
    void call<MarketIndexSummary[]>('marketSources').then(
      (items) => {
        if (!current) return
        setSources(items)
        setSelected((old) => (items.some((item) => item.url === old) ? old : (items[0]?.url ?? '')))
      },
      (reason) => {
        if (current) setError(String(reason))
      },
    )
    return () => {
      current = false
    }
  }, [call, changes])
  useEffect(() => {
    let current = true
    setPage(null)
    if (!selected) return
    setError('')
    setNotice('')
    const refresh = lastRefresh.current !== revision
    lastRefresh.current = revision
    void call<SkillMarketResult>('marketSearch', { url: selected, refresh }).then(
      (value) => { if (current) setPage(value) },
      (reason) => { if (current) setError(String(reason)) },
    )
    return () => { current = false }
  }, [call, selected, revision, changes])
  const change = async (method: 'marketAdd' | 'marketRemove', value: string) => {
    setBusy(true)
    setError('')
    try {
      await call(method, { url: value.trim() })
      setSelected(method === 'marketAdd' ? value.trim() : '')
      setUrl('')
      setChanges((n) => n + 1)
    } catch (reason) {
      setError(String(reason))
    } finally {
      setBusy(false)
    }
  }
  const runInstall = async (approvedBuilds?: string[]) => {
    if (!install?.defaultVersion) return
    setBusy(true)
    setResult(null)
    setError('')
    try {
      const value = await call<ChangeResult>('marketInstall', {
        url: install.indexUrl,
        name: install.name,
        version: install.defaultVersion,
        ...(approvedBuilds ? { approvedBuilds } : {}),
      })
      setResult(value)
      setChanges((n) => n + 1)
    } catch (reason) {
      setError(String(reason))
    } finally {
      setBusy(false)
    }
  }
  const toggle = async (entry: SkillMarketEntry, enabled: boolean) => {
    setBusy(true)
    setError('')
    setNotice('')
    const key = searchKey
    try {
      const result = await call<ChangeResult>('marketSetEnabled', {
        url: selected,
        name: entry.name,
        enabled,
      })
      if (!['applied', 'restart-required'].includes(result.application))
        throw new Error(result.error?.diagnostic ?? '修改未完成')
      const next = await call<SkillMarketResult>('marketSearch', { url: selected })
      if (currentSearch.current !== key) return
      setPage(next)
      if (result.application === 'restart-required') setNotice('设置已保存，重启 DSH 后生效')
    } catch (reason) {
      if (currentSearch.current === key) setError(String(reason))
    } finally {
      setBusy(false)
    }
  }
  const more = async () => {
    if (!page || page.nextOffset === null) return
    setBusy(true)
    const key = searchKey
    try {
      const next = await call<SkillMarketResult>('marketSearch', {
        url: selected,
        offset: page.nextOffset,
        fetchedAt: page.fetchedAt,
      })
      if (currentSearch.current !== key) return
      setPage((current) =>
        current?.url === next.url ? { ...next, entries: [...current.entries, ...next.entries] } : current,
      )
    } catch (reason) {
      if (currentSearch.current === key) setError(String(reason))
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      {sources.length > 0 ? <div className={css.toolbar}>
        <div className={css.sourceLabel}>
          <span>索引来源</span>
          <ChoiceMenu
            label="索引来源"
            value={selected}
            onChange={setSelected}
            disabled={busy}
            options={sources.map((source) => ({
              value: source.url,
              label: localized(source.title, source.url),
            }))}
          />
        </div>
        <div className={css.actions}>
          <Button variant="ghost" disabled={busy} icon={<IconRefreshOutlineRegular />} onClick={() => setRevision((n) => n + 1)}>
            刷新
          </Button>
          <Button variant="ghost" onClick={() => onManage(true)}>
            管理索引
          </Button>
        </div>
      </div> : null}
      {error ? (
        <div className={css.notice} role="alert">
          {error}
        </div>
      ) : null}
      {notice ? (
        <p role="status" className={css.notice}>
          {notice}
        </p>
      ) : null}
      {!sources.length ? (
        <div className={css.empty}>
          <PluginArtworkDefault size={48} />
          <p className={css.emptyTitle}>还没有技能索引</p>
          <p>添加一个技能索引，即可在这里浏览和安装其中的技能</p>
          <Button variant="primary" size="sm" icon={<IconPlusOutlineRegular size={13} />} onClick={() => onManage(true)}>
            添加索引源
          </Button>
        </div>
      ) : null}
      {selected && !page && !error ? <p className={css.hint}>读取索引…</p> : null}
      {page ? (
        <>
          <h2>
            {localized(page.title)} <span className={css.muted}>{page.total}</span>
          </h2>
          {page.entries.length === 0 ? (
            <p className={css.hint}>没有匹配的技能包。该来源可能尚未声明“skills”分类。</p>
          ) : null}
          {page.entries.map((entry) => (
            <article className={css.row} key={entry.name}>
              <span className={css.iconTile}>
                <SkillIcon />
              </span>
              <div className={css.rowMain}>
                <h3>{localized(entry.title, entry.name)}</h3>
                <p>{localized(entry.description, entry.name)}</p>
                <small>{entry.defaultVersion ?? '暂无兼容版本'}</small>
              </div>
              {entry.available ? (
                <Switch
                  label={`启用 ${localized(entry.title, entry.name)}`}
                  checked={entry.enabled}
                  disabled={busy || (!entry.enabled && !entry.defaultVersion)}
                  title={!entry.enabled && !entry.defaultVersion ? '暂无兼容版本' : undefined}
                  onChange={(enabled) => void toggle(entry, enabled)}
                />
              ) : (
                <Button
                  variant="outline"
                  disabled={!entry.defaultVersion || busy}
                  onClick={() => {
                    setInstall({ ...entry, indexUrl: selected })
                    setResult(null)
                  }}
                >
                  安装
                </Button>
              )}
            </article>
          ))}
          {page.nextOffset !== null ? (
            <Button disabled={busy} onClick={() => void more()}>
              加载更多
            </Button>
          ) : null}
        </>
      ) : null}
      <Modal
        open={manage}
        onClose={() => onManage(false)}
        title="索引源"
        description="技能索引以一个索引文件的 URL 提供，「发现」从这里列出的索引浏览技能"
        closeLabel="关闭"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void change('marketAdd', url)
          }}
          className={css.sourceForm}
        >
          <Input
            data-modal-autofocus
            aria-label="索引 URL"
            placeholder="https://example.com/index.json"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button
            icon={<IconPlusOutlineRegular />}
            variant="primary"
            type="submit"
            disabled={busy || !url.trim()}
          >
            添加
          </Button>
        </form>
        {error ? (
          <p role="alert" className={css.notice}>
            {error}
          </p>
        ) : null}
        {sources.map((source) => (
          <div className={css.sourceRow} key={source.url}>
            <span>
              {localized(source.title, source.url)}
              <small>{source.url}</small>
            </span>
            <Button disabled={busy} onClick={() => void change('marketRemove', source.url)}>
              移除
            </Button>
          </div>
        ))}
      </Modal>
      <Modal
        open={install !== null}
        onClose={() => {
          if (!busy) setInstall(null)
        }}
        title={`安装 ${localized(install?.title, install?.name)}`}
        closeLabel="关闭"
        description={install?.defaultVersion ?? ''}
      >
        <p>技能包在本机以你的权限运行。确认信任该索引及发布者后安装。</p>
        {error ? (
          <p role="alert" className={css.notice}>
            {error}
          </p>
        ) : null}
        {result ? (
          <div role="status">
            <p>
              {result.application === 'applied'
                ? '已启用'
                : result.application === 'restart-required'
                  ? '已安装，重启 DSH 后生效'
                  : `安装未完成：${result.error?.diagnostic ?? result.error?.code ?? result.application}`}
            </p>
            {result.pendingBuilds?.length ? (
              <>
                <p>以下依赖需要运行安装脚本：{result.pendingBuilds.join('、')}</p>
                <Button
                  variant="primary"
                  disabled={busy}
                  onClick={() => void runInstall(result.pendingBuilds)}
                >
                  允许这些脚本并重试
                </Button>
              </>
            ) : null}
          </div>
        ) : (
          <Button variant="primary" disabled={busy} onClick={() => void runInstall()}>
            {busy ? '正在安装…' : '确认安装'}
          </Button>
        )}
      </Modal>
    </>
  )
}
