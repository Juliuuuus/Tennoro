# Socle SEO Tennoro — 23 septembre 2026

## Périmètre et audit initial

Site statique GitHub Pages : index.html, stats/index.html, contact.html et stats.html (ancienne redirection). Aucun framework, workflow de build ou backend présent. CNAME contient déjà tennoro.com. Les corrections mobiles et l'ordre inversé des mois précédemment demandés sont conservés. Aucun push, déploiement, changement du bot, du modèle, du Selector ou de l'API.

Constats : canonical absentes sur les trois pages principales ; canonical relative sur la redirection ; absence de robots.txt, sitemap, Open Graph, Twitter Cards et JSON-LD ; description d'accueil très courte ; page Contact non reliée par les liens Contact (ils menaient à Discord) ; favicon manquant sur Contact ; images sans dimensions HTML ; configuration des statistiques chargée dans le head ; deux sections de stats titrées en H3 au lieu de H2. Un H1 par vraie page était déjà présent, et le contenu expliquait déjà naturellement tennis, ATP/WTA, données et suivi des performances. Pas de réécriture nécessaire.

## Métadonnées et URL retenues

- Accueil : https://tennoro.com/
- Statistiques : https://tennoro.com/stats/ (répertoire existant, slash final conforme à l'hébergement statique).
- Contact : https://tennoro.com/contact.html (fichier existant, pas de nouvelle route inventée).
- stats.html reste une redirection immédiate vers ./stats/, canonical vers https://tennoro.com/stats/, hors sitemap.
- /index.html et /stats/index.html restent accessibles pour les anciens liens ; canonical et liens internes privilégient / et /stats/.

Title accueil : Tennoro — Analyse & Prédictions Tennis ATP/WTA

Description accueil : Tennoro analyse chaque jour les matchs de tennis ATP et WTA grâce aux données. Découvrez les sélections du modèle statistique et ses performances suivies.

Title stats : Statistiques & Performances — Tennoro

Description stats : Consultez les performances du modèle Tennoro : précision, ROI, profit, résultats ATP/WTA, statistiques par surface et historique mensuel des sélections.

Les trois pages ont des métadonnées Open Graph et Twitter cohérentes, dont summary_large_image. Le logo existant /assets/tennoro-logo.png (1024 x 1024, environ 95 Kio) est réutilisé avec dimensions et texte alternatif de partage. Aucun compte social inventé. Une carte paysage dédiée 1200 x 630 serait une amélioration facultative : déposer alors /assets/og-image.png, puis remplacer les URL et dimensions dans les trois heads après vérification de l'image. Aucun lien vers cette image inexistante n'est livré.

JSON-LD sur l'accueil : Organization et WebSite, limités à Tennoro, URL officielle, logo, langue et relation publisher. Aucune adresse, note, personne ou entité juridique inventée.

## Fichiers

Créés : robots.txt, sitemap.xml, SEO-DEPLOYMENT.md.

Modifiés : index.html, stats/index.html, contact.html, stats.html, styles.css.

Conservés sans modification : CNAME, stats-config.js, STATS_API_CONTRACT.md, images. Aucun outil analytics ajouté.

## Performance et rendu

- Dimensions HTML explicites pour logos (38 x 38) et icône Discord (22 x 22), conformes aux dimensions CSS existantes.
- Logos du footer en loading="lazy" et decoding="async" ; images visibles immédiatement non différées.
- stats-config.js déplacé à la fin du body, immédiatement avant son script consommateur : parsing initial non bloqué, ordre d'exécution préservé. Ne pas le passer en defer seul, car les scripts inline en dépendent.
- Favicon PNG existant (819 x 819, environ 29 Kio) partagé sur les trois pages et réutilisé comme apple-touch-icon sans nouveau fichier. Aucun favicon.ico n'existe. Une déclinaison plus petite pourra être faite ultérieurement ; pas nécessaire à l'indexation.
- Fonts système : aucune requête de police externe. CSS conservé, sauf extension des sélecteurs pour que les nouveaux H2 aient le même rendu que les anciens H3.
- Logo rouge inutilisé d'environ 520 Kio laissé en place ; il n'est pas chargé par les pages. Pas de suppression spéculative.
- Alt vides conservés pour les logos redondants avec le texte Tennoro et le nom accessible du lien, et pour l'icône décorative Discord. Les graphiques SVG ont déjà role="img" et un titre accessible.

## Vérifications réalisées

- HTTP 200 local : /, /stats/, /contact.html, /stats.html, robots.txt, sitemap.xml, favicon et logo.
- 42 références locales et ancres vérifiées ; aucune cible manquante.
- XML du sitemap et JSON-LD parsés, destinations du sitemap vérifiées sur disque.
- Un H1 sur chaque vraie page, métadonnées présentes ; syntaxe des scripts inline vérifiée.
- JavaScript métier comparé au dépôt : inchangé, hormis l'inversion mensuelle déjà présente avant ce chantier. stats-config.js et CNAME inchangés.
- Navigateur : accueil à 390 px, stats à 390/320 px et 1440 px, Contact à 320 px. Aucun débordement horizontal constaté dans ces vues. Clic mobile Stats et navigation Contact fonctionnels. Aucun avertissement/erreur JS observé dans l'onglet de test.
- API réelle chargée dans le navigateur : dernière mise à jour 23/09/2026, statistiques et historique septembre → juin visibles.
- Liens légaux Notion : HTTP 200 ; cela ne prouve pas leur consultation anonyme complète. Invitation Discord : redirection HTTP vers discord.com/invite, validité de l'invitation à confirmer dans Discord.

## Points externes et limites

Au 23/09/2026, HTTPS tennoro.com et www.tennoro.com échoue à la validation du nom du certificat. L'ancien https://juliuuuus.github.io/Tennoro/ répond 301 vers http://tennoro.com/. Terminer le DNS et l'émission du certificat GitHub Pages, puis activer Enforce HTTPS et vérifier les redirections. Ne pas contourner les avertissements TLS. Le dépôt doit garder CNAME=tennoro.com ; aucun .htaccess ou serveur applicatif n'est requis.

Les changements actuels sont uniquement locaux. Le sitemap de production et les nouvelles métadonnées ne seront disponibles qu'après une publication GitHub Pages ultérieure.

L'accueil contient déjà des statistiques et une courbe de secours codées en dur qui peuvent apparaître en cas de panne API. Elles n'ont pas été modifiées. Un chantier distinct devrait distinguer explicitement les données indisponibles des données réelles. Les stats détaillées dépendent du JavaScript/API ; le texte descriptif et les métadonnées sont dans le HTML statique. Aucun résultat chiffré n'est repris dans le JSON-LD.

## CORS à régler côté VPS, manuellement

Les GET publics testés avec les origins https://tennoro.com, https://www.tennoro.com et https://juliuuuus.github.io répondent tous HTTP 200 avec Access-Control-Allow-Origin: *. Ce wildcard est déjà présent côté serveur ; ce chantier ne l'a pas ajouté.

Valeur cible recommandée si le backend lit une seule origin :

```env
PUBLIC_STATS_ALLOWED_ORIGIN=https://tennoro.com
```

Pas de slash final ni de chemin dans une origin. La variable et sa syntaxe exactes ne sont pas vérifiables ici : aucun code backend n'est dans ce dépôt.

Avec www et l'ancien domaine redirigés AVANT de servir le site, seule https://tennoro.com est nécessaire. Si des pages restent réellement servies sur l'ancien domaine pendant la transition, ajouter temporairement https://juliuuuus.github.io à une allowlist serveur explicite. Ajouter https://www.tennoro.com seulement si cette variante sert réellement des pages au lieu de rediriger vers le domaine officiel. Retirer les origins transitoires après bascule.

Une allowlist doit renvoyer une seule origin autorisée correspondant à l'en-tête Origin reçu, avec Vary: Origin ; jamais plusieurs origins séparées par des virgules dans Access-Control-Allow-Origin, et jamais *. Ne pas inventer une valeur multi-origins de PUBLIC_STATS_ALLOWED_ORIGIN sans vérifier le parseur du bot. Garder GET/OPTIONS fonctionnels. localhost est une origin de développement distincte, à gérer explicitement si nécessaire.

## Search Console après publication et HTTPS valide

1. Ouvrir Google Search Console et ajouter une propriété de type Domaine : tennoro.com (sans https ni chemin).
2. Copier l'enregistrement TXT fourni par Google dans la zone DNS chez le gestionnaire du domaine. Ne pas remplacer les autres enregistrements. Attendre la propagation puis cliquer Vérifier ; conserver le TXT.
3. Ouvrir https://tennoro.com/robots.txt et https://tennoro.com/sitemap.xml, vérifier qu'ils sont accessibles, puis envoyer https://tennoro.com/sitemap.xml dans la section Sitemaps.
4. Inspecter https://tennoro.com/ avec l'outil Inspection de l'URL, tester l'URL publiée, puis demander l'indexation. Faire de même pour /stats/ et /contact.html si souhaité.
5. Consulter les rapports Indexation des pages et Sitemaps : erreurs HTTPS, 404, canonical choisie par Google, blocages et réponses serveur. Une demande d'indexation ne garantit ni indexation immédiate ni classement.

Sources : https://support.google.com/webmasters/answer/10351509 ; https://support.google.com/webmasters/answer/7451001 ; https://support.google.com/webmasters/answer/9012289 ; https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https

## Analytics et futures pages

Aucun script analytics détecté. Options à décider ultérieurement : statistiques agrégées simples, ou outil événementiel pour un tunnel détaillé. GA4, Matomo et Plausible sont des candidats à évaluer selon les besoins et les modalités de collecte ; aucun n'est installé. Les événements utiles seront clic Discord, clic VIP et conversion confirmée. Un clic seul ne prouve pas un abonnement ; les conversions nécessiteront une intégration avec le système de paiement/bot.

Architecture future : ajouter des dossiers contenant index.html, par exemple pronostics-tennis/index.html, blog/index.html, blog/nom-article/index.html et methode/index.html. Les URL canoniques seront /pronostics-tennis/, /blog/, /blog/nom-article/ et /methode/. Pour chaque vraie page : title/description uniques, canonical absolue, métadonnées de partage, lien HTML entrant et ajout d'une entrée <url><loc>...</loc></url> au sitemap. Ajouter lastmod seulement si la date de modification du contenu est connue, pas à chaque lecture de l'API. Aucun de ces dossiers ou contenus futurs n'a été créé.
