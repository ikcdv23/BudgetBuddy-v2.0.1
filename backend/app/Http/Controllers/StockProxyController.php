<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StockProxyController extends Controller
{
    public function quote(Request $request)
    {
        $request->validate([
            'symbol' => 'required|string|max:10',
        ]);

        $apiKey = config('services.alphavantage.key');

        $response = Http::get('https://www.alphavantage.co/query', [
            'function' => 'GLOBAL_QUOTE',
            'symbol' => $request->symbol,
            'apikey' => $apiKey,
        ]);

        return response()->json($response->json());
    }
}
