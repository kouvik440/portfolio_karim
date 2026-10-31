# Architecture recommandée : Laravel + Inertia + React

## Pourquoi un monolithe

Un seul projet PHP/Laravel pilote les routes, l'authentification, l'accès DB, les uploads et les pages Inertia React. Vite compile React et Tailwind. L'administration et le site public partagent les modèles et la session sécurisée. **Deux serveurs distincts ne sont pas nécessaires pour un déploiement monolithique**. Pendant le développement, Vite peut tourner en parallèle du serveur PHP pour le rechargement à chaud.

## Installation suggérée pour nouveau projet

Prérequis : PHP et extensions compatibles avec la version Laravel, Composer, Node/npm et un SGBD. Avec Laragon, installer le projet dans le répertoire de développement adapté (souvent `C:\laragon\www`). Vérifier d'abord les versions installées.

```powershell
composer global require laravel/installer
laravel new portfolio
# Choisir le starter kit React lors des questions interactives.
cd portfolio
npm install
php artisan migrate
composer run dev
```

Vérifier les instructions exactes du starter kit et du `composer.json` local ; selon le projet, `npm run dev`, `php artisan serve` et le serveur SQL peuvent être gérés séparément. Configurer `.env` pour la DB déjà présente et `php artisan storage:link` pour les fichiers publics si utilisé. `composer run dev` lance plusieurs processus sur les installations qui possèdent ce script.

## Arborescence indicative (ne pas forcer si starter kit différent)

```
portfolio/
├── app/
│   ├── Http/Controllers/{Public,Admin}/
│   ├── Http/Requests/{Admin,Contact}/
│   ├── Models/
│   └── Policies/
├── database/{migrations,seeders,factories}/
├── resources/js/
│   ├── components/{portfolio,admin,ui}/
│   ├── layouts/{public,admin}/
│   ├── pages/{public,admin,auth}/
│   └── types/
├── routes/web.php
└── tests/{Feature,Unit}/
```

## Exemples de routes (adapter classes/noms après création)

```php
Route::get('/', [PortfolioController::class, 'index'])->name('home');
Route::get('/projets/{project:slug}', [PortfolioController::class, 'project'])->name('projects.show');
Route::post('/contact', [ContactController::class, 'store'])
    ->middleware('throttle:contact')->name('contact.store');

Route::middleware(['auth', 'can:access-admin'])->prefix('admin')
    ->name('admin.')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::resource('projects', ProjectController::class);
        // Ajouter autres ressources protégées
    });
```

Ne pas copier ces routes sans imports, contrôleurs ni rate limiter adéquats : ce sont des exemples de structure. Les routes publiques ne doivent livrer que les enregistrements publiés.

## Alternatives

Si API publique, application mobile, séparation des déploiements ou frontend sur autre domaine demandés : Laravel API + React SPA indépendant. Prévoir CORS, cookies Sanctum / CSRF, contrats JSON, auth et hosting séparés. Ne pas basculer vers cette architecture par défaut.
