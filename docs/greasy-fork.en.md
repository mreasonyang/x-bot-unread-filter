Exclude X's **Grok Bot** conversation unread counts from the left navigation **Direct Messages** badge, browser **tab-title** unread number, and website **favicon** unread indicator on `x.com` desktop web pages—while keeping ordinary DM reminders, X's selected other-notification counts, and the unread blue dots on bot rows in the chat list.

For example, when you have 3 unread Grok Bot conversations and no other unread items, `(3) X` becomes `X` and the unread favicon reverts to X's ordinary icon.

## Installation & Updates

1. Install the official [Tampermonkey](https://www.tampermonkey.net/) extension and enable **Allow User Scripts** in your browser's extension settings ([Tampermonkey FAQ Q209](https://www.tampermonkey.net/faq.php?locale=en&q=Q209); do not disable browser security protections).
2. Click the install button on this page and confirm that the script runs only on `https://x.com/*`.
3. Reload `x.com`. To restore X's native reminders at any time, disable or remove the script in Tampermonkey and reload `x.com`.

- **If clicking install shows source text**: Download the `.user.js` file and import it via Tampermonkey **Utilities → Import from file** (verified in Brave).
- **Site permissions & updates**: Restricting Tampermonkey's site access solely to `x.com` can block direct installation and automatic updates. Keep that restriction and import updates manually, or allow `update.greasyfork.org` when prompted. Source code and bilingual descriptions sync periodically from GitHub to this listing (no fixed interval promised; automatic cross-version upgrades have not been tested).

## Scope, Privacy & Compatibility

- **Excludes Grok Bot only — not a human detector**: Filters only X's Grok Bot conversation counter. It does not detect whether ordinary X accounts are real humans, automated bots, or spam; messages from ordinary accounts still count as ordinary DMs.
- **Desktop web display only**: Runs only on `x.com` desktop web pages. Does not affect X mobile apps, push notifications, or OS app badges, and never marks messages as read, mutes notifications, or deletes messages.
- **Privacy & fail-safe fallback**: Reads only X's independent ordinary-DM counter and the native title component's selected unread counters. It never calls or replaces native component methods, never reads message bodies, notification entries, cookies, or credentials, makes no network requests, and has no external dependencies, storage, or logs (changing the favicon may let the browser load X's ordinary icon asset). If expected counters or components are unavailable, native reminders remain in place; unrecognized title formats and favicon URLs are left untouched.
- **Verification**: Verified on macOS Brave desktop with Tampermonkey 5.5.1 (persistent install, refresh, chat/home navigation, bot-only filtering, and reminder restoration) and 16 automated tests (including mixed DM/bot counts and other notifications). Live arrival of a new ordinary DM, other browsers, and other script managers are untested.

MIT licensed by Eason Yang. Unofficial and unaffiliated with X, xAI, or Tampermonkey. [Source repository](https://github.com/mreasonyang/x-bot-unread-filter) · [Issue tracker](https://github.com/mreasonyang/x-bot-unread-filter/issues) (do not include private messages, credentials, or raw logs).
