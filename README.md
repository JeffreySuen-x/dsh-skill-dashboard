# 技能管理 · skill-dashboard

**中文** | [English](README.en.md)

`skill-dashboard`

DSH 0.2.2-rc.3 插件，专注**发现、安装、启停**。MIT 开源。

- 自动发现本机 Codex、Claude Code、Cursor、Gemini CLI 用户技能目录，也可添加文件夹库。DSH 默认技能目录继续由宿主管理。
- 独立技能索引，复用 DSH 原生市场与安装服务，不改变插件页的索引。
- 使用原生技能注册表控制 AI 与用户调用；重新启用后读取原技能的最新内容。
- 原生按钮、开关、菜单与弹窗；首页每组预览六项，“更多”进入全部技能。

## 安装

将 Release 的 `.tgz` 文件路径填入 DSH「插件 → 添加插件」，或运行：

```sh
dsh plugin --profile desktop add ./skill-dashboard-0.5.3.tgz
```

适配 DSH `0.2.2-rc.3`、Node.js `^22.19.0 || >=24.0.0`。已验证 macOS；其他平台尚未实测。

从旧名 `dsh-skill-dossier` 或 `dsh-skill-dashboard` 升级：先在 DSH 插件页卸载旧包，再安装本包，避免重复注册。技能文件和配置路径不变。

## 使用

侧栏「技能管理」管理本机技能；「添加技能」右侧下拉菜单打开文件夹库。文件夹采用 `<name>/SKILL.md` 结构，移除库只取消注册，不删除文件。

自动发现每 30 秒探测常见用户目录，尊重 `CODEX_HOME`、`CLAUDE_CONFIG_DIR`，按真实路径去重；不扫描整块磁盘。内容解析、监听和 AI 按需加载均由 DSH 提供，不额外调用模型。

「发现」接受 HTTP(S) JSON 索引，沿用 DSH `format: 1`，条目声明 `metadata.category: "skills"`，分发标准 DSH bundle。可参考 [索引示例](indexes/skills.json)。仅安装信任的来源；安装脚本由原生安装器报告并请求授权。

仅保存当前文件夹、索引和停用偏好到 `$DSH_HOME/skill-manager/library.json`（默认 `~/.dsh/skill-manager/library.json`）。管理操作仅限设备所有者。Agent 独立技能层不能被全局开关覆盖时会明确报错。

## 构建

```sh
pnpm install --frozen-lockfile
pnpm build
npm pack
```

发布源码包不包含测试、历史文档或本机数据。技能正文按需加载，列表只传摘要；不包含建档、复审、加载记录或恢复功能。

依赖来源见 [NOTICE](NOTICE.md)，许可见 [LICENSE](LICENSE)。
