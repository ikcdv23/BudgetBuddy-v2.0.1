<?php

namespace App\Http\Controllers;

use App\Models\Movement;
use App\Models\Account;
use App\Models\Card;
use App\Models\Envelope;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MovementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Account $account)
    {
        if ($account->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $query = $account->movements()->with('tags');

        if ($request->has('type')) {
            if ($request->type === 'income') {
                $query->where('amount', '>', 0);
            } elseif ($request->type === 'expense') {
                $query->where('amount', '<', 0);
            }
        }

        $movements = $query->orderBy('date', 'desc')
                           ->limit(50)
                           ->get();

        return response()->json($movements);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Get all movements for the authenticated user.
     */
    public function all(Request $request)
    {
        $user = Auth::user();

        $query = Movement::whereHas('account', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with(['account', 'card', 'tags']);

        if ($request->has('card_id')) {
            $cardId = $request->input('card_id');
            // Verificar que la card pertenece al usuario
            $validCard = Card::where('id', $cardId)
                ->whereHas('account', fn($q) => $q->where('user_id', $user->id))
                ->exists();
            if ($validCard) {
                $query->where('card_id', $cardId);
            }
        }

        $movements = $query->orderBy('date', 'desc')->limit(100)->get();

        return response()->json($movements);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $type = $request->input('type');

        // Validación base común
        $rules = [
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'date' => 'required|date',
            'type' => 'required|in:gasto,ingreso,traspaso',
            'tag_id' => 'nullable|exists:tags,id',
            'envelope_id' => 'nullable|exists:envelopes,id',
        ];

        // Validación condicional según tipo
        if ($type === 'gasto') {
            $rules['card_id'] = 'required|exists:cards,id';
        } elseif ($type === 'ingreso') {
            $rules['account_id'] = 'required|exists:accounts,id';
            $rules['card_id'] = 'nullable|exists:cards,id';
        } elseif ($type === 'traspaso') {
            $rules['account_id'] = 'required|exists:accounts,id';
            $rules['destination_type'] = 'required|in:own_account,external_iban';
            $rules['destination_account_id'] = 'required_if:destination_type,own_account|nullable|exists:accounts,id';
            $rules['destination_iban'] = 'required_if:destination_type,external_iban|nullable|string|max:34';
        }

        $validated = $request->validate($rules);

        // Determinar la cuenta origen
        if ($type === 'gasto') {
            $card = Card::findOrFail($validated['card_id']);
            $account = $card->account;
        } else {
            $account = Account::findOrFail($validated['account_id']);
        }

        if ($account->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'No autorizado para realizar esta acción'
            ], 403);
        }

        // Para traspasos internos, verificar cuenta destino
        if ($type === 'traspaso' && $validated['destination_type'] === 'own_account') {
            $destinationAccount = Account::findOrFail($validated['destination_account_id']);
            if ($destinationAccount->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'La cuenta destino no te pertenece'
                ], 403);
            }
            if ($destinationAccount->id === $account->id) {
                return response()->json([
                    'message' => 'La cuenta origen y destino no pueden ser la misma'
                ], 422);
            }
        }

        // Verificar que el envelope pertenece al usuario autenticado
        if (!empty($validated['envelope_id'])) {
            $envelope = Envelope::find($validated['envelope_id']);
            if (!$envelope || $envelope->account->user_id !== Auth::id()) {
                return response()->json([
                    'message' => 'El sobre seleccionado no pertenece a tus cuentas'
                ], 403);
            }
        }

        try {
            $movement = DB::transaction(function () use ($validated, $account, $type) {
                $amount = abs($validated['amount']);

                if ($type === 'gasto') {
                    // Gasto: 1 movimiento negativo, balance baja
                    $movement = Movement::create([
                        'account_id' => $account->id,
                        'card_id' => $validated['card_id'],
                        'envelope_id' => $validated['envelope_id'] ?? null,
                        'amount' => -$amount,
                        'description' => $validated['description'],
                        'date' => $validated['date'],
                        'type' => 'gasto',
                    ]);
                    $account->current_balance -= $amount;
                    $account->save();

                } elseif ($type === 'ingreso') {
                    // Ingreso: 1 movimiento positivo, balance sube
                    $movement = Movement::create([
                        'account_id' => $account->id,
                        'card_id' => $validated['card_id'] ?? null,
                        'envelope_id' => $validated['envelope_id'] ?? null,
                        'amount' => $amount,
                        'description' => $validated['description'],
                        'date' => $validated['date'],
                        'type' => 'ingreso',
                    ]);
                    $account->current_balance += $amount;
                    $account->save();

                } elseif ($type === 'traspaso') {
                    // Débito en cuenta origen
                    $movement = Movement::create([
                        'account_id' => $account->id,
                        'card_id' => null,
                        'envelope_id' => $validated['envelope_id'] ?? null,
                        'amount' => -$amount,
                        'description' => $validated['description'],
                        'date' => $validated['date'],
                        'type' => 'traspaso',
                    ]);
                    $account->current_balance -= $amount;
                    $account->save();

                    // Traspaso interno: crédito en cuenta destino
                    if ($validated['destination_type'] === 'own_account') {
                        $destinationAccount = Account::findOrFail($validated['destination_account_id']);
                        Movement::create([
                            'account_id' => $destinationAccount->id,
                            'card_id' => null,
                            'envelope_id' => null,
                            'amount' => $amount,
                            'description' => 'Traspaso recibido: ' . $validated['description'],
                            'date' => $validated['date'],
                            'type' => 'traspaso',
                        ]);
                        $destinationAccount->current_balance += $amount;
                        $destinationAccount->save();
                    }
                    // Traspaso externo: solo el débito (ya creado arriba)
                }

                // Asociar tag si existe
                if (!empty($validated['tag_id'])) {
                    $movement->tags()->syncWithoutDetaching([$validated['tag_id']]);
                }

                return $movement;
            });

            $movement->load('tags', 'account', 'card', 'envelope');

            return response()->json([
                'message' => 'Movimiento creado y balance actualizado correctamente',
                'movement' => $movement,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Movement creation error', [
                'user_id' => Auth::id(),
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al crear el movimiento',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Movement $movement)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Movement $movement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Movement $movement)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Movement $movement)
    {
        //
    }
}
