---
name: portfolio-seo-accessibilite
description: Auditer et améliorer SEO et accessibilité d'un portfolio Laravel Inertia React; indexabilité SSR, métadonnées, sitemap, JSON-LD justifié, HTML sémantique, contrastes, navigation clavier et formulaires. À utiliser avant la mise en ligne ou après un audit.
license: MIT
---
# SEO + Accessibilité du Portfolio

1. Inventorier routes publiques et déterminer quels contenus sont réellement publiés.
2. Vérifier le HTML effectivement renvoyé sans JavaScript ; configurer Inertia SSR ou une stratégie de rendu côté serveur adaptée et tester l'indexabilité, sans promettre qu'une SPA est automatiquement SEO-friendly.
3. Ajouter title, description, canonical, Open Graph, robots et sitemap appropriés ; intégrer des données structurées uniquement pour les faits réels.
4. Auditer chaque page : un seul titre H1 logique, niveaux de titres, labels, alt pertinents, liens compréhensibles, contrastes, ordre de focus, skip-link, erreurs.
5. Vérifier les pièges : menu mobile accessible, formulaires utilisables sans souris, animations compatibles reduced-motion, état vide et erreurs 404/403.
6. Mesurer avec Lighthouse ou outils disponibles ; noter mesures, environnement, limites. Proposer correctifs classés impact/effort.
7. Ne pas modifier le contenu publié sans justification, ne pas exposer les données de contact privées.
