---
name: portfolio-admin-securise
description: Construire ou auditer le tableau de bord administrateur sécurisé d'un portfolio Laravel + Inertia + React : auth, autorisations, CRUD, uploads, brouillons, messages et tests de refus d'accès. À utiliser pour toute fonctionnalité privée ou gestion de contenus.
license: MIT
---
# Dashboard privé Laravel/React

- Préserver auth du starter kit ; pour portfolio monopersonnel, désactiver l'inscription publique non voulue.
- Protéger toutes les routes privées avec authentification et Gate/Policy **dans Laravel** ; contrôler chaque action CRUD, y compris téléversements, suppression et visualisation des messages.
- Construire écrans React pour profil, projets, technologies, compétences, formations, expériences, liens sociaux, fichiers, SEO et boîte de réception. Gérer états vides, erreurs de validation, succès, confirmations de suppression.
- Employer migrations, FormRequest, Policies, contrôleurs fins, Inertia props minimales, noms de routes et composants propres.
- Valider les fichiers par type réel/taille, protéger données privées, conserver CSRF, throttle contact et login, échapper texte non fiable.
- Tester cas anonyme, user non-admin, admin autorisé ; brouillons invisibles côté public, champs non autorisés ignorés/refusés, mauvais fichiers rejetés.
- Documenter la création de l'administrateur sans enregistrer mot de passe dans le dépôt.
