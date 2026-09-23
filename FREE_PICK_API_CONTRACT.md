# Pick gratuit public — contrat JSON v1

## Branchement futur (aucun backend modifié)

Page statique : `/pronostics-tennis/`. Renseigner `PICK_API_URL` dans
`pronostics-tennis/pick-config.mjs` avec l'URL HTTPS du futur endpoint public.
GET JSON UTF-8, HTTP 200 pour `pick` **et** `no_pick`. Erreurs : HTTP 4xx/5xx.
Ne pas envoyer de token privé au navigateur. Le JSON ne contient que le pick
gratuit et des informations publiques, jamais les sélections VIP.
Le serveur devra autoriser l'origin `https://tennoro.com` via CORS.
Origin locale autorisée : `http://127.0.0.1:3000`, avec données réelles sans `?demo=1`.
Sans wildcard. Endpoint actif : `https://tennoro.duckdns.org/public/free-pick`.

Le frontend charge à l'ouverture puis toutes les 5 minutes, avec un délai maximal
de 10 secondes, sans credentials ni cache navigateur. Les données précédentes sont
masquées avant une nouvelle requête. Pas de repli sur un mock en cas d'erreur.

## Objet racine (toutes les clés sont requises)

| Champ | Type / valeurs | Signification |
| --- | --- | --- |
| schemaVersion | entier `1` | Version du contrat |
| isDemo | booléen | **false obligatoire pour l'API réelle** |
| date | `YYYY-MM-DD` | Journée éditoriale du pick dans Europe/Paris ; doit être aujourd'hui |
| timezone | `Europe/Paris` | Référence de la journée et de l'affichage horaire |
| updatedAt | ISO 8601 avec Z ou décalage | Dernière actualisation côté producteur |
| status | `pick` / `no_pick` | Sélection disponible ou absence explicite de sélection |
| pick | objet / null | null uniquement pour `no_pick` |
| history | tableau (0 à 50 objets) | Picks terminés ; affichés du plus récent au plus ancien |
| freePickStats | objet / null | Agrégats calculés côté bot, indépendants de la taille de l'historique |

Une journée périmée, une structure invalide, un endpoint non configuré, un timeout
ou une erreur réseau affichent « Données temporairement indisponibles » et masquent
les données. `no_pick` n'est **jamais** déduit d'un échec réseau.

## pick

| Champ | Type / valeurs |
| --- | --- |
| match.id | chaîne non vide, identifiant stable |
| match.tour | `ATP` / `WTA` |
| match.tournament | chaîne non vide |
| match.surface | `hard`, `clay`, `grass`, `carpet`, `unknown` |
| match.startsAt | ISO 8601 avec Z/décalage, ou null si horaire inconnu |
| match.status | `scheduled`, `live`, `finished`, `postponed`, `cancelled` |
| players | exactement deux joueurs : index 0 = A, index 1 = B |
| selection.playerId | id de l'un des deux joueurs |
| selection.market | `match_winner` (seul marché pris en charge) |
| confidence | nombre 0–100 ou null : indice de confiance, affiché sur 100 |
| odds | cote décimale >= 1.01, ou null |
| modelProbability | pourcentage 0–100 ou null, estimation de victoire du joueur sélectionné |
| marketProbability | pourcentage 0–100 ou null, probabilité implicite du marché corrigée de la marge pour la même sélection, comme sur Discord |
| edge | nombre -100 à 100 ou null, différence en **points de pourcentage** |
| h2h | `{ "playerAWins": entier >= 0 ou null, "playerBWins": entier >= 0 ou null }` ou null |
| reasons | tableau vide ou 2–5 chaînes (500 caractères maximum chacune), fourni par le bot |

Définitions approuvées : `marketProbability` est la probabilité implicite corrigée
de la marge, enregistrée par le bot, comme dans le panneau Informations Discord.
Elle ne vaut pas `100 / odds`. `edge` compare le modèle à ce marché corrigé,
en points de pourcentage. Probabilités et edge : une décimale, arrondis indépendants. Le frontend **ne recalcule pas** ces champs. Ne jamais copier confidence
dans modelProbability. Les trois valeurs ont des sens différents.

Chaque joueur contient toutes les clés suivantes :

| Champ | Type / convention |
| --- | --- |
| id, name | chaînes non vides ; ids distincts |
| ranking | entier > 0 ou null (rang officiel ATP/WTA, faible = mieux classé) |
| scoreTennoro | probabilité modèle du joueur 0–100 ou null, affichée sous le nom Score Tennoro dans Discord, à une décimale |
| eloGlobal, eloSurface | nombres >= 0 ou null |
| recentForm | taux pondéré 0–100 ou null sur jusqu’à 20 matchs récents, sinon taux simple si le pondéré manque ; arrondi entier |
| surfaceForm | taux pondéré 0–100 ou null sur jusqu’à 40 matchs sur la surface, sinon taux simple si le pondéré manque ; arrondi entier |
| matchesLast30Days | entier >= 0 ou null |
| restDays | entier >= 0 ou null |

Fenêtres confirmées : jusqu’à 20 matchs récents et 40 sur la surface. Le Score
Tennoro reprend la probabilité modèle du joueur ; celui de l’adversaire est son
complément à 100. La confiance reste un indicateur distinct. Ne pas transformer arbitrairement une valeur existante
pour remplir ces champs. Les valeurs inconnues sont `null`, pas zéro ni une chaîne
`"N/A"`. Zéro est une vraie mesure. Les nombres ne sont jamais des chaînes.
Barres : les scores et taux utilisent 100 ; les Elo utilisent le maximum des deux
joueurs. Aucun sens « meilleur » n'est attribué aux jours de repos ou au volume
de matchs. Orange = sélection, gris = adversaire, quel que soit l'indicateur.

## history[]

Chaque objet : `id` chaîne stable, `date` YYYY-MM-DD, `playerA` et `playerB`
chaînes, `selection` nom exactement égal à l'un des joueurs, `odds` >= 1.01 ou
null, `confidence` 0–100 ou null, `result` = `won`, `lost` ou `void`.
Ne pas y inclure des matchs encore ouverts. Le frontend trie les dates sans
modifier les résultats ni recalculer les performances.

## freePickStats

Toutes les clés requises, valeurs numériques ou null :

- `picks` : entier >= 0, nombre de picks clôturés, void compris.
- `accuracy` : taux de gagnés / (gagnés + perdus), 0–100 ; null si dénominateur nul.
- `roi` : rendement net / mises hors void × 100, >= -100, null si aucune mise valide.
- `averageOdds` : cote moyenne des gagnés/perdus, >= 1.01 ; null si aucun résultat valide.
- `from`, `to` : bornes YYYY-MM-DD ou null.

Le bot reste responsable des mises et du calcul du ROI réel. L'interface n'assume
pas que ces agrégats portent seulement sur les cartes visibles.

## Exemple complet

`pronostics-tennis/pick.mock.json` est l'exemple complet du contrat, avec tous les
champs et trois résultats (gagné/perdu/void). **Tout son contenu est fictif**.
Pour une vraie réponse, utiliser des données réelles, `isDemo: false` et la date
du jour Europe/Paris. Ne jamais publier cet exemple comme réponse de production.

Exemple d'absence de pick (date et updatedAt à renouveler quotidiennement) :

```json
{
  "schemaVersion": 1,
  "isDemo": false,
  "date": "2026-09-23",
  "updatedAt": "2026-09-23T08:00:00Z",
  "timezone": "Europe/Paris",
  "status": "no_pick",
  "pick": null,
  "history": [],
  "freePickStats": null
}
```

L'historique et les agrégats peuvent être renseignés même un jour sans pick.
Sans raisons, utiliser `reasons: []` : l'interface signale leur indisponibilité.

## Test local

Depuis la racine : `python -m http.server 3000 --bind 127.0.0.1` (si aucun serveur
n'est déjà lancé). Ouvrir :

- `http://127.0.0.1:3000/pronostics-tennis/?demo=1` : démonstration complète.
- `?demo=1&scenario=empty` : aucun pick, historique conservé.
- `?demo=1&scenario=partial` : champs optionnels inconnus et raisons absentes.
- `?demo=1&scenario=error` : indisponibilité.
- sans paramètres : comportement réel, indisponible tant qu'aucun endpoint n'est configuré.

Le mock n'est chargé que si le hostname est exactement localhost, 127.0.0.1 ou
[::1] **et** demo=1. Sur tennoro.com, même ?demo=1 est ignoré. La page démo porte
un bandeau permanent et un titre explicites ainsi qu'une directive noindex.
Le fichier de test lui-même est statique et public s'il est déployé : il ne doit
donc contenir aucun secret ni aucune donnée personnelle réelle.

Tests sans dépendance : `node --test tests/free-pick.test.mjs`.
Les métadonnées sont statiques ; le pick est chargé côté navigateur. L'indexation
des détails dynamiques dépend du rendu JavaScript du moteur de recherche.

## Modification validée le 23 septembre 2026 : dernier pick publié

Cette section remplace les anciennes contraintes de sélection par jour et de
résultats uniquement clôturés dans history. La carte principale affiche le dernier
pick gratuit effectivement publié sur Discord, indépendamment de la date du match
et du résultat du précédent. Le champ racine date est la journée Paris de la
réponse ; match.startsAt conserve la vraie date du match. pick.publishedAt fournit
la date réelle de publication. Le dernier pick reste affiché jusqu'au suivant,
avec ses dates réelles, sous le titre Dernier pronostic tennis gratuit.

history contient les publications précédentes, sans doublon avec le pick principal,
dans l'ordre de publication décroissant fourni par l'API (ne pas retrier par date
du match). history[].publishedAt est ajouté. history[].result vaut null tant que
le pick n'est pas clôturé : afficher alors une case résultat vide, sans badge.
Les valeurs de résultat clôturé restent won, lost et void.

freePickStats reste limité aux seuls picks gratuits clôturés : aucun pick pending
ne participe aux statistiques. La structure conserve schemaVersion 1 ; le
validateur frontend accepte les nouvelles valeurs null et les dates de publication.
