import type { MarketListingEntry, MarketSearchResult } from '@deepseek-ai/dsh-plugin-market/types'
import type { InvocationDescriptor, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import type { LibraryFolder } from './library.ts'

export interface SkillSummaryView {
  name: string
  description: string
  source: string
  modelInvocable: boolean
  userInvocable: boolean
  enabled: boolean
  folder: string | null
}
export interface SkillListing {
  skills: SkillSummaryView[]
  folders: LibraryFolder[]
  discoveryIssues: string[]
}
export interface SkillDetail extends SkillSummaryView {
  content: string
  path: string | null
}

export const PACKAGE = 'skill-dashboard'
export const NAMESPACE = 'skillDossier'
export const INDEX_PATH = '/api/skill-dossier/index.json'
const fields = {
  list: ['sessionId'],
  catalogRevision: [],
  setEnabled: ['sessionId', 'name', 'enabled'],
  libraryAdd: ['path'],
  libraryRefresh: [],
  librarySetEnabled: ['path', 'enabled'],
  libraryRemove: ['path'],
  get: ['sessionId', 'name'],
  marketSources: [],
  marketAddBuiltin: [],
  marketAdd: ['url'],
  marketRemove: ['url'],
  marketSearch: ['url', 'text', 'offset', 'refresh', 'fetchedAt'],
  marketInstall: ['url', 'name', 'version', 'approvedBuilds'],
  marketSetEnabled: ['url', 'name', 'enabled'],
} as const
export type Method = keyof typeof fields
export type Args = Record<string, unknown>
export type Call = <T = unknown>(method: Method, args?: Args) => Promise<T>

export function parseArgs(method: Method, value: unknown): Args {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('参数必须是对象')
  const record = value as Args
  if (JSON.stringify(record).length > 16384) throw new Error('参数过长')
  for (const [key, item] of Object.entries(record)) {
    if (!(fields[method] as readonly string[]).includes(key)) throw new Error(`未知参数：${key}`)
    if (item === undefined) continue
    if (key === 'offset' || key === 'fetchedAt') {
      if (!Number.isSafeInteger(item) || (item as number) < 0) throw new Error('无效的分页')
      continue
    }
    if (key === 'refresh' || key === 'enabled') {
      if (typeof item !== 'boolean') throw new Error('无效的刷新参数')
      continue
    }
    if (key === 'approvedBuilds') {
      if (
        !Array.isArray(item) ||
        item.length > 50 ||
        item.some((v) => typeof v !== 'string' || v.length > 256)
      )
        throw new Error('无效的脚本授权')
      continue
    }
    if (typeof item !== 'string' || item.length > (key === 'url' || key === 'path' ? 4096 : 1000))
      throw new Error(`无效参数：${key}`)
  }
  for (const key of fields[method]) {
    if (['name', 'enabled', 'path', 'url', 'version'].includes(key) &&
        (record[key] === undefined || (typeof record[key] === 'string' && !record[key].trim())))
      throw new Error(`缺少参数：${key}`)
  }
  return record
}

export const remote: TypertRemoteContribution = {
  package: PACKAGE,
  descriptors: (Object.keys(fields) as Method[]).map(
    (method): InvocationDescriptor => ({
      id: `${NAMESPACE}/${method}`,
      namespace: NAMESPACE,
      service: NAMESPACE,
      method,
      invocation: { kind: 'direct' },
      parameters: [
        {
          name: 'args',
          wire: 'args',
          source: 'json',
          codec: {
            mode: 'strict',
            typeSymbol: `${method}Args`,
            create: () => ({ parse: (value) => parseArgs(method, value) }),
          },
        },
      ],
      result: { mode: 'strict', typeSymbol: 'unknown', create: () => ({ parse: (value) => value }) },
    }),
  ),
}

export type SkillMarketEntry = MarketListingEntry & { enabled: boolean; available: boolean }
export type SkillMarketResult = Omit<MarketSearchResult, 'entries'> & { entries: SkillMarketEntry[] }
