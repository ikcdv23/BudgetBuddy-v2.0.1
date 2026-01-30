<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL; // <--- Añade esto arriba

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    
    /**
     * Bootstrap any application services.
     */


    public function boot(): void
    {
        // Fuerza a Laravel a generar URLs HTTPS si Nginx está manejando el tráfico
        if($this->app->environment('production') || $this->app->environment('local')) {
            URL::forceScheme('http'); // O 'https' si usas SSL, prueba con 'http' primero para local
        }
    }
}
