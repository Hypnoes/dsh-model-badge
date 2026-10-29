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
		 * The shipped stylesheet, copied rule for rule: the label wrapper and the
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
		 * `labelCss`, `pageCss`, and `STYLES` are constants; nothing is written to
		 * the document here. `apply` installs the combined sheet inside a
		 * `ctx.effect`, which also removes it on unload.
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

		//#region styles
		const pageCss = [
			".dsh-mb-page{display:flex;flex-direction:column;gap:18px;padding:4px 0}",
			".dsh-mb-head{display:flex;flex-direction:column;gap:4px}",
			".dsh-mb-title{font-size:14px;font-weight:600;color:var(--dsw-alias-label-primary)}",
			".dsh-mb-hint{font-size:12px;line-height:18px;color:var(--dsw-alias-label-tertiary)}",
			".dsh-mb-rules{display:flex;flex-direction:column;gap:10px}",
			".dsh-mb-rule{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,0.7fr) minmax(0,0.7fr);gap:10px;padding:12px;border-radius:8px;background:var(--dsw-alias-bg-layer-1)}",
			".dsh-mb-field{display:flex;flex-direction:column;gap:5px;min-width:0}",
			".dsh-mb-label{font-size:12px;color:var(--dsw-alias-label-secondary)}",
			".dsh-mb-input,.dsh-mb-select{box-sizing:border-box;width:100%;height:30px;padding:0 8px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-size:13px;font-family:inherit;outline:none}",
			".dsh-mb-input:focus,.dsh-mb-select:focus{border-color:var(--dsw-alias-state-business-primary)}",
			".dsh-mb-select{appearance:none;cursor:pointer}",
			".dsh-mb-invalid{border-color:var(--dsw-alias-state-error-primary)}",
			".dsh-mb-row-foot{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:10px}",
			".dsh-mb-preview{display:inline-flex;align-items:center;gap:4px;font-size:13px;color:var(--dsw-alias-label-secondary);min-height:20px}",
			".dsh-mb-remove{height:26px;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:12px;font-family:inherit;cursor:pointer}",
			".dsh-mb-remove:hover{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}",
			".dsh-mb-add{height:30px;padding:0 12px;border:1px dashed var(--dsw-alias-border-l3);border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;font-family:inherit;cursor:pointer}",
			".dsh-mb-add:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l4)}",
			".dsh-mb-actions{display:flex;align-items:center;gap:8px;justify-content:flex-end}",
			".dsh-mb-status{flex:1;font-size:12px;color:var(--dsw-alias-label-tertiary)}",
			".dsh-mb-status[data-tone=error]{color:var(--dsw-alias-state-error-primary)}",
			".dsh-mb-btn{height:30px;padding:0 14px;border-radius:6px;border:1px solid transparent;font-size:13px;font-family:inherit;cursor:pointer}",
			".dsh-mb-btn[data-kind=primary]{background:var(--dsw-alias-button-primary-fill);color:var(--dsw-alias-label-primary-foreground)}",
			".dsh-mb-btn[data-kind=ghost]{background:transparent;border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary)}",
			".dsh-mb-btn:disabled{opacity:.5;cursor:default}",
			".dsh-mb-empty{padding:14px;border-radius:8px;background:var(--dsw-alias-bg-layer-1);font-size:13px;color:var(--dsw-alias-label-tertiary)}"
		].join("");

		/**
		 * The plugin's whole stylesheet, one `<style>` for the composer label and
		 * the configuration page alike. Held as constants so the factory only
		 * declares data; `apply` owns installing and removing it.
		 */
		const STYLES = labelCss + pageCss;
		const STYLE_ID = PACKAGE_NAME + "/model-badge.css";

		/** Add the stylesheet to the document head unless it is already there. */
		function installStyles() {
			if (typeof document === "undefined") return;
			if (document.querySelector("style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]") !== null) return;
			const tag = document.createElement("style");
			tag.dataset.plugin = PACKAGE_NAME;
			tag.dataset.pluginCss = STYLE_ID;
			tag.textContent = STYLES;
			document.head.appendChild(tag);
		}

		/** Remove this plugin's stylesheet nodes, matched by this sheet's own id. */
		function removeStyles() {
			if (typeof document === "undefined") return;
			const selector = "style[data-plugin-css=" + JSON.stringify(STYLE_ID) + "]";
			document.querySelectorAll(selector).forEach((tag) => tag.remove());
		}
		//#endregion

		//#region tones
		/** Map a configured `color` value onto the picker's vocabulary. */
		function toneOf(color) {
			if (typeof color === "string" && Object.prototype.hasOwnProperty.call(TONE_BY_ID, color)) return color;
			return typeof color === "string" && color.length > 0 ? "custom" : "info";
		}
		//#endregion

		//#region catalog
		/**
		 * Read the Host-generation model catalog once and keep it: providers with
		 * their models. A failed load yields an empty list, which switches the
		 * pickers to free text.
		 */
		function useCatalog(remote) {
			const [state, setState] = React.useState({ status: "loading", groups: [] });
			React.useEffect(() => {
				let live = true;
				const load = async () => {
					try {
						const response = await remote.session.modelCatalog();
						if (!live) return;
						if (!response?.ok) {
							setState({ status: "failed", groups: [] });
							return;
						}
						const groups = (response.value?.groups ?? [])
							.filter((group) => Array.isArray(group.models) && group.models.length > 0)
							.map((group) => ({
								id: group.id,
								name: group.name ?? group.id,
								models: group.models.map((model) => ({ id: model.id, name: model.name ?? model.id }))
							}));
						setState({ status: "ready", groups });
					} catch {
						if (live) setState({ status: "failed", groups: [] });
					}
				};
				void load();
				return () => { live = false; };
			}, [remote]);
			return state;
		}
		//#endregion

		//#region draft
		/** A blank rule the editor starts a new row from. */
		function blankRule(provider) {
			return { provider: provider ?? "", model: undefined, name: undefined, badge: "", color: undefined };
		}

		/** Rules as the editor holds them, with unset optional fields dropped. */
		function toRules(value) {
			const raw = value !== null && typeof value === "object" && Array.isArray(value.labels) ? value.labels : [];
			return raw
				.filter((rule) => rule !== null && typeof rule === "object")
				.map((rule) => ({
					provider: typeof rule.provider === "string" ? rule.provider : "",
					model: typeof rule.model === "string" && rule.model.length > 0 ? rule.model : undefined,
					name: typeof rule.name === "string" && rule.name.length > 0 ? rule.name : undefined,
					badge: typeof rule.badge === "string" ? rule.badge : "",
					color: typeof rule.color === "string" && rule.color.length > 0 ? rule.color : undefined
				}));
		}

		/** Compare rules ignoring key order, to decide whether Save is enabled. */
		function sameRules(a, b) {
			return JSON.stringify(a.map(stableRule)) === JSON.stringify(b.map(stableRule));
		}
		function stableRule(rule) {
			return [rule.provider ?? "", rule.model ?? "", rule.name ?? "", rule.badge ?? "", rule.color ?? ""];
		}

		/** Field-level problems that block a save, keyed by row index. */
		/**
		 * Field-level problems that block a save, keyed by row index. `t` is the
		 * page's locale reader, so validation copy follows the active language.
		 */
		function validate(rules, t) {
			const problems = {};
			rules.forEach((rule, index) => {
				const row = {};
				if (rule.provider.trim().length === 0) row.provider = t("required");
				if (rule.badge.trim().length === 0) row.badge = t("required");
				if (Object.keys(row).length > 0) problems[index] = row;
			});
			return problems;
		}
		//#endregion

		//#region controls
		function Field({ label, children }) {
			return jsxs("div", {
				className: "dsh-mb-field",
				children: [jsx("label", { className: "dsh-mb-label", children: label }), children]
			});
		}

		/** One badge rule row: provider, model, text, tone, preview, remove. */
		function RuleRow({ rule, index, groups, problems, onChange, onRemove, t }) {
			const catalogReady = groups.length > 0;
			const group = groups.find((candidate) => candidate.id === rule.provider);
			const modelKnown = group !== undefined && group.models.some((model) => model.id === rule.model);
			const tone = toneOf(rule.color);
			const rowProblems = problems[index] ?? {};

			const setField = (field, value) => onChange(index, { ...rule, [field]: value });

			// Provider: a select when the catalog lists providers, otherwise text.
			const providerControl = catalogReady
				? jsxs("select", {
					className: "dsh-mb-select" + (rowProblems.provider === undefined ? "" : " dsh-mb-invalid"),
					value: rule.provider,
					"aria-label": "provider",
					onChange: (event) => {
						const next = event.target.value;
						// Clear a model that does not belong to the new provider.
						const nextGroup = groups.find((candidate) => candidate.id === next);
						const keepModel = nextGroup !== undefined && nextGroup.models.some((model) => model.id === rule.model);
						onChange(index, { ...rule, provider: next, model: keepModel ? rule.model : undefined });
					},
					children: [
						jsx("option", { value: "", children: t("chooseProvider") }),
						...groups.map((candidate) => jsx("option", { value: candidate.id, children: candidate.name }))
					]
				})
				: jsx("input", {
					className: "dsh-mb-input" + (rowProblems.provider === undefined ? "" : " dsh-mb-invalid"),
					value: rule.provider,
					"aria-label": "provider",
					placeholder: t("providerPlaceholder"),
					onChange: (event) => setField("provider", event.target.value)
				});

			// Model: a select over the chosen provider's models, or text.
			const modelControl = group !== undefined
				? jsxs("select", {
					className: "dsh-mb-select",
					value: modelKnown ? rule.model : "",
					"aria-label": "model",
					onChange: (event) => {
						const next = event.target.value;
						setField("model", next.length === 0 ? undefined : next);
					},
					children: [
						jsx("option", { value: "", children: t("allModels") }),
						...group.models.map((model) => jsx("option", { value: model.id, children: model.name }))
					]
				})
				: jsx("input", {
					className: "dsh-mb-input",
					value: rule.model ?? "",
					"aria-label": "model",
					placeholder: t("modelPlaceholder"),
					onChange: (event) => {
						const next = event.target.value.trim();
						setField("model", next.length === 0 ? undefined : next);
					}
				});

			const badgeControl = jsx("input", {
				className: "dsh-mb-input" + (rowProblems.badge === undefined ? "" : " dsh-mb-invalid"),
				value: rule.badge,
				"aria-label": "badge",
				placeholder: t("badgePlaceholder"),
				onChange: (event) => setField("badge", event.target.value)
			});

			const toneControl = jsxs("select", {
				className: "dsh-mb-select",
				value: tone,
				"aria-label": "color",
				onChange: (event) => {
					const next = event.target.value;
					if (next === "custom") setField("color", rule.color !== undefined && toneOf(rule.color) === "custom" ? rule.color : TONE_BY_ID.info.token);
					else setField("color", next === "info" ? undefined : next);
				},
				children: [
					...TONES.map((option) => jsx("option", { value: option.id, children: option.label })),
					jsx("option", { value: "custom", children: t("customTone") })
				]
			});

			const customControl = tone === "custom"
				? jsx("input", {
					className: "dsh-mb-input",
					value: rule.color ?? "",
					"aria-label": "custom color",
					placeholder: t("customColorPlaceholder"),
					onChange: (event) => setField("color", event.target.value.length === 0 ? undefined : event.target.value)
				})
				: null;

			return jsxs("div", {
				className: "dsh-mb-rule",
				children: [
					jsx(Field, { label: t("providerLabel"), children: providerControl }),
					jsx(Field, { label: t("modelLabel"), children: modelControl }),
					jsx(Field, { label: t("badgeLabel"), children: badgeControl }),
					jsx(Field, { label: t("toneLabel"), children: customControl === null ? toneControl : jsxs("div", { className: "dsh-mb-field", children: [toneControl, customControl] }) }),
					jsxs("div", {
						className: "dsh-mb-row-foot",
						children: [
							jsxs("span", {
								className: "dsh-mb-preview",
								children: [
									rule.provider.trim().length === 0
										? jsx("span", { children: t("previewHint") })
										: jsx("span", { children: rule.model === undefined ? t("allModels") : (modelKnown ? (group.models.find((m) => m.id === rule.model).name) : rule.model) }),
									rule.provider.trim().length === 0 || rule.badge.length === 0 ? null : jsx(BadgePill, { rule })
								]
							}),
							jsx("button", {
								type: "button",
								className: "dsh-mb-remove",
								onClick: () => onRemove(index),
								children: t("remove")
							})
						]
					})
				]
			});
		}
		//#endregion

		//#region page
		/**
		 * The page's form: a staged copy of the entry's rules with one atomic save.
		 *
		 * Reads and writes ride the shared settings form (`configForms`), the same
		 * transport the label occupant uses, so a save here is what the badges
		 * show immediately. A write carries the revision read before editing: a
		 * concurrent change is refused and the draft is kept for the user.
		 */
		function ConfigForm({ form, groups, t }) {
			// `form` is the configForms controller: React wants a subscribe
			// function and a getSnapshot function, not the snapshot itself.
			const snapshot = React.useSyncExternalStore(
				React.useCallback((listener) => form.subscribe(listener), [form]),
				React.useCallback(() => form.getSnapshot(), [form])
			);

			const stored = React.useMemo(() => toRules(snapshot.value), [snapshot]);
			const [draft, setDraft] = React.useState(stored);
			const [busy, setBusy] = React.useState(false);
			const [error, setError] = React.useState(null);

			// Adopt what the Host holds whenever it changes underneath us, unless a
			// save of our own is in flight.
			React.useEffect(() => {
				if (!busy) setDraft(stored);
			}, [stored, busy]);

			const dirty = !sameRules(draft, stored);
			const problems = validate(draft, t);
			const blocked = Object.keys(problems).length > 0;
			const unwritable = snapshot.status !== "ready" || snapshot.writable === false;
			const canSave = dirty && !blocked && !busy && !unwritable;

			const changeRule = React.useCallback((index, next) => {
				setDraft((current) => current.map((rule, at) => (at === index ? next : rule)));
			}, []);
			const removeRule = React.useCallback((index) => {
				setDraft((current) => current.filter((_, at) => at !== index));
			}, []);
			const addRule = React.useCallback(() => {
				setDraft((current) => [...current, blankRule(groups[0]?.id)]);
			}, [groups]);

			const save = async () => {
				if (!canSave) return;
				setBusy(true);
				setError(null);
				const revision = snapshot.revision;
				const labels = draft.map((rule) => {
					const entry = { provider: rule.provider.trim(), badge: rule.badge.trim() };
					if (rule.model !== undefined) entry.model = rule.model;
					if (rule.name !== undefined) entry.name = rule.name;
					if (rule.color !== undefined) entry.color = rule.color;
					return entry;
				});
				const accepted = await form.mutate([{ op: "set", path: ["labels"], value: labels }], revision);
				setBusy(false);
				if (!accepted) setError(t("saveRejected"));
			};

			if (snapshot.status === "loading" || snapshot.status === "idle") {
				return jsx("div", { className: "dsh-mb-empty", children: t("loading") });
			}
			if (snapshot.status === "unavailable") {
				return jsx("div", { className: "dsh-mb-empty", children: t("unavailable") });
			}

			return jsxs("div", {
				className: "dsh-mb-page",
				children: [
					jsx("div", { className: "dsh-mb-hint", children: t("hint") }),
					draft.length === 0
						? jsx("div", { className: "dsh-mb-empty", children: t("empty") })
						: jsx("div", {
							className: "dsh-mb-rules",
							children: draft.map((rule, index) => jsx(RuleRow, {
								rule,
								index,
								groups,
								problems,
								onChange: changeRule,
								onRemove: removeRule,
								t
							}, index))
						}),
					jsx("button", { type: "button", className: "dsh-mb-add", onClick: addRule, children: t("addRule") }),
					jsxs("div", {
						className: "dsh-mb-actions",
						children: [
							jsx("span", {
								className: "dsh-mb-status",
								"data-tone": error === null ? undefined : "error",
								children: error
									?? (unwritable
										? t("readOnly")
										: blocked
											? t("requiredHint")
											: dirty ? t("unsaved") : "")
							}),
							jsx("button", {
								type: "button",
								className: "dsh-mb-btn",
								"data-kind": "ghost",
								disabled: !dirty || busy,
								onClick: () => { setDraft(stored); setError(null); },
								children: t("cancel")
							}),
							jsx("button", {
								type: "button",
								className: "dsh-mb-btn",
								"data-kind": "primary",
								disabled: !canSave,
								onClick: () => { void save(); },
								children: busy ? t("saving") : t("save")
							})
						]
					})
				]
			});
		}

		/**
		 * Page wiring handed from the plugin body: the shared form, the remote,
		 * and the locale reader. Declared before the page that consumes it so no
		 * component depends on declaration order.
		 */
		const PageContext = React.createContext(undefined);

		/**
		 * The page's entry point. The plugin page supplies `{ view }`; the wiring
		 * comes from `PageContext`, and both views are rendered here so the
		 * summary receives the same locale reader as the form.
		 */
		function ConfigPage({ view }) {
			const ctx = React.useContext(PageContext);
			// Without the wiring (a page mounted outside this plugin's
			// registration) the fallback reads the first shipped locale, because
			// no reader is bound yet.
			const t = ctx === undefined ? (key) => zh[key] : ctx.t;
			if (ctx === undefined) {
				return jsx("div", { className: "dsh-mb-empty", children: t("notReady") });
			}
			if (view === "summary") return t("summary");
			return jsx(ConfigFormBody, { form: ctx.form, remote: ctx.remote, t: ctx.t });
		}

		/**
		 * Load the model catalog for the pickers, then mount the form. Split from
		 * `ConfigPage` so the summary view renders without fetching anything.
		 */
		function ConfigFormBody({ form, remote, t }) {
			const catalog = useCatalog(remote);
			return jsx(ConfigForm, { form, groups: catalog.groups, t });
		}
		//#endregion


		//#region plugin
		/** Required services: the slot registry and the settings form transport. */
		/**
		 * Required services. `remote.session` is listed explicitly, not implied by
		 * `remote`: the picker reads the model catalog through that namespace, and
		 * without the declaration `ctx.remote.session` is absent, which silently
		 * degraded the pickers to free-text inputs. The catalog is fetched once by
		 * `ConfigFormBody`; the label seat reads none of it, because `provider`
		 * and `model` reach it through the selector's props.
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
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "model-badge: dictionaries");

			// The stylesheet is a resource like any other: installed while this
			// plugin is mounted, removed with the fiber that added it. Re-checked
			// here rather than at factory time so a reload that leaves the module
			// resident but drops its styles reinstalls them.
			ctx.effect(() => {
				installStyles();
				return () => removeStyles();
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

			// The bundle's own configuration page, keyed by package name.
			ctx.slots.inject("plugins.bundle.config", () => ctx.slots.register({
				name: "plugins.bundle.config",
				key: PACKAGE_NAME,
				locale: NS
			}, (props) => React.createElement(PageContext.Provider, {
				value: { form, remote: ctx.remote, t }
			}, React.createElement(ConfigPage, props))));
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
