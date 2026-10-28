# Changelog

## 1.0.0

Initial release.

- Configurable badges next to model names in the composer model selector.
- Rules match on provider id, optionally narrowed by model id and catalog name.
- Several badges per model; per-rule tone (`info`, `success`, `warning`, `danger`,
  `neutral`), theme token, or CSS colour.
- Zero configuration is inert: with no rules the plugin claims no slot and the shipped
  `1017` label keeps rendering.
- Live config reload through the Host settings seam (`volatile` + `configForms`).
- Badge geometry and tones copied from the Harness tag stylesheet; no Harness Client
  package is imported.
