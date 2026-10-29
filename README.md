# dsh-model-badge

Configurable version badges next to model names in the DeepSeek Harness composer model
selector.

English | [中文](README.zh.md)

---

## What it does

The composer's model control shows a model's catalog name. This plugin adds a small pill
after that name — the same shape and tones as the Harness' own tag component — for any
model you list in its config.

Two behavioural rules:

- **Nothing changes until you configure it.** With no rules, the plugin occupies no slot
  and the shipped `1017` label keeps rendering exactly as before.
- **A model may carry several badges.** Every matching rule renders one pill, in
  configuration order.

## Install

```sh
dsh plugin --profile <name> add dsh-model-badge
```

Open the bundle's detail page (**Settings → Plugins → dsh-model-badge**) to configure
it: add rules, pick a provider and model from the catalog, type the badge text, choose a
tone, and watch the preview update. Saving applies live — no restart. The page is its own
client artifact, loaded the first time you open it.

Or write the profile's `cordis.patch.yml` directly:

```yaml
- id: model-badge
  config:
    labels:
      - provider: scnet
        model: DeepSeek-V4.1-Flash-1017
        badge: '1017'
      - provider: scnet
        model: Kimi-K3
        badge: K3
        color: success
```

Both edit the same `labels` field; a save from the page lands in this file.

## Rules

| Field | Required | Meaning |
|---|---|---|
| `provider` | yes | Provider id, as listed under `providers` in the profile |
| `model` | no | Exact model id; omit to match every model of that provider |
| `name` | no | Exact catalog display name, to disambiguate same-named models |
| `badge` | yes | Pill text. Quote `'1017'` — unquoted, YAML parses it as a number |
| `color` | no | Tone, described below; defaults to `info` |

`color` accepts three forms:

| Form | Example | Result |
|---|---|---|
| Tone name | `info` `success` `warning` `danger` `neutral` | Coloured text over the same colour at 10–12% |
| Theme token | `--dsw-alias-state-success-primary` | That token as text colour, `info` tint |
| CSS colour | `#c026d3` | That colour as text colour, `info` tint |

Four of the tones are the Harness tag component's own; `neutral` is this plugin's own
addition, drawn from the secondary label colour. Both tones and tokens follow the light
and dark palettes automatically.

Matching is evaluated per model, not per rule: every rule whose `provider` matches and
whose `model`/`name` are either unset or equal gets a pill. A `provider`-only rule
therefore marks every model of that provider.

## How it works

```
cordis.patch.yml labels
  → Host Config (labels marked .volatile())
    → settings.describe (only volatile fields are projected)
      → browser configForms mirror
        → ctx.configForms.get('model-badge')
          → the badge, and the page's preview, subscribe; edits re-render without a restart
```

Badge geometry and tones are copied from the Harness' own tag stylesheet
(`border-radius:999px`, `padding:1px 8px`, `font-size:11px`, `line-height:17px`,
`color-mix(... 10%, transparent)`), so a badge is visually indistinguishable from a
first-party one. No Harness Client package is imported — the plugin draws the pill itself
and styles it only with `--dsw-alias-*` tokens. `dsh.client.inject` only orders plugin
activation; it is not a runtime dependency.

## Known limitations

- **This plugin takes over the model-label seat.** `conversation.input.model.label` is a
  `single` slot. Whenever rules are configured, this plugin claims it at `priority: -1`
  so it outranks the shipped `@deepseek-ai/dsh-client-ui-deepseek-model-label-1017`
  occupant (which sits at `0`). If a future Harness release changes that occupant's
  priority, the claim is refused and logged — the composer keeps the shipped label
  instead of losing it.

- **The official Flash marker is restated, not inherited.** Because claiming the seat
  replaces the shipped occupant, the plugin carries its own copy of the conditions that
  produce the `1017` badge (provider `deepseek-official` / `deepseek-account`, model
  `deepseek-flash`, name `DeepSeek-V4.1-Flash`). Those built-in rules are consulted only
  for models no configured rule matches: configure one rule and the official marker stays,
  configure a rule for the same model and yours wins.

- **Pills are text, not actions.** The seat is inline content; clicks, focus and
  selection stay with the model selector.

- **Rules live in configuration, not in a generated settings form.** This package ships
  its own page through `plugins.bundle.config`, shown on the bundle's detail page under
  Settings → Plugins. `index.js` turns the auto-generated form off for this entry
  (`settings.configure({ auto: false })`), so the same field is not edited by two
  different UIs.

- **Page copy follows the UI language.** The page reads its copy from the plugin's own
  `model-badge` locale namespace through `ctx.locale.bind()`, so switching the Harness
  language switches its labels, placeholders and save status. Provider and model names
  are not translated: they are spelled as the Host catalog spells them.

- **Styles are owned by `apply`.** The badge sheet and the page sheet are constants;
  `apply` installs the badge sheet in a `ctx.effect` and removes it when the plugin
  unloads, and the page installs its own sheet while it is mounted. Nothing is written to
  the document while a module is merely loaded.

Verified against `@deepseek-ai/dsh-desktop-runtime` **0.2.1-rc.3**.

## Layout

| File | Role |
|---|---|
| `index.js` | Host half: declares `Config`, disables the generated generic form |
| `client.js` | Browser half: claims the seat per rules, reads config, draws the pill, registers the configuration page entry and the copy both halves show |
| `settings.js` | Configuration page, loaded on demand through `require.async` |
| `cordis.patch.yml` | Bundle patch that mounts the plugin |
| `locale/*.json` | Display name and description |
| `icon.svg` | Plugin icon |

## License

MIT.
