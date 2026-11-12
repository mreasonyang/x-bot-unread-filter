Exclude Grok Bot conversations from X's navigation DM unread badge while preserving ordinary DM alerts and bot conversation unread dots.

## Install

1. Install Tampermonkey and enable **Allow User Scripts** in the browser's extension settings.
2. Use this page's install button and confirm the script runs only on `https://x.com/*`.
3. Reload X. The script runs only on `x.com`.

If the install link displays source text, download the `.user.js` and use Tampermonkey's Utilities → Import from file, verified in Brave. Restricting extension access to `x.com` can block installation and updates. Allow `update.greasyfork.org` when prompted if you want automatic updates, or keep your current permissions and import new versions manually.

## Scope and privacy

Only the navigation DM badge changes. Messages and read state remain unchanged. Push notifications, browser tab titles, and native X mobile apps are outside the script's scope. Automated ordinary X accounts still count as ordinary DMs; this is not a bot-account detector.

The script makes no network requests, reads no message bodies or credentials, and has no external runtime dependencies, storage, or logs. It reads the existing ordinary-DM counter and updates the badge. It leaves native reminders available if the expected page state cannot be read.

Desktop macOS Brave with Tampermonkey 5.5.1 is verified. Other browsers/managers are untested. Mixed ordinary/bot counts have automated coverage, but live arrival of a real ordinary DM has not been verified. Disable the script and reload X to restore native behavior.

MIT licensed. Unofficial and unaffiliated with X, xAI, or Tampermonkey. [Source and feedback](https://github.com/MrEasonYang/x-bot-unread-filter). Do not include private messages, credentials, or unfiltered logs in feedback.
