/** Skill discovery, installation and invocation policy use native DSH services. */
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { FileSystem } from '@deepseek-ai/dsh-fs'
import type ShellExecutor from '@deepseek-ai/dsh-shell'
import type { SkillRegistry, SkillSummary } from '@deepseek-ai/dsh-skill'
import { mkdirCommand, skillFolderOf } from './files.ts'
import { registerRemote } from './remote-host.ts'
import { independentMarket, marketHandlers, registerBuiltinIndex } from './market.ts'
import { createSkillLibrary, DISABLED_PROVIDER } from './library.ts'
import { discoverGlobalFolders } from './discovery.ts'
import type { SkillListing, SkillDetail, SkillSummaryView } from './remote.ts'

export const name = 'skill-manager'
export const inject = ['skills', 'webServer', 'agents', 'fs', 'shell', 'typert', 'workingDirectory']
interface AgentLike { session: { header: { cwd: string } } }

export function apply(ctx: Context): void {
  const skills = ctx.get('skills') as SkillRegistry
  const agents = ctx.get('agents') as { get(id: string): AgentLike | undefined }
  const fs = ctx.get('fs') as FileSystem
  const shell = ctx.get('shell') as ShellExecutor
  const webServer = ctx.get('webServer') as { register(route: any): () => void }
  const workingDirectory = ctx.get('workingDirectory') as { get(session: AgentLike['session']): string }
  function viewOptions(sessionId: unknown) {
    const agent = typeof sessionId === 'string' ? agents.get(sessionId) : undefined
    return agent ? { scope: agent, cwd: workingDirectory.get(agent.session) } : {}
  }

  const dshHome = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const libraryPath = join(dshHome, 'skill-manager', 'library.json')
  const library = createSkillLibrary(ctx, skills, {
    discover: () => discoverGlobalFolders(),
    async read() { return fs.readText(await fs.resolve(libraryPath)) },
    async write(value) {
      const policy = { mode: 'workspace-write' as const, workspaceRoot: dshHome }
      const execution = await shell.execute(shell.resolve({
        command: mkdirCommand(dirname(libraryPath)), timeoutMs: 30_000,
        onExpiry: 'kill', sandboxPolicy: policy,
      }))
      const result = await execution.result()
      if (result.sandbox?.denied) throw new Error('技能配置写入被沙箱拒绝')
      if (result.exitCode !== 0) throw new Error(`无法创建技能配置目录：${result.stderr?.text ?? result.exitCode}`)
      await fs.writeText(await fs.resolve(libraryPath), value, undefined, undefined, policy)
    },
    async isDirectory(path) { return (await fs.stat(await fs.resolve(path)))?.type === 'directory' },
  })
  function summary(skill: SkillSummary): SkillSummaryView {
    return {
      name: skill.name, description: skill.description, source: skill.source,
      modelInvocable: skill.invocation.modelInvocable,
      userInvocable: skill.invocation.userInvocable,
      enabled: skill.provider !== DISABLED_PROVIDER,
      folder: skillFolderOf(skill) ?? null,
    }
  }
  const handlers = {
    async catalogRevision() { return library.revision() },
    async setEnabled(args: any) { return library.setEnabled(args.name, args.enabled, viewOptions(args.sessionId)) },
    async libraryAdd(args: any) { return library.addFolder(args.path) },
    async libraryRefresh() { await library.refresh(); return { ok: true } },
    async librarySetEnabled(args: any) { return library.setFolder(args.path, args.enabled) },
    async libraryRemove(args: any) { return library.setFolder(args.path, null) },
    async list(args: any): Promise<SkillListing> {
      const [catalog, preferences] = await Promise.all([
        skills.list(viewOptions(args.sessionId)), library.read(),
      ])
      return { skills: catalog.map(summary), folders: preferences.folders, discoveryIssues: preferences.discoveryIssues }
    },
    async get(args: any): Promise<SkillDetail | null> {
      const skill = await skills.get(args.name, viewOptions(args.sessionId))
      return skill ? { ...summary(skill), content: skill.content, path: skill.path ?? null } : null
    },
    ...marketHandlers(ctx, independentMarket(ctx, library)),
  }
  registerBuiltinIndex(ctx, webServer)
  registerRemote(ctx, handlers)
}
