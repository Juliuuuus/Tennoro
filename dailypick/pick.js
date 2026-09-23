const { t, locale, monthLabel, reasonText } = window.TENNORO_I18N;
import { PICK_API_URL } from './pick-config.mjs';
import { isDemoRequest, loadPick } from './pick-data.mjs';

const $ = id => document.getElementById(id);
const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
const n = (v, suffix = '') => v === null ? '—' : fmt.format(v) + suffix;
const percent = v => n(v, ' %');
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function dateText(value, withTime = false) {
  if (!value) return t('timeUnknown');
  return new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }) }).format(new Date(withTime ? value : value + 'T12:00:00Z')) + (withTime ? t('parisTime') : '');
}
function metric(label, value, detail) {
  const box = el('div', undefined, 'pick-metric');
  box.append(el('span', label), el('strong', value));
  if (detail) box.append(el('small', detail));
  return box;
}
function state(title, body) {
  $('pick-state').replaceChildren(el('h2', title), el('p', body));
  $('pick-state').hidden = false;
}
function renderMatch(p) {
  const a = p.players[0], b = p.players[1], selected = p.players.find(x => x.id === p.selection.playerId);
  const surfaces = { hard: t('hard'), clay: t('clay'), grass: t('grass'), carpet: t('carpet'), unknown: t('unknownSurface') };
  const statuses = { scheduled: t('scheduled'), live: t('live'), finished: t('finished'), postponed: t('postponed'), cancelled: t('cancelled') };
  const card = $('match-card');
  const top = el('div', undefined, 'pick-match-meta');
  top.append(el('span', p.match.tour + ' · ' + surfaces[p.match.surface], 'pick-chip'), el('span', statuses[p.match.status], 'pick-status'));
  card.append(top, el('h2', p.match.tournament, 'pick-tournament'), el('p', dateText(p.match.startsAt, true), 'pick-muted'));
  if (p.publishedAt) card.append(el('p', t('published', {date:dateText(p.publishedAt, true)}), 'pick-muted'));
  const versus = el('div', undefined, 'pick-versus');
  for (const [i, player] of [a,b].entries()) {
    if (i) versus.append(el('span', 'VS', 'pick-vs'));
    const side = el('div', undefined, player.id === selected.id ? 'pick-selected' : '');
    side.append(el('h3', player.name), el('p', t('ranking', {value:n(player.ranking)})));
    if (player.id === selected.id) side.append(el('small', t('selected')));
    versus.append(side);
  }
  card.append(versus);
  const selection = el('div', undefined, 'pick-selection');
  selection.append(metric(t('winner'), selected.name), metric(t('decimalOdds'), n(p.odds)), metric(t('modelConfidence'), n(p.confidence, ' / 100')));
  card.append(selection);
}
function renderComparison(p) {
  const target = $('comparison');
  const heading = el('div', undefined, 'pick-comparison-head');
  p.players.forEach(player => heading.append(el('strong', player.name + (player.id === p.selection.playerId ? t('selectionSuffix') : ''), player.id === p.selection.playerId ? 'pick-selected' : '')));
  target.append(heading);
  const rows = [
    [t('score'),'scoreTennoro',' %',true], [t('officialRanking'),'ranking','',false],
    [t('elo'),'eloGlobal','',true], [t('surfaceElo'),'eloSurface','',true],
    [t('recentForm'),'recentForm',' %',true], [t('surfaceForm'),'surfaceForm',' %',true],
    [t('matches30'),'matchesLast30Days','',false], [t('rest'),'restDays',t('days'),false],
    [t('h2h'),'h2h',t('wins'),false]
  ];
  for (const [label,key,suffix,bars] of rows) {
    const values = key === 'h2h' ? [p.h2h?.playerAWins ?? null,p.h2h?.playerBWins ?? null] : p.players.map(x=>x[key]);
    const row = el('div', undefined, 'pick-comparison-row');
    row.append(el('strong', n(values[0],suffix),p.players[0].id === p.selection.playerId ? 'pick-selected' : ''),el('span',label),el('strong',n(values[1],suffix),p.players[1].id === p.selection.playerId ? 'pick-selected' : ''));
    if (bars && values.every(v=>v!==null)) {
      const chart = el('div', undefined, 'pick-bars');
      chart.setAttribute('aria-hidden','true');
      const scale = ['scoreTennoro','recentForm','surfaceForm'].includes(key) ? 100 : Math.max(...values,1);
      values.forEach((value,i)=>{
        const track = el('div',undefined,'pick-bar-track');
        const fill = el('i',undefined,p.players[i].id===p.selection.playerId?'selected':'');
        fill.style.width = Math.max(0, Math.min(100,value/scale*100))+'%';
        track.append(fill);chart.append(track);
      });
      row.append(chart);
    }
    target.append(row);
  }
}
function renderAnalysis(p) {
  renderMatch(p);renderComparison(p);
  $('evaluation').append(metric(t('modelProbability'),percent(p.modelProbability)),metric(t('marketProbability'),percent(p.marketProbability)),metric(t('edge'),p.edge===null?'—':(p.edge>0?'+':'')+n(p.edge,t('points'))),metric(t('odds'),n(p.odds)));
  const translatedReasons = p.reasons.map(reasonText).filter(Boolean);
  translatedReasons.forEach(reason=>$('pick-reasons').append(el('li',reason)));
  $('no-reasons').textContent = t('reasonsUnavailable');
  $('no-reasons').hidden = translatedReasons.length>0;
  $('pick-reasons').hidden = !translatedReasons.length;
  $('pick-analysis').hidden = false;
}
function renderHistory(data) {
  $('pick-history').hidden = false;
  const history = data.history
    .filter(h => ['won', 'lost', 'void'].includes(h.result))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 24);
  $('empty-history').hidden = history.length>0;
  const results = {won:t('won'),lost:t('lost'),void:t('void')};
  history.forEach(h=>{
    const card = el('article',undefined,'pick-panel pick-history-card');
    const top = el('div',undefined,'pick-match-meta');
    top.append(el('time',dateText(h.date)));
    if (h.result !== null) top.append(el('span',results[h.result],'pick-result '+h.result));
    top.firstChild.dateTime = h.date;
    card.append(top,el('h3',h.playerA+' vs '+h.playerB),el('p',t('selection', {name:h.selection})));
    const details = el('div',undefined,'pick-history-details');
    details.append(metric(t('odds'),n(h.odds)),metric(t('confidence'),n(h.confidence,' / 100')));
    card.append(details);$('history-cards').append(card);
  });
}
const demo = isDemoRequest(location.hostname, location.search);
$('demo-banner').hidden = !demo;
if (demo) {
  const robots = document.createElement('meta');robots.name='robots';robots.content='noindex, nofollow';document.head.append(robots);
  document.title = t('demoTitle')+document.title;
}
async function refresh() {
  // Clear previous data before refreshing; an error must not display a cached response.
  $('pick-analysis').hidden = true;$('pick-history').hidden = true;
  for (const id of ['match-card','comparison','evaluation','pick-reasons','history-cards']) $(id).replaceChildren();
  state(t('pickLoading'),t('fetching'));
  try {
    const data = await loadPick({hostname:location.hostname,search:location.search,endpoint:PICK_API_URL});
    if(data.status==='no_pick') state(t('noPick'),t('noPickDetail'));
    else { renderAnalysis(data.pick);$('pick-state').hidden=true; }
    renderHistory(data);
  } catch {
    $('pick-analysis').hidden=true;$('pick-history').hidden=true;
    state(t('unavailable'),t('unavailableDetail'));
  }
}
await refresh();
setInterval(refresh, 300000);
