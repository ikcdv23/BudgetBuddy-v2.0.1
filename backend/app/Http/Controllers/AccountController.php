<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Añadimos 'with('envelopes')' para que cargue los datos necesarios para la resta
        $accounts = Auth::user()->accounts()->with('envelopes')->get();
        return response()->json($accounts);
    }

    /**
     * Show the form for creating a new resource.
     */

    public function getCards(Account $account)
    {
        // 1. SEGURIDAD: Verificar que la cuenta pertenece al usuario logueado
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // 2. Devolver las tarjetas asociadas
        return response()->json($account->cards);
    }
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string',
            'current_balance' => 'required|numeric',
            'color' => 'required|string',
            'iban' => 'required|string|unique:accounts,iban'
        ]);

        $account = Account::create([
            'user_id' => Auth::id(),
            'bank_name' => $validated['bank_name'],
            'current_balance' => $validated['current_balance'],
            // Usamos el operador null coalescing (??) por seguridad
            'iban' => $validated['iban'] ?? null,
            'color' => $validated['color'],
        ]);

        return response()->json([
            'message' => 'Cuenta creada',
            'account' => $account
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(account $account)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(account $account)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, account $account)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(account $account)
    {
        //
    }
}