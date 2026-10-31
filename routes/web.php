<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\PortfolioController;
use App\Http\Middleware\EnsureAdministrator;
use Illuminate\Support\Facades\Route;

Route::get('/', [PortfolioController::class, 'index'])->name('home');
Route::get('/portfolio/media/{kind}', [PortfolioController::class, 'media'])->whereIn('kind', ['cv', 'photo'])->name('portfolio.media');
Route::post('/contact', ContactController::class)->middleware('throttle:5,1')->name('contact.store');

Route::view('/admin/connexion', 'admin', ['login' => true])->name('login');
Route::post('/admin/connexion', [AuthController::class, 'login'])->middleware('throttle:5,1')->name('admin.login');
Route::middleware(['auth', EnsureAdministrator::class])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [AdminPortfolioController::class, 'index'])->name('index');
    Route::get('/data', [AdminPortfolioController::class, 'data'])->name('data');
    Route::post('/profil', [AdminPortfolioController::class, 'profile'])->name('profile');
    Route::post('/elements', [AdminPortfolioController::class, 'store'])->name('entries.store');
    Route::put('/elements/{entry}', [AdminPortfolioController::class, 'update'])->name('entries.update');
    Route::delete('/elements/{entry}', [AdminPortfolioController::class, 'destroy'])->name('entries.destroy');
    Route::get('/messages', [AdminPortfolioController::class, 'messages'])->name('messages');
    Route::post('/deconnexion', [AuthController::class, 'logout'])->name('logout');
});
