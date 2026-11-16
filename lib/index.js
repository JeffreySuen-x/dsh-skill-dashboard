import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";
import { Service } from "@deepseek-ai/cordis";
import { bindTypertRemote } from "@deepseek-ai/dsh-typert-protocol";
import { readFileSync } from "node:fs";
import PluginMarketService from "@deepseek-ai/dsh-plugin-market";
import { createHash } from "node:crypto";
import { realpath, stat } from "node:fs/promises";
import { FileSystemSkillProvider } from "@deepseek-ai/dsh-skill-filesystem";
//#region lib/types/files.js
/** Folder filtering uses only paths returned by the native skill registry. */
function skillFolderOf(skill) {
	if (!skill.path || !isAbsolute(skill.path)) return void 0;
	if (basename(skill.path) === "SKILL.md") return dirname(dirname(skill.path));
	if (basename(skill.path) === `${skill.name}.md`) return dirname(skill.path);
}
/** Native FS has atomic writes; its public contract has no directory-creation method. */
function mkdirCommand(dir) {
	return `mkdir -p '${dir.replaceAll("'", "'\\''")}'`;
}
/** Node and DSH expose different missing-file codes at the I/O boundary. */
function isMissingFile(error) {
	return error !== null && typeof error === "object" && "code" in error && (error.code === "ENOENT" || error.code === "FS_NOT_FOUND");
}
//#endregion
//#region lib/types/remote.js
const PACKAGE = "dsh-skill-dashboard";
const NAMESPACE = "skillDossier";
const INDEX_PATH = "/api/skill-dossier/index.json";
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
//#region lib/types/remote-host.js
var SkillManagerService = class extends Service {
	constructor(ctx) {
		super(ctx, NAMESPACE);
	}
};
/** All management endpoints require an authenticated owner, including shared/global skill files. */
function registerRemote(ctx, handlers) {
	const service = new SkillManagerService(ctx);
	for (const descriptor of remote.descriptors) {
		const handler = handlers[descriptor.method];
		if (handler === void 0) throw new Error(`Missing handler: ${descriptor.method}`);
		service[descriptor.method] = function(args) {
			if (this.ctx.invocation?.peer.principal.kind !== "owner") throw new Error("仅设备所有者可以管理技能");
			return handler(args);
		};
	}
	service.typertRemote = bindTypertRemote(service, NAMESPACE);
	ctx.effect(() => ctx.typert.register({
		package: remote.package,
		face: "host",
		schemas: [],
		model: {
			services: [],
			events: [],
			objects: []
		},
		invocations: remote.descriptors
	}));
}
//#endregion
//#region lib/types/market.js
function registerBuiltinIndex(ctx, server) {
	const body = readFileSync(new URL("../indexes/skills.json", import.meta.url), "utf8");
	ctx.effect(() => server.register({
		kind: "exact",
		path: INDEX_PATH,
		handler(req, res) {
			res.setHeader("content-type", "application/json; charset=utf-8");
			res.setHeader("cache-control", "public, max-age=300");
			res.statusCode = req.method === "GET" || req.method === "HEAD" ? 200 : 405;
			res.end(req.method === "GET" ? body : "");
		}
	}));
}
/** Same native engine, isolated service identity and plugin-owned source preferences. */
function independentMarket(ctx, library) {
	let pending;
	return () => pending ??= (async () => {
		const isolated = ctx.isolate("pluginMarket").isolate("webServer");
		const { indexes } = await library.read();
		const config = {
			indexes,
			detailCacheDir: join(process.env.DSH_HOME ?? join(homedir(), ".dsh"), "skill-manager", "market-cache")
		};
		const fiber = isolated.plugin(PluginMarketService, config);
		await fiber.await();
		const service = () => {
			const value = isolated.get("pluginMarket");
			if (!value) throw new Error("技能索引服务尚未就绪");
			return value;
		};
		return {
			listIndexes: () => service().listIndexes(),
			search: (url, query) => service().search(url, query),
			entry: (url, name) => service().entry(url, name),
			async setIndexes(urls) {
				for (const value of urls) {
					const url = new URL(value);
					if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("请输入有效的 HTTP(S) 技能索引地址");
				}
				await library.setIndexes([...new Set(urls)]);
				await fiber.update({
					...config,
					indexes: urls
				}, true);
			}
		};
	})().catch((error) => {
		pending = void 0;
		throw error;
	});
}
function marketHandlers(ctx, market) {
	let changes = Promise.resolve();
	const changeSource = (url, remove) => {
		const operation = changes.then(async () => {
			const service = await market();
			const urls = service.listIndexes().map((index) => index.url);
			await service.setIndexes(remove ? urls.filter((value) => value !== url) : [.../* @__PURE__ */ new Set([...urls, url])]);
			return service.listIndexes();
		});
		changes = operation.then(() => {}, () => {});
		return operation;
	};
	return {
		async marketSources() {
			const operation = changes.then(async () => {
				const service = await market();
				const server = ctx.get("webServer");
				const current = server ? new URL(INDEX_PATH, server.getOrigin()).href : void 0;
				const sources = service.listIndexes();
				const urls = sources.map((source) => {
					const url = new URL(source.url);
					return current && [
						"127.0.0.1",
						"localhost",
						"[::1]"
					].includes(url.hostname) && url.pathname === "/api/skill-dossier/index.json" ? current : source.url;
				});
				if (urls.some((url, index) => url !== sources[index]?.url)) await service.setIndexes([...new Set(urls)]);
				return service.listIndexes();
			});
			changes = operation.then(() => {}, () => {});
			return operation;
		},
		async marketAddBuiltin() {
			const server = ctx.get("webServer");
			if (!server) throw new Error("当前宿主不提供本地索引地址，请添加已托管的索引 URL");
			const url = new URL(INDEX_PATH, server.getOrigin()).href;
			await changeSource(url, false);
			return url;
		},
		async marketAdd(args) {
			return changeSource(args.url, false);
		},
		async marketRemove(args) {
			return changeSource(args.url, true);
		},
		async marketSearch(args) {
			const manager = ctx.get("pluginManager");
			const [page, bundles] = await Promise.all([(await market()).search(args.url, {
				category: "skills",
				text: args.text ?? "",
				sort: { kind: "relevance" },
				offset: args.offset ?? 0,
				limit: 30,
				refresh: args.refresh === true,
				...args.fetchedAt !== void 0 ? { fetchedAt: args.fetchedAt } : {}
			}), manager?.listBundles() ?? []]);
			const enabled = new Set(bundles.filter((bundle) => bundle.enabled).map((bundle) => bundle.name));
			return {
				...page,
				entries: page.entries.map((entry) => ({
					...entry,
					enabled: enabled.has(entry.name),
					available: bundles.some((bundle) => bundle.name === entry.name && bundle.availability !== "missing")
				}))
			};
		},
		async marketSetEnabled(args) {
			const entry = await (await market()).entry(args.url, args.name);
			if (entry?.metadata.category !== "skills") throw new Error("索引中没有这个技能包");
			if (typeof args.enabled !== "boolean") throw new Error("无效的开关状态");
			const manager = ctx.get("pluginManager");
			if (!manager) throw new Error("插件管理服务不可用");
			const bundle = (await manager.listBundles()).find((item) => item.name === entry.name);
			if (!bundle || bundle.availability === "missing") throw new Error("请先安装技能包");
			if (args.enabled && !entry.versions.some((item) => item.version === bundle.version && item.compatibility.compatible)) throw new Error("已安装版本与当前 DSH 不兼容，请在插件页更新");
			return manager.setBundleEnabled(entry.name, args.enabled);
		},
		async marketInstall(args) {
			const entry = await (await market()).entry(args.url, args.name);
			if (entry?.metadata.category !== "skills") throw new Error("索引中没有这个技能包");
			const version = entry.versions.find((item) => item.version === args.version);
			if (!version?.compatibility.compatible) throw new Error("该版本与当前 DSH 不兼容");
			const manager = ctx.get("pluginManager");
			if (!manager) throw new Error("插件安装服务不可用");
			const existing = (await manager.listBundles()).find((bundle) => bundle.name === entry.name);
			if (existing && existing.availability !== "missing" && existing.version === version.version && !args.approvedBuilds?.length) return manager.setBundleEnabled(entry.name, true);
			return manager.installBundle(version.install.spec, {
				saveExact: true,
				expected: {
					name: entry.name,
					version: version.version
				},
				...version.install.registry ? { registry: version.install.registry } : {},
				...args.approvedBuilds ? { approvedBuilds: args.approvedBuilds } : {}
			});
		}
	};
}
//#endregion
//#region lib/types/library.js
const DISABLED_PROVIDER = "skill-dossier-disabled";
/** Own only preferences. Discovery, YAML parsing, watching and invocation policy belong to DSH. */
function createSkillLibrary(ctx, skills, storage) {
	let state = {
		version: 1,
		folders: [],
		indexes: [],
		disabled: {}
	};
	let revision = 0;
	let control;
	let closed = false;
	let discovered = {
		folders: [],
		issues: []
	};
	const folderPreferences = () => [...discovered.folders.map((item) => ({
		...item,
		automatic: true,
		enabled: state.folders.find((folder) => folder.path === item.path)?.enabled ?? !state.automaticDisabled?.includes(item.path)
	})), ...state.folders.filter((item) => !discovered.folders.some((folder) => folder.path === item.path))];
	const folders = /* @__PURE__ */ new Map();
	const syncFolders = () => {
		if (closed) return;
		const enabled = new Set(folderPreferences().filter((folder) => folder.enabled).map((folder) => folder.path));
		for (const [path, dispose] of folders) if (!enabled.has(path)) {
			dispose();
			folders.delete(path);
		}
		for (const path of enabled) {
			if (folders.has(path)) continue;
			const providerName = `skill-library-${createHash("sha256").update(path).digest("hex").slice(0, 12)}`;
			folders.set(path, skills.registerProvider((lifetime) => {
				const provider = new FileSystemSkillProvider(ctx, lifetime, {
					providerName,
					includeDefaultRoots: false,
					customSkillDirs: [path],
					watch: true
				});
				lifetime.signal.addEventListener("abort", () => {
					provider.dispose();
				}, { once: true });
				return provider;
			}));
		}
	};
	const ready = (async () => {
		try {
			const parsed = JSON.parse(await storage.read());
			if (parsed.version !== 1 || !Array.isArray(parsed.folders) || !Array.isArray(parsed.indexes) || !parsed.disabled || typeof parsed.disabled !== "object" || Array.isArray(parsed.disabled) || parsed.automaticDisabled !== void 0 && (!Array.isArray(parsed.automaticDisabled) || parsed.automaticDisabled.some((path) => typeof path !== "string"))) throw new Error("技能库配置损坏");
			state = parsed;
		} catch (error) {
			if (!isMissingFile(error)) throw error;
		}
		if (storage.discover) discovered = await storage.discover();
		if (!closed) syncFolders();
	})();
	ready.catch(() => {});
	if (skills.registerProvider) skills.registerProvider((lifetime) => {
		control = lifetime;
		return {
			name: DISABLED_PROVIDER,
			async list() {
				await ready;
				return Object.values(state.disabled).map((skill) => ({
					...skill,
					provider: DISABLED_PROVIDER,
					invocation: {
						modelInvocable: false,
						userInvocable: false
					},
					rank: -1,
					locator: skill.name
				}));
			},
			async get(candidate) {
				return {
					...candidate,
					content: ""
				};
			}
		};
	});
	ctx.on("skills/change", () => {
		revision += 1;
	});
	let discoveryPending;
	function refresh() {
		return discoveryPending ??= (async () => {
			await ready;
			if (!storage.discover || closed) return;
			const next = await storage.discover();
			if (closed || JSON.stringify(next) === JSON.stringify(discovered)) return;
			discovered = next;
			syncFolders();
			revision += 1;
		})().finally(() => {
			discoveryPending = void 0;
		});
	}
	ctx.effect(() => {
		const timer = storage.discover ? setInterval(() => {
			refresh().catch(() => {});
		}, 3e4) : void 0;
		timer?.unref();
		return () => {
			closed = true;
			clearInterval(timer);
			for (const dispose of folders.values()) dispose();
			folders.clear();
		};
	});
	let pending = Promise.resolve();
	function enqueue(action) {
		const operation = pending.then(async () => {
			await ready;
			if (closed) throw new Error("技能服务已关闭");
			return action();
		});
		pending = operation.then(() => {}, () => {});
		return operation;
	}
	async function save(next) {
		await storage.write(JSON.stringify(next, null, 2));
		state = next;
		syncFolders();
		control?.invalidate();
		revision += 1;
	}
	function update(mutator) {
		return enqueue(async () => {
			const next = structuredClone(state);
			mutator(next);
			await save(next);
		});
	}
	return {
		async read() {
			await ready;
			await pending;
			return structuredClone({
				...state,
				folders: folderPreferences(),
				discoveryIssues: discovered.issues
			});
		},
		refresh,
		revision: () => revision,
		async setEnabled(name, enabled, options) {
			return enqueue(async () => {
				const skill = (await skills.list(options)).find((item) => item.name === name);
				const wasDisabled = Object.hasOwn(state.disabled, name);
				if (!skill && !wasDisabled) throw new Error("技能已不在目录中，请刷新");
				const scopeError = "该技能由当前 Agent 的独立技能层管理，请在对应 Agent 配置中调整";
				if (!enabled && wasDisabled) {
					if (skill?.provider !== "skill-dossier-disabled") throw new Error(scopeError);
					return { ok: true };
				}
				const previous = state;
				const next = structuredClone(state);
				if (enabled) delete next.disabled[name];
				else if (skill) next.disabled = {
					...next.disabled,
					[name]: skill
				};
				await save(next);
				if (!enabled && (await skills.list(options)).find((item) => item.name === name)?.provider !== "skill-dossier-disabled") {
					await save(previous);
					throw new Error(scopeError);
				}
				return { ok: true };
			});
		},
		async addFolder(input) {
			if (!isAbsolute(input)) throw new Error("请输入技能文件夹的绝对路径");
			const path = await realpath(input);
			if (!await storage.isDirectory(path)) throw new Error("所选路径不是文件夹");
			await update((next) => {
				if (discovered.folders.some((item) => item.path === path)) {
					next.automaticDisabled = (next.automaticDisabled ?? []).filter((item) => item !== path);
					next.folders = next.folders.filter((item) => item.path !== path);
					return;
				}
				const old = next.folders.find((folder) => folder.path === path);
				if (old) old.enabled = true;
				else next.folders.push({
					path,
					enabled: true
				});
			});
			return { ok: true };
		},
		async setFolder(path, enabled) {
			await update((next) => {
				if (discovered.folders.some((item) => item.path === path)) {
					if (enabled === null) throw new Error("自动发现的目录可通过开关停用");
					next.folders = next.folders.filter((item) => item.path !== path);
					next.automaticDisabled = [.../* @__PURE__ */ new Set([...(next.automaticDisabled ?? []).filter((item) => item !== path), ...enabled ? [] : [path]])];
					return;
				}
				const folder = next.folders.find((item) => item.path === path);
				if (!folder) throw new Error("技能文件夹未登记");
				if (enabled === null) next.folders = next.folders.filter((item) => item.path !== path);
				else folder.enabled = enabled;
			});
			return { ok: true };
		},
		async setIndexes(indexes) {
			await update((next) => {
				next.indexes = indexes;
			});
		}
	};
}
//#endregion
//#region lib/types/discovery.js
/** Probe known user-level roots only; the native provider owns skill parsing and watching. */
async function discoverGlobalFolders(home = homedir(), env = process.env) {
	const native = [join(env.DSH_HOME || join(home, ".dsh"), "skills"), join(env.DSH_AGENTS_HOME || join(home, ".agents"), "skills")];
	const seen = new Set(await Promise.all(native.map((path) => realpath(path).catch(() => path))));
	const candidates = [
		{
			label: "Codex",
			path: join(env.CODEX_HOME || join(home, ".codex"), "skills")
		},
		{
			label: "Claude Code",
			path: join(env.CLAUDE_CONFIG_DIR || join(home, ".claude"), "skills")
		},
		{
			label: "Cursor",
			path: join(home, ".cursor", "skills")
		},
		{
			label: "Gemini CLI",
			path: join(home, ".gemini", "skills")
		}
	];
	const result = {
		folders: [],
		issues: []
	};
	for (const candidate of candidates) try {
		const path = await realpath(candidate.path);
		if (seen.has(path) || !(await stat(path)).isDirectory()) continue;
		seen.add(path);
		result.folders.push({
			...candidate,
			path
		});
	} catch (error) {
		if (!["ENOENT", "ENOTDIR"].includes(error.code ?? "")) result.issues.push(`${candidate.label}：无法读取 ${candidate.path}`);
	}
	return result;
}
//#endregion
//#region lib/types/index.js
/** Skill discovery, installation and invocation policy use native DSH services. */
const name = "skill-manager";
const inject = [
	"skills",
	"webServer",
	"agents",
	"fs",
	"shell",
	"typert",
	"workingDirectory"
];
function apply(ctx) {
	const skills = ctx.get("skills");
	const agents = ctx.get("agents");
	const fs = ctx.get("fs");
	const shell = ctx.get("shell");
	const webServer = ctx.get("webServer");
	const workingDirectory = ctx.get("workingDirectory");
	function viewOptions(sessionId) {
		const agent = typeof sessionId === "string" ? agents.get(sessionId) : void 0;
		return agent ? {
			scope: agent,
			cwd: workingDirectory.get(agent.session)
		} : {};
	}
	const dshHome = process.env.DSH_HOME ?? join(homedir(), ".dsh");
	const libraryPath = join(dshHome, "skill-manager", "library.json");
	const library = createSkillLibrary(ctx, skills, {
		discover: () => discoverGlobalFolders(),
		async read() {
			return fs.readText(await fs.resolve(libraryPath));
		},
		async write(value) {
			const policy = {
				mode: "workspace-write",
				workspaceRoot: dshHome
			};
			const result = await (await shell.execute(shell.resolve({
				command: mkdirCommand(dirname(libraryPath)),
				timeoutMs: 3e4,
				onExpiry: "kill",
				sandboxPolicy: policy
			}))).result();
			if (result.sandbox?.denied) throw new Error("技能配置写入被沙箱拒绝");
			if (result.exitCode !== 0) throw new Error(`无法创建技能配置目录：${result.stderr?.text ?? result.exitCode}`);
			await fs.writeText(await fs.resolve(libraryPath), value, void 0, void 0, policy);
		},
		async isDirectory(path) {
			return (await fs.stat(await fs.resolve(path)))?.type === "directory";
		}
	});
	function summary(skill) {
		return {
			name: skill.name,
			description: skill.description,
			source: skill.source,
			modelInvocable: skill.invocation.modelInvocable,
			userInvocable: skill.invocation.userInvocable,
			enabled: skill.provider !== DISABLED_PROVIDER,
			folder: skillFolderOf(skill) ?? null
		};
	}
	const handlers = {
		async catalogRevision() {
			return library.revision();
		},
		async setEnabled(args) {
			return library.setEnabled(args.name, args.enabled, viewOptions(args.sessionId));
		},
		async libraryAdd(args) {
			return library.addFolder(args.path);
		},
		async libraryRefresh() {
			await library.refresh();
			return { ok: true };
		},
		async librarySetEnabled(args) {
			return library.setFolder(args.path, args.enabled);
		},
		async libraryRemove(args) {
			return library.setFolder(args.path, null);
		},
		async list(args) {
			const [catalog, preferences] = await Promise.all([skills.list(viewOptions(args.sessionId)), library.read()]);
			return {
				skills: catalog.map(summary),
				folders: preferences.folders,
				discoveryIssues: preferences.discoveryIssues
			};
		},
		async get(args) {
			const skill = await skills.get(args.name, viewOptions(args.sessionId));
			return skill ? {
				...summary(skill),
				content: skill.content,
				path: skill.path ?? null
			} : null;
		},
		...marketHandlers(ctx, independentMarket(ctx, library))
	};
	registerBuiltinIndex(ctx, webServer);
	registerRemote(ctx, handlers);
}
//#endregion
export { apply, inject, name };
