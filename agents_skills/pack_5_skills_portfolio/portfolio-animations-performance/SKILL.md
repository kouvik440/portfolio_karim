---
name: portfolio-animations-performance
description: Ajouter des animations sobres et optimiser la vitesse d'un portfolio React/Inertia/Laravel : chargements, images, bundles, requêtes SQL, rendu et expérience mobile. À utiliser pour améliorer la fluidité sans nuire à l'accessibilité.
license: MIT
---
# Animations + Performance

- Définir d'abord la fonction de l'animation : feedback, transition de route, ouverture du menu ou mise en avant d'un projet. Eviter les animations décoratives en série.
- Préférer CSS transform/opacity et transitions courtes ; Framer Motion seulement si cela résout un besoin réel. Respecter `prefers-reduced-motion`.
- Réduire bundle React par code splitting, imports ciblés et suppression des librairies inutilisées ; analyser le bundle avant optimisation profonde.
- Images responsives : tailles/width/height, compression et formats adaptés, lazy loading hors viewport ; priorité au visuel hero si nécessaire.
- Côté Laravel : sélectionner seulement les champs nécessaires, précharger relations utiles, vérifier N+1 et index, utiliser cache si mesuré utile.
- Tester sur écran mobile, connexion lente, clavier et mode reduced-motion ; vérifier les Web Vitals si outils disponibles.
- Ne donner ni score Lighthouse ni gains de vitesse non mesurés.
