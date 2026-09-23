import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('carsoccer/index.html');
const target='/en/?utm_source=carsoccer&utm_medium=display&utm_campaign=carsoccer_launch';

test('Car Soccer redirects directly to English regardless of browser or saved language',()=>{
  for(const path of ['/carsoccer','/carsoccer/']){
    let destination;
    const context={window:{location:{pathname:path,replace:url=>destination=url}},navigator:{language:'fr-FR'},localStorage:{getItem:()=> 'fr',setItem:()=>assert.fail('Campaign must not overwrite user preference')}};
    vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],context);
    assert.equal(destination,target);
    const url=new URL(destination,'https://tennoro.com');
    assert.equal(url.pathname,'/en/');
    assert.deepEqual(Object.fromEntries(url.searchParams),{utm_source:'carsoccer',utm_medium:'display',utm_campaign:'carsoccer_launch'});
  }
});

test('Campaign has no visible intermediate content and supports JavaScript-disabled redirects',()=>{
  assert.match(html,/<body>\s*<\/body>/);
  assert.ok(html.includes('content="0;url='+target.replaceAll('&','&amp;')+'"'));
  assert.ok(!html.includes('/i18n/redirect.mjs'));
  assert.ok(!read('en/index.html').includes('/i18n/redirect.mjs'));
  assert.ok(!read('fr/index.html').includes('/i18n/redirect.mjs'));
  assert.ok(!read('sitemap.xml').includes('carsoccer'));
});
