// ==UserScript==
// @name         X 私信提醒仅计入真人
// @name:en      X DM badge - exclude Grok Bot
// @namespace    local.eason.x-human-dm-badge
// @version      0.0.1
// @description  从 X 左侧私信徽标排除 Grok Bot 未读数，保留普通私信提醒和 bot 列表未读标记。
// @description:en Exclude Grok Bot from X's navigation DM badge while keeping ordinary DM alerts and bot conversation unread markers.
// @author       Eason Yang
// @license      MIT
// @homepageURL  https://github.com/MrEasonYang/x-bot-unread-filter
// @supportURL   https://github.com/MrEasonYang/x-bot-unread-filter/issues
// @updateURL    https://raw.githubusercontent.com/MrEasonYang/x-bot-unread-filter/main/x-human-dm-badge.meta.js
// @downloadURL  https://raw.githubusercontent.com/MrEasonYang/x-bot-unread-filter/main/x-human-dm-badge.user.js
// @compatible   brave Tested on desktop with Tampermonkey 5.5.1
// @match        https://x.com/*
// @run-at       document-start
// @grant        none
// @sandbox      raw
// @noframes
// ==/UserScript==
