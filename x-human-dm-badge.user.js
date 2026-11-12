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

(function (windowObject, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else if (windowObject && windowObject.document) {
    const key = Symbol.for('local.eason.x-human-dm-badge');
    windowObject[key]?.stop();
    windowObject[key] = api.start(windowObject);
  }
})(typeof window === 'undefined' ? null : window, function () {
  'use strict';
  const NAV = '[data-testid="AppTabBar_DirectMessage_Link"]';
  const OWN = 'data-x-human-dm-badge';
  const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

  // X's current selector adds the bot count to this ordinary-DM count.
  // Read this counter only; never enumerate or serialize the application state.
  function readHumanCount(state) {
    const counts = state?.badgeCount;
    if (!counts || !hasOwn(counts, 'chatUnreadCount') ||
        !hasOwn(counts, 'chatGrokBotUnreadCount')) return null;
    const count = counts.chatUnreadCount ?? counts.remote?.badgeCounts?.xchat_unread_count ?? 0;
    return Number.isSafeInteger(count) && count >= 0 ? count : null;
  }

  function findStore(node) {
    const key = Object.getOwnPropertyNames(node).find(name => name.startsWith('__reactFiber$'));
    let fiber = key ? node[key] : null;
    for (let depth = 0; fiber && depth < 200; depth++, fiber = fiber.return) {
      const store = fiber.memoizedProps?.value?.store;
      if (typeof store?.getState === 'function' && typeof store?.subscribe === 'function') {
        return store;
      }
    }
    return null;
  }

  function withoutCount(label) {
    return label.replace(/\s*[（(][^()（）]*[）)]\s*$/, '').trim();
  }

  function start(win) {
    const document = win.document;
    const records = new Map();
    let stopped = false;
    let timer = null;

    function schedule() {
      if (!stopped && timer === null) timer = win.setTimeout(refresh, 40);
    }

    function observe(record) {
      record.observer.observe(record.node, {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: ['aria-label', 'class']
      });
    }

    function restoreBadge(record) {
      const saved = record.saved;
      if (!saved) return;
      if (saved.node.style.getPropertyValue('display') === 'none' &&
          saved.node.style.getPropertyPriority('display') === 'important') {
        if (saved.display) saved.node.style.setProperty('display', saved.display, saved.priority);
        else saved.node.style.removeProperty('display');
      }
      if (saved.node.getAttribute('aria-hidden') === 'true') {
        if (saved.hidden === null) saved.node.removeAttribute('aria-hidden');
        else saved.node.setAttribute('aria-hidden', saved.hidden);
      }
      record.saved = null;
    }

    function restore(record) {
      restoreBadge(record);
      record.clone?.remove();
      record.clone = null;
      if (record.writtenLabel !== null &&
          record.node.getAttribute('aria-label') === record.writtenLabel) {
        if (record.templateLabel === null) record.node.removeAttribute('aria-label');
        else record.node.setAttribute('aria-label', record.templateLabel);
      }
      record.writtenLabel = null;
      record.filtering = false;
    }

    function render(record) {
      record.observer.disconnect();
      try {
        const liveLabel = record.node.getAttribute('aria-label');
        if (liveLabel !== record.writtenLabel) record.templateLabel = liveLabel;
        let count = null;
        try { count = record.store ? readHumanCount(record.store.getState()) : null; }
        catch { /* Unknown state: restore X's normal reminder. */ }
        const native = [...record.node.querySelectorAll('div[aria-label]')].find(node =>
          !node.closest(`[${OWN}]`) && /^[0-9]+\+?$/.test(node.textContent.trim()));
        if (count === null || !native) {
          restore(record);
          return;
        }

        // React can write the same label we wrote when the bot count reaches zero.
        // Keep the native template current even when that write is indistinguishable.
        if (record.templateLabel && /[0-9]/.test(record.templateLabel)) {
          const nativeNumber = native.getAttribute('aria-label')?.match(/[0-9]+\+?/)?.[0];
          if (nativeNumber) record.templateLabel = record.templateLabel.replace(/[0-9]+\+?/, nativeNumber);
        }

        if (record.saved?.node !== native) {
          restoreBadge(record);
          record.clone?.remove();
          record.clone = null;
          record.saved = {
            node: native,
            display: native.style.getPropertyValue('display'),
            priority: native.style.getPropertyPriority('display'),
            hidden: native.getAttribute('aria-hidden')
          };
        }

        if (count > 0) {
          if (!record.clone) {
            record.clone = native.cloneNode(true);
            record.clone.setAttribute(OWN, '');
            record.clone.removeAttribute('aria-hidden');
            if (record.saved.display) {
              record.clone.style.setProperty('display', record.saved.display, record.saved.priority);
            } else record.clone.style.removeProperty('display');
            native.after(record.clone);
          }
          const text = count > 99 ? '99+' : String(count);
          const target = record.clone.querySelector('span') || record.clone;
          if (target.textContent !== text) target.textContent = text;
          const nativeClass = native.getAttribute('class');
          if (record.clone.getAttribute('class') !== nativeClass) {
            if (nativeClass === null) record.clone.removeAttribute('class');
            else record.clone.setAttribute('class', nativeClass);
          }
          const label = native.getAttribute('aria-label')?.replace(/[0-9]+\+?/, String(count));
          if (label && record.clone.getAttribute('aria-label') !== label) {
            record.clone.setAttribute('aria-label', label);
          }
        } else {
          record.clone?.remove();
          record.clone = null;
        }
        if (native.style.getPropertyValue('display') !== 'none' ||
            native.style.getPropertyPriority('display') !== 'important') {
          native.style.setProperty('display', 'none', 'important');
        }
        if (native.getAttribute('aria-hidden') !== 'true') native.setAttribute('aria-hidden', 'true');
        if (record.templateLabel !== null) {
          const template = record.templateLabel;
          const nextLabel = count === 0 ? withoutCount(template) :
            /[0-9]/.test(template) ? template.replace(/[0-9]+\+?/, String(count)) :
              `${template} (${count} unread)`;
          if (record.node.getAttribute('aria-label') !== nextLabel) {
            record.node.setAttribute('aria-label', nextLabel);
          }
          record.writtenLabel = nextLabel;
        }
        record.filtering = true;
      } catch {
        restore(record);
      } finally {
        if (!stopped) observe(record);
      }
    }

    function remove(record) {
      record.observer.disconnect();
      record.unsubscribe?.();
      restore(record);
      records.delete(record.node);
    }

    function refresh() {
      if (timer !== null) win.clearTimeout(timer);
      timer = null;
      if (stopped) return;
      for (const record of records.values()) {
        if (!record.node.isConnected || !record.node.matches(NAV)) remove(record);
      }
      for (const node of document.querySelectorAll(NAV)) {
        let record = records.get(node);
        if (!record) {
          record = {
            node, store: null, unsubscribe: null, saved: null, clone: null,
            templateLabel: node.getAttribute('aria-label'), writtenLabel: null,
            filtering: false, observer: new win.MutationObserver(schedule)
          };
          records.set(node, record);
        }
        if (!record.store) {
          record.store = findStore(node);
          if (record.store) record.unsubscribe = record.store.subscribe(schedule);
        }
        render(record);
      }
    }

    // Only watch ordinary DOM/navigation. The bot conversation Shadow DOM is untouched.
    const observer = new win.MutationObserver(schedule);
    observer.observe(document, { subtree: true, childList: true });
    refresh();
    return Object.freeze({
      refresh,
      status: () => ({
        active: !stopped,
        attachedLinks: records.size,
        filteringLinks: [...records.values()].filter(record => record.filtering).length
      }),
      stop() {
        if (stopped) return;
        stopped = true;
        observer.disconnect();
        if (timer !== null) win.clearTimeout(timer);
        timer = null;
        for (const record of [...records.values()]) remove(record);
      }
    });
  }

  return Object.freeze({ readHumanCount, start });
});
