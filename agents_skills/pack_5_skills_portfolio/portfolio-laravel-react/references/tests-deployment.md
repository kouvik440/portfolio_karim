# Qualité, SEO et déploiement

## Vérifications avant livraison

1. `php artisan test` : auth, policies, CRUD, brouillons, upload, contact, routes publiques.
2. `npm run build` et commandes de lint/typecheck définies dans le `package.json` réel.
3. `php artisan migrate --pretend` si compatible et revue des migrations avant exécution destructive sur prod.
4. Tests navigateur/Playwright pour parcours visiteur, login admin, création projet, publication, contact et affichage mobile.
5. Audit Lighthouse/PageSpeed **mesuré**, notamment vitesse mobile, accessibilité, SEO.
6. Vérification page HTML publique servie aux robots ; activer/tester Inertia SSR si indispensable à l'indexation et compatible avec l'hébergement.
7. Tester les URL inconnues, images absentes, messages de validation, déconnexion et accès non autorisé.

## SEO

Titles et descriptions propres à chaque route ; `lang=fr` (ou langue réelle), métadonnées sociales et image OG, canonicals, `robots.txt`, `sitemap.xml`, schémas JSON-LD validés. Pas de fausses évaluations ni de liens inexistants. Démontrer que les balises sont présentes sur le HTML réellement envoyé ou que le rendu SSR est correctement configuré.

## Déploiement

Prévoir PHP+extensions, DB, files/storage, HTTPS, tâches scheduler/queues seulement si utilisées. Définir variables `.env` côté serveur : `APP_ENV=production`, `APP_DEBUG=false`, DB, mail. `npm run build`, `php artisan migrate --force` après **sauvegarde**, caches Artisan appropriés, `php artisan storage:link` si nécessaire, permissions minimales, supervision/logs, stratégie de backups. Configurer le document root sur `public/`, jamais sur la racine projet. Pas de secrets dans Git.

## Livrables

Code utilisable, fichier `.env.example` sans secrets, fichier README avec étapes Laragon/Windows et production, compte admin créé sans identifiants publiés, rapport des tests exécutés et limites restantes.
