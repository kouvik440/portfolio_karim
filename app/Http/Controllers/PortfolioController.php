<?php

namespace App\Http\Controllers;

use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortfolioController extends Controller
{
    public function index(): View
    {
        return view('app', ['portfolio' => $this->publicContent(), 'canonical' => route('home')]);
    }

    public function project(PortfolioEntry $entry): View
    {
        abort_unless($entry->type === 'project' && $entry->is_published, 404);

        return view('app', ['portfolio' => [...$this->publicContent(), 'project_detail' => $entry->publicData()], 'canonical' => route('projects.show', $entry->slug)]);
    }

    public function news(): View
    {
        $posts = PortfolioEntry::where('type', 'news')->where('is_published', true)
            ->orderByRaw('COALESCE(occurred_on, DATE(created_at)) DESC')->orderByDesc('id')->paginate(10);

        return view('app', ['portfolio' => [...$this->publicContent(), 'news_page' => [
            'posts' => $posts->getCollection()->map(fn (PortfolioEntry $entry) => $entry->publicData()),
            'previous_url' => $posts->previousPageUrl(), 'next_url' => $posts->nextPageUrl(),
            'current_page' => $posts->currentPage(), 'last_page' => $posts->lastPage(),
        ]], 'canonical' => route('news.index')]);
    }

    public function newsPost(PortfolioEntry $entry): View
    {
        abort_unless($entry->type === 'news' && $entry->is_published, 404);

        return view('app', ['portfolio' => [...$this->publicContent(), 'news_detail' => $entry->publicData()], 'canonical' => route('news.show', $entry->slug)]);
    }

    public function newsMedia(PortfolioEntry $entry, string $kind, ?int $index = null): StreamedResponse
    {
        abort_unless($entry->type === 'news' && $entry->is_published, 404);

        return $this->entryMedia($entry, $kind, $index);
    }

    public function projectMedia(PortfolioEntry $entry, string $kind, ?int $index = null): StreamedResponse
    {
        abort_unless($entry->type === 'project' && $entry->is_published, 404);

        return $this->entryMedia($entry, $kind, $index);
    }

    private function entryMedia(PortfolioEntry $entry, string $kind, ?int $index): StreamedResponse
    {
        abort_unless(in_array($kind, ['cover', 'gallery'], true), 404);
        $path = $kind === 'cover' ? $entry->cover_path : ($entry->gallery_paths[$index ?? -1] ?? null);
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path, null, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function media(string $kind): StreamedResponse
    {
        abort_unless(in_array($kind, ['cv', 'photo'], true), 404);
        $profile = PortfolioProfile::findOrFail(1);
        $path = $profile->getAttribute($kind === 'cv' ? 'cv_path' : 'photo_path');
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return $kind === 'cv'
            ? Storage::disk('local')->download($path, 'CV-Karim-Ouedraogo.pdf', ['Content-Type' => 'application/pdf'])
            : Storage::disk('local')->response($path, null, ['X-Content-Type-Options' => 'nosniff']);
    }

    public function sitemap(): Response
    {
        $projects = PortfolioEntry::whereIn('type', ['project', 'news'])->where('is_published', true)->whereNotNull('slug')->get(['type', 'slug', 'updated_at']);

        return response()->view('sitemap', ['projects' => $projects, 'profile' => PortfolioProfile::find(1)])->header('Content-Type', 'application/xml; charset=UTF-8');
    }

    public function robots(): Response
    {
        return response("User-agent: *\nDisallow: /admin\nSitemap: ".route('sitemap')."\n")->header('Content-Type', 'text/plain; charset=UTF-8');
    }

    private function publicContent(): array
    {
        $profile = PortfolioProfile::find(1);
        $data = $profile?->only(['full_name', 'display_name', 'job_title', 'tagline', 'bio', 'email', 'phone', 'location', 'github_url', 'linkedin_url', 'availability', 'default_theme', 'meta_title', 'meta_description']) ?? [];
        $data['cv_url'] = $profile?->cv_path ? route('portfolio.media', 'cv') : null;
        $data['photo_url'] = $profile?->photo_path ? route('portfolio.media', 'photo') : null;

        return [
            'home_url' => route('home'),
            'news_url' => route('news.index'),
            'profile' => $data,
            'content' => array_replace(PortfolioProfile::CONTENT_DEFAULTS, array_filter($profile?->content ?? [], fn ($value) => $value !== null && $value !== '')),
            'entries' => PortfolioEntry::where('is_published', true)->where('type', '!=', 'news')->orderByDesc('is_featured')->orderBy('sort_order')->orderBy('id')
                ->get()->map(fn (PortfolioEntry $entry) => $entry->publicData())->groupBy('type'),
        ];
    }
}
