<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController; // Si tienes vistas de perfil
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Redirigir la raíz al login o dashboard
Route::get('/', function () {
    return redirect()->route('login');
});

// Rutas protegidas (Solo usuarios logueados)
Route::middleware(['auth', 'verified'])->group(function () {
    // Muestra la vista del Dashboard (HTML)
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user->accounts()->count() === 0) {
            // Si es virgen (no tiene datos), lo mandamos al Wizard
            return redirect('/setup');
        }
        return redirect('/dashboard');
    })->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/api/profile', function () {
        return response()->json(Auth::user());
    });
});

require __DIR__ . '/auth.php'; // Las rutas de Breeze (login, register)