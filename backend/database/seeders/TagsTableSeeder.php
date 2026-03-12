<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tag;
use App\Models\User;

class TagsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        if (!$user) return;

        $tags = [
            ['name' => 'Gimnasio', 'color' => '#34d399', 'icon' => 'dumbbell'],
            ['name' => 'Internet', 'color' => '#60a5fa', 'icon' => 'wifi'],
            ['name' => 'Gasolina', 'color' => '#fbbf24', 'icon' => 'gas-pump'],
            ['name' => 'Supermercado', 'color' => '#ef4444', 'icon' => 'shopping-cart'],
            ['name' => 'Entretenimiento', 'color' => '#a855f7', 'icon' => 'gamepad'],
            ['name' => 'Netflix', 'color' => '#ef4444', 'icon' => 'tv'],
            ['name' => 'Spotify', 'color' => '#10b981', 'icon' => 'music'],
            ['name' => 'Transporte', 'color' => '#60a5fa', 'icon' => 'bus'],
            ['name' => 'Ropa', 'color' => '#a855f7', 'icon' => 'tshirt'],
            ['name' => 'Restaurante', 'color' => '#fbbf24', 'icon' => 'utensils'],
        ];

        foreach ($tags as $tag) {
            Tag::create(array_merge($tag, ['user_id' => $user->id]));
        }
    }
}
