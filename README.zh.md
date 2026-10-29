# dsh-model-badge

在 DeepSeek Harness 输入区的模型选择器里，为模型名称添加可配置的版本徽标。

[English](README.md) | 中文

---

## 它做什么

输入区的模型控件会显示模型的目录名。本插件在这个名字后面追加一个小胶囊 —— 形状和
色调取自 Harness 自带的标签组件 —— 用于你在配置里列出的任何模型。

两条行为约定：

- **不配置就什么都不发生**：规则为空时，插件不占用任何 slot，内置的 `1017` 标记
  照常渲染。
- **一个模型可以有多个徽标**：每条匹配的规则渲染一个胶囊，按配置顺序排列。

## 安装

```sh
dsh plugin --profile <名字> add dsh-model-badge
```

安装后打开该 bundle 的详情页（**设置 → 插件 → dsh-model-badge**）配置：添加规则、
从下拉里选 provider 和模型、填写胶囊文字、挑选色调，右侧实时预览。改完点保存即时
生效，无需重启。配置页是独立的客户端产物，第一次打开时才加载。

也可以直接写 profile 的 `cordis.patch.yml`：

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

两种方式改的是同一份配置，界面保存后会出现在这个文件里。

## 规则字段

| 字段 | 必填 | 说明 |
|---|---|---|
| `provider` | 是 | provider id，即 profile 里 `providers` 的键 |
| `model` | 否 | 精确 model id；省略表示该 provider 下全部模型 |
| `name` | 否 | 精确目录显示名，用来区分同名模型 |
| `badge` | 是 | 胶囊文字。`'1017'` 要带引号，否则 YAML 会解析成数字 |
| `color` | 否 | 见下，默认 `info` |

`color` 三种写法：

| 写法 | 例子 | 效果 |
|---|---|---|
| 色调名 | `info` `success` `warning` `danger` `neutral` | 彩色文字 + 同色 10–12% 底色 |
| 主题变量 | `--dsw-alias-state-success-primary` | 该变量作文字色，配 `info` 底色 |
| CSS 颜色 | `#c026d3` | 该颜色作文字色，配 `info` 底色 |

前四个色调取自 Harness 标签组件自身，`neutral` 是本插件增加的、取自次级文字色的灰调。
色调与主题变量都会随深/浅色主题自动切换。

匹配是按模型逐条求值的，不是「一条规则命中就停」：凡是 `provider` 相同、且 `model` /
`name` 未填或相等的规则，各渲染一个胶囊。因此只写 `provider` 的规则会给该 provider 下
的每个模型都加徽标。

## 工作原理

```
cordis.patch.yml 的 labels
  → Host Config（labels 标记 .volatile()）
    → settings.describe 投影（只投影 volatile 字段）
      → 浏览器 configForms 镜像
        → ctx.configForms.get('model-badge')
          → 胶囊与配置页的预览共同订阅；改动即时重渲染，无需重启
```

胶囊的几何与色调抄自 Harness 自带的标签样式表（`border-radius:999px`、`padding:1px 8px`、
`font-size:11px`、`line-height:17px`、`color-mix(... 10%, transparent)`），所以外观与官方
标签无法区分。插件不 import 任何 Harness Client 包 —— 胶囊由插件自己绘制，样式只用
`--dsw-alias-*` 主题变量。`dsh.client.inject` 只决定插件激活顺序，不是运行时依赖。

## 已知限制

- **本插件会接管模型标签座位。** `conversation.input.model.label` 是 `single` slot。
  一旦配置了规则，插件以 `priority: -1` 占用它，从而压过内置的
  `@deepseek-ai/dsh-client-ui-deepseek-model-label-1017`（其为 `0`）。若未来的 Harness
  版本改变了该占用者的优先级，这次占用会被拒绝并写日志 —— 输入区保留官方标签，而不是
  整个消失。

- **官方 Flash 标记是复刻，不是继承。** 接管座位会顶掉内置占用者，所以插件自带一份
  生成 `1017` 徽标的判定条件（provider `deepseek-official` / `deepseek-account`、model
  `deepseek-flash`、name `DeepSeek-V4.1-Flash`）。这些内置规则只在没有配置规则命中该模型
  时生效：配了别的规则，官方标记照旧；给同一模型配了规则，以你的规则为准。

- **胶囊是文字，不是操作。** 该座位只承载内联内容；点击、焦点与选择仍归模型选择器。

- **规则在配置文件，不在自动生成的设置表单里。** `labels` 是 volatile 字段，改动即时生效。
  本插件自带配置页（`plugins.bundle.config`），位于「设置 → 插件 → dsh-model-badge」的
  详情页。`index.js` 为本条目关掉自动生成的表单（`settings.configure({ auto: false })`），
  避免同一个字段被两套界面编辑。

- **配置页文案跟随界面语言。** 配置页从插件自己的 `model-badge` 语言命名空间、经
  `ctx.locale.bind()` 读取，因此切换 Harness 界面语言时，标签、占位符和保存状态一起切换。
  provider 与模型名不翻译，按 Host 目录里的原样显示。

- **样式分两处持有。** 胶囊样式与页面样式都是常量：`apply` 在 `ctx.effect` 里安装胶囊
  样式表、插件卸载时移除；页面只在自己挂载期间安装自己的样式表。模块仅仅是加载、未生效时
  不会向文档写入任何东西。

已在 `@deepseek-ai/dsh-desktop-runtime` **0.2.1-rc.3** 上验证。

## 文件结构

| 文件 | 角色 |
|---|---|
| `index.js` | Host 侧：声明 `Config`，关闭自动生成的通用表单 |
| `client.js` | 浏览器侧：按规则占用座位、读配置、绘制胶囊，注册配置页入口，并提供两侧共用的文案 |
| `settings.js` | 配置页，经 `require.async` 按需加载 |
| `cordis.patch.yml` | 挂载插件用的 bundle patch |
| `locale/*.json` | 显示名称与描述 |
| `icon.svg` | 插件图标 |

## 许可证

MIT。
