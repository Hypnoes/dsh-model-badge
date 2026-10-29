# Changelog

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
- The badge and page stylesheet is installed by `apply` through `ctx.effect` and removed
  on unload, so loading the module writes nothing to the document.
