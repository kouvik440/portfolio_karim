<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePortfolioEntryRequest;
use App\Http\Requests\Admin\SavePortfolioProfileRequest;
use App\Http\Requests\Admin\SavePortfolioSettingsRequest;
use App\Models\ContactMessage;
use App\Models\Permission;
use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use App\Models\Role;
use App\Models\User;
use App\Services\ImageOptimizer;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortfolioController extends Controller
{
    public const TYPES = ['education', 'experience', 'skill', 'interest', 'language', 'project', 'news'];

    public function index(): View
    {
        return view('admin', ['login' => false]);
    }

    public function data(): JsonResponse
    {
        $profile = PortfolioProfile::find(1);

        return response()->json([
            'profile' => $profile,
            'content_defaults' => PortfolioProfile::CONTENT_DEFAULTS,
            'entries' => PortfolioEntry::orderBy('sort_order')->orderBy('id')->get()->map(function (PortfolioEntry $entry): array {
                return [...$entry->toArray(),
                    'cover_url' => $entry->cover_path ? route('admin.entries.media', [$entry, 'cover']) : null,
                    'gallery_urls' => array_map(fn ($index) => route('admin.entries.media', [$entry, 'gallery', $index]), array_keys($entry->gallery_paths ?? [])),
                    'public_url' => $entry->is_published ? $entry->publicData()['detail_url'] : null,
                ];
            }),
            'stats' => [
                'published_projects' => PortfolioEntry::where('type', 'project')->where('is_published', true)->count(),
                'draft_projects' => PortfolioEntry::where('type', 'project')->where('is_published', false)->count(),
                'unread_messages' => ContactMessage::whereNull('read_at')->count(),
                'total_messages' => ContactMessage::count(),
            ],
            'cv_url' => $profile?->cv_path ? route('portfolio.media', 'cv') : null,
            'photo_url' => $profile?->photo_path ? route('portfolio.media', 'photo') : null,
        ])->header('Cache-Control', 'no-store');
    }

    public function profile(SavePortfolioProfileRequest $request): JsonResponse
    {
        $data = $request->validated();
        $profile = PortfolioProfile::firstOrNew(['id' => 1]);
        $oldPaths = [];
        $optimizer = app(ImageOptimizer::class);
        foreach (['cv', 'photo'] as $field) {
            if ($request->hasFile($field) || $request->boolean('remove_'.$field)) {
                $oldPaths[] = $profile->getAttribute($field.'_path');
                if ($request->hasFile($field)) {
                    $data[$field.'_path'] = $field === 'photo'
                        ? $optimizer->storeOptimized($request->file($field), 'portfolio', 1000, 1000, 85)
                        : $request->file($field)->store('portfolio', 'local');
                } else {
                    $data[$field.'_path'] = null;
                }
            }
            unset($data[$field], $data['remove_'.$field]);
        }
        $profile->fill($data)->save();
        foreach (array_filter($oldPaths) as $path) {
            Storage::disk('local')->delete($path);
        }

        return response()->json(['message' => 'Profil enregistré.']);
    }

    public function settings(SavePortfolioSettingsRequest $request): JsonResponse
    {
        $profile = PortfolioProfile::firstOrNew(['id' => 1]);
        $profile->fill($request->validated())->save();

        return response()->json(['message' => 'Textes et paramètres enregistrés.']);
    }

    public function store(SavePortfolioEntryRequest $request): JsonResponse
    {
        $entry = $this->saveEntry($request, new PortfolioEntry);

        return response()->json(['message' => 'Élément ajouté.', 'entry' => $entry], 201);
    }

    public function update(SavePortfolioEntryRequest $request, PortfolioEntry $entry): JsonResponse
    {
        $this->saveEntry($request, $entry);

        return response()->json(['message' => 'Élément enregistré.', 'entry' => $entry]);
    }

    public function destroy(PortfolioEntry $entry): JsonResponse
    {
        $paths = array_filter([$entry->cover_path, ...($entry->gallery_paths ?? [])]);
        $entry->delete();
        Storage::disk('local')->delete($paths);

        return response()->json(['message' => 'Élément supprimé.']);
    }

    public function entryMedia(PortfolioEntry $entry, string $kind, ?int $index = null): StreamedResponse
    {
        abort_unless(in_array($kind, ['cover', 'gallery'], true), 404);
        $path = $kind === 'cover' ? $entry->cover_path : ($entry->gallery_paths[$index ?? -1] ?? null);
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path, null, ['X-Content-Type-Options' => 'nosniff', 'Cache-Control' => 'private, no-store']);
    }

    public function messages(): JsonResponse
    {
        return response()->json(ContactMessage::latest()->paginate(20))->header('Cache-Control', 'no-store');
    }

    public function readMessage(ContactMessage $message): JsonResponse
    {
        $message->read_at = $message->read_at ? null : now();
        $message->save();

        return response()->json(['message' => $message->read_at ? 'Message marqué comme lu.' : 'Message marqué comme non lu.']);
    }

    public function destroyMessage(ContactMessage $message): JsonResponse
    {
        $message->delete();

        return response()->json(['message' => 'Message supprimé.']);
    }

    public function users(): JsonResponse
    {
        return response()->json([
            'users' => User::with('roles:id,name,slug')->where('is_admin', true)->orderBy('name')->get(['id', 'name', 'email', 'created_at']),
            'roles' => Role::with('permissions:id,name,slug,module')->orderBy('name')->get(['id', 'name', 'slug', 'description']),
            'current_user_id' => auth()->id(),
        ])->header('Cache-Control', 'no-store');
    }

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ], [
            'name.required' => 'Le nom est obligatoire.',
            'email.required' => 'L’adresse e-mail est obligatoire.',
            'email.email' => 'Veuillez saisir une adresse e-mail valide.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'password.required' => 'Le mot de passe est obligatoire.',
            'password.min' => 'Le mot de passe doit comporter au moins 8 caractères.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
        ]);

        $user = new User;
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->password = $validated['password'];
        $user->is_admin = true;
        $user->save();

        $roleIds = $request->input('roles', []);
        if (empty($roleIds)) {
            $defaultRole = Role::where('slug', 'editor')->first() ?? Role::first();
            if ($defaultRole) {
                $roleIds = [$defaultRole->id];
            }
        }
        $user->roles()->sync($roleIds);

        return response()->json([
            'message' => 'Compte administrateur créé avec succès.',
            'user' => $user->load('roles:id,name,slug')->only(['id', 'name', 'email', 'roles', 'created_at']),
        ], 201);
    }

    public function updateUserRoles(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'roles' => ['required', 'array', 'min:1'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ], [
            'roles.required' => 'Au moins un rôle doit être sélectionné.',
            'roles.min' => 'Au moins un rôle doit être sélectionné.',
        ]);

        $user->roles()->sync($validated['roles']);

        return response()->json([
            'message' => 'Rôles mis à jour pour '.$user->name.'.',
            'user' => $user->load('roles:id,name,slug')->only(['id', 'name', 'email', 'roles', 'created_at']),
        ]);
    }

    public function destroyUser(User $user): JsonResponse
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        $user->roles()->detach();
        $user->delete();

        return response()->json(['message' => 'Compte administrateur supprimé.']);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'roles' => Role::with('permissions:id,name,slug,module')->withCount('users')->orderBy('name')->get(),
            'permissions' => Permission::orderBy('module')->orderBy('name')->get(['id', 'name', 'slug', 'module', 'description']),
        ])->header('Cache-Control', 'no-store');
    }

    public function storeRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:80', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'unique:roles,slug'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ], [
            'name.required' => 'Le nom du rôle est obligatoire.',
            'slug.unique' => 'Cet identifiant de rôle existe déjà.',
        ]);

        $role = new Role;
        $role->name = $validated['name'];
        $role->slug = ! empty($validated['slug']) ? $validated['slug'] : Str::slug($validated['name']);
        $role->description = $validated['description'] ?? null;
        $role->save();

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->input('permissions', []));
        }

        return response()->json([
            'message' => 'Rôle créé avec succès.',
            'role' => $role->load('permissions:id,name,slug,module'),
        ], 201);
    }

    public function updateRole(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role->name = $validated['name'];
        $role->description = $validated['description'] ?? null;
        $role->save();

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->input('permissions', []));
        }

        return response()->json([
            'message' => 'Rôle mis à jour avec succès.',
            'role' => $role->load('permissions:id,name,slug,module'),
        ]);
    }

    public function destroyRole(Role $role): JsonResponse
    {
        if (in_array($role->slug, ['super-admin', 'editor', 'moderator'], true)) {
            return response()->json(['message' => 'Ce rôle système ne peut pas être supprimé.'], 422);
        }

        if ($role->users()->count() > 0) {
            return response()->json(['message' => 'Ce rôle est attribué à des utilisateurs. Réattribuez-leur un autre rôle avant de le supprimer.'], 422);
        }

        $role->permissions()->detach();
        $role->delete();

        return response()->json(['message' => 'Rôle supprimé avec succès.']);
    }

    private function saveEntry(SavePortfolioEntryRequest $request, PortfolioEntry $entry): PortfolioEntry
    {
        $data = $request->validated();
        $oldPaths = [];
        $newPaths = [];
        if (in_array($data['type'], ['project', 'news'], true)) {
            $data['slug'] = ! empty($data['slug']) ? $data['slug'] : ($entry->slug ?? Str::limit(Str::slug($data['title']) ?: 'publication', 160, '').'-'.Str::lower(Str::random(8)));
            if (empty($data['cover_alt'])) {
                $data['cover_alt'] = $data['title'] ?? null;
            }
            if ($data['type'] === 'news' && empty($data['occurred_on'])) {
                $data['occurred_on'] = now()->toDateString();
            }
            $optimizer = app(ImageOptimizer::class);
            if ($request->hasFile('cover') || $request->boolean('remove_cover')) {
                $oldPaths[] = $entry->cover_path;
                $data['cover_path'] = $request->hasFile('cover')
                    ? $optimizer->storeOptimized($request->file('cover'), 'portfolio/projects', 1600, 1600, 82)
                    : null;
                if ($data['cover_path']) {
                    $newPaths[] = $data['cover_path'];
                }
            }
            if ($request->hasFile('gallery') || $request->boolean('remove_gallery')) {
                $oldPaths = [...$oldPaths, ...($entry->gallery_paths ?? [])];
                $data['gallery_paths'] = [];
                foreach ($request->file('gallery', []) as $image) {
                    $path = $optimizer->storeOptimized($image, 'portfolio/projects', 1600, 1600, 82);
                    $data['gallery_paths'][] = $path;
                    $newPaths[] = $path;
                }
            }
        }
        unset($data['cover'], $data['gallery'], $data['remove_cover'], $data['remove_gallery']);
        try {
            $entry->fill($data)->save();
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($newPaths);
            throw $exception;
        }
        Storage::disk('local')->delete(array_filter($oldPaths));

        return $entry;
    }
}
