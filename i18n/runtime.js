(() => {
  const lang=document.documentElement.lang==='en'?'en':'fr';
  const config=window.TENNORO_TRANSLATIONS;
  const t=(key,params={})=>{
    if(!(key in config.messages)) throw Error('Missing translation: '+key);
    return config.messages[key].replace(/\{(\w+)\}/g,(_,k)=>params[k]??'');
  };
  const monthLabel=value=>{
    const s=String(value??'');
    const iso=s.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
    if(iso&&+iso[2]>=1&&+iso[2]<=12)return config.months[+iso[2]-1]+' '+iso[1];
    const m=s.match(/^(\S+)\s+(\d{4})$/);
    if(m){const index=config.frMonths.indexOf(m[1].toLowerCase());if(index>=0)return config.months[index]+' '+m[2];}
    return s;
  };
  const reasonText=(reason)=>{
    if(lang==='fr')return reason;
    for(const [key,pattern,names] of config.reasonPatterns){const m=reason.match(new RegExp(pattern));if(m)return t(key,Object.fromEntries(names.map((name,i)=>[name,m[i+1]])));}
    return null;
  };
  window.TENNORO_I18N={lang,locale:lang==='fr'?'fr-FR':'en-GB',t,monthLabel,reasonText};
  document.addEventListener('DOMContentLoaded',()=>{
    for(const a of document.querySelectorAll('[data-language]')){
      const target=new URL(a.href);target.search=location.search;target.hash=location.hash;a.href=target.href;
      a.addEventListener('click',()=>{const current=new URL(a.href);current.search=location.search;current.hash=location.hash;a.href=current.href;try{localStorage.setItem('tennoro-language',a.dataset.language);}catch{ /* Storage may be disabled. */ }});
    }
  });
})();
