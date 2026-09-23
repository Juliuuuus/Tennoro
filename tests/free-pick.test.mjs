import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validatePayload, loadPick, isDemoRequest, parisDate } from '../pronostics-tennis/pick-data.mjs';
const fixture = JSON.parse(await readFile(new URL('../pronostics-tennis/pick.mock.json', import.meta.url), 'utf8'));
const mock = () => structuredClone(fixture);
const fetcher = async () => ({ok:true,json:async()=>mock()});
test('demo is explicit and only loopback',()=>{
  assert.equal(isDemoRequest('localhost','?demo=1'),true);
  for(const host of ['tennoro.com','www.tennoro.com','localhost.evil.com','192.168.1.1']) assert.equal(isDemoRequest(host,'?demo=1'),false);
  assert.equal(isDemoRequest('127.0.0.1',''),false);
});
test('complete demo contract validates',()=>assert.equal(validatePayload(mock(),{demo:true}).pick.confidence,86));
test('live endpoint cannot return demo data',()=>assert.throws(()=>validatePayload(mock(),{today:fixture.date})));
test('real current payload accepted and stale day rejected',()=>{
  const d=mock(); d.isDemo=false;
  assert.equal(validatePayload(d,{today:d.date}).status,'pick');
  assert.throws(()=>validatePayload(d,{today:'2026-09-24'}));
});
test('no endpoint never fetches a mock, even public demo query',async()=>{
  let calls=0;
  await assert.rejects(loadPick({hostname:'tennoro.com',search:'?demo=1',endpoint:'',fetcher:()=>{calls++;}}));
  assert.equal(calls,0);
});
test('network and HTTP failures do not fall back to mock',async()=>{
  let calls=0;
  await assert.rejects(loadPick({hostname:'tennoro.com',search:'',endpoint:'https://api.example.com/pick',fetcher:async()=>{calls++;throw Error('offline');}}));
  assert.equal(calls,1);
  await assert.rejects(loadPick({hostname:'tennoro.com',search:'',endpoint:'https://api.example.com/pick',fetcher:async()=>({ok:false})}));
});
test('empty and partial states preserve null instead of inventing values',async()=>{
  const empty=await loadPick({hostname:'localhost',search:'?demo=1&scenario=empty',endpoint:'',fetcher});
  assert.equal(empty.pick,null);assert.equal(empty.history.length,3);
  const partial=await loadPick({hostname:'localhost',search:'?demo=1&scenario=partial',endpoint:'',fetcher});
  assert.equal(partial.pick.modelProbability,null);assert.deepEqual(partial.pick.reasons,[]);
});
test('invalid selection, units, date and results are rejected',()=>{
  for(const change of [d=>d.pick.selection.playerId='unknown',d=>d.pick.confidence=101,d=>d.pick.odds='1.5',d=>d.history[0].result='pending',d=>d.date='2026-02-31',d=>d.pick.players[0].ranking=0]){
    const d=mock();change(d);assert.throws(()=>validatePayload(d,{demo:true}));
  }
});
test('selection can be B; zero metrics remain legitimate',()=>{
  const d=mock();d.pick.selection.playerId='demo-b';d.pick.players[0].restDays=0;d.pick.players[1].recentForm=0;
  assert.equal(validatePayload(d,{demo:true}).pick.players[0].restDays,0);
});
test('Paris day changes at Paris midnight',()=>{
  assert.equal(parisDate(new Date('2026-09-23T22:30:00Z')),'2026-09-24');
});
