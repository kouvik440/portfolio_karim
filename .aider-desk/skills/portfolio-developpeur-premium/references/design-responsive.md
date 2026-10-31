# Structure et responsive

## Plan conseillé

- `Header`: logo/monogramme, liens Projets, Compétences, Parcours, À propos, Contact, thème.
- `Hero`: identité, valeur, CTA, disponibilité, 1 élément visuel utile (photo, fenêtre de code factice étiquetée « aperçu », mini-carte profil).
- `Trust strip` facultatif : technos réellement utilisées ou rôles, pas de faux logos de clients.
- `FeaturedProject`: grand aperçu, rôle, résultat, lien vers détail.
- `Projects`: grille bento (2 colonnes desktop, 1 mobile), cartes cliquables avec accès clavier.
- `About`: texte personnel concis, méthode de travail, 1 portrait si disponible.
- `Skills`: catégories et niveaux factuels (pas de pourcentage inventé).
- `Timeline`: expériences, formations, engagements, dates vérifiées.
- `Contact`: email sécurisé, formulaire, liens sociaux, état d'envoi visible.
- `Footer`: année dynamique, retour en haut, confidentialité si collecte de messages.

## Responsive

- 320/360 px : 1 colonne, CTA pleine largeur si utile, navigation menu accessible, titres `clamp`, pas de texte minuscule, padding 16 px.
- 768 px : 2 colonnes possibles pour cartes, header complet uniquement si place suffisante, photos ratio fixe.
- 1024 px : hero 7/5 ou 6/6, projets en 12 colonnes, largeur contenu max 1200–1280px.
- 1440 px et plus : marges généreuses et largeur plafonnée ; ne jamais étirer indéfiniment les lignes de texte (max 65-75 caractères).
- Utiliser `minmax(0, 1fr)` pour éviter que des items grid débordent. Tester textes longs et URLs.

## Interaction

- Le header ne couvre pas la cible des ancres (`scroll-mt-*`).
- Liens et boutons facilement ciblables au toucher (environ 44 px).
- N'afficher qu'une seule interaction principale par section.
- Menus : Échap pour fermer, boutons `aria-expanded`, focus restauré après fermeture, pas de piège de focus improvisé.
- CTA : `Voir les projets` mène à une section réelle, `Contact` mène au formulaire/à l'email, `Télécharger CV` fonctionne si le fichier existe ; sinon masquer.

## États

- Projets absents -> message éditable ou masquer la section.
- Projets non publiés -> aucune exposition publique.
- Image absente -> dégradé décoratif accessible, pas d'URL cassée.
- Contact en cours -> bouton désactivé + retour clair ; erreur -> message utile sans données internes.
