# Architecture Laravel + React/Inertia pour portfolio administrable

## Principe

Starter kit officiel Laravel React et Inertia : routes Laravel + contrôleurs + pages React, dans une même application. Respecter la version présente : éviter de créer une API séparée si pas demandée. Authentification gérée par Laravel. Utiliser MySQL ou PostgreSQL selon l'environnement.

## Modèles recommandés

| Modèle | Attributs principaux | Usage |
|---|---|---|
| `Profile` | `name`, `headline`, `bio`, `location_public`, `email_public`, `avatar_path`, `cv_path`, `availability`, `meta_title`, `meta_description` | Profil public, unique |
| `Project` | `title`, `slug`, `summary`, `problem`, `solution`, `contribution`, `stack` (json), `cover_path`, `demo_url`, `repo_url`, `featured`, `published_at`, `sort_order` | Études de cas, brouillon/publication |
| `ProjectImage` | `project_id`, `path`, `alt_text`, `sort_order` | Galerie |
| `SkillCategory` | `name`, `sort_order` | Frontend/backend/outils |
| `DeveloperSkill` | `category_id`, `name`, `icon`, `sort_order`, `is_visible` | Compétences |
| `Experience` | `company_or_school`, `role`, `location_public`, `start_date`, `end_date`, `description`, `type`, `sort_order` | Carrière/formation |
| `ContactMessage` | `name`, `email`, `subject`, `body`, `read_at`, `created_at` | Messages privés |
| `Setting` | `key`, `value` (json) | Réseaux, thème, SEO |

Adaptez noms/champs au schéma existant, sans doublons inutiles. Ajoutez index sur `slug`, `published_at`, `sort_order` ; unicité de slug. Les technologies peuvent aussi être normalisées selon le besoin.

## Sécurité et politiques

- Utiliser authentification du starter et un rôle administrateur/policy ou gate `manage-portfolio` : **pas seulement** middleware `auth` ; pas de mass assignment incontrôlé.
- Bloquer l'inscription publique si l'administration est réservée au propriétaire. Créer l'utilisateur admin via commande ou seed contrôlé, **jamais** avec mot de passe codé en dur dans le repo.
- `/admin` et sous-routes dans un groupe `auth` + `can:manage-portfolio`, avec accès refusé aux autres utilisateurs. Vérifier la route de login et les formulaires via tests.
- Contrôleurs ressources et Form Requests distincts. URLs externes : schéma `http`/`https`, empêcher `javascript:`.
- Messages : garder privés, validation Laravel, CSRF, limitation de fréquence/anti-spam, pas de HTML arbitraire rendu tel quel.
- Upload : validation serveur (MIME/extension/taille), stockage avec noms sûrs, optimisation images si possible, URL contrôlée, nettoyage lors du remplacement/suppression. Ne jamais exposer les messages privés dans une réponse Inertia publique.
- Préférer `storage:link` ou stockage cloud selon déploiement, ne jamais placer secrets dans `public/`.

## Pages admin

1. `/admin` : stats sûres (projets publiés, brouillons, messages non lus).
2. `/admin/profil` : identité, bio, photo, liens, CV, statut, SEO.
3. `/admin/projets` : liste, création, édition, aperçu, statut, ordre, médias.
4. `/admin/competences` : catégories, technologies, visibilité, ordre.
5. `/admin/parcours` : expériences/formation.
6. `/admin/messages` : liste et détail, lecture, suppression autorisée.
7. `/admin/parametres` : réseaux, thème, métadonnées.

Utiliser React + TypeScript + composants shadcn/ui pour tables, formulaires, modal de confirmation et toasts. Validation backend authoritative ; erreurs affichées dans React. Prévisualisation optionnelle ne doit pas publier un brouillon.

## Routes publiques

- `GET /` : portfolio, projets publiés triés, profil et compétences visibles.
- `GET /projets/{slug}` : étude de cas publiée ; renvoyer 404 pour brouillon.
- `POST /contact` : soumission validée, rate limit, message de succès, pas de fuite d'information privée.
- Métadonnées server-side adaptées (Inertia Head, SSR si pertinent).

## Structure proposée

```text
app/Models/{Profile,Project,ProjectImage,SkillCategory,DeveloperSkill,Experience,ContactMessage,Setting}.php
app/Http/Controllers/PortfolioController.php
app/Http/Controllers/ContactController.php
app/Http/Controllers/Admin/*.php
app/Http/Requests/Admin/*.php
app/Policies/*.php
resources/js/pages/portfolio/*.tsx
resources/js/pages/admin/*.tsx
resources/js/components/portfolio/*.tsx
resources/js/components/admin/*.tsx
resources/css/app.css
routes/web.php
database/migrations/*.php
tests/Feature/Portfolio/*.php
```

## Données de démonstration

Ne jamais affirmer les réalisations d'une personne sans preuves. Seeding local avec `EXEMPLE – à remplacer` pour les projets fictifs ; pas de production avec des faux diplômes, faux clients ou métriques. Prévoir des états vides soignés plutôt que des faux témoignages.
