import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
import {routes,aliases,preferredLanguage,localizedPath} from '../i18n/routes.mjs';
import {messages} from '../i18n/messages.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('browser detection and explicit preference',()=>{
  for(const language of ['fr','fr-FR','fr-CA','FR-be'])assert.equal(preferredLanguage(null,language),'fr');
  for(const language of ['en-US','de-DE','es','',undefined])assert.equal(preferredLanguage(null,language),'en');
  assert.equal(preferredLanguage('en','fr-FR'),'en');assert.equal(preferredLanguage('fr','en-US'),'fr');
  assert.equal(preferredLanguage('invalid','fr-FR'),'fr');
});
test('equivalent pages and aliases do not cause redirect loops',()=>{
  for(const lang of ['fr','en'])for(const route of Object.values(routes)){
    const target='/'+lang+'/'+route;
    assert.equal(localizedPath('/'+route,lang),target);
    assert.equal(localizedPath(target,lang),target);
    assert.equal(localizedPath(localizedPath(target,lang==='fr'?'en':'fr'),lang),target);
  }
  for(const [alias,target]of Object.entries(aliases))assert.equal(localizedPath('/'+alias,'en'),'/en/'+target);
});
test('all 12 static pages have localized SEO, navigation, assets and matching alternates',()=>{
  for(const lang of ['fr','en'])for(const route of Object.values(routes)){
    const file=lang+'/'+route+(route===''||route.endsWith('/')?'index.html':'');
    const html=read(file), url='/'+lang+'/'+route;
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.ok(html.includes(`rel="canonical" href="https://tennoro.com${url}"`));
    assert.equal((html.match(/<h1\b/g)||[]).length,1);
    assert.ok(!html.includes('{{'));
    for(const other of ['fr','en'])assert.ok(html.includes(`hreflang="${other}" href="https://tennoro.com/${other}/${route}"`));
    const anchors=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    for(const [,attribute,value]of html.matchAll(/\b(href|src)="([^"]+)"/g)){
      if(value.startsWith('#')){assert.ok(anchors.includes(value.slice(1)),file+' '+value);continue;}
      if(!value.startsWith('/'))continue;
      const path=value.split(/[?#]/)[0], target=path.slice(1)+(path.endsWith('/')?'index.html':'');
      assert.ok(existsSync(new URL('../'+target,import.meta.url)),file+' '+value);
      if(attribute==='href'&&(path.endsWith('/')||path.endsWith('.html'))&&!value.startsWith('/'+lang+'/'))assert.ok(/^\/(fr|en)\//.test(value),'Unlocalized internal link: '+value);
    }
  }
});
test('catalogs cover every source token and runtime call',()=>{
  const fr=JSON.parse(read('i18n/fr.json')),en=JSON.parse(read('i18n/en.json'));
  assert.deepEqual(Object.keys(fr).sort(),Object.keys(en).sort());
  assert.deepEqual(Object.keys(messages.fr).sort(),Object.keys(messages.en).sort());
  for(const page of Object.keys(routes))for(const [,key]of read('i18n/templates/'+page+'.html').matchAll(/\{\{(\w+)\}\}/g))assert.ok(fr[key]&&en[key]);
  for(const path of ['scripts/home.js','scripts/stats.js','dailypick/pick.js'])for(const [,key]of read(path).matchAll(/\bt\('([^']+)'/g))assert.ok(messages.fr[key]&&messages.en[key],key);
});
function runtime(lang,storage){
  const listeners={};const links=['fr','en'].map(l=>({href:`https://tennoro.com/${l}/dailypick/`,dataset:{language:l},addEventListener(type,fn){this.click=fn;}}));
  const context={window:{},document:{documentElement:{lang},addEventListener:(name,fn)=>listeners[name]=fn,querySelectorAll:()=>links},URL,location:{search:'?demo=1',hash:'#analysis'},localStorage:storage};
  vm.createContext(context);vm.runInContext(read(`i18n/catalog.${lang}.js`),context);vm.runInContext(read('i18n/runtime.js'),context);listeners.DOMContentLoaded();return {context,links};
}
test('language switch preserves page/query/hash and saves manual choice',()=>{
  const saved={};const {links}=runtime('en',{setItem:(k,v)=>saved[k]=v});
  assert.equal(links[0].href,'https://tennoro.com/fr/dailypick/?demo=1#analysis');
  links[0].click();assert.equal(saved['tennoro-language'],'fr');
  const blocked=runtime('en',{setItem(){throw Error('blocked');}});assert.doesNotThrow(()=>blocked.links[0].click());
});
test('API reasons and month names are localized without changing player data',()=>{
  const {context}=runtime('en',{setItem(){}}),api=context.window.TENNORO_I18N;
  assert.equal(api.monthLabel('Septembre 2026'),'September 2026');
  assert.equal(api.monthLabel('2026-01'),'January 2026');
  assert.equal(api.reasonText('Elo global enregistré : Talia Gibson 1570, Viktoria Morvayova 1493.'),'Recorded overall Elo: Talia Gibson 1570, Viktoria Morvayova 1493.');
  assert.equal(api.reasonText('Unrecognized API analysis'),null);
});
test('sitemap contains only the 12 localized canonical pages',()=>{
  const urls=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
  assert.equal(urls.length,12);assert.equal(new Set(urls).size,12);
  assert.ok(urls.every(u=>/^https:\/\/tennoro.com\/(fr|en)\//.test(u)));
});
