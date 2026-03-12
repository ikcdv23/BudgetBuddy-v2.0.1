<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Obtener las etiquetas del usuario autenticado
     */
    public function index()
    {
        $tags = Tag::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($tags);
    }

    /**
     * Crear nueva etiqueta para el usuario autenticado
     */
    public function store(Request $request)
    {
        // Limitar etiquetas por usuario
        if (Tag::where('user_id', Auth::id())->count() >= 50) {
            return response()->json([
                'message' => 'Has alcanzado el límite máximo de etiquetas (50)'
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'nullable|string|max:7|regex:/^#[A-Fa-f0-9]{6}$/',
            'icon' => 'nullable|string|max:50|alpha_dash'
        ]);

        // Verificar nombre único por usuario
        if (Tag::where('user_id', Auth::id())->where('name', $validated['name'])->exists()) {
            return response()->json([
                'message' => 'Ya tienes una etiqueta con ese nombre',
                'errors' => ['name' => ['Ya tienes una etiqueta con ese nombre']]
            ], 422);
        }

        $tag = Tag::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'color' => $validated['color'] ?? '#cccccc',
            'icon' => $validated['icon'] ?? 'tag'
        ]);

        return response()->json([
            'message' => 'Etiqueta creada exitosamente',
            'tag' => $tag
        ], 201);
    }

    /**
     * Actualizar etiqueta (solo si pertenece al usuario)
     */
    public function update(Request $request, Tag $tag)
    {
        if ($tag->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'color' => 'sometimes|string|max:7|regex:/^#[A-Fa-f0-9]{6}$/',
            'icon' => 'sometimes|string|max:50|alpha_dash'
        ]);

        // Verificar nombre único por usuario (excluyendo el tag actual)
        if (isset($validated['name'])) {
            $exists = Tag::where('user_id', Auth::id())
                ->where('name', $validated['name'])
                ->where('id', '!=', $tag->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Ya tienes una etiqueta con ese nombre',
                    'errors' => ['name' => ['Ya tienes una etiqueta con ese nombre']]
                ], 422);
            }
        }

        $tag->update($validated);

        return response()->json([
            'message' => 'Etiqueta actualizada',
            'tag' => $tag
        ]);
    }

    /**
     * Eliminar etiqueta (solo si pertenece al usuario)
     */
    public function destroy(Tag $tag)
    {
        if ($tag->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($tag->movements()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar la etiqueta porque está en uso por algunos movimientos'
            ], 422);
        }

        $tag->delete();

        return response()->json([
            'message' => 'Etiqueta eliminada'
        ]);
    }

    /**
     * Mostrar una etiqueta específica (solo si pertenece al usuario)
     */
    public function show(Tag $tag)
    {
        if ($tag->user_id !== Auth::id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        return response()->json($tag);
    }
}
