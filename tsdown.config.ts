import { clientBundle } from './scripts/tsdown.client.ts'

export default clientBundle('dsh-skill-dashboard', ['lib/types/index.js'], {
  lib: { deps: { neverBundle: ['@deepseek-ai/dsh-typert-protocol', '@deepseek-ai/cordis', '@deepseek-ai/dsh-plugin-market', '@deepseek-ai/dsh-skill-filesystem'] } },
})
