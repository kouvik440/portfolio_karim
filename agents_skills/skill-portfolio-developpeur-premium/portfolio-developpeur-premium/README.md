# Skill : Portfolio de développeur premium, responsive et immersif

Ce dossier est un **Agent Skill**, pas un projet Laravel/React déjà construit.

## Contenu

- `SKILL.md` : instructions pour l'assistant de programmation.
- `references/` : direction artistique, responsive, animations, contenu, architecture admin et tests.
- `assets/` : CSS Aurora Graphite + 3 composants React/TypeScript de démarrage (à intégrer et adapter dans une vraie application).

## Installation sous Windows

1. Décompresser le ZIP.
2. Dans PowerShell, se placer dans le projet Laravel existant (ou dans un nouveau dossier de projet).
3. Installer le skill depuis son dossier local :

```powershell
npx skills add "C:\chemin\vers\portfolio-developpeur-premium"
```

Ou, sans CLI, copier le dossier dans `.agents/skills/portfolio-developpeur-premium/` du projet, selon les chemins compatibles avec votre agent.

## Prompt recommandé

> Utilise le skill `portfolio-developpeur-premium` pour réaliser mon portfolio personnel de développeur full-stack. Je veux un design Aurora Graphite haut de gamme, responsive mobile/tablette/desktop, une ambiance lumineuse discrète, des animations élégantes et accessibles, des études de cas de projets et un espace admin sécurisé Laravel + React/Inertia pour gérer mon profil, mes projets, compétences, expériences, médias et messages. Examine le projet avant toute modification, n'invente pas mes expériences et exécute les tests disponibles.

## Stack

Laravel + React + TypeScript + Inertia + Tailwind + Motion. La base SQL est configurable (MySQL ou PostgreSQL). L'admin se trouve dans le même projet Laravel.

## Dépendances des exemples

`npm install motion` pour les composants React `Reveal.tsx` et `HeroSection.tsx`.

Importer `assets/theme.css` dans la feuille CSS de votre projet ou adapter ses tokens à votre thème existant. Les composants sont des exemples intégrables et non un site complet.

## Ressources

- https://agentskills.io/specification
- https://laravel.com/starter-kits
- https://motion.dev/docs/react
