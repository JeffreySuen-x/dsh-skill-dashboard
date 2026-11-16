# DSH Skill Dashboard

[中文](README.md) | **English**

`dsh-skill-dashboard`

A plugin for DSH 0.2.2-rc.3 focused on **discovering, installing, and enabling or disabling skills**. MIT licensed.

- Automatically discovers local user skill directories for Codex, Claude Code, Cursor, and Gemini CLI. You can also add folders. DSH continues to manage its default skill directories.
- Maintains separate skill indexes while reusing DSH's native market and installer. Plugin-page indexes stay unchanged.
- Uses the native skill registry to control AI and user invocation. Re-enabling a skill loads the latest content from its original provider.
- Uses native buttons, switches, menus, and dialogs. Each group previews six skills; “More” (更多) opens the full list.

## Installation

Enter the path to the Release `.tgz` file in DSH's **Plugins → Add plugin** dialog, or run:

```sh
dsh plugin --profile desktop add ./dsh-skill-dashboard-0.5.2.tgz
```

Requires DSH `0.2.2-rc.3` and Node.js `^22.19.0 || >=24.0.0`. Verified on macOS; other platforms have not been tested.

Upgrading from `dsh-skill-dossier`: uninstall the old package from DSH's plugin page before installing this package to avoid duplicate registrations. Skill files and configuration paths remain unchanged.

## Usage

Open **Skills (技能)** in the sidebar to manage local skills. The dropdown beside **Add skill (添加技能)** opens the folder library. Folders use the `<name>/SKILL.md` structure. Removing a folder unregisters it without deleting its files.

Automatic discovery checks common user directories every 30 seconds, respects `CODEX_HOME` and `CLAUDE_CONFIG_DIR`, and deduplicates resolved paths. It does not scan the entire disk. DSH handles parsing, watching, and on-demand AI loading; discovery makes no model calls.

**Discover (发现)** accepts HTTP(S) JSON indexes using DSH's native `format: 1`. Entries declare `metadata.category: "skills"` and distribute standard DSH bundles. See the [example index](indexes/skills.json). Install only trusted sources; the native installer reports installation scripts and requests approval.

The plugin stores only current folder, index, and disabled-skill preferences in `$DSH_HOME/skill-manager/library.json` (default: `~/.dsh/skill-manager/library.json`). Management operations require the device owner. If an Agent's private skill layer prevents a global toggle from taking effect, the operation reports an error.

## Build

```sh
pnpm install --frozen-lockfile
pnpm build
npm pack
```

The release source archive excludes tests, historical documents, and local data. Skill bodies load on demand; lists contain summaries only. Dossier creation, review, load history, and recovery features are not included.

See [NOTICE](NOTICE.md) for dependency attribution and [LICENSE](LICENSE) for the license.
