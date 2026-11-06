# Changelog

## Unreleased

### Fixed

- The configuration page saves again after the plugin is reloaded. The page called
  `dispose()` on the settings controller it borrowed from the shared `configForms`
  service, but that service owns one controller per Host entry and keeps handing out the
  same instance: a released one refuses every write, so the page showed values while each
  save came back rejected. No consumer disposes a provider-owned controller now, and the
  page and the label resolve it through the service on every use instead of caching it.
- The generated schema form no longer appears beside the custom page. The
  `settings.configure({ auto: false })` policy was registered under the fiber of the
  `settings` child context created by `ctx.inject`, while the service looks the policy up
  by the entry's own fiber, so the policy was never found.
- A refused save reports a real conflict only when the revision moved; a refusal with an
  unchanged revision now says the deployment did not accept the change, and logs the
  facts instead of blaming a concurrent edit.
- A concurrent change no longer discards the draft being edited, and the write carries
  the revision read when editing began rather than the one current at save time — the
  stale-revision check is a guard again instead of a last-writer-wins write.
- Saving no longer drops a rule's `name` filter, which the page does not edit but the
  config format supports.
- The configuration page loads again on Harness builds that name every package-local
  client chunk `client.<name>.js`. The page moved from `settings.js` to
  `client.settings.js` and now registers as a chunk of this package
  (`chunk: "client.settings.js"`); `require.async("./settings.js")` is rejected by the
  module table before any request, so the Plugins detail page stayed on its loading row.

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
- The configuration page and its summary view read the settings snapshot through the
  controller's `subscribe`/`getSnapshot` pair, so an open form follows live configuration
  changes instead of rendering from a stale object.
- The label seat declares the `inject` and `locale` the model selector relies on, falls
  back to the plain model name when the host passes no `provider`/`model`, and reclaims
  the seat on the next settings change if the initial registration was refused.
- Style teardown matches this plugin's own `data-plugin-css` id, so unloading never
  removes another sheet that shares the package's `data-plugin`.
- Badge rules match on provider id, optionally narrowed by model id and catalog name.
- Several badges per model; per-rule tone (`info`, `success`, `warning`, `danger`,
  `neutral`), theme token, or CSS colour.
- Zero configuration is inert: with no rules the plugin claims no slot and the shipped
  `1017` label keeps rendering; built-in `1017` rules apply only to models no configured
  rule matches.
- Live config reload through the Host settings seam (`volatile` + `configForms`).
- Badge geometry, tones, and label markup copied from the Harness tag stylesheet and the
  shipped `1017` occupant; no Harness Client package is imported.
- Configuration page copy is registered in the `model-badge` locale namespace and follows
  the Harness UI language.
- The badge stylesheet is installed by `apply` through `ctx.effect` and removed on unload,
  so loading the module writes nothing to the document.
- `schemastery` is an optional peer, so a profile-installed bundle resolves it from the
  Harness installation.
