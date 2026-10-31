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
        Schema::create('portfolio_entries', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30)->index();
            $table->string('import_key')->nullable()->unique();
            $table->string('title');
            $table->string('organization')->nullable();
            $table->string('period', 120)->nullable();
            $table->string('category', 120)->nullable();
            $table->text('description')->nullable();
            $table->string('url', 2048)->nullable();
            $table->json('technologies')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_published')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_entries');
    }
};
