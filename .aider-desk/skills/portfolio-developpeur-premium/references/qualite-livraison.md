# Plan de validation et livraison

## Checklist technique

- `composer install` / `npm install` sans conflit ; ne pas lancer des commandes destructrices sans accord.
- `.env` renseigné localement sans jamais l'exposer ; `php artisan key:generate` si nouveau projet.
- `php artisan migrate` sur base dédiée ; ne pas écraser base existante.
- `npm run build` OK ; `npx tsc --noEmit` ou commande de typecheck du projet ; test de lint si configuré.
- `php artisan test` : tests d'accès admin (200 pour admin, 403 pour non-admin), validation create/update, publié/brouillon, contact et limitation de fréquence.
- Examiner les liens, les 404, le succès/échec formulaire, les images manquantes.

## Tests visuels

- Largeurs 360, 768, 1024, 1440 px ; zoom 200 %.
- Titres longs, traduction, très petits mobiles, thème clair/foncé, textes sans image.
- `prefers-reduced-motion`, tabulation complète, focus visible et menu mobile.
- Site disponible sans animation ; ne pas masquer les contenus derrière des effets scroll jamais déclenchés.

## SEO et accessibilité

- `title`, `description`, canonical, OG image, alt images, sitemap et robots corrects.
- Pas de titres H1 multiples sans raison, ordre des headings cohérent.
- Formulaires labellisés, erreurs associées, messages `aria-live` si nécessaires.
- Mesurer LCP/CLS/INP avant d'annoncer un score ou un gain.

## Compte-rendu final de l'agent

- Fonctionnalités livrées et fichiers importants.
- Choix de design et pourquoi ils servent le profil.
- Commandes testées et résultats observés, erreurs éventuelles.
- Variables d'environnement à renseigner.
- Accès admin : procédure de création du compte, pas d'identifiants par défaut.
- Prochaines améliorations, sans promettre des fonctionnalités non livrées.
