export const routes = {home:'',stats:'stats/',dailypick:'dailypick/',cgu:'cgu.html',cgv:'cgv.html',privacy:'confidentialite.html'};
export const aliases = {'index.html':'', 'stats.html':'stats/', 'pronostics-tennis/':'dailypick/', 'daily-pick/':'dailypick/'};
export function preferredLanguage(saved, browserLanguage) {
  if(['fr','en'].includes(saved))return saved;
  return /^fr(?:-|$)/i.test(browserLanguage || '')?'fr':'en';
}
export function localizedPath(path, lang) {
  let suffix=path.replace(/^\/(?:fr|en)(?=\/|$)/,'').replace(/^\//,'');
  suffix=aliases[suffix]??suffix;
  return '/'+lang+'/'+suffix;
}
