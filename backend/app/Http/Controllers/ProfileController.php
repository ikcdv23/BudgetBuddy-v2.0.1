<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile;
use App\Models\Movement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProfileController extends Controller
{
    // ==========================================
    // 1. MOSTRAR DATOS (GET)
    // ==========================================
    public function show(Request $request)
    {
        $user = $request->user()->load('profile');

        // MODO API/SETUP: Si el JS pide datos, devolvemos JSON limpio
        if ($request->wantsJson()) {
            return $user;
        }

        // MODO WEB: Si entras por el navegador, devolvemos la VISTA
        return view('ajustes', ['user' => $user, 'currentPage' => 'ajustes']);
    }

    // ==========================================
    // 2. GUARDAR DATOS DEL PERFIL (PUT)
    // ==========================================
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name'         => 'required|string|max:255',
            'last_name'          => 'required|string|max:255',
            'email'              => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone_country_code' => 'nullable|string|max:5',
            'phone'              => 'nullable|string|max:20',
        ]);

        // 1. Guardar en tabla USERS
        $user->update([
            'name'  => $validated['first_name'],
            'email' => $validated['email'],
        ]);

        // 2. Guardar en tabla PROFILES
        $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'lastname'           => $validated['last_name'],
                'phone_country_code' => $validated['phone_country_code'] ?? '+34',
                'phone'              => $validated['phone'],
            ]
        );

        return response()->json([
            'message' => 'Perfil guardado correctamente',
            'user'    => $user->load('profile'),
        ], 200);
    }

    // ==========================================
    // 3. AVATAR (POST)
    // ==========================================
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        // Opción A: Avatar preset (string)
        if ($request->has('avatar') && !$request->hasFile('avatar_file')) {
            $request->validate([
                'avatar' => 'required|string|regex:/^preset-[1-8]$/',
            ]);

            // Borrar foto anterior si era upload
            $this->deleteOldAvatarFile($user);

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                ['avatar' => $request->avatar]
            );

            return response()->json([
                'message'    => 'Avatar actualizado',
                'avatar'     => $request->avatar,
                'avatar_url' => null,
            ]);
        }

        // Opción B: Subida de foto
        if ($request->hasFile('avatar_file')) {
            $request->validate([
                'avatar_file' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            ]);

            // Borrar foto anterior si era upload
            $this->deleteOldAvatarFile($user);

            $path = $request->file('avatar_file')->store('avatars', 'public');

            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                ['avatar' => $path]
            );

            return response()->json([
                'message'    => 'Avatar actualizado',
                'avatar'     => $path,
                'avatar_url' => asset('storage/' . $path),
            ]);
        }

        return response()->json(['message' => 'No se recibió avatar'], 422);
    }

    // ==========================================
    // 4. CAMBIAR CONTRASEÑA (PUT)
    // ==========================================
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual no es correcta',
                'errors'  => ['current_password' => ['La contraseña actual no es correcta']],
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        return response()->json(['message' => 'Contraseña actualizada correctamente']);
    }

    // ==========================================
    // 5. EXPORTAR MOVIMIENTOS CSV (GET)
    // ==========================================
    public function exportMovements()
    {
        $user = Auth::user();

        $movements = Movement::whereHas('account', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with(['account', 'card', 'tags'])->orderBy('date', 'desc')->get();

        $filename = 'movimientos_budgetbuddy_' . date('Y-m-d') . '.csv';

        return new StreamedResponse(function () use ($movements) {
            $handle = fopen('php://output', 'w');

            // BOM UTF-8 para Excel
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Cabecera
            fputcsv($handle, ['Fecha', 'Descripción', 'Importe', 'Tipo', 'Cuenta', 'Tarjeta', 'Etiquetas'], ';');

            foreach ($movements as $mov) {
                fputcsv($handle, [
                    $mov->date,
                    $mov->description,
                    number_format($mov->amount, 2, ',', ''),
                    $mov->type,
                    $mov->account->name ?? '',
                    $mov->card->alias ?? '',
                    $mov->tags->pluck('name')->implode(', '),
                ], ';');
            }

            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    // ==========================================
    // 7. ELIMINAR CUENTA (DELETE)
    // ==========================================
    public function deleteAccount(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'password' => 'required|string',
        ]);

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Contraseña incorrecta',
                'errors'  => ['password' => ['La contraseña no es correcta']],
            ], 422);
        }

        // Borrar avatar si era upload
        $this->deleteOldAvatarFile($user);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $user->delete();

        return response()->json(['message' => 'Cuenta eliminada correctamente']);
    }

    // ==========================================
    // HELPER: Borrar archivo de avatar anterior
    // ==========================================
    private function deleteOldAvatarFile($user)
    {
        $profile = $user->profile;
        if ($profile && $profile->avatar && !str_starts_with($profile->avatar, 'preset-')) {
            Storage::disk('public')->delete($profile->avatar);
        }
    }
}
