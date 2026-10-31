# Pack de 5 skills pour portfolio Laravel + React

Les dossiers sont des **skills pour assistants de programmation**, pas des thèmes React ni des projets Laravel déjà codés.

## Contenu

1. `portfolio-laravel-react` — construction full-stack complète (skill principal)
2. `portfolio-design-premium` — identité visuelle et UI responsive
3. `portfolio-seo-accessibilite` — référencement et accessibilité
4. `portfolio-animations-performance` — animations et vitesse
5. `portfolio-admin-securise` — back-office et sécurité

## Installation

Extraire ce pack, puis depuis la racine de ton projet et PowerShell :

```powershell
npx skills add "C:\chemin\vers\portfolio_skills"
```

Choisir les 5 skills et ton assistant. Si la CLI ne détecte pas automatiquement le pack, installer séparément chaque dossier (ex. `npx skills add C:\chemin\vers\portfolio_skills\portfolio-design-premium`). Autre possibilité : copier chaque dossier dans le répertoire de skills de ton agent (`.agents/skills/` ou chemin documenté par cet agent).

Pour un projet neuf Laravel, choisir le starter kit React/Inertia. Prévoir PHP, Composer, Node et une DB. Les skills ne créent pas automatiquement l'application.

## Dans ton assistant de code

> Utilise `portfolio-laravel-react` et `portfolio-design-premium`. Construis le site public et l'admin avec Laravel, Inertia, React et TypeScript. Ensuite applique `portfolio-admin-securise`, `portfolio-seo-accessibilite` et `portfolio-animations-performance` et lance les tests.

## Autres skills reconnus

- Vercel React : `npx skills add vercel-labs/agent-skills --skill react-best-practices` (vérifier noms via `--list`, qui peuvent évoluer)
- Vercel audit de design : `npx skills add vercel-labs/agent-skills --skill web-design-guidelines`
- Anthropic frontend design : `npx skills add anthropics/skills --skill frontend-design`
- Anthropic webapp-testing : `npx skills add anthropics/skills --skill webapp-testing`
- Laravel Boost : `composer require laravel/boost --dev` puis `php artisan boost:install`.

Vérifier les sources et permissions avant d'installer des skills externes.
