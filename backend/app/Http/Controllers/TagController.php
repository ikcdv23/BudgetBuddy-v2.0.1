<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Obtener todas las etiquetas
     */
    public function index()
    {
        $tags = Tag::orderBy('created_at', 'desc')->limit(100)->get();
        return response()->json($tags);
    }

    /**
     * Crear nueva etiqueta (requiere autenticacion)
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Limitar cantidad de tags globales para evitar spam
        if (Tag::count() >= 200) {
            return response()->json([
                'message' => 'Se ha alcanzado el limite maximo de etiquetas'
            ], 422);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:tags,name',
            'color' => 'nullable|string|max:7|regex:/^#[A-Fa-f0-9]{6}$/',
            'icon' => 'nullable|string|max:50|alpha_dash'
        ]);

        $tag = Tag::create([
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
     * Actualizar etiqueta (requiere autenticacion)
     */
    public function update(Request $request, Tag $tag)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100|unique:tags,name,' . $tag->id,
            'color' => 'sometimes|string|max:7|regex:/^#[A-Fa-f0-9]{6}$/',
            'icon' => 'sometimes|string|max:50|alpha_dash'
        ]);

        $tag->update($validated);

        return response()->json([
            'message' => 'Etiqueta actualizada',
            'tag' => $tag
        ]);
    }

    /**
     * Eliminar etiqueta (requiere autenticacion)
     */
    public function destroy(Tag $tag)
    {
        if (!Auth::check()) {
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
     * Mostrar una etiqueta específica
     */
    public function show(Tag $tag)
    {
        return response()->json($tag);
    }
}