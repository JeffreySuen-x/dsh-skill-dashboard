window.__ModuleLoader__.load({
	id: "skill-dashboard",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/remote.ts
		const PACKAGE = "skill-dashboard";
		const NAMESPACE = "skillDossier";
		const fields = {
			list: ["sessionId"],
			catalogRevision: [],
			setEnabled: [
				"sessionId",
				"name",
				"enabled"
			],
			libraryAdd: ["path"],
			libraryRefresh: [],
			librarySetEnabled: ["path", "enabled"],
			libraryRemove: ["path"],
			get: ["sessionId", "name"],
			marketSources: [],
			marketAddBuiltin: [],
			marketAdd: ["url"],
			marketRemove: ["url"],
			marketSearch: [
				"url",
				"text",
				"offset",
				"refresh",
				"fetchedAt"
			],
			marketInstall: [
				"url",
				"name",
				"version",
				"approvedBuilds"
			],
			marketSetEnabled: [
				"url",
				"name",
				"enabled"
			]
		};
		function parseArgs(method, value) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("参数必须是对象");
			const record = value;
			if (JSON.stringify(record).length > 16384) throw new Error("参数过长");
			for (const [key, item] of Object.entries(record)) {
				if (!fields[method].includes(key)) throw new Error(`未知参数：${key}`);
				if (item === void 0) continue;
				if (key === "offset" || key === "fetchedAt") {
					if (!Number.isSafeInteger(item) || item < 0) throw new Error("无效的分页");
					continue;
				}
				if (key === "refresh" || key === "enabled") {
					if (typeof item !== "boolean") throw new Error("无效的刷新参数");
					continue;
				}
				if (key === "approvedBuilds") {
					if (!Array.isArray(item) || item.length > 50 || item.some((v) => typeof v !== "string" || v.length > 256)) throw new Error("无效的脚本授权");
					continue;
				}
				if (typeof item !== "string" || item.length > (key === "url" || key === "path" ? 4096 : 1e3)) throw new Error(`无效参数：${key}`);
			}
			for (const key of fields[method]) if ([
				"name",
				"enabled",
				"path",
				"url",
				"version"
			].includes(key) && (record[key] === void 0 || typeof record[key] === "string" && !record[key].trim())) throw new Error(`缺少参数：${key}`);
			return record;
		}
		const remote = {
			package: PACKAGE,
			descriptors: Object.keys(fields).map((method) => ({
				id: `${NAMESPACE}/${method}`,
				namespace: NAMESPACE,
				service: NAMESPACE,
				method,
				invocation: { kind: "direct" },
				parameters: [{
					name: "args",
					wire: "args",
					source: "json",
					codec: {
						mode: "strict",
						typeSymbol: `${method}Args`,
						create: () => ({ parse: (value) => parseArgs(method, value) })
					}
				}],
				result: {
					mode: "strict",
					typeSymbol: "unknown",
					create: () => ({ parse: (value) => value })
				}
			}))
		};
		//#endregion
		//#region \0dsh-css:src/client/Panel.module.css.mjs
		const key = "skill-dashboard/src/client/Panel.module.css";
		let style = document.querySelector("style[data-plugin-css=" + JSON.stringify(key) + "]");
		if (!style) {
			style = document.createElement("style");
			style.dataset.plugin = "skill-dashboard";
			style.dataset.pluginCss = key;
			document.head.append(style);
		}
		style.textContent = "._9hd3Vq_surface{height:100%;container-type:inline-size}._9hd3Vq_page{--skill-page-inset:48px;box-sizing:border-box;height:100%;padding:calc(28px + var(--dsh-frame-top-clearance,0px)) var(--skill-page-inset) 48px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);font:var(--dsw-font-s-14);overflow:hidden auto}._9hd3Vq_page h1,._9hd3Vq_page h2,._9hd3Vq_page h3{margin:0;font-weight:500}._9hd3Vq_page h1{font-size:20px;line-height:28px}._9hd3Vq_page h2{font-size:14px}._9hd3Vq_page h3{font-size:14px;line-height:20px}._9hd3Vq_page p{margin:6px 0}._9hd3Vq_header{justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:16px;display:flex}._9hd3Vq_header p,._9hd3Vq_muted,._9hd3Vq_hint{color:var(--dsw-alias-label-tertiary)}._9hd3Vq_actions{flex-wrap:wrap;flex-shrink:0;align-items:center;gap:8px;display:flex}._9hd3Vq_navigation{margin-bottom:32px;display:flex}._9hd3Vq_primaryTabs{width:240px}._9hd3Vq_sourceForm>span{min-width:0}._9hd3Vq_toolbar{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;margin:16px 0;display:flex}._9hd3Vq_row{box-sizing:border-box;border-radius:16px;align-items:center;gap:14px;min-height:64px;margin:0 -8px;padding:8px;display:flex}._9hd3Vq_row:hover{background:var(--dsw-alias-interactive-bg-hover)}._9hd3Vq_iconTile{box-sizing:content-box;border:.5px solid var(--dsw-alias-border-l3);width:48px;height:48px;color:var(--dsw-alias-state-business-primary);border-radius:16px;flex:0 0 48px;justify-content:center;align-items:center;display:flex}._9hd3Vq_rowMain{text-align:start;min-width:0;color:inherit;font:inherit;background:0 0;border:0;flex:1;padding:0;display:block}button._9hd3Vq_rowMain{cursor:pointer;border-radius:6px}._9hd3Vq_rowMain p{color:var(--dsw-alias-label-tertiary);-webkit-line-clamp:1;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}._9hd3Vq_rowMain small{color:var(--dsw-alias-label-tertiary)}._9hd3Vq_rowMain h3{overflow-wrap:anywhere}._9hd3Vq_rowMain:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:5px}._9hd3Vq_badge{vertical-align:middle;margin-left:8px}._9hd3Vq_hint{font-size:13px}._9hd3Vq_card{border-bottom:.5px solid var(--dsw-alias-border-l2);padding:20px 0}._9hd3Vq_notice{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;border-radius:12px;padding:12px 16px}._9hd3Vq_empty{text-align:center;color:var(--dsw-alias-label-tertiary);flex-direction:column;align-items:center;gap:8px;padding:64px 0;display:flex}._9hd3Vq_empty>p{font:var(--dsw-font-xs-13);margin:0;line-height:20px}._9hd3Vq_empty>._9hd3Vq_emptyTitle{font:var(--dsw-font-s-14);color:var(--dsw-alias-label-primary);margin-top:8px;font-weight:500;line-height:20px}._9hd3Vq_empty>button{margin-top:8px}._9hd3Vq_sourceLabel{color:var(--dsw-alias-label-secondary);align-items:center;gap:12px;display:flex}._9hd3Vq_choice{min-width:0;max-width:min(400px,65vw)}._9hd3Vq_choice>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._9hd3Vq_sourceForm{grid-template-columns:minmax(0,1fr) auto;gap:12px;margin-bottom:16px;display:grid}._9hd3Vq_sourceForm>button{white-space:nowrap}._9hd3Vq_libraryDialog{width:560px;max-width:calc(100vw - 32px)}._9hd3Vq_libraryBody{max-height:65vh;font:var(--dsw-font-xs-13);overflow:auto}._9hd3Vq_librarySection+._9hd3Vq_librarySection{border-top:.5px solid var(--dsw-alias-border-l3);margin-top:24px;padding-top:20px}._9hd3Vq_libraryHeading{justify-content:space-between;align-items:center;gap:12px;min-height:28px;margin-bottom:8px;display:flex}._9hd3Vq_libraryHeading h3{font:var(--dsw-font-s-14);margin:0;font-weight:500}._9hd3Vq_libraryRow{align-items:center;gap:12px;min-height:56px;padding:8px 0;display:flex}._9hd3Vq_libraryRow>svg{width:20px;height:20px;color:var(--dsw-alias-label-tertiary);flex:0 0 20px}._9hd3Vq_libraryInfo{flex:1;min-width:0}._9hd3Vq_libraryInfo h4{font:var(--dsw-font-s-14);margin:0 0 4px;font-weight:500}._9hd3Vq_libraryInfo>span{width:100%;max-width:100%}._9hd3Vq_libraryInfo p,._9hd3Vq_libraryHint{color:var(--dsw-alias-label-tertiary);font:var(--dsw-font-xs-13);margin:4px 0;line-height:20px}._9hd3Vq_libraryActions{flex-shrink:0;align-items:center;gap:12px;display:flex}._9hd3Vq_libraryForm{grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;margin:12px 0 8px;display:grid}._9hd3Vq_libraryForm>span{min-width:0}._9hd3Vq_libraryForm>button{white-space:nowrap;min-width:64px}._9hd3Vq_libraryHeading button,._9hd3Vq_libraryActions button{white-space:nowrap}._9hd3Vq_sourceRow{justify-content:space-between;align-items:center;gap:12px;padding:16px 0;display:flex}._9hd3Vq_sourceRow span{overflow-wrap:anywhere;min-width:0}._9hd3Vq_sourceRow small{color:var(--dsw-alias-label-tertiary);display:block}._9hd3Vq_detail{max-height:70vh;overflow:auto}._9hd3Vq_pre{white-space:pre-wrap;overflow-wrap:anywhere;background:var(--dsw-alias-bg-layer-2);border-radius:12px;padding:16px;font:12px/1.7 ui-monospace,SFMono-Regular,monospace}@media (width<=700px){._9hd3Vq_page{--skill-page-inset:24px}._9hd3Vq_header{flex-direction:column}._9hd3Vq_row{flex-wrap:wrap}._9hd3Vq_primaryTabs{width:100%}._9hd3Vq_navigation{display:block}}._9hd3Vq_page>._9hd3Vq_header,._9hd3Vq_page>._9hd3Vq_allHeader,._9hd3Vq_page>._9hd3Vq_navigation,._9hd3Vq_page>section{max-width:960px;margin-left:auto;margin-right:auto}._9hd3Vq_header p{font:var(--dsw-font-xs-13);margin:4px 0 0;line-height:20px}._9hd3Vq_page>._9hd3Vq_header,._9hd3Vq_page>._9hd3Vq_allHeader,._9hd3Vq_page>._9hd3Vq_navigation{width:min(960px, calc(100cqw - 2 * var(--skill-page-inset)));margin-left:max(0px, calc((100cqw - 960px) / 2 - var(--skill-page-inset)));margin-right:0}._9hd3Vq_header>._9hd3Vq_actions{gap:16px}._9hd3Vq_header>._9hd3Vq_actions>button{height:32px;font:var(--dsw-font-xs-13);padding:0 12px}._9hd3Vq_addGroup{align-items:stretch;display:flex}._9hd3Vq_addGroup button{height:32px;font:var(--dsw-font-xs-13);white-space:nowrap}._9hd3Vq_addGroup ._9hd3Vq_addPrimary{border-top-right-radius:0;border-bottom-right-radius:0;padding:0 12px}._9hd3Vq_addGroup ._9hd3Vq_addToggle{border-left:.5px solid var(--dsw-alias-label-tertiary);border-top-left-radius:0;border-bottom-left-radius:0;width:32px;padding:0}._9hd3Vq_allHeader{justify-content:space-between;align-items:center;gap:16px;margin-bottom:32px;display:flex}._9hd3Vq_backTitle{align-items:center;gap:8px;display:flex}._9hd3Vq_backTitle>button{width:28px;height:28px;padding:0}._9hd3Vq_backTitle h1{white-space:nowrap}._9hd3Vq_moreLink{color:var(--dsw-alias-label-tertiary);gap:8px}._9hd3Vq_moreLink>svg{width:16px;height:16px}._9hd3Vq_skillGroup+._9hd3Vq_skillGroup{margin-top:32px}._9hd3Vq_sectionHeader{justify-content:space-between;align-items:center;gap:16px;min-height:22px;margin-bottom:8px;display:flex}._9hd3Vq_sectionHeader h2{line-height:22px}._9hd3Vq_sectionHeader button{height:20px;min-height:20px;padding-top:0;padding-bottom:0}._9hd3Vq_rowMain p{margin:4px 0 0;font-size:13px;line-height:18px}._9hd3Vq_row+._9hd3Vq_row{margin-top:2px}@media (width<=700px){._9hd3Vq_allHeader,._9hd3Vq_sectionHeader{flex-wrap:wrap;align-items:flex-start}._9hd3Vq_header>._9hd3Vq_actions{gap:8px}}";
		var Panel_module_css_default = {
			"actions": "_9hd3Vq_actions",
			"addGroup": "_9hd3Vq_addGroup",
			"addPrimary": "_9hd3Vq_addPrimary",
			"addToggle": "_9hd3Vq_addToggle",
			"allHeader": "_9hd3Vq_allHeader",
			"backTitle": "_9hd3Vq_backTitle",
			"badge": "_9hd3Vq_badge",
			"card": "_9hd3Vq_card",
			"choice": "_9hd3Vq_choice",
			"detail": "_9hd3Vq_detail",
			"empty": "_9hd3Vq_empty",
			"emptyTitle": "_9hd3Vq_emptyTitle",
			"header": "_9hd3Vq_header",
			"hint": "_9hd3Vq_hint",
			"iconTile": "_9hd3Vq_iconTile",
			"libraryActions": "_9hd3Vq_libraryActions",
			"libraryBody": "_9hd3Vq_libraryBody",
			"libraryDialog": "_9hd3Vq_libraryDialog",
			"libraryForm": "_9hd3Vq_libraryForm",
			"libraryHeading": "_9hd3Vq_libraryHeading",
			"libraryHint": "_9hd3Vq_libraryHint",
			"libraryInfo": "_9hd3Vq_libraryInfo",
			"libraryRow": "_9hd3Vq_libraryRow",
			"librarySection": "_9hd3Vq_librarySection",
			"moreLink": "_9hd3Vq_moreLink",
			"muted": "_9hd3Vq_muted",
			"navigation": "_9hd3Vq_navigation",
			"notice": "_9hd3Vq_notice",
			"page": "_9hd3Vq_page",
			"pre": "_9hd3Vq_pre",
			"primaryTabs": "_9hd3Vq_primaryTabs",
			"row": "_9hd3Vq_row",
			"rowMain": "_9hd3Vq_rowMain",
			"sectionHeader": "_9hd3Vq_sectionHeader",
			"skillGroup": "_9hd3Vq_skillGroup",
			"sourceForm": "_9hd3Vq_sourceForm",
			"sourceLabel": "_9hd3Vq_sourceLabel",
			"sourceRow": "_9hd3Vq_sourceRow",
			"surface": "_9hd3Vq_surface",
			"toolbar": "_9hd3Vq_toolbar"
		};
		//#endregion
		//#region src/client/ChoiceMenu.tsx
		/** Selection wiring only; DSH owns menu appearance, keyboard movement and focus return. */
		function ChoiceMenu({ label, value, options, onChange, disabled = false, size = "md" }) {
			const [open, setOpen] = (0, react.useState)(false);
			const selected = options.find((option) => option.value === value)?.label ?? "尚未添加";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				onClose: () => setOpen(false),
				portal: true,
				minWidthFromAnchor: true,
				selectedId: value,
				items: options.map((option) => ({
					id: option.value,
					label: option.label
				})),
				onSelect: (next) => {
					setOpen(false);
					onChange(next);
				},
				anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size,
					className: Panel_module_css_default.choice,
					"aria-label": `${label}：${selected}`,
					"aria-haspopup": "menu",
					"aria-expanded": open,
					disabled: disabled || options.length === 0,
					onClick: () => setOpen((value) => !value),
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selected }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
				})
			});
		}
		//#endregion
		//#region src/client/Icon.tsx
		/** Original line icon; host owns sidebar row geometry, color and selection. */
		function SkillIcon({ size = 24 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: "1.5",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5.5C9 3.8 5.5 3.7 3 4.5v14c3-.8 6.5-.5 9 1 2.5-1.5 6-1.8 9-1v-14c-2.5-.8-6-.7-9 1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M12 5.5v14M6 8h3M6 11h3M15 8h3M15 11h3" })]
			});
		}
		//#endregion
		//#region src/client/Discover.tsx
		function localized(value, fallback = "") {
			if (typeof value === "string") return value;
			if (value && typeof value === "object") {
				const text = value;
				return text["zh-CN"] ?? text.zh ?? text.en ?? Object.values(text)[0] ?? fallback;
			}
			return fallback;
		}
		function Discover({ call, manage, onManage }) {
			const [revision, setRevision] = (0, react.useState)(0);
			const [sources, setSources] = (0, react.useState)([]);
			const [selected, setSelected] = (0, react.useState)("");
			const [url, setUrl] = (0, react.useState)("");
			const [page, setPage] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)("");
			const [notice, setNotice] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [install, setInstall] = (0, react.useState)(null);
			const [result, setResult] = (0, react.useState)(null);
			const [changes, setChanges] = (0, react.useState)(0);
			const searchKey = `${selected}\n${revision}\n${changes}`;
			const lastRefresh = (0, react.useRef)(revision);
			const currentSearch = (0, react.useRef)(searchKey);
			currentSearch.current = searchKey;
			(0, react.useEffect)(() => {
				let current = true;
				call("marketSources").then((items) => {
					if (!current) return;
					setSources(items);
					setSelected((old) => items.some((item) => item.url === old) ? old : items[0]?.url ?? "");
				}, (reason) => {
					if (current) setError(String(reason));
				});
				return () => {
					current = false;
				};
			}, [call, changes]);
			(0, react.useEffect)(() => {
				let current = true;
				setPage(null);
				if (!selected) return;
				setError("");
				setNotice("");
				const refresh = lastRefresh.current !== revision;
				lastRefresh.current = revision;
				call("marketSearch", {
					url: selected,
					refresh
				}).then((value) => {
					if (current) setPage(value);
				}, (reason) => {
					if (current) setError(String(reason));
				});
				return () => {
					current = false;
				};
			}, [
				call,
				selected,
				revision,
				changes
			]);
			const change = async (method, value) => {
				setBusy(true);
				setError("");
				try {
					await call(method, { url: value.trim() });
					setSelected(method === "marketAdd" ? value.trim() : "");
					setUrl("");
					setChanges((n) => n + 1);
				} catch (reason) {
					setError(String(reason));
				} finally {
					setBusy(false);
				}
			};
			const runInstall = async (approvedBuilds) => {
				if (!install?.defaultVersion) return;
				setBusy(true);
				setResult(null);
				setError("");
				try {
					const value = await call("marketInstall", {
						url: install.indexUrl,
						name: install.name,
						version: install.defaultVersion,
						...approvedBuilds ? { approvedBuilds } : {}
					});
					setResult(value);
					setChanges((n) => n + 1);
				} catch (reason) {
					setError(String(reason));
				} finally {
					setBusy(false);
				}
			};
			const toggle = async (entry, enabled) => {
				setBusy(true);
				setError("");
				setNotice("");
				const key = searchKey;
				try {
					const result = await call("marketSetEnabled", {
						url: selected,
						name: entry.name,
						enabled
					});
					if (!["applied", "restart-required"].includes(result.application)) throw new Error(result.error?.diagnostic ?? "修改未完成");
					const next = await call("marketSearch", { url: selected });
					if (currentSearch.current !== key) return;
					setPage(next);
					if (result.application === "restart-required") setNotice("设置已保存，重启 DSH 后生效");
				} catch (reason) {
					if (currentSearch.current === key) setError(String(reason));
				} finally {
					setBusy(false);
				}
			};
			const more = async () => {
				if (!page || page.nextOffset === null) return;
				setBusy(true);
				const key = searchKey;
				try {
					const next = await call("marketSearch", {
						url: selected,
						offset: page.nextOffset,
						fetchedAt: page.fetchedAt
					});
					if (currentSearch.current !== key) return;
					setPage((current) => current?.url === next.url ? {
						...next,
						entries: [...current.entries, ...next.entries]
					} : current);
				} catch (reason) {
					if (currentSearch.current === key) setError(String(reason));
				} finally {
					setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				sources.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Panel_module_css_default.toolbar,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Panel_module_css_default.sourceLabel,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "索引来源" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoiceMenu, {
							label: "索引来源",
							value: selected,
							onChange: setSelected,
							disabled: busy,
							options: sources.map((source) => ({
								value: source.url,
								label: localized(source.title, source.url)
							}))
						})]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: Panel_module_css_default.actions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							disabled: busy,
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {}),
							onClick: () => setRevision((n) => n + 1),
							children: "刷新"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							onClick: () => onManage(true),
							children: "管理索引"
						})]
					})]
				}) : null,
				error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: Panel_module_css_default.notice,
					role: "alert",
					children: error
				}) : null,
				notice ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					className: Panel_module_css_default.notice,
					children: notice
				}) : null,
				!sources.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: Panel_module_css_default.empty,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size: 48 }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: Panel_module_css_default.emptyTitle,
							children: "还没有技能索引"
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "添加一个技能索引，即可在这里浏览和安装其中的技能" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
							onClick: () => onManage(true),
							children: "添加索引源"
						})
					]
				}) : null,
				selected && !page && !error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: Panel_module_css_default.hint,
					children: "读取索引…"
				}) : null,
				page ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h2", { children: [
						localized(page.title),
						" ",
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: Panel_module_css_default.muted,
							children: page.total
						})
					] }),
					page.entries.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: Panel_module_css_default.hint,
						children: "没有匹配的技能包。该来源可能尚未声明“skills”分类。"
					}) : null,
					page.entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
						className: Panel_module_css_default.row,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: Panel_module_css_default.iconTile,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillIcon, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Panel_module_css_default.rowMain,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: localized(entry.title, entry.name) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: localized(entry.description, entry.name) }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: entry.defaultVersion ?? "暂无兼容版本" })
								]
							}),
							entry.available ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
								label: `启用 ${localized(entry.title, entry.name)}`,
								checked: entry.enabled,
								disabled: busy || !entry.enabled && !entry.defaultVersion,
								title: !entry.enabled && !entry.defaultVersion ? "暂无兼容版本" : void 0,
								onChange: (enabled) => void toggle(entry, enabled)
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: !entry.defaultVersion || busy,
								onClick: () => {
									setInstall({
										...entry,
										indexUrl: selected
									});
									setResult(null);
								},
								children: "安装"
							})
						]
					}, entry.name)),
					page.nextOffset !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						disabled: busy,
						onClick: () => void more(),
						children: "加载更多"
					}) : null
				] }) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: manage,
					onClose: () => onManage(false),
					title: "索引源",
					description: "技能索引以一个索引文件的 URL 提供，「发现」从这里列出的索引浏览技能",
					closeLabel: "关闭",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							onSubmit: (e) => {
								e.preventDefault();
								change("marketAdd", url);
							},
							className: Panel_module_css_default.sourceForm,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								"data-modal-autofocus": true,
								"aria-label": "索引 URL",
								placeholder: "https://example.com/index.json",
								value: url,
								onChange: (e) => setUrl(e.target.value)
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, {}),
								variant: "primary",
								type: "submit",
								disabled: busy || !url.trim(),
								children: "添加"
							})]
						}),
						error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							className: Panel_module_css_default.notice,
							children: error
						}) : null,
						sources.map((source) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: Panel_module_css_default.sourceRow,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [localized(source.title, source.url), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: source.url })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: busy,
								onClick: () => void change("marketRemove", source.url),
								children: "移除"
							})]
						}, source.url))
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install !== null,
					onClose: () => {
						if (!busy) setInstall(null);
					},
					title: `安装 ${localized(install?.title, install?.name)}`,
					closeLabel: "关闭",
					description: install?.defaultVersion ?? "",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "技能包在本机以你的权限运行。确认信任该索引及发布者后安装。" }),
						error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							className: Panel_module_css_default.notice,
							children: error
						}) : null,
						result ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							role: "status",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: result.application === "applied" ? "已启用" : result.application === "restart-required" ? "已安装，重启 DSH 后生效" : `安装未完成：${result.error?.diagnostic ?? result.error?.code ?? result.application}` }), result.pendingBuilds?.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: ["以下依赖需要运行安装脚本：", result.pendingBuilds.join("、")] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: busy,
								onClick: () => void runInstall(result.pendingBuilds),
								children: "允许这些脚本并重试"
							})] }) : null]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							disabled: busy,
							onClick: () => void runInstall(),
							children: busy ? "正在安装…" : "确认安装"
						})
					]
				})
			] });
		}
		//#endregion
		//#region src/client/Panel.tsx
		const tabs = [{
			value: "installed",
			label: "已安装",
			id: "skills-installed-tab",
			panelId: "skills-installed-panel"
		}, {
			value: "discover",
			label: "发现",
			id: "skills-discover-tab",
			panelId: "skills-discover-panel"
		}];
		function Panel(props) {
			const session = props.useSessions((state) => Object.values(state.byId).find((item) => (item.retainedBy.mainView ?? 0) > 0));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(WorkspacePanel, {
				...props,
				sessionId: session?.id
			}, session?.id ?? "global");
		}
		function WorkspacePanel({ call, sessionId }) {
			const [tab, setTab] = (0, react.useState)("installed");
			const [addMenu, setAddMenu] = (0, react.useState)(false);
			const [showAll, setShowAll] = (0, react.useState)(false);
			const [folder, setFolder] = (0, react.useState)("all");
			const [librariesOpen, setLibrariesOpen] = (0, react.useState)(false);
			const [folderPath, setFolderPath] = (0, react.useState)("");
			const [revision, setRevision] = (0, react.useState)(0);
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [manage, setManage] = (0, react.useState)(false);
			const [detailName, setDetailName] = (0, react.useState)(null);
			const [detail, setDetail] = (0, react.useState)(null);
			const pageRef = (0, react.useRef)(null);
			const overviewScroll = (0, react.useRef)(0);
			const backRef = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				if (pageRef.current) pageRef.current.scrollTop = showAll ? 0 : overviewScroll.current;
				if (showAll) backRef.current?.focus({ preventScroll: true });
			}, [showAll]);
			const alive = (0, react.useRef)(true);
			(0, react.useEffect)(() => {
				alive.current = true;
				return () => {
					alive.current = false;
				};
			}, []);
			(0, react.useEffect)(() => {
				let current = true;
				setError("");
				call("list", { sessionId }).then((value) => {
					if (current) setData(value);
				}, (reason) => {
					if (current) setError(String(reason));
				});
				return () => {
					current = false;
				};
			}, [
				call,
				sessionId,
				revision
			]);
			(0, react.useEffect)(() => {
				let disposed = false;
				let previous;
				let pending = false;
				const check = async () => {
					if (pending || document.visibilityState === "hidden") return;
					pending = true;
					try {
						const next = await call("catalogRevision");
						if (!disposed && previous !== void 0 && next !== previous) setRevision((n) => n + 1);
						previous = next;
					} catch {} finally {
						pending = false;
					}
				};
				check();
				const timer = window.setInterval(() => void check(), 2e3);
				window.addEventListener("focus", check);
				return () => {
					disposed = true;
					window.clearInterval(timer);
					window.removeEventListener("focus", check);
				};
			}, [call]);
			(0, react.useEffect)(() => {
				let current = true;
				setDetail(null);
				if (!detailName) return;
				call("get", {
					sessionId,
					name: detailName
				}).then((value) => {
					if (current) {
						setDetail(value);
						if (!value) setError("该技能已不可用，请刷新列表");
					}
				}, (reason) => {
					if (current) setError(String(reason));
				});
				return () => {
					current = false;
				};
			}, [
				call,
				sessionId,
				detailName,
				revision
			]);
			const setEnabled = async (name, enabled) => {
				setBusy(true);
				setError("");
				try {
					await call("setEnabled", {
						sessionId,
						name,
						enabled
					});
					if (alive.current) setRevision((n) => n + 1);
				} catch (reason) {
					if (alive.current) setError(String(reason));
				} finally {
					if (alive.current) setBusy(false);
				}
			};
			const catalog = [...data?.skills ?? []].sort((a, b) => a.name.localeCompare(b.name));
			const visible = catalog.filter((skill) => !showAll || folder === "all" || skill.folder === folder);
			const groups = [{
				id: "builtin",
				title: "内置技能",
				skills: visible.filter((skill) => skill.source === "bundled")
			}, {
				id: "installed",
				title: "已安装技能",
				skills: visible.filter((skill) => skill.source !== "bundled")
			}];
			const folderChoices = [...new Set(catalog.map((skill) => skill.folder).filter(Boolean))];
			const toggle = (name, enabled) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
				label: `启用 ${name}`,
				checked: enabled,
				disabled: busy,
				onChange: (next) => void setEnabled(name, next)
			});
			const changeLibrary = async (method, path, enabled) => {
				setBusy(true);
				setError("");
				try {
					await call(method, {
						...path === void 0 ? {} : { path },
						...enabled === void 0 ? {} : { enabled }
					});
					if (!alive.current) return;
					setRevision((n) => n + 1);
					if (method === "libraryAdd") setFolderPath("");
					setFolder("all");
				} catch (reason) {
					if (alive.current) setError(String(reason));
				} finally {
					if (alive.current) setBusy(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: Panel_module_css_default.surface,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
					ref: pageRef,
					className: Panel_module_css_default.page,
					"aria-label": showAll ? "全部技能" : "技能管理",
					children: [
						showAll ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Panel_module_css_default.allHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Panel_module_css_default.backTitle,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									ref: backRef,
									variant: "ghost",
									size: "sm",
									"aria-label": "返回技能管理",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {}),
									onClick: () => setShowAll(false)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "全部技能" })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChoiceMenu, {
								label: "技能文件夹",
								size: "sm",
								value: folder,
								onChange: setFolder,
								options: [{
									value: "all",
									label: "全部文件夹"
								}, ...folderChoices.map((path) => ({
									value: path,
									label: path
								}))]
							})]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: Panel_module_css_default.header,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: "技能管理" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "浏览、安装和管理你的技能" })] }), tab === "installed" ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: Panel_module_css_default.actions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {}),
									disabled: busy,
									onClick: () => void changeLibrary("libraryRefresh"),
									children: "刷新"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: Panel_module_css_default.addGroup,
									role: "group",
									"aria-label": "添加技能",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										className: Panel_module_css_default.addPrimary,
										variant: "primary",
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, {}),
										onClick: () => {
											setTab("discover");
											setManage(true);
										},
										children: "添加技能"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
										open: addMenu,
										onClose: () => setAddMenu(false),
										portal: true,
										align: "end",
										items: [{
											id: "libraries",
											label: "文件夹库",
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, {})
										}],
										onSelect: () => {
											setAddMenu(false);
											setLibrariesOpen(true);
										},
										anchor: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											className: Panel_module_css_default.addToggle,
											"aria-label": "更多添加方式",
											"aria-haspopup": "menu",
											"aria-expanded": addMenu,
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {}),
											onClick: () => setAddMenu(!addMenu)
										})
									})]
								})]
							}) : null]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: Panel_module_css_default.navigation,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
								size: "sm",
								items: tabs,
								value: tab,
								onChange: setTab,
								label: "技能管理页面",
								className: Panel_module_css_default.primaryTabs
							})
						})] }),
						!showAll && tab === "discover" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
							id: "skills-discover-panel",
							role: "tabpanel",
							"aria-labelledby": "skills-discover-tab",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Discover, {
								call,
								manage,
								onManage: setManage
							})
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							id: "skills-installed-panel",
							role: showAll ? void 0 : "tabpanel",
							"aria-labelledby": showAll ? void 0 : "skills-installed-tab",
							children: [
								error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: Panel_module_css_default.notice,
									role: "alert",
									children: error
								}) : null,
								!data && !error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: Panel_module_css_default.hint,
									children: "加载中…"
								}) : null,
								showAll && folder !== "all" && data && !visible.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: Panel_module_css_default.hint,
									children: "此文件夹暂无技能"
								}) : null,
								groups.filter((group) => !showAll || folder === "all" || group.skills.length > 0).map((group) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: Panel_module_css_default.skillGroup,
									"aria-labelledby": `skills-${group.id}-heading`,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: Panel_module_css_default.sectionHeader,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
												id: `skills-${group.id}-heading`,
												children: group.title
											}), !showAll && (group.id === "installed" || group.skills.length > 6) ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												variant: "ghost",
												className: Panel_module_css_default.moreLink,
												"aria-label": `查看全部${group.title}`,
												onClick: () => {
													overviewScroll.current = pageRef.current?.scrollTop ?? 0;
													setFolder("all");
													setShowAll(true);
												},
												children: ["更多 ", /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})]
											}) : null]
										}),
										data && !group.skills.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: Panel_module_css_default.hint,
											children: showAll && folder !== "all" ? "此文件夹暂无技能" : group.id === "builtin" ? "暂无内置技能" : "暂无已安装技能，可前往“发现”添加，或选择技能文件夹库。"
										}) : null,
										(showAll ? group.skills : group.skills.slice(0, 6)).map((skill) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
											className: Panel_module_css_default.row,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: Panel_module_css_default.iconTile,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillIcon, {})
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													className: Panel_module_css_default.rowMain,
													onClick: () => {
														setError("");
														setDetailName(skill.name);
													},
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h3", { children: [skill.name, !skill.enabled ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
														tone: "neutral",
														className: Panel_module_css_default.badge,
														children: "已停用"
													}) : null] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: skill.description })]
												}),
												toggle(skill.name, skill.enabled)
											]
										}, skill.name))
									]
								}, group.id))
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
							open: librariesOpen,
							onClose: () => setLibrariesOpen(false),
							title: "技能文件夹库",
							closeLabel: "关闭",
							className: Panel_module_css_default.libraryDialog,
							contentClassName: Panel_module_css_default.libraryBody,
							description: "自动发现本机技能，管理需要持续检索的文件夹。",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: Panel_module_css_default.librarySection,
									"aria-label": "自动发现",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: Panel_module_css_default.libraryHeading,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "自动发现" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												variant: "ghost",
												size: "sm",
												icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {}),
												disabled: busy,
												onClick: () => void changeLibrary("libraryRefresh"),
												children: "重新检测"
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: Panel_module_css_default.libraryRow,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, {}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: Panel_module_css_default.libraryInfo,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: "DSH 默认目录" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "工作区与用户目录中的 .dsh/skills、.agents/skills" })]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
													tone: "neutral",
													children: "默认"
												})
											]
										}),
										(data?.folders ?? []).filter((item) => item.automatic).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: Panel_module_css_default.libraryRow,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, {}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: Panel_module_css_default.libraryInfo,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: item.label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, { path: item.path })]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
													label: `检索 ${item.path}`,
													checked: item.enabled,
													disabled: busy,
													onChange: (enabled) => void changeLibrary("librarySetEnabled", item.path, enabled)
												})
											]
										}, item.path)),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: Panel_module_css_default.libraryHint,
											children: "自动检测 Codex、Claude Code、Cursor 和 Gemini CLI 的用户技能目录。"
										}),
										data?.discoveryIssues?.map((issue) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											role: "status",
											className: Panel_module_css_default.libraryHint,
											children: issue
										}, issue))
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
									className: Panel_module_css_default.librarySection,
									"aria-label": "其他文件夹",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: Panel_module_css_default.libraryHeading,
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "其他文件夹" })
										}),
										(data?.folders ?? []).filter((item) => !item.automatic).map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: Panel_module_css_default.libraryRow,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, {}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
													className: Panel_module_css_default.libraryInfo,
													children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, { path: item.path })
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
													className: Panel_module_css_default.libraryActions,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
														label: `检索 ${item.path}`,
														checked: item.enabled,
														disabled: busy,
														onChange: (enabled) => void changeLibrary("librarySetEnabled", item.path, enabled)
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														size: "sm",
														disabled: busy,
														onClick: () => void changeLibrary("libraryRemove", item.path),
														children: "移除"
													})]
												})
											]
										}, item.path)),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
											className: Panel_module_css_default.libraryForm,
											onSubmit: (event) => {
												event.preventDefault();
												if (folderPath.trim() && !busy) changeLibrary("libraryAdd", folderPath.trim());
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
												"aria-label": "技能文件夹路径",
												placeholder: "输入文件夹的绝对路径",
												value: folderPath,
												onChange: (event) => setFolderPath(event.target.value)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
												type: "submit",
												variant: "primary",
												disabled: busy || !folderPath.trim(),
												children: "添加"
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: Panel_module_css_default.libraryHint,
											children: "启用后持续发现其中的技能。停用或移除文件夹不会删除文件。"
										})
									]
								}),
								error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: Panel_module_css_default.notice,
									children: error
								}) : null
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
							open: detailName !== null,
							onClose: () => setDetailName(null),
							title: detailName ?? "技能详情",
							closeLabel: "关闭",
							contentClassName: Panel_module_css_default.detail,
							children: [
								error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: Panel_module_css_default.notice,
									role: "alert",
									children: error
								}) : null,
								!detail && !error ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "读取技能…" }) : null,
								detail ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: detail.description }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: Panel_module_css_default.actions,
										children: [toggle(detail.name, detail.enabled), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: detail.enabled ? "已启用" : "已停用" })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: Panel_module_css_default.hint,
										children: !detail.enabled ? "已停止向 AI 和用户提供此技能。" : detail.modelInvocable ? "可由 AI 根据任务自动选用。" : detail.userInvocable ? "此技能仅支持用户显式调用。" : "此技能未开放调用。"
									}),
									detail.path ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PathLabel, { path: detail.path }) : null,
									detail.content ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
										className: Panel_module_css_default.card,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "技能说明" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
											className: Panel_module_css_default.pre,
											children: detail.content
										})]
									}) : null
								] }) : null
							]
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/index.ts
		const inject = ["slots", "remote"];
		async function apply(ctx) {
			const unmount = await ctx.remote.$mount(remote);
			ctx.effect(() => unmount);
			ctx.inject(["remote.skillDossier"], (ctx) => {
				const call = async (method, args = {}) => {
					const result = await ctx.remote.skillDossier[method](args);
					if (!result.ok) throw new Error(result.error?.message ?? result.error?.code ?? "连接失败");
					return result.value;
				};
				ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
					name: "sidebar.panellist",
					id: "skills",
					order: -10,
					label: () => "技能管理"
				}, SkillIcon));
				ctx.slots.inject("main", () => ctx.slots.register({
					name: "main",
					key: "skills",
					inject: () => ({ call })
				}, (props) => (0, react.createElement)(Panel, props)));
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
