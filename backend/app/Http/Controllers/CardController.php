<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\Account;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class CardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $cards = Card::whereHas('account', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->with('account')->limit(100)->get();

        return response()->json($cards);
    }

    public function destroy(Card $card)
    {
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
            $rules = [
                'account_id'      => 'required|exists:accounts,id',
                'alias'           => 'required|string|max:50',
                'expiration_date' => 'required|date|after_or_equal:today',
                'type'            => 'required|in:credit,debit',
                'card_number'     => 'required|string|size:16|regex:/^\d+$/',
                'security_code'   => 'required|string|size:3|regex:/^\d+$/',
                'last_4_digits'   => 'nullable|string|size:4',
            ];

            $validated = $request->validate($rules);

            // Si hay card_number, extraer últimos 4 dígitos automáticamente
            if (!empty($validated['card_number'])) {
                $validated['last_4_digits'] = substr($validated['card_number'], -4);
            }

            $account = Account::where('id', $validated['account_id'])
                ->where('user_id', Auth::id())
                ->first();

            if (!$account) {
                return response()->json([
                    'message' => 'La cuenta no existe o no te pertenece'
                ], 403);
            }

            $card = Card::create([
                'account_id'    => $account->id,
                'alias'         => $validated['alias'],
                'type'          => $validated['type'],
                'last_4_digits' => $validated['last_4_digits'],
                'expiration_date' => $validated['expiration_date'],
                'card_number'   => $validated['card_number'] ?? null,
                'security_code' => $validated['security_code'] ?? null,
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

    public function revealSensitive(Request $request, Card $card)
    {
        $user = $request->user();
        $userAccountIds = $user->accounts()->pluck('id');

        if (!$userAccountIds->contains($card->account_id)) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate(['password' => 'required|string']);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Contraseña incorrecta',
                'errors'  => ['password' => ['La contraseña no es correcta']],
            ], 422);
        }

        return response()->json([
            'card_number'   => $card->card_number,
            'security_code' => $card->security_code,
        ]);
    }
}
