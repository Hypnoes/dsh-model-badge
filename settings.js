/**
 * Browser half of dsh-model-badge — configuration page.
 *
 * The editor is its own Client artifact: `client.js` loads it on demand
 * (`require.async("./settings.js")`) when the Plugins page asks for this
 * bundle's view, so the composer label never pays for the catalog fetch, the
 * form state, or these styles.
 *
 * Nothing here imports a Harness Client package. React and the jsx runtime come
 * from the page's module table, the stylesheet is a constant installed by the
 * caller through `ctx.effect`, and every colour is a `--dsw-alias-*` token.
 */
window.__ModuleLoader__.load({
	id: "dsh-model-badge/settings",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const { jsx, jsxs } = require("react/jsx-runtime");
		const React = require("react");

		/**
		 * The editor's stylesheet. Every class is prefixed with this plugin's
		 * classes so nothing can collide with the host's own rules.
		 */
		const pageCss = [
			".dsh-mb-page{display:flex;flex-direction:column;gap:18px;padding:4px 0}",
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
		 * Tones the picker offers. The composer's badge and this preview share the
		 * table through the wiring, so a tone retuned here changes both.
		 */
		const DEFAULT_TONES = [
			{ id: "info", label: "Blue" },
			{ id: "success", label: "Green" },
			{ id: "warning", label: "Amber" },
			{ id: "danger", label: "Red" },
			{ id: "neutral", label: "Grey" }
		];

		/** Default tone resolution, for a caller that hands down no tone table. */
		function defaultToneOf(color) {
			const known = typeof color === "string" && DEFAULT_TONES.some((tone) => tone.id === color);
			if (known) return color;
			return typeof color === "string" && color.length > 0 ? "custom" : "info";
		}

		/** Default preview rendering, for a caller that hands down no pill builder. */
		function defaultPreview(rule) {
			return jsx("span", { className: "dsh-model-badge-pill", "data-tone": defaultToneOf(rule.color), children: rule.badge });
		}

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

		function Field({ label, children }) {
			return jsxs("div", {
				className: "dsh-mb-field",
				children: [jsx("label", { className: "dsh-mb-label", children: label }), children]
			});
		}

		/**
		 * One badge rule row: provider, model, text, tone, preview, remove.
		 * The preview is the composer's own pill builder, handed down by the
		 * wiring, so the row shows exactly what the selector will draw.
		 */
		function RuleRow({ rule, index, groups, problems, tones, toneOf, preview, onChange, onRemove, t }) {
			const catalogReady = groups.length > 0;
			const group = groups.find((candidate) => candidate.id === rule.provider);
			const modelKnown = group !== undefined && group.models.some((model) => model.id === rule.model);
			const tone = toneOf(rule.color);
			const rowProblems = problems[index] ?? {};

			const setField = (field, value) => onChange(index, { ...rule, [field]: value });

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
					if (next === "custom") setField("color", rule.color !== undefined && toneOf(rule.color) === "custom" ? rule.color : undefined);
					else setField("color", next === "info" ? undefined : next);
				},
				children: [
					...tones.map((option) => jsx("option", { value: option.id, children: option.label })),
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

			const chosenName = modelKnown ? group.models.find((model) => model.id === rule.model).name : rule.model;

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
										: jsx("span", { children: rule.model === undefined ? t("allModels") : chosenName }),
									rule.provider.trim().length === 0 || rule.badge.length === 0
										? null
										: preview({ provider: rule.provider, model: rule.model ?? "", name: rule.name, badge: rule.badge, color: rule.color })
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

		/**
		 * The page's form: a staged copy of the entry's rules with one atomic save.
		 *
		 * Reads and writes ride the shared settings form (`configForms`), the same
		 * transport the label occupant uses, so a save here is what the badges
		 * show immediately. A write carries the revision read before editing: a
		 * concurrent change is refused and the draft is kept for the user.
		 */
		function ConfigForm({ ctx, catalog }) {
			const { form, t } = ctx;
			const tones = ctx.tones ?? DEFAULT_TONES;
			const toneOf = ctx.toneOf ?? defaultToneOf;
			const preview = ctx.preview ?? defaultPreview;
			const groups = catalog.groups;
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
								tones,
								toneOf,
								preview,
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
		 * The page's view switch. `ctx` is the wiring the caller passes, `props`
		 * is what the Plugins page supplies (`{ view }`): `"summary"` is the text
		 * shown on the bundle card, anything else is the editor.
		 */
		function ConfigPage({ ctx, props }) {
			const read = ctx.t;
			if (props.view === "summary") return read("summary");
			return jsx(ConfigFormBody, { ctx });
		}

		/**
		 * Load the model catalog for the pickers, then mount the form. Kept apart
		 * from `ConfigPage` so the summary view renders without fetching.
		 */
		function ConfigFormBody({ ctx }) {
			const catalog = useCatalog(ctx.remote);
			if (catalog.status === "loading") return jsx("div", { className: "dsh-mb-empty", children: ctx.t("loading") });
			return jsx(ConfigForm, { ctx, catalog });
		}

		/** The editor's stylesheet, installed by the caller through `ctx.effect`. */
		exports.styles = pageCss;
		/** The page component, mounted by the caller inside its context provider. */
		exports.ConfigPage = ConfigPage;
		return module.exports;
	}
});
