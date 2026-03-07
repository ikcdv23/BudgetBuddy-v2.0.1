<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// 1. Landing page (pública)
Route::get('/', function () {
    return view('landing');
})->name('landing');

Route::get('/accesibilidad', function () {
    return view('accesibilidad');
})->name('accesibilidad');

Route::get('/get-csrf-token', function() {
    return response()->json(['token' => csrf_token()]);
});

// 2. Rutas Protegidas (Auth)
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard lógico
    Route::get('/dashboard', function () {
        $user = Auth::user();
        if ($user->accounts()->count() === 0) {
            return redirect()->route('setup.view');
        }
        return redirect()->route('desktop.index');
    })->name('dashboard');

    // Setup wizard
    Route::get('/setup', function () {
        if (Auth::user()->accounts()->count() > 0) {
            return redirect()->route('dashboard');
        }
        return view('setup');
    })->name('setup.view');

    // Páginas principales de la app
    Route::get('/desktop', fn() => view('desktop', ['currentPage' => 'desktop']))->name('desktop.index');
    Route::get('/misTarjetas', fn() => view('misTarjetas', ['currentPage' => 'misTarjetas']))->name('tarjetas.index');
    Route::get('/estadisticas', fn() => view('estadisticas', ['currentPage' => 'estadisticas']))->name('estadisticas.index');

    // Perfil / Ajustes
    Route::get('/ajustes', [ProfileController::class, 'show'])->name('profile.view');
    Route::put('/ajustes', [ProfileController::class, 'update'])->name('profile.update');
});

require __DIR__ . '/auth.php';
