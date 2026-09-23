import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { validatePayload } from '../dailypick/pick-data.mjs';
import { messages } from '../i18n/messages.mjs';

const fixture = JSON.parse(await readFile(new URL('../dailypick/pick.mock.json', import.meta.url), 'utf8'));
const source = await readFile(new URL('../dailypick/pick.js', import.meta.url), 'utf8');

test('unsettled recent pick accepts null, while omitted or invented results are rejected', () => {
  const data = structuredClone(fixture);
  data.history[0].result = null;
  assert.equal(validatePayload(data, { demo: true }).history[0].result, null);
  delete data.history[0].result;
  assert.throws(() => validatePayload(data, { demo: true }));
  data.history[0].result = 'pending';
  assert.throws(() => validatePayload(data, { demo: true }));
});

test('latest publication can concern tomorrow, with real publication time and current response date', () => {
  const data = structuredClone(fixture);
  data.isDemo = false;
  data.date = '2026-09-23';
  data.pick.match.startsAt = '2026-09-24T03:00:00Z';
  data.pick.publishedAt = '2026-09-23T16:00:00Z';
  data.history[0].result = null;
  validatePayload(data, { today: '2026-09-23' });
  assert.throws(() => validatePayload(data, { today: '2026-09-24' }));
  data.pick.publishedAt = 'not-a-date';
  assert.throws(() => validatePayload(data, { today: '2026-09-23' }));
});

test('history renderer shows only the latest 24 settled results without summary statistics', () => {
  function element(tag, text, className) {
    return { tag, text, className, children: [], append(...children) { this.children.push(...children); }, get firstChild() { return this.children[0]; } };
  }
  const nodes = new Map();
  const $ = (id) => { if (!nodes.has(id)) nodes.set(id, element('div')); return nodes.get(id); };
  const context = { $, t: (key, params={}) => messages.fr[key].replace(/\{(\w+)\}/g, (_,k)=>params[k]??''), el: element, metric: (label, value) => element('metric', `${label}:${value}`),
    n: String, percent: String, dateText: (value) => value };
  const start = source.indexOf('function renderHistory(data)');
  const end = source.indexOf('const demo =', start);
  assert.ok(start >= 0 && end > start);
  vm.createContext(context);
  vm.runInContext(source.slice(start, end), context);
  const pending = { ...fixture.history[0], playerA: 'Previous unfinished pick', date: '2026-09-20', result: null };
  const settled = { ...fixture.history[1], playerA: 'Older publication', date: '2026-09-21', result: 'won' };
  const completed = Array.from({ length: 30 }, (_, i) => ({
    ...settled, id: `settled-${i}`, date: `2026-08-${String(i + 1).padStart(2, '0')}`,
    result: ['won', 'lost', 'void'][i % 3],
  }));
  context.renderHistory({ history: [pending, ...completed], freePickStats: null });
  const cards = $('history-cards').children;
  assert.equal(cards.length, 24);
  assert.equal(cards[0].children[0].firstChild.text, '2026-08-30');
  assert.equal(cards[23].children[0].firstChild.text, '2026-08-07');
  assert.ok(cards.every(card => card.children[0].children.length === 2));
  assert.ok(cards.every(card => !card.children[1].text.includes(pending.playerA)));
  assert.equal(nodes.has('free-stats'), false);
  assert.equal(nodes.has('stats-period'), false);
});
