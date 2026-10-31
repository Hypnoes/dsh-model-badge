# Changelog

## 1.1.0 - 2026-10-31

### Fixed

- A tight composer no longer loses the badge. The name is now the part that shrinks
  (`min-width:0` + ellipsis) while the pill never shrinks (`flex:none`), so a narrow trigger
  shortens the model name and keeps the badge whole; before, the atomic inline-flex label was
  hard-clipped, which dropped the badge entirely and cut the name mid-glyph with no ellipsis.
- Badges carry their configured tone again. The host's `[data-tone=…]` colours are scoped to
  its own `Tag` class, so a `data-tone` on this plugin's span matched nothing; a tone's token
  and mix now reach every pill through `--dsh-mb-fg` / `--dsh-mb-mix`, not only custom colours.

## 1.0.0 - 2026-10-29

Initial release.

- Configuration page on the bundle's own Plugins detail page (`plugins.bundle.config`):
  staged rule rows with add/remove, provider and model pickers read from the model
  catalog, tone picker, live preview, and one revision-checked save.
- The configuration page is a separate client artifact (`settings.js`, loaded with
  `require.async`), so the composer label does not pay for its catalog fetch, form
  state, or styles.
- Badge rules match on provider id, optionally narrowed by model id and catalog name.
- Several badges per model; per-rule tone (`info`, `success`, `warning`, `danger`,
  `neutral`), theme token, or CSS colour.
- Zero configuration is inert: with no rules the plugin claims no slot and the shipped
  `1017` label keeps rendering.
- Live config reload through the Host settings seam (`volatile` + `configForms`).
- Badge geometry, tones, and label markup copied from the Harness tag stylesheet and the
  shipped `1017` occupant; no Harness Client package is imported.
- Configuration page copy is registered in the `model-badge` locale namespace and follows
  the Harness UI language.
- The badge stylesheet is installed by `apply` through `ctx.effect` and removed on unload,
  so loading the module writes nothing to the document.
- `schemastery` is an optional peer, so a profile-installed bundle resolves it from the
  Harness installation.
