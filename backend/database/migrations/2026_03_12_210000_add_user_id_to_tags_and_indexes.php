<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Añadir user_id a tags (etiquetas por usuario) + índices compuestos en movements
     */
    public function up(): void
    {
        // Tags: añadir user_id para que cada usuario tenga sus propias etiquetas
        Schema::table('tags', function (Blueprint $table) {
            $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'name']);
        });

        // Índices compuestos para consultas frecuentes en movements
        Schema::table('movements', function (Blueprint $table) {
            $table->index(['account_id', 'date']);
            $table->index(['account_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tags', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'name']);
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('movements', function (Blueprint $table) {
            $table->dropIndex(['account_id', 'date']);
            $table->dropIndex(['account_id', 'type']);
        });
    }
};
