# Sources and licenses

This plugin is independently implemented against DeepSeek Harness public service,
Remote, slot and UI primitive contracts, verified on DSH 0.2.2-rc.3
(commit 6b729fedde0c8fd03af7afdf5a711aa64fe87c3b).

- DeepSeek Harness: https://github.com/deepseek-ai/deepseek-harness (MIT).
  Runtime services and UI primitives are consumed from the host. The plugin does
  not distribute its own copy of Cordis or Typert.
- The initial skill index references the published MIT package
  `@deepseek-ai/dsh-experimental-badge-skill-bundle@0.2.2-rc.3`.
  npm metadata and the running DSH manifest were verified on 2026-11-16.
  The package is not vendored or installed automatically.

The sidebar icon and page layout are original, using DSH theme tokens and public
components. No third-party plugin market implementation is copied into this package.

Build tooling is not included in the runtime bundle. Lightning CSS (MPL-2.0)
is used only to compile the plugin's original CSS; no Lightning CSS source or
runtime is copied into this plugin. TypeScript (Apache-2.0) and tsdown (MIT)
are likewise build-time dependencies.
