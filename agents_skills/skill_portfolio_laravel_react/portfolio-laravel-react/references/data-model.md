# Modèle de données initial

Choisir un modèle modeste et évolutif ; créer migrations, contraintes, index, casts, Form Requests et factories.

| Table | Champs clés indicatifs | Usage |
|---|---|---|
| `users` | id, name, email, password, is_admin | Administrateur propriétaire ; privilégier Gates/Policies |
| `site_settings` | key, value (JSON/text), group | Réglages éditables, identité visuelle, métadonnées |
| `profiles` | name, headline, bio, location_text, email_public, phone_public?, avatar_path, cv_path | Bio/profil visible ; consentement avant publication de coordonnées |
| `projects` | title, slug unique, summary, description, cover_path, demo_url?, repository_url?, featured, is_published, published_at?, sort_order | Vitrine et pages détaillées |
| `project_images` | project_id FK, image_path, alt_text, sort_order | Galerie accessible |
| `technologies` | name, slug unique, icon_key? | Stack technique |
| `project_technology` | project_id, technology_id, unique composite | Relation N:N |
| `skills` | name, category?, proficiency_label?, sort_order, visible | Compétences authentiques ; éviter % arbitraires |
| `experiences` | title, organization, start_date, end_date?, description, sort_order, visible | Expériences |
| `educations` | diploma, institution, start_date?, end_date?, description, sort_order, visible | Parcours de formation |
| `social_links` | platform, url, sort_order, visible | GitHub, LinkedIn, etc. |
| `contact_messages` | name, email, subject?, body, read_at?, created_at | Messages privés dans l'admin, aucun accès public |

Si le blog est demandé, ajouter `posts`, `tags` et pivot ; ne pas le créer systématiquement. Si contenu multilingue demandé, choisir une stratégie cohérente de traductions ; éviter deux ensembles de champs sans plan.

## Règles de données

- Slugs uniques, contrôle des tailles et URLs, index sur `is_published, sort_order` si utile.
- Validation serveur et intégrité référentielle ; suppression en cascade **seulement** si souhaitée et sûre.
- Chaque `projects` doit filtrer le statut publié côté serveur, y compris dans l'accès direct aux pages.
- Exposer au frontend public uniquement les propriétés nécessaires, jamais les modèles privés entiers.
- Réutiliser des media existants quand possible et protéger la suppression des anciens fichiers.
- Prévoir `published_at` et `is_published` pour brouillon/publication ; si les deux sont utilisés, définir une unique règle de visibilité.
- Pour un seul administrateur, éviter un système de rôles complexe avant qu'il soit utile.
