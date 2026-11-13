# x-bot-unread-filter

从 `x.com` 桌面网页的**左侧导航栏“私信”徽标**、**浏览器标签页标题未读数**与**网站图标（favicon）未读红点**中排除 **Grok Bot 会话**的未读计数，同时保留普通私信提醒、X 原生选定的其他通知提醒，以及聊天列表内 Bot 会话自身的未读蓝点。

**网页用户脚本（`x-human-dm-badge.user.js`） · MIT 许可 · macOS Brave 桌面版已验证**

![左侧导航徽标过滤示意（虚构会话数据，仅示意导航栏徽标一处效果）](docs/badge-preview.svg)

> 上图使用虚构会话数据，仅示意左侧“私信”导航徽标。脚本同时过滤网页标题和标签页图标：例如当前仅有 3 条 Grok Bot 未读时，页面标题会从 `(3) X` 变为 `X`，未读图标恢复为普通图标；有普通私信或其他通知未读时则正常保留提醒。

## 安装与更新

- **[从 Greasy Fork 安装（中文）](https://greasyfork.org/zh-CN/scripts/605054)** · **[Greasy Fork (English)](https://greasyfork.org/en/scripts/605054)**
- **备用直装 / 源码文件**：[`x-human-dm-badge.user.js` (GitHub Raw)](https://raw.githubusercontent.com/MrEasonYang/x-bot-unread-filter/main/x-human-dm-badge.user.js)

1. 从 [Tampermonkey 官网](https://www.tampermonkey.net/)安装对应浏览器的官方扩展。
2. 在浏览器扩展管理详情中开启 **Allow User Scripts（允许用户脚本）**（Chromium 系浏览器开启步骤见 [官方说明 Q209](https://www.tampermonkey.net/faq.php?locale=en&q=Q209)，无需关闭浏览器安全防护）。
3. 打开上方安装链接，确认运行范围仅为 `https://x.com/*` 后点击安装。
4. 刷新 `x.com` 即可生效。停用或卸载脚本后刷新 `x.com`，即可恢复 X 原生显示。全程无需提供 X 账号、密码或 API Key。

**常见问题与旧版升级说明**：
- **0.0.1–0.0.3 用户升级提示**：由于 `0.0.4` 更新了默认 `@name`（以便在默认语言为简体中文的 Greasy Fork 上正确显示新标题），而脚本管理器通过 `@name` + `@namespace` 组合识别已安装脚本（参见 [Greasy Fork 元数据说明](https://greasyfork.org/en/help/meta-keys)），直接重装或导入可能会生成重复条目。已安装 `0.0.1`–`0.0.3` 的用户请直接在 Tampermonkey 编辑器中用 `0.0.4` 源码替换保存原有条目（已在 Brave 实测保留同一条目并更新标题与版本），或先删除旧版条目后再安装 `0.0.4`。新用户直接按上方步骤安装即可。
- **点击安装后只显示源码**：将 `.user.js` 下载到本地，在 Tampermonkey 的 **Utilities → Import from file** 中导入（已在 Brave 实测）。
- **站点访问权限与自动更新**：若将 Tampermonkey 的站点访问权限限制为仅 `x.com`，直接点击安装和自动更新可能受阻。你可保持该权限并手动导入新版，或在弹窗提示时放行对应下载域名（Greasy Fork 为 `update.greasyfork.org`，GitHub 为 `raw.githubusercontent.com`）。GitHub 源码与双语说明会定期自动同步至同一个 Greasy Fork 页面（无固定同步间隔；跨版本/改名自动更新尚未实测）。

## 功能范围与边界

- **仅排除 X 的 Grok Bot 会话，不识别“真人”**：脚本仅过滤 X 内置的 Grok Bot 会话计数，**不会**判断普通 X 账号背后是不是真人、自动回复、营销号或垃圾私信；普通账号发来的私信仍按普通私信计入。
- **不改动消息与已读状态**：Grok Bot 消息照常接收，聊天列表中的未读蓝点保持原样；不会将消息标记为已读，也不会静音通知、屏蔽账号或删除消息。
- **仅限 `x.com` 桌面网页**：不影响 X 手机客户端、系统推送通知或操作系统应用图标角标。
- **直接读取独立计数**：使用 X 页面状态中独立的普通私信计数与原生标题组件已选定的未读计数，不靠减去屏幕上可见的聊天条目来估算，因此不依赖聊天列表是否加载或滚动。普通未读私信超过 99 条时，导航徽标显示为 `99+`，无障碍属性（`aria-label`）保留实际数值。

## 隐私与安全回退

- **无网络请求与额外依赖**：脚本自身不发起网络请求，无外部运行时依赖、本地存储或日志输出（切换网站图标时，浏览器可能加载或使用缓存中的 X 普通图标资源；安装与更新下载由 Tampermonkey 独立完成）。
- **不读取私密内容**：不读取私信正文、通知条目明细、Cookie 或登录凭证，不调用或替换 X 原生组件方法，也不写入应用状态。脚本需在页面主环境运行（`@sandbox raw`、`@grant none`），因此全部运行时逻辑保持为单文件可读源码供检查。
- **异常自动恢复**：若 X 改版导致计数字段或组件结构不可用，脚本会放弃干预并恢复对应的原生提醒；无法识别的网页标题格式与图标地址保持原样不动。

## 验证状态与限制

- **已验证环境**：macOS Brave 桌面版 + Tampermonkey 5.5.1（覆盖持久化安装、编辑器内替换旧版升级、页面刷新、首页与聊天页切换、仅 Bot 未读过滤，以及导航徽标、标题和图标提醒的还原）。
- **测试覆盖**：24 项自动化测试全部通过，包含普通私信与 Bot 混合计数、其他通知保留、远端字段回退、SPA 导航重建及还原逻辑。
- **未实测范围**：真实普通私信在线新到达的完整链路、跨版本/改名自动升级、其他浏览器及其他脚本管理器尚未实测。

## 开发与反馈

```sh
npm ci --ignore-scripts
npm test
npm run prepare-release
```

npm 依赖仅用于本地测试，不发布到 npm；`prepare-release` 仅在本地生成更新元数据与发布包，不上传任何文件。

- **源码仓库**：<https://github.com/mreasonyang/x-bot-unread-filter>
- **问题反馈**：<https://github.com/mreasonyang/x-bot-unread-filter/issues>（请说明浏览器与 Tampermonkey 版本，**请勿**附带私信正文、账号凭证或未处理的原始日志）
- **声明**：非官方项目，与 X、xAI 或 Tampermonkey 无隶属或合作关系。

## English Overview

**x-bot-unread-filter** (`x-human-dm-badge.user.js`) is an MIT-licensed userscript for `https://x.com/*` on desktop browsers. It excludes X's **Grok Bot** conversation unread counts from the left navigation DM badge, browser tab title, and favicon while keeping ordinary DM reminders, X's selected other-notification counts, and in-list bot unread dots. It only filters X's Grok Bot counter—it does not detect whether ordinary X accounts are real humans or bots, mark messages as read, or affect mobile apps, push notifications, or OS badges.

The script reads only X's independent ordinary-DM counter and the native title component's selected unread counts; it never reads message bodies, notification entries, or credentials, never calls or replaces native component methods, and makes no network requests (changing the favicon may let the browser load X's ordinary icon asset). Verified on macOS Brave with Tampermonkey 5.5.1 and 24 automated tests; live arrival of a new ordinary DM, automatic cross-version/rename upgrades, and other browsers/managers are untested.

**Install & upgrade**: Install [Tampermonkey](https://www.tampermonkey.net/), enable **Allow User Scripts** ([FAQ Q209](https://www.tampermonkey.net/faq.php?locale=en&q=Q209)), install from [Greasy Fork](https://greasyfork.org/en/scripts/605054) or [GitHub Raw](https://raw.githubusercontent.com/MrEasonYang/x-bot-unread-filter/main/x-human-dm-badge.user.js), and reload `x.com` (or download the `.user.js` and use **Utilities → Import from file** if clicking install shows source text). Because `0.0.4` updates the default `@name` for Greasy Fork display compatibility and script managers match installations by `@name` + `@namespace` ([meta keys guide](https://greasyfork.org/en/help/meta-keys)), users upgrading from `0.0.1`–`0.0.3` should replace the source inside their existing Tampermonkey editor entry (verified in Brave to keep a single entry) or delete the old entry before installing `0.0.4` to avoid duplicate entries. If you restrict Tampermonkey site access to `x.com`, allow `update.greasyfork.org` / `raw.githubusercontent.com` when prompted for updates or import new versions manually. Disable or remove the script and reload `x.com` to restore native reminders. Unofficial and unaffiliated with X, xAI, or Tampermonkey. [Issues & feedback](https://github.com/mreasonyang/x-bot-unread-filter/issues).
