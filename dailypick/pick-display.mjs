import { parisDate } from './pick-data.mjs';
const settled = result => ['won', 'lost', 'void'].includes(result);

// Presentation only: never infer a result from elapsed time or change API data.
export function preparePickDisplay(data) {
  const p = data.pick;
  if (!p) return data;
  const selected = p.players.find(player => player.id === p.selection.playerId).name;
  const date = p.match.startsAt ? parisDate(new Date(p.match.startsAt)) : null;
  const index = data.history.findIndex(h =>
    h.selection === selected &&
    [h.playerA, h.playerB].every(name => p.players.some(player => player.name === name)) &&
    (p.publishedAt && h.publishedAt ? p.publishedAt === h.publishedAt : date !== null && h.date === date));
  const existing = data.history[index];
  const finished = ['finished', 'cancelled'].includes(p.match.status) || settled(existing?.result);
  if (!finished) return data;
  const history = data.history.slice();
  const entry = existing ? {...existing, completed: true} : {
    id: p.match.id,
    date: date || (p.publishedAt ? parisDate(new Date(p.publishedAt)) : null),
    playerA: p.players[0].name, playerB: p.players[1].name,
    selection: selected, odds: p.odds, confidence: p.confidence,
    result: null, completed: true
  };
  if (index >= 0) history[index] = entry;
  else history.unshift(entry);
  return {...data, status: 'no_pick', pick: null, history};
}
