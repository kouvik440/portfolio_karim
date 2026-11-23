<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 80)->unique();
            $table->string('module', 60)->default('general');
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug', 80)->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permission_role', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->unique(['role_id', 'permission_id']);
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->unique(['user_id', 'role_id']);
        });

        // Seed default permissions
        $permissions = [
            ['name' => 'Gérer les projets', 'slug' => 'manage-projects', 'module' => 'Projets', 'description' => 'Créer, modifier et supprimer des réalisations et études de cas.'],
            ['name' => 'Gérer les actualités', 'slug' => 'manage-news', 'module' => 'Actualités', 'description' => 'Publier, modifier et supprimer des articles et actualités.'],
            ['name' => 'Gérer le profil & CV', 'slug' => 'manage-profile', 'module' => 'Profil', 'description' => 'Modifier la bio, les coordonnées, la photo et le fichier du CV.'],
            ['name' => 'Gérer le parcours & compétences', 'slug' => 'manage-resume', 'module' => 'Parcours', 'description' => 'Modifier les formations, expériences et compétences.'],
            ['name' => 'Consulter les messages reçus', 'slug' => 'manage-messages', 'module' => 'Messagerie', 'description' => 'Lire, traiter et supprimer les messages de contact reçus.'],
            ['name' => 'Modifier les paramètres du site', 'slug' => 'manage-settings', 'module' => 'Paramètres', 'description' => 'Modifier les textes éditoriaux, méta SEO et le thème par défaut.'],
            ['name' => 'Gérer les rôles et permissions', 'slug' => 'manage-roles', 'module' => 'Sécurité', 'description' => 'Créer des rôles, attribuer des permissions et gérer les comptes.'],
        ];

        $now = now();
        foreach ($permissions as $p) {
            DB::table('permissions')->insert([
                ...$p,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Seed default roles
        $superAdminRoleId = DB::table('roles')->insertGetId([
            'name' => 'Super Administrateur',
            'slug' => 'super-admin',
            'description' => 'Accès complet et illimité à toutes les sections et à la gestion des rôles.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $editorRoleId = DB::table('roles')->insertGetId([
            'name' => 'Éditeur de Contenu',
            'slug' => 'editor',
            'description' => 'Peut gérer les projets, actualités, compétences et parcours.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $moderatorRoleId = DB::table('roles')->insertGetId([
            'name' => 'Modérateur Messages',
            'slug' => 'moderator',
            'description' => 'Peut consulter et traiter les messages reçus via le formulaire de contact.',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Attach permissions to Super Admin (all permissions)
        $allPermissionIds = DB::table('permissions')->pluck('id');
        foreach ($allPermissionIds as $pId) {
            DB::table('permission_role')->insert([
                'role_id' => $superAdminRoleId,
                'permission_id' => $pId,
            ]);
        }

        // Attach permissions to Editor (projects, news, resume)
        $editorPerms = DB::table('permissions')->whereIn('slug', ['manage-projects', 'manage-news', 'manage-resume'])->pluck('id');
        foreach ($editorPerms as $pId) {
            DB::table('permission_role')->insert([
                'role_id' => $editorRoleId,
                'permission_id' => $pId,
            ]);
        }

        // Attach permissions to Moderator (messages)
        $moderatorPerms = DB::table('permissions')->whereIn('slug', ['manage-messages'])->pluck('id');
        foreach ($moderatorPerms as $pId) {
            DB::table('permission_role')->insert([
                'role_id' => $moderatorRoleId,
                'permission_id' => $pId,
            ]);
        }

        // Assign super-admin role to all existing users with is_admin = true
        $existingAdminIds = DB::table('users')->where('is_admin', true)->pluck('id');
        foreach ($existingAdminIds as $userId) {
            DB::table('role_user')->insertOrIgnore([
                'user_id' => $userId,
                'role_id' => $superAdminRoleId,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');
    }
};
