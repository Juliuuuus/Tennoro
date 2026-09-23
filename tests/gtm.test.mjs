import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {routes} from '../i18n/routes.mjs';
import {gtmHead,gtmBody} from '../scripts/gtm.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('all 12 content pages include GTM once, first in head and body',()=>{
  for(const lang of ['fr','en'])for(const route of Object.values(routes)){
    const html=read(`${lang}/${route}${!route||route.endsWith('/')?'index.html':''}`);
    assert.ok(html.includes('<head>\n'+gtmHead));
    assert.equal(html.split(gtmHead).length-1,1);
    assert.equal(html.split(gtmBody).length-1,1);
    assert.ok(html.match(/<body\b[^>]*>([\s\S]*)/i)[1].startsWith('\n'+gtmBody));
  }
});

test('GTM initializes dataLayer and asynchronously loads the requested container',()=>{
  let inserted;
  const first={parentNode:{insertBefore:node=>inserted=node}};
  const window={};
  const document={getElementsByTagName:()=>[first],createElement:()=>({})};
  vm.runInNewContext(gtmHead.match(/<script>([\s\S]*?)<\/script>/)[1],{window,document});
  assert.equal(window.dataLayer[0].event,'gtm.js');
  assert.equal(inserted.async,true);
  assert.equal(inserted.src,'https://www.googletagmanager.com/gtm.js?id=GTM-PX8FZ39R');
});

test('Car Soccer retains campaign UTMs and lands on the GTM-enabled English page',()=>{
  assert.ok(read('carsoccer/index.html').includes("window.location.replace('/en/?utm_source=carsoccer&utm_medium=display&utm_campaign=carsoccer_launch')"));
  assert.ok(read('en/index.html').includes(gtmHead));
  // Redirect-only documents do not initialize a second container before navigation.
  assert.ok(!read('carsoccer/index.html').includes('googletagmanager.com'));
});
