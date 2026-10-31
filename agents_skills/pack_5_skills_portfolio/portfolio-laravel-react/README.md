# Skill : portfolio-laravel-react

Skill au format Agent Skills, en français, destiné à un agent de programmation prenant en charge les skills locaux.

**Ce ZIP n'est pas un projet Laravel exécutable**, mais un ensemble d'instructions et références permettant à un agent de le construire et de l'améliorer.

## Installer dans un projet sous Windows

1. Extraire le dossier `portfolio-laravel-react` dans un emplacement connu.
2. Ouvrir PowerShell dans la racine du projet Laravel.
3. Si Node.js est suffisamment récent pour la CLI :

```powershell
npx skills add "C:\chemin\vers\portfolio-laravel-react"
```

4. Choisir l'agent souhaité parmi les options interactives. Vous pouvez aussi copier le dossier vers le chemin des skills de votre agent (`.agents/skills/`, `.claude/skills/`, etc., selon l'agent).
5. Demander à votre assistant de coder : « Utilise le skill portfolio-laravel-react et applique assets/prompt-demarrage.md ».

Installation globale possible via `npx skills add <chemin> -g`.

## Composition

- `SKILL.md` : consignes principales.
- `references/` : architecture, données, sécurité, design, tests et déploiement.
- `assets/` : brief, profil à renseigner, prompt prêt à l'emploi.

## Dépendances du site à créer

Laravel compatible avec votre version PHP, React + Inertia + Vite, Node/npm, Composer, MySQL ou PostgreSQL. Le skill ne télécharge pas ces dépendances automatiquement.

## Sources utiles

- https://agentskills.io/specification
- https://laravel.com/docs/starter-kits
- https://laravel.com/docs/frontend
- https://laravel.com/docs/boost
