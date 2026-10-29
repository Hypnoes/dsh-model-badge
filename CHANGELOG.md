# Changelog

## Unreleased

### Fixed

- The configuration page rendered at all: `ConfigForm` passed the snapshot object to
  `useSyncExternalStore` instead of the controller's subscribe/getSnapshot pair, and the
  summary view read `t` from props that never carried it.
- The label seat now declares the `inject` and `locale` the selector relies on, degrades to
  the plain name when `provider`/`model` are missing, and reclaims the seat on the next
  settings change if the registration was refused.
- `schemastery` is an optional peer: a profile-installed bundle resolves it from the
  Harness installation.
- Style teardown matches this plugin's own `data-plugin-css` id, not every sheet under the
  package's `data-plugin`.

### Changed

- The configuration page is a separate client artifact (`settings.js`, loaded with
  `require.async`), so the composer label no longer pays for its catalog fetch, form
  state, or styles.
- `neutral` is documented as this plugin's own tone, and the README describes the real
  fallback behaviour: built-in `1017` rules apply only to models no configured rule
  matches.

## 1.0.0

Initial release.

- Configuration page on the bundle's own Plugins detail page (`plugins.bundle.config`):
  staged rule rows with add/remove, provider and model pickers read from the model
  catalog, tone picker, live preview, and one revision-checked save.
- Badge rules match on provider id, optionally narrowed by model id and catalog name.
- Several badges per model; per-rule tone (`info`, `success`, `warning`, `danger`), theme
  token, or CSS colour.
- Zero configuration is inert: with no rules the plugin claims no slot and the shipped
  `1017` label keeps rendering.
- Live config reload through the Host settings seam (`volatile` + `configForms`).
- Badge geometry, tones, and label markup copied from the Harness tag stylesheet and the
  shipped `1017` occupant; no Harness Client package is imported.
- Configuration page copy is registered in the `model-badge` locale namespace and follows
  the Harness UI language.
- The badge stylesheet is installed by `apply` through `ctx.effect` and removed on unload,
  so loading the module writes nothing to the document.
