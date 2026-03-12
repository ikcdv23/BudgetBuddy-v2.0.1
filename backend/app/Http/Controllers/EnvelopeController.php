<?php

namespace App\Http\Controllers;

use App\Models\Envelope;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Account;

class EnvelopeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $accountIds = Auth::user()->accounts->pluck('id');
        $envelopes = Envelope::whereIn('account_id', $accountIds)->get();

        return response()->json($envelopes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'name' => 'required|string|max:50',
            'allocated_amount' => 'nullable|numeric|min:0',
            'target_amount' => 'required|numeric|min:0',
            'icon' => 'required|string'
        ]);

        $validated['allocated_amount'] = $validated['allocated_amount'] ?? 0;

        // Verificar propiedad de la cuenta
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', Auth::id())
            ->firstOrFail();

        // Validar que la asignación no exceda el saldo disponible
        $currentAllocated = Envelope::where('account_id', $account->id)->sum('allocated_amount');
        $newTotal = $currentAllocated + $validated['allocated_amount'];

        if ($newTotal > $account->current_balance) {
            return response()->json([
                'message' => 'La asignación total (' . number_format($newTotal, 2) . '€) supera el saldo de la cuenta (' . number_format($account->current_balance, 2) . '€)',
                'errors' => ['allocated_amount' => ['No hay saldo suficiente en la cuenta para esta asignación']]
            ], 422);
        }

        $envelope = Envelope::create($validated);

        return response()->json(['message' => 'Sobre creado', 'envelope' => $envelope], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Envelope $envelope)
    {
        // Seguridad: Verificar dueño
        if ($envelope->account->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'name'             => 'required|string|max:50',
            'target_amount'    => 'required|numeric|min:0',
            'allocated_amount' => 'nullable|numeric|min:0',
            'icon'             => 'nullable|string'
        ]);

        $newAllocated = $validated['allocated_amount'] ?? 0;

        // Validar que la asignación no exceda el saldo disponible
        // (excluir el sobre actual del cálculo)
        $account = $envelope->account;
        $otherAllocated = Envelope::where('account_id', $account->id)
            ->where('id', '!=', $envelope->id)
            ->sum('allocated_amount');
        $newTotal = $otherAllocated + $newAllocated;

        if ($newTotal > $account->current_balance) {
            return response()->json([
                'message' => 'La asignación total (' . number_format($newTotal, 2) . '€) supera el saldo de la cuenta (' . number_format($account->current_balance, 2) . '€)',
                'errors' => ['allocated_amount' => ['No hay saldo suficiente en la cuenta para esta asignación']]
            ], 422);
        }

        $envelope->update([
            'name'             => $validated['name'],
            'target_amount'    => $validated['target_amount'],
            'allocated_amount' => $newAllocated,
            'icon'             => $validated['icon']
        ]);

        return response()->json(['message' => 'Meta actualizada', 'envelope' => $envelope]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Envelope $envelope)
    {
        if ($envelope->account->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $envelope->delete();
        return response()->json(['message' => 'Meta eliminada']);
    }
}
