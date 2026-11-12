# Changelog

## 0.0.2

- Exclude Grok Bot from the browser tab-title count and favicon reminder as well as the navigation DM badge.
- Preserve ordinary DMs and X's native selected notification count without reading message bodies or notification entries.
- Handle native title rewrites and favicon replacement, and restore native reminders when stopped or the expected contract is unavailable.
- Pass 16 automated tests; verify installed Brave refresh, title/favicon filtering and restoration.

## 0.0.1

- Exclude Grok Bot conversations from the X navigation DM badge using X's independent ordinary-DM counter.
- Preserve bot conversation unread markers and all underlying message/read state.
- Handle in-page navigation and navigation element replacement.
- Restore native reminders if the expected counter contract cannot be read.
- Include nine automated checks, desktop Brave verification, readable source, and MIT licensing.
