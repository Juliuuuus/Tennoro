// Runtime UI messages. Static page copy lives in fr.json and en.json.
export const messages = {
  fr: {
    language:'Langue', redirect:'Choisissez votre langue', redirectTitle:'Tennoro — Choix de langue',
    pickLoading:'Chargement du dernier pick publié…', fetching:'Récupération des données Tennoro.',
    noPick:"Aucun pick gratuit aujourd'hui", noPickDetail:"Tennoro n'a identifié aucune rencontre correspondant actuellement aux critères du modèle.",
    unavailable:'Données temporairement indisponibles', unavailableDetail:'Le dernier pick publié ne peut pas être affiché pour le moment. Réessayez plus tard.',
    timeUnknown:'Horaire à confirmer', parisTime:' · heure de Paris', published:'Publié le {date}', ranking:'Classement : {value}',
    selected:'Sélection Tennoro', selectionSuffix:' · sélection', winner:'Vainqueur du match', odds:'Cote', decimalOdds:'Cote décimale', confidence:'Confiance', modelConfidence:'Confiance Tennoro',
    score:'Score Tennoro', officialRanking:'Classement officiel', elo:'Elo global', surfaceElo:'Elo surface', recentForm:'Forme récente pondérée', surfaceForm:'Forme sur la surface pondérée', matches30:'Matchs sur 30 jours', rest:'Jours de repos', h2h:'Face-à-face', days:' j', wins:' victoire(s)',
    modelProbability:'Probabilité modèle', marketProbability:'Probabilité marché (hors marge)', edge:'Edge', points:' pts', selection:'Sélection : {name}', demoTitle:'[DÉMO FICTIVE] ',
    hard:'Dur', clay:'Terre battue', grass:'Gazon', carpet:'Moquette', unknownSurface:'Surface non précisée', scheduled:'À venir', live:'En cours', finished:'Terminé', postponed:'Reporté', cancelled:'Annulé', won:'Gagné', lost:'Perdu', void:'Void · annulé',
    current:'Actuel', pickNumber:'Pick {number}', pointNumber:'Point {number}', picksCorrect:'{total} sélections • {won} correctes', roi:'ROI : {value}', averageOdds:'Cote moyenne : {value}', updated:'Dernière mise à jour : {date}', updateUnavailable:'Dernière mise à jour : indisponible', soon:'Bientôt disponible', data:'Données', detailedStats:'Statistiques détaillées',
    free:'Gratuit', premium:'Premium', highConfidence:'Haute confiance', hardLabel:'Dur', clayLabel:'Terre battue', grassLabel:'Gazon',
    reasonElo:'Elo global enregistré : {a} {av}, {b} {bv}.', reasonRecent:'Forme récente pondérée : {a} {av} % sur {an} matchs ; {b} {bv} % sur {bn} matchs.', reasonSurface:'Forme sur surface pondérée : {a} {av} % sur {an} matchs ; {b} {bv} % sur {bn} matchs.',
    reasonDemoElo:'Avantage Elo — {a} contre {b}', reasonDemoForm:'Meilleure forme récente — {a} % contre {b} %', reasonDemoRest:'Meilleure récupération — {a} jours contre {b}',
    reasonsUnavailable:'Les raisons détaillées ne sont pas encore disponibles dans cette langue.'
  },
  en: {
    language:'Language', redirect:'Choose your language', redirectTitle:'Tennoro — Choose your language',
    pickLoading:'Loading the latest published pick…', fetching:'Fetching Tennoro data.',
    noPick:'No free pick today', noPickDetail:'Tennoro has not identified any match that currently meets the model’s criteria.',
    unavailable:'Data temporarily unavailable', unavailableDetail:'The latest published pick cannot be displayed right now. Please try again later.',
    timeUnknown:'Start time to be confirmed', parisTime:' · Paris time', published:'Published {date}', ranking:'Ranking: {value}',
    selected:'Tennoro selection', selectionSuffix:' · selected', winner:'Match winner', odds:'Odds', decimalOdds:'Decimal odds', confidence:'Confidence', modelConfidence:'Tennoro confidence',
    score:'Tennoro score', officialRanking:'Official ranking', elo:'Overall Elo', surfaceElo:'Surface Elo', recentForm:'Weighted recent form', surfaceForm:'Weighted surface form', matches30:'Matches in 30 days', rest:'Rest days', h2h:'Head-to-head', days:' d', wins:' win(s)',
    modelProbability:'Model probability', marketProbability:'Market probability (margin removed)', edge:'Edge', points:' pts', selection:'Selection: {name}', demoTitle:'[FICTIONAL DEMO] ',
    hard:'Hard', clay:'Clay', grass:'Grass', carpet:'Carpet', unknownSurface:'Surface unspecified', scheduled:'Upcoming', live:'In progress', finished:'Finished', postponed:'Postponed', cancelled:'Cancelled', won:'Won', lost:'Lost', void:'Void · cancelled',
    current:'Current', pickNumber:'Pick {number}', pointNumber:'Point {number}', picksCorrect:'{total} picks • {won} correct', roi:'ROI: {value}', averageOdds:'Average odds: {value}', updated:'Last updated: {date}', updateUnavailable:'Last updated: unavailable', soon:'Coming soon', data:'Data', detailedStats:'Detailed statistics',
    free:'Free', premium:'Premium', highConfidence:'High Confidence', hardLabel:'Hard', clayLabel:'Clay', grassLabel:'Grass',
    reasonElo:'Recorded overall Elo: {a} {av}, {b} {bv}.', reasonRecent:'Weighted recent form: {a} {av}% across {an} matches; {b} {bv}% across {bn} matches.', reasonSurface:'Weighted surface form: {a} {av}% across {an} matches; {b} {bv}% across {bn} matches.',
    reasonDemoElo:'Elo advantage — {a} vs {b}', reasonDemoForm:'Stronger recent form — {a}% vs {b}%', reasonDemoRest:'More recovery time — {a} days vs {b}',
    reasonsUnavailable:'Detailed reasons are not yet available in this language.'
  }
};
// Translate only known API text formats; do not infer new reasons or translate player names.
export const reasonPatterns = [
  ['reasonElo', '^Elo global enregistré : (.+) ([0-9.,]+), (.+) ([0-9.,]+)\\.$', ['a','av','b','bv']],
  ['reasonRecent', '^Forme récente pondérée : (.+) ([0-9.,]+) % sur ([0-9]+) matchs ; (.+) ([0-9.,]+) % sur ([0-9]+) matchs\\.$', ['a','av','an','b','bv','bn']],
  ['reasonSurface', '^Forme sur surface pondérée : (.+) ([0-9.,]+) % sur ([0-9]+) matchs ; (.+) ([0-9.,]+) % sur ([0-9]+) matchs\\.$', ['a','av','an','b','bv','bn']],
  ['reasonDemoElo', '^Avantage Elo — ([0-9.,]+) contre ([0-9.,]+)$', ['a','b']],
  ['reasonDemoForm', '^Meilleure forme récente — ([0-9.,]+) % contre ([0-9.,]+) %$', ['a','b']],
  ['reasonDemoRest', '^Meilleure récupération — ([0-9.,]+) jours contre ([0-9.,]+)$', ['a','b']]
];
export const monthNames = {fr:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],en:['January','February','March','April','May','June','July','August','September','October','November','December']};
