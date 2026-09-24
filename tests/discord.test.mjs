import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('discord/index.html');
const target='/fr/?utm_source=discord&utm_medium=referral&utm_campaign=discord_share';

test('Discord redirects to French with campaign UTMs without changing language preference',()=>{
  for(const pathname of ['/discord','/discord/']){
    let destination;
    vm.runInNewContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],{
      window:{location:{pathname,replace:url=>destination=url}},
      navigator:{language:'en-US'},
      localStorage:{getItem:()=> 'en',setItem:()=>assert.fail('Must preserve preference')}
    });
    assert.equal(destination,target);
  }
});

test('Discord has no visible chooser, a no-JS redirect and a GTM-enabled destination',()=>{
  assert.match(html,/<body>\s*<\/body>/);
  assert.ok(html.includes('content="0;url='+target.replaceAll('&','&amp;')+'"'));
  assert.ok(!html.includes('/i18n/redirect.mjs'));
  assert.ok(read('fr/index.html').includes('GTM-PX8FZ39R'));
  assert.ok(!read('fr/index.html').includes('/i18n/redirect.mjs'));
  assert.ok(!read('sitemap.xml').includes('/discord'));
});
