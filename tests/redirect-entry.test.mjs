import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('entry redirects synchronously without external script and only renders chooser without JavaScript',()=>{
  assert.ok(!html.includes('type="module"'));
  assert.match(html,/<body><noscript><main/);
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for(const [path,saved,browser,expected] of [['/',null,'fr-FR','/fr/'],['/',null,'en-US','/en/'],['/','en','fr-FR','/en/'],['/fr/stats.html','en','en-US','/fr/stats/']]){
    let result;
    vm.runInNewContext(script,{localStorage:{getItem:()=>saved},navigator:{language:browser},location:{pathname:path,search:'?utm_source=test',hash:'#top',replace:value=>result=value}});
    assert.equal(result,expected+'?utm_source=test#top');
  }
});
