# Tennoro public stats API contract

Endpoint used by the site:

```text
NEXT_PUBLIC_TENNORO_STATS_API
```

Current value:

```text
https://tennoro-stripe.duckdns.org/public/stats
```

The page `/stats/index.html` can already render the fields below.

## Expected JSON

```json
{
  "updatedAt": "2026-06-13T12:00:00.000Z",
  "accuracy": 86.6,
  "totalPicks": 127,
  "wonPicks": 110,
  "lostPicks": 17,
  "profit": 421,
  "roi": 4.21,
  "totalStake": 6350,
  "averageOdds": 1.33,
  "bankroll": 1421,
  "bankrollHistory": [
    { "date": "2026-06-01", "value": 1000 },
    { "date": "2026-06-02", "value": 1042 }
  ],
  "categories": {
    "free": { "picks": 23, "won": 20, "lost": 3, "accuracy": 86.96, "roi": 4.2, "profit": 48 },
    "premium": { "picks": 72, "won": 61, "lost": 11, "accuracy": 84.72, "roi": 3.8, "profit": 136 },
    "highConfidence": { "picks": 32, "won": 29, "lost": 3, "accuracy": 90.63, "roi": 7.4, "profit": 237 }
  },
  "circuits": {
    "atp": { "picks": 68, "won": 58, "lost": 10, "accuracy": 85.29, "roi": 3.9, "profit": 132 },
    "wta": { "picks": 59, "won": 52, "lost": 7, "accuracy": 88.14, "roi": 4.6, "profit": 289 }
  },
  "surfaces": {
    "hard": { "picks": 64, "won": 55, "lost": 9, "accuracy": 85.94, "roi": 4.1, "profit": 148 },
    "clay": { "picks": 48, "won": 42, "lost": 6, "accuracy": 87.5, "roi": 5.0, "profit": 188 },
    "grass": { "picks": 15, "won": 13, "lost": 2, "accuracy": 86.67, "roi": 3.2, "profit": 85 }
  },
  "monthlyHistory": [
    { "month": "Mai 2026", "picks": 80, "accuracy": 85.0, "roi": 3.7, "profit": 148 },
    { "month": "Juin 2026", "picks": 47, "accuracy": 89.36, "roi": 5.1, "profit": 273 }
  ]
}
```

## Notes

- Percentages are expected as percentages, not ratios. Example: `86.6`, not `0.866`.
- Money values are expected in euros as numbers, without the `€` symbol.
- `bankrollHistory` should contain one point per day. If several picks happen on the same day, send the final bankroll value for that day.
- The stats page currently displays detailed cards using:
  - `accuracy`
  - `picks`
  - `won`
- It also accepts common aliases such as `totalPicks`, `wonPicks`, `wins`, `correct`, `count`, `byCategory`, `surfaceStats`, `circuitStats`, and `byMonth`.
