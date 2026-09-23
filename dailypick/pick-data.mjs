export const isLocalHost = host => ["localhost", "127.0.0.1", "[::1]"].includes(host);
export const isDemoRequest = (host, search) => isLocalHost(host) && new URLSearchParams(search).get("demo") === "1";
export function parisDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function requireValue(ok) { if (!ok) throw new Error("Invalid pick payload"); }
const text = v => typeof v === "string" && v.trim().length > 0 && v.length <= 500;
const date = v => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
const timestamp = v => typeof v === "string" && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(v) && !Number.isNaN(Date.parse(v));
const number = (v, min = 0, max = Infinity) => v === null || (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max);
const integer = v => v === null || (number(v) && Number.isInteger(v));
function validatePlayer(p) {
  requireValue(p && text(p.id) && text(p.name));
  requireValue(p.ranking === null || (integer(p.ranking) && p.ranking > 0));
  for (const k of ["scoreTennoro", "recentForm", "surfaceForm"]) requireValue(number(p[k], 0, 100));
  for (const k of ["eloGlobal", "eloSurface"]) requireValue(number(p[k]));
  for (const k of ["matchesLast30Days", "restDays"]) requireValue(integer(p[k]));
}
export function validatePayload(data, { demo = false, today = parisDate() } = {}) {
  requireValue(data && data.schemaVersion === 1 && data.isDemo === demo);
  requireValue(date(data.date) && timestamp(data.updatedAt) && data.timezone === "Europe/Paris");
  // Reject cached responses from a previous Paris day. The pick itself is the latest publication, with its own dates.
  requireValue(demo || data.date === today);
  requireValue(["pick", "no_pick"].includes(data.status));
  if (data.status === "no_pick") requireValue(data.pick === null);
  else {
    const p = data.pick;
    requireValue(p && (p.publishedAt === undefined || timestamp(p.publishedAt)));
    requireValue(p && p.match && Array.isArray(p.players) && p.players.length === 2);
    p.players.forEach(validatePlayer);
    requireValue(p.players[0].id !== p.players[1].id);
    requireValue(text(p.match.id) && ["ATP", "WTA"].includes(p.match.tour));
    requireValue(text(p.match.tournament) && ["hard", "clay", "grass", "carpet", "unknown"].includes(p.match.surface));
    requireValue(p.match.startsAt === null || timestamp(p.match.startsAt));
    requireValue(["scheduled", "live", "finished", "postponed", "cancelled"].includes(p.match.status));
    requireValue(p.selection && p.selection.market === "match_winner" && p.players.some(x => x.id === p.selection.playerId));
    requireValue(number(p.confidence, 0, 100) && number(p.odds, 1.01));
    requireValue(number(p.modelProbability, 0, 100) && number(p.marketProbability, 0, 100) && number(p.edge, -100, 100));
    requireValue(p.h2h === null || (p.h2h && integer(p.h2h.playerAWins) && integer(p.h2h.playerBWins)));
    requireValue(Array.isArray(p.reasons) && p.reasons.length <= 5 && (p.reasons.length === 0 || p.reasons.length >= 2) && p.reasons.every(text));
  }
  requireValue(Array.isArray(data.history) && data.history.length <= 50);
  data.history.forEach(h => {
    requireValue(h && text(h.id) && date(h.date) && text(h.playerA) && text(h.playerB));
    requireValue([h.playerA, h.playerB].includes(h.selection) && number(h.odds, 1.01) && number(h.confidence, 0, 100));
    requireValue(h.result === null || ["won", "lost", "void"].includes(h.result));
    requireValue(h.publishedAt === undefined || timestamp(h.publishedAt));
  });
  const s = data.freePickStats;
  requireValue(s === null || (s && integer(s.picks) && number(s.accuracy, 0, 100) && number(s.roi, -100) && number(s.averageOdds, 1.01) && (s.from === null || date(s.from)) && (s.to === null || date(s.to))));
  return data;
}
export async function loadPick({ hostname, search, endpoint, fetcher = fetch, today = parisDate() }) {
  const demo = isDemoRequest(hostname, search);
  const scenario = new URLSearchParams(search).get("scenario");
  if (demo && scenario === "error") throw new Error("Simulated unavailable data");
  if (!demo && !endpoint) throw new Error("Pick endpoint is not configured");
  if (!demo) {
    const url = new URL(endpoint);
    requireValue(url.protocol === "https:" || (isLocalHost(hostname) && isLocalHost(url.hostname) && url.protocol === "http:"));
  }
  const response = await fetcher(demo ? new URL("./pick.mock.json", import.meta.url) : endpoint, { cache: "no-store", credentials: "omit", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Pick request failed");
  const data = await response.json();
  if (demo && scenario === "empty") { data.status = "no_pick"; data.pick = null; }
  if (demo && scenario === "partial" && data.pick) {
    for (const player of data.pick.players) for (const key of ["ranking", "scoreTennoro", "eloGlobal", "eloSurface", "recentForm", "surfaceForm", "matchesLast30Days", "restDays"]) player[key] = null;
    for (const key of ["odds", "confidence", "modelProbability", "marketProbability", "edge", "h2h"]) data.pick[key] = null;
    data.pick.match.startsAt = null;
    data.pick.reasons = [];
  }
  return validatePayload(data, { demo, today });
}
