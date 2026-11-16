import { createElement } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { remote, type Call } from '../remote.ts'
import { Panel } from './Panel.tsx'
import { SkillIcon } from './Icon.tsx'

export const inject = ['slots', 'remote']
export interface SkillManagerInjected extends PropsRuntime<'main'> {
  call: Call
}
export async function apply(ctx: Context): Promise<void> {
  const unmount = await ctx.remote.$mount(remote)
  ctx.effect(() => unmount)
  ctx.inject(['remote.skillDossier'], (ctx) => {
    const call: Call = async (method, args = {}) => {
      const result = await (ctx.remote as any).skillDossier[method](args)
      if (!result.ok) throw new Error(result.error?.message ?? result.error?.code ?? '连接失败')
      return result.value
    }
    ctx.slots.inject('sidebar.panellist', () =>
      ctx.slots.register(
        {
          name: 'sidebar.panellist',
          id: 'skills',
          order: -10,
          label: () => '技能管理',
        },
        SkillIcon,
      ),
    )
    ctx.slots.inject('main', () =>
      ctx.slots.register(
        {
          name: 'main',
          key: 'skills',
          inject: () => ({ call }),
        },
        (props) => createElement(Panel, props),
      ),
    )
  })
}
