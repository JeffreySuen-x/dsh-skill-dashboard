import { readFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import type { UserConfig } from 'tsdown'
import { transform } from 'lightningcss'
import { PLATFORM_MODULES } from './platform.ts'

/** DSH loads client factories from its shared module table; CSS belongs to that plugin's lifetime. */
export function clientBundle(
  id: string,
  entry: readonly string[],
  options: { lib?: UserConfig } = {},
): UserConfig[] {
  const root = process.cwd()
  const prefix = '\0dsh-css:'
  const external: readonly string[] = PLATFORM_MODULES
  return [
    {
      entry: [...entry],
      outDir: 'lib',
      format: 'esm',
      platform: 'node',
      target: 'es2024',
      clean: false,
      dts: false,
      fixedExtension: false,
      ...options.lib,
    },
    {
      entry: { client: 'src/client/index.ts' },
      outDir: 'lib',
      format: 'cjs',
      platform: 'browser',
      target: 'es2024',
      clean: false,
      dts: false,
      sourcemap: false,
      deps: { neverBundle: [...external], alwaysBundle: (id) => !external.includes(id) },
      define: { 'process.env.NODE_ENV': '"production"' },
      plugins: [
        {
          name: 'skill-dashboard-client-contract',
          resolveId(source, importer) {
            if (source.startsWith('@deepseek-ai/') && !external.includes(source)) {
              throw new Error(`Use a DSH service, not a second runtime: ${source}`)
            }
            if (!source.endsWith('.module.css') || !importer) return null
            const path = relative(root, resolve(dirname(importer), source)).replaceAll('\\', '/')
            return `${prefix}${path}.mjs`
          },
          async load(virtualId) {
            if (!virtualId.startsWith(prefix)) return null
            const path = virtualId.slice(prefix.length, -4)
            const file = resolve(root, path)
            this.addWatchFile(file)
            const css = transform({
              filename: `${id}/${path}`,
              code: await readFile(file),
              cssModules: { pattern: '[hash]_[local]' },
              minify: true,
            })
            const names = Object.fromEntries(
              Object.entries(css.exports ?? {}).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, value]) => [key, value.name]),
            )
            return `
          const key = ${JSON.stringify(`${id}/${path}`)};
          let style = document.querySelector('style[data-plugin-css=' + JSON.stringify(key) + ']');
          if (!style) {
            style = document.createElement('style');
            style.dataset.plugin = ${JSON.stringify(id)};
            style.dataset.pluginCss = key;
            document.head.append(style);
          }
          style.textContent = ${JSON.stringify(css.code.toString())};
          export default ${JSON.stringify(names)};
        `
          },
        },
      ],
      outputOptions: {
        entryFileNames: 'client.js',
        banner: `window.__ModuleLoader__.load({id:${JSON.stringify(id)},factory:(require)=>{`,
        intro: 'var module={exports:{}}; var exports=module.exports;',
        footer: 'return module.exports;}});',
      },
    },
  ]
}
