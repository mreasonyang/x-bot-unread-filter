# Changelog

## 0.0.4

- Set the default `@name` to the Chinese title (`X 未读提醒排除 Grok Bot`) so Greasy Fork displays the updated title when `zh-CN` is the default locale, while keeping `@name:en`, `@namespace`, script filename, Greasy Fork ID `605054`, and source/update URLs stable.
- Document manual migration for existing `0.0.1`–`0.0.3` users (updating inside the existing Tampermonkey editor entry or removing the old entry before installing `0.0.4`), since script managers identify installations by `@name` + `@namespace`.
- Bump version metadata to `0.0.4` with no change to runtime filtering logic from `0.0.2`/`0.0.3`.

## 0.0.3

- Update localized script titles, one-line descriptions, repository README, and Greasy Fork listing copy in Chinese and English to describe Grok Bot unread filtering clearly without implying human-account detection.
- Bump version metadata to 0.0.3 with no change to filtering logic or runtime behavior from 0.0.2.

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
