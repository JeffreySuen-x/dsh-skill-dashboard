import { basename, dirname, isAbsolute } from 'node:path'

/** Folder filtering uses only paths returned by the native skill registry. */
export function skillFolderOf(skill: { name: string; path?: string }): string | undefined {
  if (!skill.path || !isAbsolute(skill.path)) return undefined
  if (basename(skill.path) === 'SKILL.md') return dirname(dirname(skill.path))
  if (basename(skill.path) === `${skill.name}.md`) return dirname(skill.path)
  return undefined
}

/** Native FS has atomic writes; its public contract has no directory-creation method. */
export function mkdirCommand(dir: string): string {
  return `mkdir -p '${dir.replaceAll("'", "'\\''")}'`
}

/** Node and DSH expose different missing-file codes at the I/O boundary. */
export function isMissingFile(error: unknown): boolean {
  return error !== null && typeof error === 'object' && 'code' in error &&
    (error.code === 'ENOENT' || error.code === 'FS_NOT_FOUND')
}
