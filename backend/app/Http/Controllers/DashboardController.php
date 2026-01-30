<?php
namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index() // Método estándar para "mostrar la página principal"
    {
        $user = Auth::user();

        return view('dashboard');
    }
}