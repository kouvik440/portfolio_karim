<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('portfolio_profiles', function (Blueprint $table): void {
            $table->string('availability')->nullable();
            $table->string('meta_title')->nullable();
            $table->string('meta_description', 320)->nullable();
            $table->string('default_theme', 10)->default('system');
            $table->json('content')->nullable();
        });
        Schema::table('portfolio_entries', function (Blueprint $table): void {
            $table->string('slug', 180)->nullable()->unique();
            $table->text('problem')->nullable();
            $table->text('solution')->nullable();
            $table->text('contribution')->nullable();
            $table->text('result')->nullable();
            $table->string('demo_url', 2048)->nullable();
            $table->string('cover_path')->nullable();
            $table->string('cover_alt')->nullable();
            $table->json('gallery_paths')->nullable();
            $table->boolean('is_featured')->default(false);
        });
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->timestamp('read_at')->nullable();
        });
        DB::table('portfolio_entries')->where('type', 'project')->orderBy('id')->each(function ($entry): void {
            DB::table('portfolio_entries')->where('id', $entry->id)->update(['slug' => Str::limit(Str::slug($entry->title) ?: 'projet', 160, '').'-'.$entry->id]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('portfolio_profiles', function (Blueprint $table): void {
            $table->dropColumn(['availability', 'meta_title', 'meta_description', 'default_theme', 'content']);
        });
        Schema::table('portfolio_entries', function (Blueprint $table): void {
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'problem', 'solution', 'contribution', 'result', 'demo_url', 'cover_path', 'cover_alt', 'gallery_paths', 'is_featured']);
        });
        Schema::table('contact_messages', function (Blueprint $table): void {
            $table->dropColumn('read_at');
        });
    }
};
