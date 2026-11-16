import { Service, type Context } from '@deepseek-ai/cordis'
import { bindTypertRemote } from '@deepseek-ai/dsh-typert-protocol'
import { NAMESPACE, remote, type Args } from './remote.ts'

class SkillManagerService extends Service {
  constructor(ctx: Context) {
    super(ctx, NAMESPACE)
  }
}

/** All management endpoints require an authenticated owner, including shared/global skill files. */
export function registerRemote(
  ctx: Context,
  handlers: Record<string, (args: any) => Promise<unknown>>,
): void {
  const service = new SkillManagerService(ctx) as Service & Record<string, unknown>
  for (const descriptor of remote.descriptors) {
    const handler = handlers[descriptor.method]
    if (handler === undefined) throw new Error(`Missing handler: ${descriptor.method}`)
    service[descriptor.method] = function (this: { ctx: Context }, args: Args) {
      if (this.ctx.invocation?.peer.principal.kind !== 'owner') throw new Error('仅设备所有者可以管理技能')
      return handler(args)
    }
  }
  service.typertRemote = bindTypertRemote(service, NAMESPACE)
  ctx.effect(() =>
    (ctx.typert as unknown as { register(value: unknown): () => void }).register({
      package: remote.package,
      face: 'host',
      schemas: [],
      model: { services: [], events: [], objects: [] },
      invocations: remote.descriptors,
    }),
  )
}
