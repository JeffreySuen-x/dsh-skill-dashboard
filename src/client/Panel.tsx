import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Button,
  Input,
  Modal,
  SegmentedTabs,
  Switch,
  Tag,
  PathLabel,
  Menu,
  IconRefreshOutlineRegular,
  IconPlusOutlineRegular,
  IconFolderOpenOutlineRegular,
  IconChevronDownOutlineRegular,
  IconChevronLeftOutlineRegular,
  IconChevronRightOutlineRegular,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { SkillManagerInjected } from './index.ts'
import type { SkillListing as Listing, SkillDetail as Detail } from '../remote.ts'
import { Discover } from './Discover.tsx'
import { ChoiceMenu } from './ChoiceMenu.tsx'
import { SkillIcon } from './Icon.tsx'
import css from './Panel.module.css'

const tabs = [
  {
    value: 'installed' as const,
    label: '已安装',
    id: 'skills-installed-tab',
    panelId: 'skills-installed-panel',
  },
  {
    value: 'discover' as const,
    label: '发现',
    id: 'skills-discover-tab',
    panelId: 'skills-discover-panel',
  },
] as const
export function Panel(props: SkillManagerInjected) {
  const session = props.useSessions((state) =>
    Object.values(state.byId).find((item) => (item.retainedBy.mainView ?? 0) > 0),
  )
  // A scope change unmounts every request, detail from the previous workspace.
  return (
    <WorkspacePanel
      key={session?.id ?? 'global'}
      {...props}
      sessionId={session?.id}
    />
  )
}
function WorkspacePanel({
  call,
  sessionId,
}: SkillManagerInjected & { sessionId: string | undefined }) {
  const [tab, setTab] = useState<'installed' | 'discover'>('installed')
  const [addMenu, setAddMenu] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [folder, setFolder] = useState('all')
  const [librariesOpen, setLibrariesOpen] = useState(false)
  const [folderPath, setFolderPath] = useState('')
  const [revision, setRevision] = useState(0)
  const [data, setData] = useState<Listing | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [manage, setManage] = useState(false)
  const [detailName, setDetailName] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const pageRef = useRef<HTMLElement>(null)
  const overviewScroll = useRef(0)
  const backRef = useRef<HTMLButtonElement>(null)
  useLayoutEffect(() => {
    if (pageRef.current) pageRef.current.scrollTop = showAll ? 0 : overviewScroll.current
    if (showAll) backRef.current?.focus({ preventScroll: true })
  }, [showAll])
  const alive = useRef(true)
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])
  useEffect(() => {
    let current = true
    setError('')
    void call<Listing>('list', { sessionId }).then(
      (value) => {
        if (current) setData(value)
      },
      (reason) => {
        if (current) setError(String(reason))
      },
    )
    return () => {
      current = false
    }
  }, [call, sessionId, revision])
  useEffect(() => {
    let disposed = false
    let previous: number | undefined
    let pending = false
    const check = async () => {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      try {
        const next = await call<number>('catalogRevision')
        if (!disposed && previous !== undefined && next !== previous) setRevision((n) => n + 1)
        previous = next
      } catch { /* Normal list requests surface connection failures. */ }
      finally { pending = false }
    }
    void check()
    const timer = window.setInterval(() => void check(), 2000)
    window.addEventListener('focus', check)
    return () => { disposed = true; window.clearInterval(timer); window.removeEventListener('focus', check) }
  }, [call])
  useEffect(() => {
    let current = true
    setDetail(null)
    if (!detailName) return
    void call<Detail | null>('get', { sessionId, name: detailName }).then(
      (value) => {
        if (current) {
          setDetail(value)
          if (!value) setError('该技能已不可用，请刷新列表')
        }
      },
      (reason) => {
        if (current) setError(String(reason))
      },
    )
    return () => {
      current = false
    }
  }, [call, sessionId, detailName, revision])
  const setEnabled = async (name: string, enabled: boolean) => {
    setBusy(true)
    setError('')
    try {
      await call('setEnabled', { sessionId, name, enabled })
      if (alive.current) setRevision((n) => n + 1)
    } catch (reason) {
      if (alive.current) setError(String(reason))
    } finally {
      if (alive.current) setBusy(false)
    }
  }
  const catalog = [...(data?.skills ?? [])].sort((a, b) => a.name.localeCompare(b.name))
  const visible = catalog.filter((skill) => !showAll || folder === 'all' || skill.folder === folder)
  const groups = [
    { id: 'builtin', title: '内置技能', skills: visible.filter((skill) => skill.source === 'bundled') },
    { id: 'installed', title: '已安装技能', skills: visible.filter((skill) => skill.source !== 'bundled') },
  ]
  const folderChoices = [...new Set(catalog.map((skill) => skill.folder).filter(Boolean))] as string[]
  const toggle = (name: string, enabled: boolean) => (
    <Switch
      label={`启用 ${name}`}
      checked={enabled}
      disabled={busy}
      onChange={(next) => void setEnabled(name, next)}
    />
  )
  const changeLibrary = async (method: 'libraryAdd' | 'librarySetEnabled' | 'libraryRemove' | 'libraryRefresh', path?: string, enabled?: boolean) => {
    setBusy(true)
    setError('')
    try {
      await call(method, { ...(path === undefined ? {} : { path }), ...(enabled === undefined ? {} : { enabled }) })
      if (!alive.current) return
      setRevision((n) => n + 1)
      if (method === 'libraryAdd') setFolderPath('')
      setFolder('all')
    } catch (reason) { if (alive.current) setError(String(reason)) }
    finally { if (alive.current) setBusy(false) }
  }
  return (
    <div className={css.surface}>
    <main ref={pageRef} className={css.page} aria-label={showAll ? '全部技能' : '技能'}>
      {showAll ? (
        <header className={css.allHeader}>
          <div className={css.backTitle}>
            <Button ref={backRef} variant="ghost" size="sm" aria-label="返回技能" icon={<IconChevronLeftOutlineRegular />}
              onClick={() => setShowAll(false)} />
            <h1>全部技能</h1>
          </div>
          <ChoiceMenu label="技能文件夹" size="sm" value={folder} onChange={setFolder}
            options={[{ value: 'all', label: '全部文件夹' }, ...folderChoices.map((path) => ({ value: path, label: path }))]} />
        </header>
      ) : <>
      <header className={css.header}>
        <div>
          <h1>技能</h1>
          <p>浏览、安装和管理你的技能</p>
        </div>
        {tab === 'installed' ? <div className={css.actions}>
          <Button
            variant="outline"
            icon={<IconRefreshOutlineRegular />}
            disabled={busy}
            onClick={() => void changeLibrary('libraryRefresh')}
          >
            刷新
          </Button>
          <div className={css.addGroup} role="group" aria-label="添加技能">
          <Button className={css.addPrimary}
            variant="primary"
            icon={<IconPlusOutlineRegular />}
            onClick={() => {
              setTab('discover')
              setManage(true)
            }}
          >
            添加技能
          </Button>
          <Menu open={addMenu} onClose={() => setAddMenu(false)} portal align="end"
            items={[{ id: 'libraries', label: '文件夹库', icon: <IconFolderOpenOutlineRegular /> }]}
            onSelect={() => { setAddMenu(false); setLibrariesOpen(true) }}
            anchor={<Button variant="primary" className={css.addToggle} aria-label="更多添加方式"
              aria-haspopup="menu" aria-expanded={addMenu} icon={<IconChevronDownOutlineRegular />}
              onClick={() => setAddMenu(!addMenu)} />} />
          </div>
        </div> : null}
      </header>
      <div className={css.navigation}>
        <SegmentedTabs
          size="sm"
          items={tabs}
          value={tab}
          onChange={setTab}
          label="技能页面"
          className={css.primaryTabs}
        />
      </div>
      </>}
      {!showAll && tab === 'discover' ? (
        <section id="skills-discover-panel" role="tabpanel" aria-labelledby="skills-discover-tab">
          <Discover
            call={call}
           
            manage={manage}
            onManage={setManage}
          />
        </section>
      ) : (
        <section id="skills-installed-panel" role={showAll ? undefined : 'tabpanel'} aria-labelledby={showAll ? undefined : 'skills-installed-tab'}>
          {error ? <p className={css.notice} role="alert">{error}</p> : null}
          {!data && !error ? <p className={css.hint}>加载中…</p> : null}
          {showAll && folder !== 'all' && data && !visible.length ? <p className={css.hint}>此文件夹暂无技能</p> : null}
          {groups.filter((group) => !showAll || folder === 'all' || group.skills.length > 0).map((group) => (
            <section className={css.skillGroup} key={group.id} aria-labelledby={`skills-${group.id}-heading`}>
              <div className={css.sectionHeader}>
                <h2 id={`skills-${group.id}-heading`}>{group.title}</h2>
                {!showAll && (group.id === 'installed' || group.skills.length > 6) ? (
                  <Button variant="ghost" className={css.moreLink} aria-label={`查看全部${group.title}`}
                    onClick={() => { overviewScroll.current = pageRef.current?.scrollTop ?? 0; setFolder('all'); setShowAll(true) }}>
                    更多 <IconChevronRightOutlineRegular />
                  </Button>
                ) : null}
              </div>
              {data && !group.skills.length ? <p className={css.hint}>
                {showAll && folder !== 'all' ? '此文件夹暂无技能' : group.id === 'builtin' ? '暂无内置技能' : '暂无已安装技能，可前往“发现”添加，或选择技能文件夹库。'}
              </p> : null}
              {(showAll ? group.skills : group.skills.slice(0, 6)).map((skill) => (
                <article className={css.row} key={skill.name}>
                  <span className={css.iconTile}>
                    <SkillIcon />
                  </span>
                  <button
                    className={css.rowMain}
                    onClick={() => {
                      setError('')
                      setDetailName(skill.name)
                    }}
                  >
                    <h3>
                      {skill.name}
                      {!skill.enabled ? (
                        <Tag tone="neutral" className={css.badge}>
                          已停用
                        </Tag>
                      ) : null}
                    </h3>
                    <p>{skill.description}</p>
                  </button>
                  {toggle(skill.name, skill.enabled)}
                </article>
              ))}
            </section>
          ))}
        </section>
      )}
      <Modal open={librariesOpen} onClose={() => setLibrariesOpen(false)} title="技能文件夹库" closeLabel="关闭"
        className={css.libraryDialog!} contentClassName={css.libraryBody!}
        description="自动发现本机技能，管理需要持续检索的文件夹。">
        <section className={css.librarySection} aria-label="自动发现">
          <div className={css.libraryHeading}>
            <h3>自动发现</h3>
            <Button variant="ghost" size="sm" icon={<IconRefreshOutlineRegular />} disabled={busy}
              onClick={() => void changeLibrary('libraryRefresh')}>重新检测</Button>
          </div>
          <div className={css.libraryRow}>
            <IconFolderOpenOutlineRegular />
            <div className={css.libraryInfo}><h4>DSH 默认目录</h4><p>工作区与用户目录中的 .dsh/skills、.agents/skills</p></div>
            <Tag tone="neutral">默认</Tag>
          </div>
          {(data?.folders ?? []).filter((item) => item.automatic).map((item) => (
            <div key={item.path} className={css.libraryRow}>
              <IconFolderOpenOutlineRegular />
              <div className={css.libraryInfo}><h4>{item.label}</h4><PathLabel path={item.path} /></div>
              <Switch label={`检索 ${item.path}`} checked={item.enabled} disabled={busy}
                onChange={(enabled) => void changeLibrary('librarySetEnabled', item.path, enabled)} />
            </div>
          ))}
          <p className={css.libraryHint}>自动检测 Codex、Claude Code、Cursor 和 Gemini CLI 的用户技能目录。</p>
          {data?.discoveryIssues?.map((issue) => <p key={issue} role="status" className={css.libraryHint}>{issue}</p>)}
        </section>
        <section className={css.librarySection} aria-label="其他文件夹">
          <div className={css.libraryHeading}><h3>其他文件夹</h3></div>
          {(data?.folders ?? []).filter((item) => !item.automatic).map((item) => (
            <div key={item.path} className={css.libraryRow}>
              <IconFolderOpenOutlineRegular />
              <div className={css.libraryInfo}><PathLabel path={item.path} /></div>
              <div className={css.libraryActions}>
                <Switch label={`检索 ${item.path}`} checked={item.enabled} disabled={busy}
                  onChange={(enabled) => void changeLibrary('librarySetEnabled', item.path, enabled)} />
                <Button variant="ghost" size="sm" disabled={busy} onClick={() => void changeLibrary('libraryRemove', item.path)}>移除</Button>
              </div>
            </div>
          ))}
          <form className={css.libraryForm} onSubmit={(event) => { event.preventDefault(); if (folderPath.trim() && !busy) void changeLibrary('libraryAdd', folderPath.trim()) }}>
            <Input aria-label="技能文件夹路径" placeholder="输入文件夹的绝对路径" value={folderPath} onChange={(event) => setFolderPath(event.target.value)} />
            <Button type="submit" variant="primary" disabled={busy || !folderPath.trim()}>添加</Button>
          </form>
          <p className={css.libraryHint}>启用后持续发现其中的技能。停用或移除文件夹不会删除文件。</p>
        </section>
        {error ? <p role="alert" className={css.notice}>{error}</p> : null}
      </Modal>
      <Modal
        open={detailName !== null}
        onClose={() => setDetailName(null)}
        title={detailName ?? '技能详情'}
        closeLabel="关闭"
        contentClassName={css.detail!}
      >
        {error ? (
          <p className={css.notice} role="alert">
            {error}
          </p>
        ) : null}
        {!detail && !error ? <p>读取技能…</p> : null}
        {detail ? <>
          <p>{detail.description}</p>
          <div className={css.actions}>
            {toggle(detail.name, detail.enabled)}
            <span>{detail.enabled ? '已启用' : '已停用'}</span>
          </div>
          <p className={css.hint}>{!detail.enabled ? '已停止向 AI 和用户提供此技能。' :
            detail.modelInvocable ? '可由 AI 根据任务自动选用。' :
            detail.userInvocable ? '此技能仅支持用户显式调用。' : '此技能未开放调用。'}</p>
          {detail.path ? <PathLabel path={detail.path} /> : null}
          {detail.content ? <details className={css.card}>
            <summary>技能说明</summary>
            <pre className={css.pre}>{detail.content}</pre>
          </details> : null}
        </> : null}
      </Modal>
    </main>
    </div>
  )
}
