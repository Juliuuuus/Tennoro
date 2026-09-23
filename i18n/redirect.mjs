import { preferredLanguage, localizedPath } from './routes.mjs';
let saved=null;
try { saved=localStorage.getItem('tennoro-language'); } catch { /* Private browsing/storage restrictions. */ }
const explicit=location.pathname.match(/^\/(fr|en)(?:\/|$)/)?.[1];
const lang=explicit||preferredLanguage(saved,navigator.language);
const target=localizedPath(location.pathname,lang)+location.search+location.hash;
if(target!==location.pathname+location.search+location.hash)location.replace(target);
for(const a of document.querySelectorAll('[data-language]'))a.addEventListener('click',()=>{try{localStorage.setItem('tennoro-language',a.dataset.language);}catch{}});
