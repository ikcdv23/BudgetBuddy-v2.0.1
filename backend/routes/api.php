<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\EnvelopeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TagController;
use App\Http\Controllers\MovementController;
use App\Http\Controllers\StockProxyController;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS (No necesitan login)
|--------------------------------------------------------------------------
*/
Route::middleware(['throttle:30,1'])->group(function () {
    Route::get('/reviews', [ReviewController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| RUTAS PRIVADAS (Requieren Login - Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware(['web', 'auth', 'throttle:60,1'])->group(function () {

    // 1. Usuario y Perfil
    Route::get('/user', function (Request $request) {
        return $request->user()->load('profile');
    });
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::get('/profile/export', [ProfileController::class, 'exportMovements']);
    Route::delete('/profile/account', [ProfileController::class, 'deleteAccount']);

    // 2. Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::post('/tags', [TagController::class, 'store']);
    Route::get('/tags/{tag}', [TagController::class, 'show']);
    Route::put('/tags/{tag}', [TagController::class, 'update']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

    // 3. Cuentas
    Route::get('/accounts', [AccountController::class, 'index']);
    Route::post('/accounts', [AccountController::class, 'store']);
    Route::get('/accounts/{account}/cards', [AccountController::class, 'getCards']);

    // 4. Tarjetas
    Route::get('/cards', [CardController::class, 'index']);
    Route::post('/cards', [CardController::class, 'store']);
    Route::delete('/cards/{card}', [CardController::class, 'destroy']);
    Route::post('/cards/{card}/reveal', [CardController::class, 'revealSensitive']);

    // 5. Sobres / Envelopes
    Route::get('/envelopes', [EnvelopeController::class, 'index']);
    Route::post('/envelopes', [EnvelopeController::class, 'store']);
    Route::put('/envelopes/{envelope}', [EnvelopeController::class, 'update']);
    Route::delete('/envelopes/{envelope}', [EnvelopeController::class, 'destroy']);

    // 6. Movimientos
    Route::get('/accounts/{account}/movements', [MovementController::class, 'index']);
    Route::get('/movements', [MovementController::class, 'all']);
    Route::post('/movements', [MovementController::class, 'store']);

    // 7. Proxy API financiera (Alpha Vantage)
    Route::get('/stocks/quote', [StockProxyController::class, 'quote']);
});
