<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CardController extends Controller{

        public function index()
        {
            // Отримати всі картки користувача через його рахунки
            $user = Auth::user();
            $cards = Card::whereHas('account', function($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with('account')->limit(100)->get();
            
            return response()->json($cards);
        }

        public function destroy(Card $card)
        {
            // Перевірити, чи картка належить користувачеві
            if ($card->account->user_id !== Auth::id()) {
                return response()->json(['message' => 'No autorizado'], 403);
            }
            
            $card->delete();
            
            return response()->json([
                'message' => 'Tarjeta eliminada correctamente',
                'success' => true
            ], 200);
        }
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'account_id' => 'required|exists:accounts,id',
                'alias' => 'required|string|max:50',
                'last_4_digits' => 'required|string|size:4', 
                'expiration_date' => 'required|date',           // YYYY-MM-DD
                'type' => 'required|in:credit,debit',
            ]);

            // 2. Перевірка власності акаунта
            $account = Account::where('id', $validated['account_id'])
                ->where('user_id', Auth::id())
                ->first();

            if (!$account) {
                return response()->json([
                    'message' => 'La cuenta no existe o no te pertenece'
                ], 403);
            }

            // 3. Створення карти
            $card = Card::create([
                'account_id' => $account->id,
                'alias' => $validated['alias'],
                'last_4_digits' => $validated['last_4_digits'], // ← Перейменування
                'expiration_date' => $validated['expiration_date'],
                'type' => $validated['type']
            ]);

            return response()->json([
                'message' => 'Tarjeta creada con éxito',
                'card' => $card
            ], 201);

        } catch (\Exception $e) {
            Log::error('Card creation error', [
                'user_id' => Auth::id(),
                'exception' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al crear la tarjeta',
            ], 500);
        }
    }
}