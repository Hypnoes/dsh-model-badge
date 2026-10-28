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

		//#region styles
		/**
		 * The shipped tag's own metrics, copied from its stylesheet so the local
		 * badges are indistinguishable from it:
		 *
		 *   display:inline-flex; align-items:center; border-radius:999px;
		 *   padding:1px 8px; font-size:11px; line-height:17px; font-weight:500
		 *
		 * Tones follow the same shape too — coloured text over the SAME colour at
		 * 10% opacity, not a surface fill:
		 *
		 *   [data-tone=info]{ color: var(--dsw-alias-state-business-primary);
		 *                     background: color-mix(in srgb, <same> 10%, transparent) }
		 */
		const TONES = {
			info: { fg: "--dsw-alias-state-business-primary", mix: "10%" },
			success: { fg: "--dsw-alias-state-success-primary", mix: "10%" },
			warning: { fg: "--dsw-alias-state-warn-primary", mix: "12%" },
			danger: { fg: "--dsw-alias-state-error-primary", mix: "10%" },
			neutral: { fg: "--dsw-alias-label-secondary", mix: "10%" }
		};

		/** Fallbacks keep the chip legible if a token is renamed upstream. */
		const TONE_FALLBACK = {
			info: "#7aaaff",
			success: "#3ddc97",
			warning: "#f0b429",
			danger: "#ff6b6b",
			neutral: "#8b8d93"
		};

		const css = [
			".dsh-model-badge-label{vertical-align:baseline;white-space:nowrap;align-items:center;gap:6px;display:inline-flex}",
			".dsh-model-badge-label>.dsh-model-badge-pill{display:inline-flex;align-items:center;border-radius:999px;corner-shape:round;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;color:var(--dsh-model-badge-fg);background-color:color-mix(in srgb,var(--dsh-model-badge-fg) var(--dsh-model-badge-mix),transparent)}"
		].join("");
		const cssId = "dsh-model-badge/LocalModelLabel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(cssId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-model-badge";
			tag.dataset.pluginCss = cssId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}

		/**
		 * Resolve a configured colour into the two custom properties the stylesheet
		 * reads: the foreground token (or literal colour) and its tint strength.
		 *
		 *   a known tone name  → its alias token and that tone's mix
		 *   a `--dsw-*` token  → that token at the info mix
		 *   any other string   → a literal CSS colour at the info mix
		 *
		 * Unset falls back to `info`.
		 */
		function pillStyle(color) {
			const known = typeof color === "string" && Object.prototype.hasOwnProperty.call(TONES, color);
			const tone = known ? TONES[color] : TONES.info;
			const mix = known ? tone.mix : TONES.info.mix;
			if (known) {
				const fallback = TONE_FALLBACK[color];
				return {
					"--dsh-model-badge-fg": "var(" + tone.fg + ", " + fallback + ")",
					"--dsh-model-badge-mix": mix
				};
			}
			if (typeof color === "string" && color.length > 0) {
				const fg = color.startsWith("--dsw-") ? "var(" + color + ", " + TONE_FALLBACK.info + ")" : color;
				return { "--dsh-model-badge-fg": fg, "--dsh-model-badge-mix": mix };
			}
			return {
				"--dsh-model-badge-fg": "var(" + TONES.info.fg + ", " + TONE_FALLBACK.info + ")",
				"--dsh-model-badge-mix": mix
			};
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
		 * Render the catalog name unchanged, or the name plus every badge pill.
		 * Non-interactive: the model selector owns clicks, focus and selection.
		 */
		function LocalModelLabel({ provider, model }) {
			const snapshot = React.useSyncExternalStore(subscribeRules, readSnapshot, readSnapshot);
			const badges = badgesFor(readRules(snapshot.value), provider, model);
			if (badges.length === 0) return model.name;
			return jsxs("span", {
				className: "dsh-model-badge-label",
				children: [
					jsx("span", { children: model.name }),
					...badges.map((rule, index) => jsx("span", {
						key: index,
						className: "dsh-model-badge-pill",
						style: pillStyle(rule.color),
						children: rule.badge
					}))
				]
			});
		}
		//#endregion

		//#region plugin
		/** Required services: the slot registry and the settings form transport. */
		const inject = ["slots", "configForms"];

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
			form = ctx.configForms.get(ENTRY_ID);
			ctx.effect(() => () => {
				void form.dispose();
			}, "model-label: settings form");

			let disposeSlot;
			const sync = () => {
				const wanted = servesRules(form.getSnapshot());
				if (wanted && disposeSlot === undefined) disposeSlot = ctx.slots.inject("conversation.input.model.label", () => ctx.slots.register({
					name: "conversation.input.model.label",
					// This slot is `single`, and the shipped 1017 occupant sits at
					// priority 0. Take a lower number to shadow it: the registry
					// rejects a second occupant at the same priority.
					priority: -1
				}, LocalModelLabel));
				else if (!wanted && disposeSlot !== undefined) {
					disposeSlot();
					disposeSlot = undefined;
				}
			};
			ctx.effect(() => {
				const off = form.subscribe(sync);
				sync();
				return () => {
					off();
					if (disposeSlot !== undefined) disposeSlot();
					disposeSlot = undefined;
				};
			}, "model-label: label occupant");
		}
		//#endregion

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
