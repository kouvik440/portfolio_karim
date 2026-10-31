<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use Illuminate\Contracts\View\View;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PortfolioController extends Controller
{
    public const TYPES = ['education', 'experience', 'skill', 'interest', 'language', 'project'];

    public function index(): View
    {
        return view('admin', ['login' => false]);
    }

    public function data(): JsonResponse
    {
        $profile = PortfolioProfile::find(1);

        return response()->json([
            'profile' => $profile,
            'entries' => PortfolioEntry::orderBy('sort_order')->orderBy('id')->get(),
            'cv_url' => $profile?->cv_path ? route('portfolio.media', 'cv') : null,
            'photo_url' => $profile?->photo_path ? route('portfolio.media', 'photo') : null,
        ])->header('Cache-Control', 'no-store');
    }

    public function profile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'display_name' => ['required', 'string', 'max:60'],
            'job_title' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:10000'],
            'email' => ['nullable', 'email', 'max:254'],
            'phone' => ['nullable', 'string', 'max:60'],
            'location' => ['nullable', 'string', 'max:255'],
            'github_url' => ['nullable', 'url:http,https', 'max:2048'],
            'linkedin_url' => ['nullable', 'url:http,https', 'max:2048'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:2048'],
            'remove_photo' => ['nullable', 'boolean'],
            'remove_cv' => ['nullable', 'boolean'],
        ]);
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

    public function store(Request $request): JsonResponse
    {
        $entry = PortfolioEntry::create($this->validatedEntry($request));

        return response()->json(['message' => 'Élément ajouté.', 'entry' => $entry], 201);
    }

    public function update(Request $request, PortfolioEntry $entry): JsonResponse
    {
        $entry->update($this->validatedEntry($request));

        return response()->json(['message' => 'Élément enregistré.', 'entry' => $entry]);
    }

    public function destroy(PortfolioEntry $entry): JsonResponse
    {
        $entry->delete();

        return response()->json(['message' => 'Élément supprimé.']);
    }

    public function messages(): JsonResponse
    {
        return response()->json(ContactMessage::latest()->paginate(20))->header('Cache-Control', 'no-store');
    }

    private function validatedEntry(Request $request): array
    {
        return $request->validate([
            'type' => ['required', Rule::in(self::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'period' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:10000'],
            'url' => ['nullable', 'url:http,https', 'max:2048'],
            'technologies' => ['nullable', 'array', 'max:30'],
            'technologies.*' => ['string', 'max:80'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
            'is_published' => ['required', 'boolean'],
        ]);
    }
}
