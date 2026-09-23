import { PICK_API_URL } from './pick-config.mjs';
import { isDemoRequest, loadPick } from './pick-data.mjs';

const $ = id => document.getElementById(id);
const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });
const n = (v, suffix = '') => v === null ? '—' : fmt.format(v) + suffix;
const percent = v => n(v, ' %');
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function dateText(value, withTime = false) {
  if (!value) return 'Horaire à confirmer';
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'long', ...(withTime ? { hour: '2-digit', minute: '2-digit' } : { year: 'numeric' }) }).format(new Date(withTime ? value : value + 'T12:00:00Z')) + (withTime ? ' · heure de Paris' : '');
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
  const surfaces = { hard: 'Dur', clay: 'Terre battue', grass: 'Gazon', carpet: 'Moquette', unknown: 'Surface non précisée' };
  const statuses = { scheduled: 'À venir', live: 'En cours', finished: 'Terminé', postponed: 'Reporté', cancelled: 'Annulé' };
  const card = $('match-card');
  const top = el('div', undefined, 'pick-match-meta');
  top.append(el('span', p.match.tour + ' · ' + surfaces[p.match.surface], 'pick-chip'), el('span', statuses[p.match.status], 'pick-status'));
  card.append(top, el('h2', p.match.tournament, 'pick-tournament'), el('p', dateText(p.match.startsAt, true), 'pick-muted'));
  if (p.publishedAt) card.append(el('p', 'Publié le ' + dateText(p.publishedAt, true), 'pick-muted'));
  const versus = el('div', undefined, 'pick-versus');
  for (const [i, player] of [a,b].entries()) {
    if (i) versus.append(el('span', 'VS', 'pick-vs'));
    const side = el('div', undefined, player.id === selected.id ? 'pick-selected' : '');
    side.append(el('h3', player.name), el('p', 'Classement : ' + n(player.ranking)));
    if (player.id === selected.id) side.append(el('small', 'Sélection Tennoro'));
    versus.append(side);
  }
  card.append(versus);
  const selection = el('div', undefined, 'pick-selection');
  selection.append(metric('Vainqueur du match', selected.name), metric('Cote décimale', n(p.odds)), metric('Confiance Tennoro', n(p.confidence, ' / 100')));
  card.append(selection);
}
function renderComparison(p) {
  const target = $('comparison');
  const heading = el('div', undefined, 'pick-comparison-head');
  p.players.forEach(player => heading.append(el('strong', player.name + (player.id === p.selection.playerId ? ' · sélection' : ''), player.id === p.selection.playerId ? 'pick-selected' : '')));
  target.append(heading);
  const rows = [
    ['Score Tennoro','scoreTennoro',' %',true], ['Classement officiel','ranking','',false],
    ['Elo global','eloGlobal','',true], ['Elo surface','eloSurface','',true],
    ['Forme récente pondérée','recentForm',' %',true], ['Forme sur la surface pondérée','surfaceForm',' %',true],
    ['Matchs sur 30 jours','matchesLast30Days','',false], ['Jours de repos','restDays',' j',false],
    ['Face-à-face','h2h',' victoire(s)',false]
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
  $('evaluation').append(metric('Probabilité modèle',percent(p.modelProbability)),metric('Probabilité marché (hors marge)',percent(p.marketProbability)),metric('Edge',p.edge===null?'—':(p.edge>0?'+':'')+n(p.edge,' pts')),metric('Cote',n(p.odds)));
  p.reasons.forEach(reason=>$('pick-reasons').append(el('li',reason)));
  $('no-reasons').hidden = p.reasons.length>0;
  $('pick-reasons').hidden = !p.reasons.length;
  $('pick-analysis').hidden = false;
}
function renderHistory(data) {
  $('pick-history').hidden = false;
  const history = data.history
    .filter(h => ['won', 'lost', 'void'].includes(h.result))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 24);
  $('empty-history').hidden = history.length>0;
  const results = {won:'Gagné',lost:'Perdu',void:'Void · annulé'};
  history.forEach(h=>{
    const card = el('article',undefined,'pick-panel pick-history-card');
    const top = el('div',undefined,'pick-match-meta');
    top.append(el('time',dateText(h.date)));
    if (h.result !== null) top.append(el('span',results[h.result],'pick-result '+h.result));
    top.firstChild.dateTime = h.date;
    card.append(top,el('h3',h.playerA+' vs '+h.playerB),el('p','Sélection : '+h.selection));
    const details = el('div',undefined,'pick-history-details');
    details.append(metric('Cote',n(h.odds)),metric('Confiance',n(h.confidence,' / 100')));
    card.append(details);$('history-cards').append(card);
  });
}
const demo = isDemoRequest(location.hostname, location.search);
$('demo-banner').hidden = !demo;
if (demo) {
  const robots = document.createElement('meta');robots.name='robots';robots.content='noindex, nofollow';document.head.append(robots);
  document.title = '[DÉMO FICTIVE] '+document.title;
}
async function refresh() {
  // Clear previous data before refreshing; an error must not display a cached response.
  $('pick-analysis').hidden = true;$('pick-history').hidden = true;
  for (const id of ['match-card','comparison','evaluation','pick-reasons','history-cards']) $(id).replaceChildren();
  state('Chargement du dernier pick publié…','Récupération des données Tennoro.');
  try {
    const data = await loadPick({hostname:location.hostname,search:location.search,endpoint:PICK_API_URL});
    if(data.status==='no_pick') state("Aucun pick gratuit aujourd'hui","Tennoro n'a identifié aucune rencontre correspondant actuellement aux critères du modèle.");
    else { renderAnalysis(data.pick);$('pick-state').hidden=true; }
    renderHistory(data);
  } catch {
    $('pick-analysis').hidden=true;$('pick-history').hidden=true;
    state('Données temporairement indisponibles','Le dernier pick publié ne peut pas être affiché pour le moment. Réessayez plus tard.');
  }
}
await refresh();
setInterval(refresh, 300000);
