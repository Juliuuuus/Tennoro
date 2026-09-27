import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {routes} from '../i18n/routes.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('all localized footers link to Contact and use the new Discord invite and favicon',()=>{
  for(const lang of ['fr','en'])for(const route of Object.values(routes)){
    const html=read(`${lang}/${route}${!route||route.endsWith('/')?'index.html':''}`);
    const footer=html.match(/<footer[\s\S]*?<\/footer>/)[0];
    assert.ok(footer.includes(`href="/${lang}/contact/"`));
    const invites=[...html.matchAll(/href="(https:\/\/discord.gg\/[^\"]+)"/g)].map(m=>m[1]);
    assert.ok(invites.length>0);
    assert.ok(invites.every(url=>url==='https://discord.gg/WZNvE9kdVA'));
    assert.ok(html.includes('href="/assets/favicon-tennoro-orange.png"'));
    assert.ok(html.includes('src="/assets/tennoro-logo.png"'));
  }
});
test('Contact opens email composition without a backend or fake submission',()=>{
  for(const lang of ['fr','en']){
    const html=read(`${lang}/contact/index.html`);
    assert.ok(html.includes('href="mailto:contact@tennoro.com"'));
    assert.ok(!html.includes('<form'));
    assert.ok(read('sitemap.xml').includes(`https://tennoro.com/${lang}/contact/`));
  }
});
