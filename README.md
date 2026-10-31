# Portfolio Karim

Portfolio personnel de Kiswendsida Abdoul Karim OUEDRAOGO : Laravel 13, React 19, Vite et MySQL. React est intégré directement dans les vues Laravel, sans Inertia.

## Démarrer avec Laragon

Le projet se trouve dans `C:\laragon\www\portfolio_karim`. Démarrer MySQL dans Laragon, puis ouvrir un terminal dans ce dossier.

Pour une nouvelle installation uniquement :

```powershell
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
```

Créer la base MySQL `portfolio_karim` et adapter les paramètres de connexion dans `.env` :

```dotenv
APP_URL=http://127.0.0.1:8002
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portfolio_karim
DB_USERNAME=root
DB_PASSWORD=
```

Appliquer les migrations sans effacer les données :

```powershell
php artisan migrate
```

Lancer Laravel, puis Vite dans un second terminal :

```powershell
php artisan serve --host=127.0.0.1 --port=8002
```

```powershell
npm run dev
```

Ouvrir http://127.0.0.1:8002. Si ce serveur fonctionne déjà, conserver le terminal existant.

## Administrer le contenu

Créer votre compte avec une adresse e-mail et un mot de passe personnel (12 caractères minimum) :

```powershell
php artisan portfolio:admin
```

La saisie du mot de passe est masquée. Aucun compte public ni mot de passe par défaut n'est fourni. Connexion : http://127.0.0.1:8002/admin.

- **Vue d’ensemble** : projets publiés, brouillons et messages non lus, à partir des données réelles.
- **Profil & CV** : identité, rôle, accroche, présentation, disponibilité, photo et CV PDF.
- **Formations, expériences, compétences, langues et centres d’intérêt** : ajout, modification, ordre, publication et suppression.
- **Projets** : description, technologies, liens, couverture, galerie, mise en avant et étude de cas (besoin, solution, contribution, résultats vérifiés). L'adresse de l'étude de cas est créée automatiquement si elle reste vide.
- **Coordonnées** : e-mail, téléphone, localisation, GitHub et LinkedIn.
- **Messages reçus** : lecture, marquage lu/non lu, suppression et ouverture de votre logiciel de messagerie pour répondre.
- **Textes & paramètres** : titres et introductions des sections, bouton principal, thème par défaut et métadonnées de référencement.

Un projet masqué et ses médias ne sont pas accessibles sur leurs URL publiques. Les fichiers sont conservés dans `storage/app/private/portfolio` et servis par des routes contrôlées ; `storage:link` n'est pas nécessaire. Une couverture accepte JPEG/PNG/WebP, jusqu'à 2 Mo ; la galerie accepte 3 images d'1 Mo maximum chacune. La suppression d'un projet supprime aussi ses fichiers.

Le formulaire de contact enregistre les demandes dans le tableau de bord avec protection anti-spam. Il n'envoie pas de notification e-mail automatique : aucun serveur SMTP n'est configuré.

## Structure

- `resources/js/PortfolioApp.jsx` : page publique et navigation.
- `resources/js/Components/` : contact, thème et étude de cas.
- `resources/js/admin.jsx` : connexion et tableau de bord React.
- `resources/css/app.css`, `portfolio-motion.css`, `admin.css` : styles et animations accessibles.
- `app/Http/Controllers/` et `app/Http/Requests/Admin/` : contrôleurs et validation côté serveur.
- `app/Models/` : profil, éléments du portfolio, messages et utilisateurs.
- `routes/web.php` : routes publiques et administration protégée.

Les projets sont chargés depuis MySQL, sans liste codée dans React. Les thèmes clair/sombre/système et le choix du visiteur sont pris en charge. Les pages de projet ont leurs propres métadonnées, un canonical et une représentation lisible sans JavaScript. Le sitemap se trouve à `/sitemap.xml`.

## Vérification et compilation

```powershell
npm run build
php -d extension=pdo_sqlite -d extension=gd vendor/bin/phpunit --no-progress
```

Les extensions chargées par `-d` permettent de lancer les tests avec SQLite en mémoire et de générer leurs images de test sur cette installation Laragon. Les tests n'utilisent pas la base MySQL du portfolio.

Les vérifications couvrent l'authentification, les rôles, les formulaires, les publications, les fichiers, les paramètres, les messages et le sitemap. Le rendu est également contrôlé dans Chrome à 360, 768, 1 024 et 1 440 px, en clair/sombre et avec réduction des animations.

Pour un hébergement : pointer le serveur web sur `public`, définir l'URL HTTPS réelle dans `APP_URL`, désactiver `APP_DEBUG`, compiler les ressources et sauvegarder ensemble MySQL et les fichiers privés. Ne jamais publier `.env`. Le projet n'est pas encore déployé.