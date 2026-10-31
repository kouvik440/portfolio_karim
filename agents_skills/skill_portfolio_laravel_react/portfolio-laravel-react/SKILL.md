---
name: portfolio-laravel-react
description: Concevoir, construire, améliorer et maintenir un portfolio professionnel dynamique et responsive utilisant Laravel, Inertia.js, React et TypeScript, avec dashboard administrateur sécurisé, gestion de contenus, projets, compétences, CV, contact, SEO et tests. À activer pour un portfolio personnel Laravel et React, son interface publique ou son back-office.
license: MIT
compatibility: PHP, Composer, Laravel, Node.js, npm, React, Inertia.js et base SQL. Utilisable par un assistant de programmation prenant en charge le format Agent Skills.
---

# Portfolio Laravel + React — skill principal

## Mission

Agir comme développeur full-stack senior et designer produit pour réaliser un **portfolio personnel réellement administrable, élégant, performant et accessible**. Livrer du code fonctionnel, pas uniquement une maquette ou des composants décoratifs. Réutiliser le projet existant si l'utilisateur en fournit un. Les préférences explicites de l'utilisateur prévalent sur ces conventions.

## Architecture par défaut

- **Monolithe Laravel + Inertia.js + React + TypeScript + Vite**. Une application, un domaine, un système de sessions Laravel, des pages publiques et un dashboard React. Pas de deuxième application React ni de CORS/API externe inutile.
- Démarrer à partir du **starter kit officiel Laravel React** compatible avec la version installée. Préserver ses conventions d'authentification et de fichiers. Tailwind CSS et shadcn/ui peuvent servir de base sans produire une esthétique générique.
- Base relationnelle : PostgreSQL ou MySQL selon ce qui est disponible. Migrations, seeders démonstratifs et factories. Ne jamais imposer un nouveau serveur DB à chaque projet.
- Routes et contrôleurs Laravel, pages React dans `resources/js/pages`, composants réutilisables dans `resources/js/components`, layouts publics et administration séparés. Adopter la structure réelle du starter kit.
- Si l'utilisateur exige explicitement deux applications indépendantes ou une API mobile : proposer Laravel API + React SPA avec Sanctum, expliquer les surcoûts et **ne pas mélanger** les modes au hasard.

Lire `references/architecture.md` avant de démarrer un nouveau projet.

## Ce que le site doit couvrir

**Public** : accueil/hero, à-propos, compétences filtrables, projets avec détail et liens demo/GitHub, parcours/formation, expériences, CV téléchargeable, contact, liens sociaux, bas de page, page 404. Prévoir des états vides, chargement, validation et erreurs. Section blog, témoignages et multilingue FR/EN seulement si utile ou demandés.

**Administration** (`/admin`) : authentification, tableau de bord simple, CRUD projets, catégories et technologies, compétences, expériences, formations, liens sociaux, profil, réglages (titre, couleurs, SEO), images et CV, consultation/suivi des messages de contact. Modification des sections publiques sans retoucher le JSX. Toutes les données publiées proviennent de la DB ; aucune donnée personnelle factice présentée comme véridique.

## Sécurité non négociable

- Restreindre `/admin` avec `auth`, vérification de l'autorisation **côté Laravel** (Gate/Policy), protections CSRF et validation via Form Requests. La simple dissimulation des liens admin dans React ne suffit jamais.
- Pour un portfolio monopersonnel : premier compte administrateur créé volontairement (seeder sécurisé ou commande dédiée) ; **ne jamais exposer une inscription publique non souhaitée**. Aucun mot de passe en dur, dans le dépôt ou une réponse.
- Limiter les tentatives de login et l'envoi de messages ; utiliser anti-spam approprié. Echapper le contenu utilisateur, ne pas insérer du HTML non fiable avec `dangerouslySetInnerHTML`.
- Vérifier MIME/type, taille et extension des uploads ; stockage sur disque configuré ; nettoyer les anciens fichiers prudemment ; limiter les permissions. Ne jamais exposer `.env` ni les secrets.
- Mettre en œuvre droits, validations, logs utiles, gestion de l'erreur 403/404 et tests des accès interdits. Voir `references/admin-security.md`.

## Design et expérience

- Proposer un rendu professionnel **original** : hiérarchie typographique forte, palette cohérente, sections aérées, visuels de projets réels, navigation claire, CTA précis et mobile-first. Pas de modèle de cartes identiques partout.
- Responsive sur mobiles 320–390 px, tablette 768 px, desktop 1280+ px, sans débordement horizontal. Tester clavier, focus visible, contraste, labels, alt, erreurs formulaires.
- Micro-interactions utiles avec CSS ou Framer Motion uniquement si nécessaire ; respecter `prefers-reduced-motion`, éviter effets lourds et chargements janky.
- Mode clair/sombre synchronisé avec préférences utilisateur lorsque demandé ; stocker la préférence de façon adaptée.
- Lire `references/design-system.md` pour l'approche visuelle et la validation.

## Contenus et personnalisation

- Utiliser `assets/profil-exemple.md` comme questionnaire facultatif ou source de placeholders **explicitement identifiés**. Ne pas inventer des réalisations professionnelles, des statistiques, des clients, ni des liens fonctionnels.
- Créer la structure pour présenter des projets de génie logiciel avec stack technique, problème, solution, fonctionnalités, résultats vérifiables, visuels et URLs.
- Tous les champs visibles éditables depuis `/admin` lorsque raisonnable, avec visibilité `published` / `draft` et ordre d'affichage.
- Lire `references/data-model.md` avant d'écrire les migrations.

## SEO, vitesse et accessibilité

- Titles/descriptions distincts par page, canonical, Open Graph/Twitter Card, sitemap, robots.txt, données structurées pertinentes si fondées. Prévoir un rendu HTML indexable des pages publiques (SSR Inertia ou stratégie vérifiée) et vérifier par un test HTML ; ne pas promettre le SEO grâce au JSX seul.
- Optimiser images (tailles, compression, formats modernes), chargement différé sous la ligne de flottaison, polices, lazy loading des vues lourdes, requêtes DB et pagination si nécessaire.
- Objectif indicatif Lighthouse >= 90 sur performance/accessibilité/bonnes pratiques/SEO en conditions de test documentées, sans prétendre l'atteindre sans mesure.

## Procédure de travail obligatoire

1. **Auditer** le projet : versions, dépendances, structure, convention Inertia, auth, DB, routes et contenus existants ; ne pas écraser le code sans nécessité.
2. **Définir** pages, entités, parcours, style et tests ; annoncer les hypothèses et ne demander des précisions qu'en cas de blocage réel.
3. **Créer** les migrations/modèles/relations, Request validators, Policies/Gates, routes/controllers, puis vues React et composants.
4. **Rendre dynamique** le contenu via Inertia props sans requêtes redondantes ; CRUD admin réel, fichiers réellement enregistrés, statut brouillon/publication.
5. **Tester** migrations, autorisations (non-auth, user non-admin), CRUD, CV, uploads, contact, responsive et clavier ; vérifier build TypeScript, PHP tests et lint.
6. **Documenter** `.env.example`, commandes locales, rôle admin, procédure de déploiement/sauvegarde, actions non terminées.
7. Livrer des éléments vérifiables, distinguer clairement fonctionnalités codées et fonctionnalités uniquement prévues.

## Définition de terminé

- Un visiteur consulte le site sur mobile, voit seulement les données publiées, ouvre les projets et peut transmettre un message.
- Le propriétaire se connecte, crée/édite/supprime/publie des projets et modifie son profil et son CV sans modifier de code.
- Un visiteur anonyme et un utilisateur ordinaire ne peuvent accéder ni lire ni muter les données privées de `/admin`.
- Tests pertinents exécutés, site compilé, aucun secret exposé, navigation clavier et pages d'erreur vérifiées.

## Références

- `references/architecture.md` — dossier monolithique Laravel/React, installation et conventions.
- `references/data-model.md` — tables, champs et relations.
- `references/admin-security.md` — auth, autorisations, fichiers, contact.
- `references/design-system.md` — design, animations et responsive.
- `references/tests-deployment.md` — tests, performance, SEO et mise en ligne.
- `assets/brief-portfolio.md` — mini-cahier des charges personnalisable.
- `assets/profil-exemple.md` — profil et contenus à compléter.
- `assets/prompt-demarrage.md` — prompt à donner à l'agent.
