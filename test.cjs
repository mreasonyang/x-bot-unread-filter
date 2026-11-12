'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { readHumanCount, start } = require('./x-human-dm-badge.user.js');

function fixture(human = 0, bots = 1) {
  const dom = new JSDOM('<!doctype html><body><nav></nav><div id="chat-host"></div></body>', {
    url: 'https://x.com/i/chat'
  });
  let state = { badgeCount: { chatUnreadCount: human, chatGrokBotUnreadCount: bots } };
  Object.defineProperty(state, 'auth', { get() { throw Error('Must not read unrelated state'); } });
  const listeners = new Set();
  const store = { getState: () => state, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); } };
  const shadow = dom.window.document.querySelector('#chat-host').attachShadow({ mode: 'open' });
  shadow.innerHTML = '<a href="/i/chat/bots/example" aria-label="Bot, unread"><svg><circle></circle></svg></a>';
  function nav(total) {
    const link = dom.window.document.createElement('a');
    link.setAttribute('data-testid', 'AppTabBar_DirectMessage_Link');
    link.setAttribute('aria-label', `私信（${total} 条未读 对话）`);
    link.innerHTML = `<div><svg></svg><div class="native-badge" style="display: flex" aria-label="${total} 条未读项目"><span>${total}</span></div><span class="nav-text">私信</span></div>`;
    link.__reactFiber$test = { return: { memoizedProps: { value: { store } } } };
    return link;
  }
  let link = nav(human + bots);
  dom.window.document.querySelector('nav').append(link);
  const controller = start(dom.window);
  function update(newHuman, newBots) {
    state.badgeCount = { chatUnreadCount: newHuman, chatGrokBotUnreadCount: newBots };
    const total = newHuman + newBots;
    link.setAttribute('aria-label', `私信（${total} 条未读 对话）`);
    const badge = link.querySelector('.native-badge:not([data-x-human-dm-badge])');
    badge.setAttribute('aria-label', `${total} 条未读项目`);
    badge.querySelector('span').textContent = String(total);
    for (const fn of listeners) fn();
    controller.refresh();
  }
  return {
    dom, shadow, controller, store, listeners, state,
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
