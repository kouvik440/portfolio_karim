<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortfolioController;
use App\Http\Middleware\EnsureAdministrator;
use Illuminate\Support\Facades\Route;

Route::get('/', [PortfolioController::class, 'index'])->name('home');
Route::get('/actualites', [PortfolioController::class, 'news'])->name('news.index');
Route::get('/actualites/{entry:slug}', [PortfolioController::class, 'newsPost'])->name('news.show');
Route::get('/actualites/{entry:slug}/media/{kind}/{index?}', [PortfolioController::class, 'newsMedia'])->whereIn('kind', ['cover', 'gallery'])->whereNumber('index')->name('news.media');
Route::get('/projets/{entry:slug}', [PortfolioController::class, 'project'])->name('projects.show');
Route::get('/projets/{entry:slug}/media/{kind}/{index?}', [PortfolioController::class, 'projectMedia'])->whereIn('kind', ['cover', 'gallery'])->whereNumber('index')->name('projects.media');
Route::get('/sitemap.xml', [PortfolioController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [PortfolioController::class, 'robots'])->name('robots');
Route::get('/portfolio/media/{kind}', [PortfolioController::class, 'media'])->whereIn('kind', ['cv', 'photo'])->name('portfolio.media');
Route::post('/contact', ContactController::class)->middleware('throttle:5,1')->name('contact.store');

Route::view('/admin/connexion', 'admin', ['login' => true, 'register' => false])->name('login');
Route::post('/admin/connexion', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('admin.login');
Route::view('/admin/inscription', 'admin', ['login' => true, 'register' => true])->name('admin.register');
Route::post('/admin/inscription', [AuthController::class, 'register'])->middleware('throttle:5,1')->name('admin.register.submit');
Route::middleware(['auth', EnsureAdministrator::class])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [AdminPortfolioController::class, 'index'])->name('index');
    Route::get('/data', [AdminPortfolioController::class, 'data'])->name('data');
    Route::get('/utilisateurs', [AdminPortfolioController::class, 'users'])->name('users.index');
    Route::post('/utilisateurs', [AdminPortfolioController::class, 'storeUser'])->name('users.store');
    Route::put('/utilisateurs/{user}/roles', [AdminPortfolioController::class, 'updateUserRoles'])->name('users.roles.update');
    Route::delete('/utilisateurs/{user}', [AdminPortfolioController::class, 'destroyUser'])->name('users.destroy');
    Route::get('/roles', [AdminPortfolioController::class, 'roles'])->name('roles.index');
    Route::post('/roles', [AdminPortfolioController::class, 'storeRole'])->name('roles.store');
    Route::put('/roles/{role}', [AdminPortfolioController::class, 'updateRole'])->name('roles.update');
    Route::delete('/roles/{role}', [AdminPortfolioController::class, 'destroyRole'])->name('roles.destroy');
    Route::post('/profil', [AdminPortfolioController::class, 'profile'])->name('profile');
    Route::post('/parametres', [AdminPortfolioController::class, 'settings'])->name('settings');
    Route::post('/elements', [AdminPortfolioController::class, 'store'])->name('entries.store');
    Route::put('/elements/{entry}', [AdminPortfolioController::class, 'update'])->name('entries.update');
    Route::delete('/elements/{entry}', [AdminPortfolioController::class, 'destroy'])->name('entries.destroy');
    Route::get('/elements/{entry}/media/{kind}/{index?}', [AdminPortfolioController::class, 'entryMedia'])->whereIn('kind', ['cover', 'gallery'])->whereNumber('index')->name('entries.media');
    Route::get('/messages', [AdminPortfolioController::class, 'messages'])->name('messages');
    Route::patch('/messages/{message}', [AdminPortfolioController::class, 'readMessage'])->name('messages.read');
    Route::delete('/messages/{message}', [AdminPortfolioController::class, 'destroyMessage'])->name('messages.destroy');
    Route::post('/deconnexion', [AuthController::class, 'logout'])->name('logout');
});
