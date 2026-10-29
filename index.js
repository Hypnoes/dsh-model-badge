/**
 * Host half of dsh-model-badge.
 *
 * The badge rules live in this plugin's config (`labels`). The Config schema
 * marks them volatile, which is what makes them readable through the Host
 * settings seam: `@deepseek-ai/dsh-settings` projects an entry's volatile fields
 * into `settings.describe`, the Web client's `configForms` service mirrors that
 * document, and the browser half of this plugin reads its own entry from there.
 * A non-volatile field would never reach that projection.
 */
import z from "@deepseek-ai/schemastery";

export const name = "model-badge";

/**
 * One badge rule.
 *
 *   provider  provider id as shown in the model directory (required)
 *   model     exact model id (optional; omit to match every model)
 *   name      exact catalog display name (optional)
 *   badge     pill text (required)
 *   color     pill tone — `info` (default), `success`, `warning`, `danger`,
 *             `neutral` — or a `--dsw-*` theme token name, or a CSS color
 */
const LabelRule = z.object({
	provider: z.string().min(1).required(),
	model: z.string(),
	name: z.string(),
	badge: z.string().min(1).required(),
	color: z.string()
});

export const Config = z.object({
	/**
	 * Rules for models this plugin should mark. Every matching rule renders one
	 * badge, in this order. Volatile so the settings seam serves them to the
	 * browser and an edit applies without a restart.
	 *
	 * Empty (the default) means "add nothing": the browser half then registers
	 * no occupant, and the shipped 1017 label keeps rendering. Only the rules
	 * this plugin is supposed to add belong here — the official DeepSeek Flash
	 * marker is part of the browser half's fallback, not of this list.
	 */
	labels: z.array(LabelRule).default([]).volatile()
});

/**
 * Mount: claim the entry's settings page policy.
 *
 * `auto: false` stops the Plugins page from generating a schema form beside
 * this entry — the browser half ships its own page through
 * `plugins.bundle.config`, and the generated form would offer a second editor
 * for the same field. Per the settings service, that policy belongs to the
 * `apply` of the plugin whose entry it is, inside an optional `settings` child.
 * It touches only this entry: no other plugin's form, page, or order changes.
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, child.fiber), "model-badge: settings page policy");
	});
}
