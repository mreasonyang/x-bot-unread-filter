'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { readHumanCount, start } = require('./x-human-dm-badge.user.js');

const plainIcon = 'https://abs.twimg.com/favicons/twitter.3.ico';
const unreadIcon = 'https://abs.twimg.com/favicons/twitter-pip.3.ico';

function fixture(human = 0, bots = 1, notifications = 0) {
  const dom = new JSDOM('<!doctype html><body><nav></nav><div id="chat-host"></div></body>', {
    url: 'https://x.com/i/chat'
  });
  let state = { badgeCount: { chatUnreadCount: human, chatGrokBotUnreadCount: bots } };
  Object.defineProperty(state, 'auth', { get() { throw Error('Must not read unrelated state'); } });
  const listeners = new Set();
  const store = { getState: () => state, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  const root = { tag: 3, memoizedProps: { value: { store } } };
  root.stateNode = { current: root };
  const titleComponent = {
    _isDesktop: true,
    props: { messagesUnreadCount: human + bots, notificationsUnreadCount: notifications },
    _getUnreadTotal() { throw Error('Must not execute or replace native component methods'); },
    _setFavicon() { throw Error('Must not execute or replace native component methods'); }
  };
  const titleFiber = { tag: 1, stateNode: titleComponent, return: root };
  root.child = titleFiber;
  const icon = dom.window.document.createElement('link');
  icon.rel = 'shortcut icon';
  dom.window.document.head.append(icon);
  function nativeHead(base = '主页 / X') {
    const total = titleComponent.props.messagesUnreadCount + titleComponent.props.notificationsUnreadCount;
    dom.window.document.title = total ? `(${total}) ${base}` : base;
    icon.href = total ? unreadIcon : plainIcon;
  }
  nativeHead();
  const shadow = dom.window.document.querySelector('#chat-host').attachShadow({ mode: 'open' });
  shadow.innerHTML = '<a href="/i/chat/bots/example" aria-label="Bot, unread"><svg><circle></circle></svg></a>';
  function nav(total) {
    const link = dom.window.document.createElement('a');
    link.setAttribute('data-testid', 'AppTabBar_DirectMessage_Link');
    link.setAttribute('aria-label', `私信（${total} 条未读 对话）`);
    link.innerHTML = `<div><svg></svg><div class="native-badge" style="display: flex" aria-label="${total} 条未读项目"><span>${total}</span></div><span class="nav-text">私信</span></div>`;
    link.__reactFiber$test = { return: root };
    titleFiber.sibling = link.__reactFiber$test;
    return link;
  }
  let link = nav(human + bots);
  dom.window.document.querySelector('nav').append(link);
  const controller = start(dom.window);
  function update(newHuman, newBots) {
    state.badgeCount = { chatUnreadCount: newHuman, chatGrokBotUnreadCount: newBots };
    titleComponent.props.messagesUnreadCount = newHuman + newBots;
    nativeHead();
    const total = newHuman + newBots;
    link.setAttribute('aria-label', `私信（${total} 条未读 对话）`);
    const badge = link.querySelector('.native-badge:not([data-x-human-dm-badge])');
    badge.setAttribute('aria-label', `${total} 条未读项目`);
    badge.querySelector('span').textContent = String(total);
    for (const fn of listeners) fn();
    controller.refresh();
  }
  return {
    dom, shadow, controller, store, listeners, state, titleComponent, icon, nativeHead,
    get link() { return link; },
    native: () => link.querySelector('.native-badge:not([data-x-human-dm-badge])'),
    custom: () => link.querySelector('[data-x-human-dm-badge]'),
    update,
    replace() { const next = nav(5); link.replaceWith(next); link = next; controller.refresh(); },
    close() { controller.stop(); dom.window.close(); }
  };
}

test('uses the independent ordinary-DM counter with the same remote fallback as X', () => {
  assert.equal(readHumanCount({ badgeCount: { chatUnreadCount: 2, chatGrokBotUnreadCount: 90 } }), 2);
  assert.equal(readHumanCount({ badgeCount: { chatUnreadCount: null, chatGrokBotUnreadCount: 9,
    remote: { badgeCounts: { xchat_unread_count: 3, grok_bot_unread_conversations: 20 } } } }), 3);
  assert.equal(readHumanCount({ badgeCount: { chatUnreadCount: 0, chatGrokBotUnreadCount: 9,
    remote: { badgeCounts: { xchat_unread_count: 3 } } } }), 0);
  assert.equal(readHumanCount({ badgeCount: { chatUnreadCount: null, chatGrokBotUnreadCount: null } }), 0);
});

test('unknown contracts and invalid counts leave the native reminder available', () => {
  for (const value of [-1, NaN, Infinity, '2', 1.5]) {
    assert.equal(readHumanCount({ badgeCount: { chatUnreadCount: value, chatGrokBotUnreadCount: 2 } }), null);
  }
  assert.equal(readHumanCount({}), null);
  const f = fixture(2, 3);
  delete f.state.badgeCount.chatGrokBotUnreadCount;
  f.controller.refresh();
  assert.equal(f.custom(), null);
  assert.equal(f.native().style.display, 'flex');
  assert.equal(f.link.getAttribute('aria-label'), '私信（5 条未读 对话）');
  f.close();
});

test('bot-only unread hides only the nav badge and preserves the bot row', () => {
  const f = fixture(0, 1);
  assert.equal(f.native().style.display, 'none');
  assert.equal(f.custom(), null);
  assert.equal(f.link.getAttribute('aria-label'), '私信');
  assert.equal(f.shadow.querySelector('a').getAttribute('aria-label'), 'Bot, unread');
  assert.ok(f.shadow.querySelector('circle'));
  assert.equal(f.link.querySelector('.nav-text').textContent, '私信');
  f.close();
});

test('mixed unread preserves human counts through new bot messages and read changes', () => {
  const f = fixture(2, 3);
  assert.equal(f.custom().textContent, '2');
  assert.equal(f.custom().getAttribute('aria-label'), '2 条未读项目');
  assert.equal(f.link.getAttribute('aria-label'), '私信（2 条未读 对话）');
  f.update(2, 20);
  assert.equal(f.custom().textContent, '2');
  f.update(1, 20);
  assert.equal(f.custom().textContent, '1');
  f.update(0, 20);
  assert.equal(f.custom(), null);
  assert.equal(f.link.getAttribute('aria-label'), '私信');
  f.update(4, 20);
  assert.equal(f.custom().textContent, '4');
  assert.equal(f.state.badgeCount.chatGrokBotUnreadCount, 20);
  f.close();
});

test('navigation replacement reconnects without duplicate badges or subscriptions', () => {
  const f = fixture(2, 3);
  const oldNative = f.native();
  f.replace();
  f.controller.refresh();
  assert.equal(f.listeners.size, 1);
  assert.equal(f.link.querySelectorAll('[data-x-human-dm-badge]').length, 1);
  assert.equal(f.custom().textContent, '2');
  assert.equal(oldNative.style.display, 'flex');
  f.close();
});

test('X replacing the original badge is handled and disabling fully restores it', () => {
  const f = fixture(2, 3);
  const next = f.native().cloneNode(true);
  next.style.display = 'flex';
  next.removeAttribute('aria-hidden');
  f.native().replaceWith(next);
  f.controller.refresh();
  assert.equal(f.custom().textContent, '2');
  f.controller.stop();
  assert.equal(f.custom(), null);
  assert.equal(next.style.display, 'flex');
  assert.equal(next.hasAttribute('aria-hidden'), false);
  assert.equal(f.link.getAttribute('aria-label'), '私信（5 条未读 对话）');
  assert.equal(f.listeners.size, 0);
  f.close();
});

test('does not suppress reminders when page-context access is unavailable', () => {
  const f = fixture(0, 1);
  f.controller.stop();
  delete f.link.__reactFiber$test;
  const controller = start(f.dom.window);
  assert.equal(f.native().style.display, 'flex');
  assert.equal(f.custom(), null);
  controller.stop();
  f.close();
});

test('disabling restores the current label when only human unread remains', () => {
  const f = fixture(2, 3);
  f.update(2, 0);
  assert.equal(f.custom().textContent, '2');
  f.controller.stop();
  assert.equal(f.link.getAttribute('aria-label'), '私信（2 条未读 对话）');
  assert.equal(f.native().textContent, '2');
  f.close();
});

test('the subscription and mutation observer update the display without manual refresh', async () => {
  const f = fixture(0, 3);
  f.state.badgeCount.chatUnreadCount = 2;
  f.native().querySelector('span').textContent = '5';
  f.native().setAttribute('aria-label', '5 条未读项目');
  f.link.setAttribute('aria-label', '私信（5 条未读 对话）');
  for (const listener of f.listeners) listener();
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(f.custom().textContent, '2');
  assert.equal(f.link.getAttribute('aria-label'), '私信（2 条未读 对话）');
  f.close();
});

test('bot-only unread is excluded from both the title and favicon and restored on stop', () => {
  const f = fixture(0, 3);
  assert.equal(f.dom.window.document.title, '主页 / X');
  assert.equal(f.icon.href, plainIcon);
  assert.equal(f.controller.status().filteringTitle, true);
  assert.equal(f.controller.status().filteringIcons, 1);
  f.controller.stop();
  assert.equal(f.dom.window.document.title, '(3) 主页 / X');
  assert.equal(f.icon.href, unreadIcon);
  f.close();
});

test('tab reminders preserve ordinary DMs and native notifications through counter changes', () => {
  const f = fixture(2, 3, 4);
  assert.equal(f.dom.window.document.title, '(6) 主页 / X');
  assert.equal(f.icon.href, unreadIcon);
  f.update(0, 20);
  assert.equal(f.dom.window.document.title, '(4) 主页 / X');
  assert.equal(f.icon.href, unreadIcon);
  f.titleComponent.props.notificationsUnreadCount = 0;
  f.nativeHead();
  f.controller.refresh();
  assert.equal(f.dom.window.document.title, '主页 / X');
  assert.equal(f.icon.href, plainIcon);
  f.update(1, 20);
  assert.equal(f.dom.window.document.title, '(1) 主页 / X');
  assert.equal(f.icon.href, unreadIcon);
  f.controller.stop();
  assert.equal(f.dom.window.document.title, '(21) 主页 / X');
  f.close();
});

test('when native and filtered title strings coincide, current counters remain authoritative', () => {
  const f = fixture(2, 3);
  f.update(2, 0);
  assert.equal(f.dom.window.document.title, '(2) 主页 / X');
  f.controller.refresh();
  assert.equal(f.dom.window.document.title, '(2) 主页 / X');
  f.controller.stop();
  assert.equal(f.dom.window.document.title, '(2) 主页 / X');
  f.close();
});

test('native title writes and favicon replacement are re-filtered without manual refresh', async () => {
  const f = fixture(0, 3);
  f.dom.window.document.title = '(3) 通知 / X';
  const next = f.icon.cloneNode();
  next.href = unreadIcon;
  f.icon.replaceWith(next);
  await new Promise(resolve => setTimeout(resolve, 130));
  assert.equal(f.dom.window.document.title, '通知 / X');
  assert.equal(next.href, plainIcon);
  f.controller.stop();
  assert.equal(f.dom.window.document.title, '(3) 通知 / X');
  assert.equal(next.href, unreadIcon);
  f.close();
});

test('unknown native title contracts restore reminders while the nav filter keeps working', () => {
  const f = fixture(0, 3);
  delete f.titleComponent.props.notificationsUnreadCount;
  f.controller.refresh();
  assert.equal(f.dom.window.document.title, '(3) 主页 / X');
  assert.equal(f.icon.href, unreadIcon);
  assert.equal(f.native().style.display, 'none');
  f.close();
});

test('unrecognized title formats and icons remain untouched', () => {
  const f = fixture(0, 3);
  f.dom.window.document.title = '自定义标题';
  f.icon.href = 'https://abs.twimg.com/favicons/future-icon.ico';
  f.controller.refresh();
  assert.equal(f.dom.window.document.title, '自定义标题');
  assert.equal(f.icon.href, 'https://abs.twimg.com/favicons/future-icon.ico');
  f.controller.stop();
  assert.equal(f.dom.window.document.title, '自定义标题');
  assert.equal(f.icon.href, 'https://abs.twimg.com/favicons/future-icon.ico');
  f.close();
});

test('title-only pages and unavailable native title counters preserve native behavior', () => {
  for (const value of [-1, NaN, Infinity, '2', 1.5]) {
    const f = fixture(0, 3);
    f.titleComponent.props.notificationsUnreadCount = value;
    f.controller.refresh();
    assert.equal(f.dom.window.document.title, '(3) 主页 / X');
    assert.equal(f.icon.href, unreadIcon);
    f.close();
  }
  const f = fixture(0, 3);
  f.titleComponent.props.displayTitleOnly = true;
  f.dom.window.document.title = '独立标题';
  f.controller.refresh();
  assert.equal(f.dom.window.document.title, '独立标题');
  f.close();
});

function suspendWindowTimers(win) {
  let next = 10000;
  const pending = new Map();
  win.setTimeout = callback => { pending.set(++next, callback); return next; };
  win.clearTimeout = id => pending.delete(id);
  return pending;
}

async function flushMicrotasks() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

test('background-safe: native title and favicon rewrites do not wait for timers', async () => {
  const f = fixture(0, 3, 2);
  suspendWindowTimers(f.dom.window);
  for (let round = 0; round < 6; round++) {
    const notifications = round % 2 ? 2 : 0;
    f.titleComponent.props.notificationsUnreadCount = notifications;
    const base = `页面 ${round} / X`;
    f.nativeHead(base);
    if (round % 2) f.dom.window.document.querySelector('title').firstChild.data = `(${3 + notifications}) ${base}`;
    await flushMicrotasks();
    assert.equal(f.dom.window.document.title, notifications ? `(${notifications}) ${base}` : base);
    assert.equal(f.icon.href, notifications ? unreadIcon : plainIcon);
  }
  f.titleComponent.props.notificationsUnreadCount = 0;
  f.nativeHead('聊天 / X');
  const next = f.icon.cloneNode();
  next.href = unreadIcon;
  f.icon.replaceWith(next);
  await flushMicrotasks();
  assert.equal(f.dom.window.document.title, '聊天 / X');
  assert.equal(next.href, plainIcon);
  f.close();
});

test('background-safe: ordinary-DM counter changes are reflected without a native title write', async () => {
  const f = fixture(1, 3);
  suspendWindowTimers(f.dom.window);
  f.state.badgeCount.chatUnreadCount = 2;
  f.titleComponent.props.messagesUnreadCount = 5;
  for (const listener of f.listeners) listener();
  await flushMicrotasks();
  assert.equal(f.dom.window.document.title, '(2) 主页 / X');
  assert.equal(f.custom().textContent, '2');
  assert.equal(f.icon.href, unreadIcon);
  f.close();
});

test('background-safe: first navigation attachment does not depend on a delayed timer', async () => {
  const f = fixture(0, 3);
  f.controller.stop();
  f.link.remove();
  suspendWindowTimers(f.dom.window);
  const controller = start(f.dom.window);
  f.dom.window.document.querySelector('nav').append(f.link);
  await flushMicrotasks();
  assert.equal(f.dom.window.document.title, '主页 / X');
  assert.equal(f.native().style.display, 'none');
  assert.equal(f.icon.href, plainIcon);
  controller.stop();
  f.close();
});

test('background-safe: stopping cancels queued immediate corrections', async () => {
  const f = fixture(1, 3);
  suspendWindowTimers(f.dom.window);
  f.state.badgeCount.chatUnreadCount = 2;
  f.titleComponent.props.messagesUnreadCount = 5;
  for (const listener of f.listeners) listener();
  f.nativeHead();
  f.controller.stop();
  await flushMicrotasks();
  assert.equal(f.dom.window.document.title, '(5) 主页 / X');
  assert.equal(f.icon.href, unreadIcon);
  assert.equal(f.custom(), null);
  f.close();
});
