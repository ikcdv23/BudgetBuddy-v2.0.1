<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            // unique() fuerza la relación 1 a 1 (un usuario solo puede tener un perfil)
            $table->foreignId('user_id')->constrained()->onDelete('cascade')->unique();
            $table->string('lastname')->nullable();
            $table->string('phone_country_code', 5)->nullable()->default('+34');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
