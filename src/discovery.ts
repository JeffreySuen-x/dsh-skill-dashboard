import { realpath, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export interface DiscoveredFolder { path: string; label: string }
export interface FolderDiscovery { folders: DiscoveredFolder[]; issues: string[] }

/** Probe known user-level roots only; the native provider owns skill parsing and watching. */
export async function discoverGlobalFolders(home = homedir(), env: NodeJS.ProcessEnv = process.env): Promise<FolderDiscovery> {
  const native = [join(env.DSH_HOME || join(home, '.dsh'), 'skills'), join(env.DSH_AGENTS_HOME || join(home, '.agents'), 'skills')]
  const seen = new Set(await Promise.all(native.map((path) => realpath(path).catch(() => path))))
  const candidates = [
    { label: 'Codex', path: join(env.CODEX_HOME || join(home, '.codex'), 'skills') },
    { label: 'Claude Code', path: join(env.CLAUDE_CONFIG_DIR || join(home, '.claude'), 'skills') },
    { label: 'Cursor', path: join(home, '.cursor', 'skills') },
    { label: 'Gemini CLI', path: join(home, '.gemini', 'skills') },
  ]
  const result: FolderDiscovery = { folders: [], issues: [] }
  for (const candidate of candidates) {
    try {
      const path = await realpath(candidate.path)
      if (seen.has(path) || !(await stat(path)).isDirectory()) continue
      seen.add(path)
      result.folders.push({ ...candidate, path })
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR'].includes((error as NodeJS.ErrnoException).code ?? ''))
        result.issues.push(`${candidate.label}：无法读取 ${candidate.path}`)
    }
  }
  return result
}
