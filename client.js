/**
 * Local model-label plugin — browser half.
 *
 * Contributes to the `conversation.input.model.label` slot owned by
 * @deepseek-ai/dsh-client-ui-model-selection, so the composer trigger, the
 * current-model menu row, and every model option can show inline badges after
 * the model name.
 *
 * Badge rules come from this plugin's own config (`labels`), read through the
 * Host settings seam: `configForms.get(entryId)` binds the entry's volatile
 * fields, mirroring `settings.describe` and refreshing on
 * `settings/document-updated`. Editing `labels` in cordis.patch.yml therefore
 * updates the badges live — no restart, no generated bundle.
 *
 * The slot is `single`, so whoever occupies it replaces the shipped
 * @deepseek-ai/dsh-client-ui-deepseek-model-label-1017 occupant: the official
 * Flash marker is restated in BUILTIN_RULES below.
 *
 * Occupancy follows the rules, not the plugin: with no usable rules this
 * plugin registers nothing, leaving the shipped occupant (and every other
 * default) exactly as an installation without this plugin.
 *
 * Rendering follows the harness plugin practices: no Harness Client package is
 * required as a module (they change without notice and a throw blanks the slot
 * entry), and the pill is drawn here with theme tokens only.
 */
window.__ModuleLoader__.load({
	id: "dsh-model-badge",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const { jsx, jsxs } = require("react/jsx-runtime");
		const React = require("react");

		/** This plugin's Loader entry id — the settings namespace it reads. */
		const ENTRY_ID = "model-badge";

		/** This package's name — the `plugins.bundle.config` key and the style owner. */
		const PACKAGE_NAME = "dsh-model-badge";

		/** Locale namespace of this plugin's visible copy. */
		const NS = "model-badge";

		//#region styles
		/**
		 * The one badge tone table. Every consumer — the label rendered in the
		 * composer and the preview inside the configuration page — derives from
		 * this list, so a tone added, renamed, or retuned here changes both at
		 * once. `label` is the picker's display name; `token` the theme alias,
		 * `mix` its tint strength, and `fallback` the literal colour used when a
		 * token is renamed upstream.
		 */
		const TONES = [
			{ id: "info", label: "Blue", token: "--dsw-alias-state-business-primary", mix: "10%", fallback: "#7aaaff" },
			{ id: "success", label: "Green", token: "--dsw-alias-state-success-primary", mix: "10%", fallback: "#3ddc97" },
			{ id: "warning", label: "Amber", token: "--dsw-alias-state-warn-primary", mix: "12%", fallback: "#f0b429" },
			{ id: "danger", label: "Red", token: "--dsw-alias-state-error-primary", mix: "10%", fallback: "#ff6b6b" },
			{ id: "neutral", label: "Grey", token: "--dsw-alias-label-secondary", mix: "10%", fallback: "#8b8d93" }
		];
		const TONE_BY_ID = Object.fromEntries(TONES.map((tone) => [tone.id, tone]));

		//#region locales
		/**
		 * This plugin's visible copy, registered in `apply` through
		 * `ctx.locale.register(NS, { zh, en })` and read with
		 * `ctx.locale.bind(NS)`. Model and provider names never pass through
		 * here: they come from the Host catalog and stay as the catalog spells
		 * them.
		 */
		const zh = {
			summary: "为模型名称添加版本胶囊，显示在输入区的模型选择器中。",
			required: "必填",
			requiredHint: "请填写标红的必填项。",
			chooseProvider: "选择 provider",
			providerPlaceholder: "provider id",
			allModels: "全部模型",
			modelPlaceholder: "model id（留空表示全部）",
			badgePlaceholder: "如 1017、新、beta",
			customTone: "自定义",
			customColorPlaceholder: "#c026d3 或 --dsw-alias-…",
			previewHint: "选择 provider 后预览",
			badgeLabel: "胶囊文字",
			remove: "移除",
			loading: "正在读取配置…",
			unavailable: "Host 未提供该项配置，插件可能未启用。",
			hint: "规则按顺序匹配，一条规则渲染一个胶囊。留空模型表示该 provider 下的全部模型。",
			empty: "还没有规则。没有规则时，插件不显示任何胶囊，内置标记保持原样。",
			addRule: "添加规则",
			readOnly: "本部署的设置为只读。",
			unsaved: "有未保存的修改。",
			cancel: "取消",
			save: "保存",
			saving: "保存中…",
			saveRejected: "保存被拒绝：配置在编辑期间已被修改，草稿已保留，请确认后重试。",
			notReady: "配置页尚未就绪。",
			providerLabel: "提供方 / Provider",
			modelLabel: "模型 / Model",
			toneLabel: "色调 / Color"
		};

		/** English copy; same keys as `zh`. */
		const en = {
			summary: "Adds version badges to model names in the composer model selector.",
			required: "Required",
			requiredHint: "Fill in the fields marked in red.",
			chooseProvider: "Choose a provider",
			providerPlaceholder: "provider id",
			allModels: "All models",
			modelPlaceholder: "model id (blank for all)",
			badgePlaceholder: "e.g. 1017, new, beta",
			customTone: "Custom",
			customColorPlaceholder: "#c026d3 or --dsw-alias-…",
			previewHint: "Preview appears once a provider is chosen",
			badgeLabel: "Badge",
			remove: "Remove",
			loading: "Reading configuration…",
			unavailable: "The Host does not serve this configuration; the plugin may be disabled.",
			hint: "Rules match in order, and each matching rule draws one badge. A blank model matches every model of that provider.",
			empty: "No rules yet. Without rules the plugin draws no badge and the built-in marker stays as shipped.",
			addRule: "Add rule",
			readOnly: "Settings are read-only on this deployment.",
			unsaved: "Unsaved changes.",
			cancel: "Cancel",
			save: "Save",
			saving: "Saving…",
			saveRejected: "Save rejected: the configuration changed while you were editing. Your draft is kept; review it and retry.",
			notReady: "The configuration page is not ready yet.",
			providerLabel: "Provider",
			modelLabel: "Model",
			toneLabel: "Color"
		};
		//#endregion

		/**
		 * The shipped tag markup, copied rule for rule: the label wrapper and the
		 * `Tag` primitive's `data-tone` table. The official occupant wraps the
		 * name and places the marker as a `Tag` with `tone="info"`, so the
		 * *geometry* here is enough — colour comes from the `data-tone` rules —
		 * and badges placed by this plugin render exactly like the shipped `1017`.
		 *
		 *   .label{vertical-align:baseline;white-space:nowrap;align-items:center;
		 *          gap:4px;display:inline-flex}
		 *   .tag{display:inline-flex;align-items:center;border-radius:999px;
		 *        corner-shape:round;padding:1px 8px;font-size:11px;
		 *        line-height:17px;font-weight:500;white-space:nowrap}
		 *   .tag[data-tone=info]{background:color-mix(in srgb,
		 *        var(--dsw-alias-state-business-primary) 10%,transparent);
		 *        color:var(--dsw-alias-state-business-primary)}
		 *
		 * A custom colour overrides only those two declarations through the
		 * `--dsh-mb-fg` / `--dsh-mb-mix` properties pillStyle() sets.
		 *
		 * `labelCss` is a constant; nothing is written to the document here.
		 * `apply` installs the sheet inside a `ctx.effect`, which also removes it
		 * on unload. The configuration page ships its own sheet from `settings.js`.
		 */
		const labelCss = [
			".dsh-model-badge-label{vertical-align:baseline;white-space:nowrap;align-items:center;gap:4px;display:inline-flex}",
			".dsh-model-badge-pill{display:inline-flex;align-items:center;border-radius:999px;corner-shape:round;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;background:color-mix(in srgb,var(--dsh-mb-fg) var(--dsh-mb-mix),transparent);color:var(--dsh-mb-fg)}"
		].join("");

		/**
		 * Resolve a configured colour into the two custom properties the badge
		 * stylesheet reads. The composer label and the configuration page's preview
		 * both call this, so a colour can never render one way in the page and
		 * another in the composer.
		 *
		 *   a known tone name  → its alias token and that tone's mix
		 *   a `--dsw-*` token  → that token at the info mix
		 *   any other string   → a literal CSS colour at the info mix
		 *
		 * Unset falls back to `info`.
		 */
		function pillStyle(color) {
			const info = TONE_BY_ID.info;
			const known = typeof color === "string" && Object.prototype.hasOwnProperty.call(TONE_BY_ID, color);
			if (known) {
				const tone = TONE_BY_ID[color];
				return { "--dsh-mb-fg": "var(" + tone.token + ", " + tone.fallback + ")", "--dsh-mb-mix": tone.mix };
			}
			if (typeof color === "string" && color.length > 0) {
				const fg = color.startsWith("--dsw-") ? "var(" + color + ", " + info.fallback + ")" : color;
				return { "--dsh-mb-fg": fg, "--dsh-mb-mix": info.mix };
			}
			return { "--dsh-mb-fg": "var(" + info.token + ", " + info.fallback + ")", "--dsh-mb-mix": info.mix };
		}

		/**
		 * One badge as the shipped marker draws it: a tag carrying the text and a
		 * tone. The composer label and the configuration preview both render this,
		 * so a badge looks the same in both places.
		 * @param rule - one matched badge rule.
		 */
		function pill(rule) {
			const tone = toneOf(rule.color);
			const custom = tone === "custom";
			return jsx("span", {
				className: "dsh-model-badge-pill",
				"data-tone": custom ? undefined : tone,
				style: custom ? pillStyle(rule.color) : undefined,
				children: rule.badge
			});
		}
		//#endregion

		//#region rules
		/**
		 * What the shipped @deepseek-ai/dsh-client-ui-deepseek-model-label-1017
		 * occupant renders, restated here because occupying this `single` slot
		 * replaces it. These rules are consulted only after the configured ones
		 * miss, so a configuration that adds local badges keeps the official Flash
		 * marker without having to repeat it.
		 */
		const BUILTIN_RULES = [
			{ provider: "deepseek-official", model: "deepseek-flash", name: "DeepSeek-V4.1-Flash", badge: "1017" },
			{ provider: "deepseek-account", model: "deepseek-flash", name: "DeepSeek-V4.1-Flash", badge: "1017" }
		];

		/**
		 * Keep the usable rules of one settings section. An unset or empty
		 * `labels` yields no rules, which is what leaves the slot to the shipped
		 * occupant.
		 * @param {unknown} value - one settings section value.
		 */
		function readRules(value) {
			const raw = value !== null && typeof value === "object" && Array.isArray(value.labels) ? value.labels : [];
			return raw.filter((rule) => rule !== null && typeof rule === "object"
				&& typeof rule.provider === "string" && rule.provider.length > 0
				&& typeof rule.badge === "string" && rule.badge.length > 0);
		}

		/** @returns the rules matching this provider/model pair, in configured order. */
		function matching(rules, provider, model) {
			return rules.filter((rule) => {
				if (rule.provider !== provider.id) return false;
				if (rule.model !== undefined && rule.model !== model.id) return false;
				if (rule.name !== undefined && rule.name !== model.name) return false;
				return true;
			});
		}

		/**
		 * Resolve one model's badges: every matching configured rule in order.
		 * When none match and this plugin is active, fall back to the built-in
		 * rules it would otherwise drop.
		 * @returns badges to render, possibly empty.
		 */
		function badgesFor(rules, provider, model) {
			const configured = matching(rules, provider, model);
			if (configured.length > 0) return configured;
			return rules.length > 0 ? matching(BUILTIN_RULES, provider, model) : [];
		}

		/** Whether a snapshot for this entry yields at least one usable rule. */
		function servesRules(snapshot) {
			return snapshot !== null && typeof snapshot === "object" && readRules(snapshot.value).length > 0;
		}
		//#endregion

		//#region component
		/**
		 * Render the catalog name unchanged, or the name plus every badge — with
		 * the marker's own markup: label, name span, a space, then the tag.
		 * Non-interactive: the model selector owns clicks, focus and selection.
		 *
		 * The slot declares `inject` in apply(), so `provider` and `model` carry
		 * the catalog identities. A bare `undefined` is still possible right
		 * after a declaration change, and a throw here blanks the model selector
		 * itself: fall back to the catalog name rather than to an error.
		 */
		function LocalModelLabel({ provider, model }) {
			const snapshot = React.useSyncExternalStore(subscribeRules, readSnapshot, readSnapshot);
			const name = model !== null && typeof model === "object" ? model.name : undefined;
			if (provider === undefined || model === undefined) return name;
			const badges = badgesFor(readRules(snapshot.value), provider, model);
			if (badges.length === 0) return name;
			const [first, ...rest] = badges;
			return jsxs("span", {
				className: "dsh-model-badge-label",
				children: [
					jsx("span", { children: name }),
					" ",
					pill(first),
					...rest.map((rule) => pill(rule))
				]
			});
		}
		//#endregion

		//#region tones
		/** Map a configured `color` value onto the picker's vocabulary. */
		function toneOf(color) {
			if (typeof color === "string" && Object.prototype.hasOwnProperty.call(TONE_BY_ID, color)) return color;
			return typeof color === "string" && color.length > 0 ? "custom" : "info";
		}
		//#endregion

		//#region styles
		/** Identifier of the label sheet: its own `data-plugin-css` and lookup key. */
		const STYLE_ID = PACKAGE_NAME + "/model-badge.css";

		/** Identifier of the configuration page's sheet, installed by its entry. */
		const PAGE_CSS_ID = PACKAGE_NAME + "/settings.css";

		/** Install one stylesheet node unless this plugin already added it. */
		function installSheet(id, css) {
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(id) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = PACKAGE_NAME;
			tag.dataset.pluginCss = id;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		/** Remove one stylesheet node this plugin installed, matched by its id. */
		function removeSheet(id) {
			if (typeof document === "undefined") return;
			const selector = "style[data-plugin-css=" + JSON.stringify(id) + "]";
			document.querySelectorAll(selector).forEach((tag) => tag.remove());
		}
		//#endregion

		//#region lazy page
		/** The client plugin context; the page entry is registered from apply(). */
		let pageCtx;

		/**
		 * Load the configuration page's Client artifact once.
		 *
		 * `require.async` resolves a chunk relative to this package, so the editor
		 * parses, links, and fetches its catalog only when the Plugins page asks
		 * for it. A failed load clears the cache, so the next mount retries.
		 * @returns a promise of the editor's exports.
		 */
		let settingsModule;
		function loadSettings() {
			if (settingsModule === undefined) {
				settingsModule = require.async("./settings.js");
				settingsModule.catch(() => {
					settingsModule = undefined;
				});
			}
			return settingsModule;
		}


		/** Shown while `settings.js` is on the wire. */
		function PageLoading({ t }) {
			return React.createElement("div", { className: "dsh-mb-empty", children: t("loading") });
		}

		/**
		 * The page's slot entry: paints a loading row, loads `settings.js` once,
		 * installs its sheet while mounted, and renders the page it exports with
		 * the wiring that page expects — the shared form, the catalog transport,
		 * and the same tone table and pill builder the label uses, so the preview
		 * cannot drift.
		 *
		 * React 18 has no `use` hook, and the composer half has to keep working on
		 * whatever React the page's module table provides, so the mount effect
		 * stores the loaded module and re-renders once instead.
		 * @param props - the entry's own `{ view }` from the Plugins page; `ctx` is
		 * the client plugin context this factory closed over.
		 */
		function PageEntry({ props }) {
			const t = pageCtx.locale.bind(NS);
			const [settings, setSettings] = React.useState(null);
			React.useEffect(() => {
				let live = true;
				loadSettings().then((loaded) => {
					if (live) setSettings(loaded);
				}).catch((error) => {
					if (live) console.error("dsh-model-badge: configuration page failed to load", error);
				});
				return () => {
					live = false;
				};
			}, []);
			React.useEffect(() => {
				if (settings === null) return;
				installSheet(PAGE_CSS_ID, settings.styles);
				return () => removeSheet(PAGE_CSS_ID);
			}, [settings]);
			if (settings === null) return React.createElement(PageLoading, { t });
			return React.createElement(settings.ConfigPage, {
				props,
				ctx: { form, remote: pageCtx.remote, t, tones: TONES, toneOf, preview: pill }
			});
		}
		//#endregion

		//#region plugin
		/**
		 * Required services. `remote.session` is listed explicitly, not implied by
		 * `remote`: the picker reads the model catalog through that namespace, and
		 * without the declaration `ctx.remote.session` is absent, which silently
		 * degraded the pickers to free-text inputs. The catalog is fetched once by the
		 * editor in settings.js; the label seat reads none of it, because
		 * `provider` and `model` reach it through the selector's props.
		 */
		const inject = ["slots", "configForms", "remote", "remote.session", "locale"];

		/** The entry's settings form, assigned by `apply`; stable across renders. */
		let form;
		const subscribeRules = (listener) => (form === undefined ? () => {} : form.subscribe(listener));
		const readSnapshot = () => (form === undefined ? { status: "loading", value: undefined } : form.getSnapshot());

		/**
		 * Register the label only while the configured rules are non-empty, so an
		 * unconfigured install behaves exactly like one without this plugin.
		 * @param ctx - Client plugin context.
		 */
		function apply(ctx) {
			pageCtx = ctx;
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-badge: dictionaries");

			// The stylesheet is a resource like any other: installed while this
			// plugin is mounted, removed with the fiber that added it. Re-checked
			// here rather than at factory time so a reload that leaves the module
			// resident but drops its styles reinstalls them.
			ctx.effect(() => {
				installSheet(STYLE_ID, labelCss);
				return () => removeSheet(STYLE_ID);
			}, "model-badge: styles");

			form = ctx.configForms.get(ENTRY_ID);
			ctx.effect(() => () => {
				void form.dispose();
			}, "model-label: settings form");

			/**
			 * Claim the label seat while the rules are non-empty. The claim is a
			 * registration in a `single` slot the selector declares lazily, so it
			 * can be rejected; a rejection must not take the plugin's other work
			 * down, and the next settings change retries it.
			 */
			let disposeSlot;
			const claim = () => {
				if (disposeSlot === undefined) {
					try {
						disposeSlot = ctx.slots.inject("conversation.input.model.label", () => ctx.slots.register({
							name: "conversation.input.model.label",
							// This slot is `single`, and the shipped 1017 occupant sits
							// at priority 0. Take a lower number to shadow it: the
							// registry rejects a second occupant at the same priority.
							priority: -1,
							// A slot's `inject` reaches only the entries that slot itself
							// declares, so declare what this plugin's own label needs.
							// The catalog is served by `remote.session`, which `inject`
							// above keeps available.
							inject: (sessionId) => ({
								directory: ctx.remote?.session?.modelDirectoryFor?.(sessionId)
							}),
							locale: NS
						}, LocalModelLabel));
					} catch (error) {
						console.error("dsh-model-badge: could not claim the model label seat", error);
					}
				}
			};
			const release = () => {
				if (disposeSlot === undefined) return;
				try {
					disposeSlot();
				} catch (error) {
					console.error("dsh-model-badge: could not release the model label seat", error);
				}
				disposeSlot = undefined;
			};
			const sync = () => {
				if (servesRules(form.getSnapshot())) claim();
				else release();
			};
			ctx.effect(() => {
				const off = form.subscribe(sync);
				sync();
				return () => {
					off();
					release();
				};
			}, "model-badge: label occupant");

			// The bundle's own configuration page, keyed by package name. The editor
			// is a separate Client artifact (settings.js) loaded on demand, so the
			// composer label never pays for its catalog fetch, form state, or styles.
			ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: PACKAGE_NAME,
				locale: NS
			}, (props) => React.createElement(PageEntry, { props })));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
