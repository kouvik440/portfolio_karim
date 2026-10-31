---
name: portfolio-developpeur-premium
description: Conçoit, construit et améliore un portfolio de développeur web premium, immersif, moderne, animé et entièrement responsive. Utiliser pour un portfolio personnel React/TypeScript avec Laravel, Inertia et un panneau administrateur CRUD sécurisé, ou pour refondre l'UX, la direction artistique, les animations et les performances d'un portfolio existant.
license: MIT
compatibility: Agents de programmation avec accès aux fichiers du projet. Laravel, React et Node.js sont requis pour exécuter le site, pas pour lire le skill.
metadata:
  version: "1.0.0"
  language: "fr"
---

# Portfolio développeur premium — expérience professionnelle et immersive

## Mission

Créer un **véritable portfolio de développeur**, personnalisé, élégant et convaincant pour les recruteurs et clients. Combiner **direction artistique forte, ambiance subtile, fluidité des interactions, accessibilité, performance et administration facile**. Ne pas produire un site de démonstration générique. Livrer du code exécutable, pas seulement une maquette.

**Stack par défaut** : Laravel (starter kit React officiel) + Inertia.js + React + TypeScript + Tailwind CSS + shadcn/ui + Motion for React + MySQL ou PostgreSQL. **Un seul projet Laravel** sert les pages React/Inertia publiques et l'admin : pas d'API REST séparée sauf exigence explicite. S'adapter à la version et aux conventions réelles du projet, sans migrations destructrices.

**Langue de base : français**, textes éditables dans l'admin ; prévoir anglais si demandé. Ne jamais inventer des études, expériences, chiffres ou liens de réalisations personnels. Utiliser des placeholders marqués quand les données ne sont pas fournies.

## Workflow obligatoire

1. **Inspecter l'existant** : `composer.json`, `package.json`, arborescence, routes, migrations, styles, schéma de données. Conserver les conventions en place. En nouveau projet, utiliser le starter kit React Laravel stable et vérifier les versions plutôt que supposer une syntaxe obsolète.
2. **Choisir une direction artistique** : par défaut « Aurora Graphite » décrite dans `references/direction-artistique.md`. Si une identité visuelle existe déjà, la respecter. Définir couleurs, échelles typographiques, densité, contraste, mouvements et règles de composants avant de générer les pages.
3. **Définir le contenu utile** : identité et rôle, accroche orientée valeur, technologies, projets vérifiables, études, parcours, offres/prestations facultatives, CV, GitHub, LinkedIn, email. Éviter les sections vides ou artificielles. Lire `references/contenu.md`.
4. **Construire l'expérience publique** en responsive mobile-first avec les sections et composants de `references/design-responsive.md`. Créer une navigation fluide au clavier et sur téléphone.
5. **Implémenter l'ambiance visuelle et les animations** à partir des ressources fournies ; lire `references/animations-accessibilite.md`. Un arrière-plan esthétique ne doit jamais réduire la lisibilité ni ralentir le site.
6. **Rendre le contenu administrable** : modèles, migrations, routes contrôlées, validation, policies, formulaires React/Inertia, stockage d'images et CV. Lire `references/architecture-admin.md`.
7. **Tester le rendu et le code** : PHP tests, compilation TypeScript/Vite, lint, vérifications manuelles à 360 / 768 / 1024 / 1440 px, clavier, reduced-motion, formulaires, erreurs 404/500, chargement et SEO. Lire `references/qualite-livraison.md`.
8. **Livrer** : expliquer la structure, les commandes de démarrage, la configuration `.env`, l'accès admin, les tests réalisés et les points non terminés ; ne pas prétendre avoir testé ce qui n'a pas été exécuté.

## Direction artistique et rendu attendu

**Signature visuelle** : noir bleuté/graphite profond, surfaces translucides discrètes, glows cyan/turquoise/violet très atténués, typographie nette, titres amples, bento grid de projets, cartes haut de gamme, interactions précises et une photographie ou illustration pertinente *si fournie/permise*.

- Hero à forte personnalité : nom, rôle (« Développeur Full-Stack » personnalisable), proposition de valeur, statut disponible, CTA `Voir mes projets` / `Me contacter`, liens sociaux. Option de mini-console stylisée, mais **pas** d'effet machine à écrire bloquant la lecture.
- Barre de navigation sticky translucide avec liens d'ancrage, changement de thème et menu mobile fonctionnel.
- Projets « case studies » : problème, solution, stack, captures originales, contribution réelle, résultats **seulement s'ils sont vérifiés**, GitHub/démo si disponibles. Un projet phare plus grand et des cartes secondaires en bento.
- Compétences en catégories (frontend, backend, bases de données, outils) sans barres de progression arbitraires.
- Parcours chronologique, section « À propos », méthodes de travail et zone de contact claire.
- Footer sobre avec liens, disponibilité et année dynamique.
- Ambiance : deux halos larges à faible opacité, grille presque invisible, mouvement lent à distance, révélations au scroll et hover subtils. Pas de pluie de particules, vidéo en autoplay, curseur personnalisé obligatoire, sons ou parallax excessive.
- 3 variantes possibles documentées dans `references/direction-artistique.md` : Aurora Graphite (défaut), Editorial Light, Neo-Brutal Minimal. L'utilisateur peut choisir ultérieurement.

## Composants réutilisables et code fourni

- `assets/theme.css` : tokens CSS pour ambiance sombre (à adapter aux variables Tailwind/shadcn existantes ; ne pas écraser aveuglément leurs styles).
- `assets/AmbientBackground.tsx` : ambiance en CSS (pas de WebGL), non interactive, sans coût JavaScript d'animation.
- `assets/Reveal.tsx` : apparition au scroll avec Motion, prise en compte de `prefers-reduced-motion`.
- `assets/HeroSection.tsx` : hero React responsive, compatible Inertia, avec données typées.
- `references/architecture-admin.md` : architecture et fonctions CRUD.

Lorsqu'un composant existant couvre le besoin, le réutiliser. Séparer données, styles et rendu ; toujours tester les chemins d'import et la compatibilité avec les versions installées.

## Exigences produit

### Design, responsive, usage
- Penser mobile dès 320–360 px ; aucun scroll horizontal, aucune section illisible et aucun élément tactile trop petit. Menu fonctionnel sur iPhone et Android.
- Éviter la mise en page à hauteur fixe qui coupe le texte ; privilégier `min-height` et tailles fluides `clamp()`.
- Contrastes suffisants, focus visible, lien d'évitement, `aria-label` lorsque nécessaire, textes alternatifs descriptifs, navigation au clavier.
- Gérer `prefers-reduced-motion`, `prefers-color-scheme` et la persistance du choix de thème s'il est offert.
- Animations uniquement sur les propriétés `transform` et `opacity` si possible. Ne pas animer continuellement de grandes ombres, filtres ou flous mobiles.

### Architecture et sécurité
- Admin à `/admin` protégé par `auth`, vérification de rôle/policy et routes explicitement séparées des routes publiques. Pas de lien public vers l'inscription de comptes admins.
- Modèles et migrations pour profil, projets, compétences, expériences, médias, messages de contact et paramètres. Données publiques publiées explicitement ; contenus en brouillon non exposés.
- Ne jamais rendre du HTML stocké sans nettoyage adapté ; valider toutes les entrées et images côté serveur ; protéger les formulaires (CSRF, anti-spam / rate limiting), ne jamais exposer `.env` ou secrets.
- Upload : extensions/MIME, taille max, noms générés, stockage public contrôlé, possibilité de suppression, alt text ; pas d'exécution de fichiers uploadés.
- Configurable par contenu, sans coder les projets dans un composant React. Les modèles de données sont détaillés dans `references/architecture-admin.md`.

### Performance, SEO, crédibilité
- Tester Web Vitals sur un build de production. Images optimisées WebP/AVIF, dimensions explicites, lazy loading hors hero, pas de bibliothèques 3D lourdes par défaut.
- Meta title/description spécifiques, Open Graph, canonical, sitemap, robots, données structurées `Person` ou `ProfilePage` si pertinentes ; vérifier l'indexabilité de l'architecture choisie et prévoir le rendu approprié des métadonnées.
- Formulaire de contact fiable avec succès/erreur, journalisation privée et protection anti-spam ; ne pas exposer d'adresse personnelle sensible.
- Garantir une page attrayante **même sans animations** et sur connexion mobile lente.

## Critères d'acceptation

Avant de déclarer le portfolio terminé :
1. Hero lisible, accroche claire, CTA utilisables sur mobile et desktop.
2. Projets réels ou marqués « à compléter », données lues depuis Laravel, aucun faux témoignage/statistique.
3. Édition du profil et d'au moins un projet via l'admin ; publication/dépublication reflétée sur le site public.
4. Connexion admin sécurisée et redirection non autorisée.
5. Menu mobile, dark/light s'il est présent, formulaire et liens externes testés.
6. Respect de reduced motion, focus clavier, contraste, pas de débordement horizontal.
7. Build React/TypeScript et tests Laravel exécutés, problèmes indiqués.
8. Documentation de démarrage et d'administration.

## Exemples de requêtes auxquelles appliquer ce skill

- « Crée mon portfolio de développeur Laravel + React avec un design premium, interactif et responsive. »
- « Améliore mon portfolio : animation moderne, ambiance lumineuse subtile, projets en bento grid et administration complète. »
- « Ajoute un dashboard Laravel pour publier mes projets sans toucher au code React. »
- « Optimise mon portfolio pour recruteurs, mobiles, SEO et accessibilité. »

## Sources techniques et limites

La spécification Agent Skills prévoit `SKILL.md` et des fichiers `references/` et `assets/`. Sources publiques utiles : https://agentskills.io/specification ; https://laravel.com/starter-kits ; https://motion.dev/docs/react ; https://motion.dev/docs/react-accessibility . Ces liens sont informatifs ; ne pas s'appuyer sur eux pour masquer une incompatibilité dans le projet local.
