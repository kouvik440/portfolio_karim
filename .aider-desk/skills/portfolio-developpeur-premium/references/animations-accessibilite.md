# Animations — immersion maîtrisée

Installer `motion` uniquement si des interactions le nécessitent : `npm install motion`. Import actuel : `import { motion, MotionConfig, useReducedMotion } from 'motion/react'`.

## Règles

- Utiliser `MotionConfig reducedMotion="user"` pour respecter les préférences système.
- `Reveal` : opacité et léger y (+12-18px) au scroll ; `once: true`. Si reduced-motion, supprimer la translation et afficher immédiatement.
- Hover cartes : translation y -3 à -5px, border contrast augmenté, shadow légère. En reduced-motion, hover couleur/bordure seulement.
- En-tête : apparition discrète ; menu mobile sans animation compliquée.
- Une aura glissante peut être réalisée en CSS mais préférer des gradients **statiques** sur mobile et en reduced-motion.
- Limiter `backdrop-filter` sur téléphone ; les flous répétés coûtent cher.
- Pas de scroll hijacking, sons, animations de texte lettre par lettre, faux terminal interminable, backgrounds WebGL imposés.

## Accessibilité

- Réserver les éléments d'ambiance à `aria-hidden="true"` et `pointer-events: none`.
- CSS `@media (prefers-reduced-motion: reduce)` coupe animations/transitions décoratives.
- Contrastes texte/objet selon WCAG AA ; liens repérables sans seule dépendance à la couleur.
- Les décorations n'ont pas d'alternative inutile ; les photos de projets ont des alt explicites.
- Bouton mode thème avec libellé accessible et préférence enregistrée.

## Performances

- Utiliser `transform`/`opacity` pour les animations ; éviter des filtres et `box-shadow` animés constamment.
- Charger lazy les captures hors écran et ne pas précharger toutes les images.
- Adapter les images avec `srcset`/`sizes` si possible.
- Pas de dépendance animation 3D tant que le site n'en tire pas de valeur manifeste.
- Mesurer CLS et LCP ; réserver hauteur/largeur des visuels.
