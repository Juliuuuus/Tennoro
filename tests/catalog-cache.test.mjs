import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {routes} from '../i18n/routes.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('every page requests the version matching its translation catalog contents',()=>{
  for(const lang of ['fr','en']){
    const script=read(`i18n/catalog.${lang}.js`);
    const data=JSON.parse(script.split('window.TENNORO_TRANSLATIONS = ')[1].trim().replace(/;$/,''));
    assert.ok(data.messages.completedPending);
    const version=createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0,12);
    for(const route of Object.values(routes)){
      const html=read(`${lang}/${route}${!route||route.endsWith('/')?'index.html':''}`);
      assert.ok(html.includes(`/i18n/catalog.${lang}.js?v=${version}`));
    }
  }
});
