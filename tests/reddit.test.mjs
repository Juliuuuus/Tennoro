import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('reddit/index.html');
const target='/en/?utm_source=reddit&utm_medium=social&utm_campaign=reddit_share';

test('Reddit redirects to English with campaign UTMs without changing language preference',()=>{
  for(const pathname of ['/reddit','/reddit/']){
    let destination;
    vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{
      window:{location:{pathname,replace:url=>destination=url}},
      navigator:{language:'fr-FR'},
      localStorage:{getItem:()=> 'fr',setItem:()=>assert.fail('Must preserve preference')}
    });
    assert.equal(destination,target);
  }
});

test('Reddit has no visible chooser, a no-JS redirect and a GTM-enabled destination',()=>{
  assert.match(html,/<body>\s*<\/body>/);
  assert.ok(html.includes('content="0;url='+target.replaceAll('&','&amp;')+'"'));
  assert.ok(!html.includes('/i18n/redirect.mjs'));
  assert.ok(read('en/index.html').includes('GTM-PX8FZ39R'));
  assert.ok(!read('en/index.html').includes('/i18n/redirect.mjs'));
  assert.ok(!read('sitemap.xml').includes('/reddit'));
});
