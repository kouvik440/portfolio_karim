<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePortfolioEntryRequest;
use App\Http\Requests\Admin\SavePortfolioProfileRequest;
use App\Http\Requests\Admin\SavePortfolioSettingsRequest;
use App\Models\ContactMessage;
use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
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
        foreach (['cv', 'photo'] as $field) {
            if ($request->hasFile($field) || $request->boolean('remove_'.$field)) {
                $oldPaths[] = $profile->getAttribute($field.'_path');
                $data[$field.'_path'] = $request->hasFile($field) ? $request->file($field)->store('portfolio', 'local') : null;
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

    private function saveEntry(SavePortfolioEntryRequest $request, PortfolioEntry $entry): PortfolioEntry
    {
        $data = $request->validated();
        $oldPaths = [];
        $newPaths = [];
        if (in_array($data['type'], ['project', 'news'], true)) {
            $data['slug'] = $data['slug'] ?? $entry->slug ?? Str::limit(Str::slug($data['title']) ?: 'projet', 160, '').'-'.Str::lower(Str::random(8));
            if ($request->hasFile('cover') || $request->boolean('remove_cover')) {
                $oldPaths[] = $entry->cover_path;
                $data['cover_path'] = $request->hasFile('cover') ? $request->file('cover')->store('portfolio/projects', 'local') : null;
                if ($data['cover_path']) {
                    $newPaths[] = $data['cover_path'];
                }
            }
            if ($request->hasFile('gallery') || $request->boolean('remove_gallery')) {
                $oldPaths = [...$oldPaths, ...($entry->gallery_paths ?? [])];
                $data['gallery_paths'] = [];
                foreach ($request->file('gallery', []) as $image) {
                    $path = $image->store('portfolio/projects', 'local');
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
