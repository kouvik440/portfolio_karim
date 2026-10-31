# Direction artistique et responsive

## Plan visuel

Avant d'écrire le JSX, proposer brièvement : un parti pris, un duo typographique au plus, une palette de 4–6 tokens CSS, une grille et les composants clés. Ne pas copier l'apparence générique d'un dashboard SaaS pour le site vitrine.

Pour un portfolio de développeur full-stack : privilégier **preuves concrètes** (captures de projets, repos, fonctions démontrables) et lisibilité avant effets. Le héros doit exprimer ce que la personne réalise, ses spécialités et une action claire (« Voir mes projets », « Me contacter »). Animation d'entrée unique et sobre ; interactions plus discrètes ensuite.

## Points de contrôle

- Mobile-first : 320, 375, 390, 768, 1024, 1440 px. Pas de scroll horizontal ; navbar mobile clavier/tactile, boutons atteignables, textes non coupés.
- Typographie fluide (`clamp` si approprié), ligne de lecture confortable, maximum 70–80 caractères pour les textes longs.
- Contraste WCAG AA autant que possible, focus visible, HTML sémantique, éléments de formulaire étiquetés, `aria` seulement si nécessaire.
- Mode clair/sombre : tokens globaux, états hover/focus dans les deux modes, image/logo contrastés.
- Motion : aucun effet par défaut qui gêne navigation, performance ou lecteur d'écran ; respecter `prefers-reduced-motion`.
- Galeries : illustrations du vrai projet, contenu alt descriptif, ratios cohérents, placeholders **explicitement** marqués si pas d'images.
- Tableau de bord : information simple (nombre de projets publiés, brouillons, messages non lus), sidebar accessible, boutons cohérents, pagination/état vide.
- Un vrai état d'erreur et un état sans contenu par formulaire et composant de données.

## Définition de « responsive »

La navigation est utilisable au clavier et au toucher, les tableaux administratifs sont accessibles sur petit écran, les formulaires ne dépassent pas la largeur, les images sont adaptatives et les actions importantes ne disparaissent pas à cause des media queries.
