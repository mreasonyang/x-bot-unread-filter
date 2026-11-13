# Changelog

## 0.0.7

- Correct native DM badge replacements and unread-label rewrites in the MutationObserver microtask.
- Observe native badge style and aria-hidden restoration, so display-only changes cannot expose the combined unread count.
- Reconnect replaced navigation links without waiting for background timers.
- Pass 24 automated tests, including four suspended-timer sidebar regressions.

## 0.0.6

- Correct title/favicon rewrites in the MutationObserver microtask, without waiting for background-tab timers.
- Attach to newly mounted navigation and reflect ordinary-DM counter changes through a coalesced microtask; refresh on visibility changes.
- Keep ordinary body updates debounced and preserve native reminders for unknown contracts.
- Pass 20 automated tests, including suspended-timer rewrites, initial attachment, ordinary-DM updates and stopping queued work.

## 0.0.5

- `@compatible`: Brave, Chrome, Edge.
- Brave: tested on desktop with Tampermonkey 5.5.1. Chrome / Edge: untested.
- Runtime filtering logic: unchanged.

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
