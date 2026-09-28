import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preparePickDisplay} from '../dailypick/pick-display.mjs';
const fixture=()=>JSON.parse(readFileSync(new URL('../dailypick/pick.mock.json',import.meta.url),'utf8'));
test('finished latest pick moves to history without inventing a result or mutating payload',()=>{
  const data=fixture(); data.history=[]; data.pick.match.status='finished';
  const before=structuredClone(data), view=preparePickDisplay(data);
  assert.equal(view.status,'no_pick'); assert.equal(view.pick,null);
  assert.equal(view.history.length,1); assert.equal(view.history[0].result,null);
  assert.equal(view.history[0].completed,true); assert.deepEqual(data,before);
});
test('active and postponed matches remain visible regardless of their date',()=>{
  for(const status of ['scheduled','live','postponed']){
    const data=fixture();data.history=[];data.pick.match.status=status;
    data.pick.match.startsAt='2020-01-01T10:00:00Z';
    assert.equal(preparePickDisplay(data),data);
  }
});
test('existing history result is retained and the match is not duplicated',()=>{
  const data=fixture(); data.history=[];data.pick.match.status='finished';
  const entry=preparePickDisplay(data).history[0];
  data.history=[{...entry,result:'won'}];
  const view=preparePickDisplay(data);
  assert.equal(view.history.length,1);assert.equal(view.history[0].result,'won');
  data.pick.match.status='scheduled';
  assert.equal(preparePickDisplay(data).pick,null);
});
test('no pick remains empty and cancellation never invents a void result',()=>{
  const data=fixture();data.pick.match.status='cancelled';data.history=[];
  assert.equal(preparePickDisplay(data).history[0].result,null);
  data.pick=null;data.status='no_pick';assert.equal(preparePickDisplay(data),data);
});
