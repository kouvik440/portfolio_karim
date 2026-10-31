<?php

namespace App\Http\Controllers;

use App\Models\PortfolioEntry;
use App\Models\PortfolioProfile;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PortfolioController extends Controller
{
    public function index(): View
    {
        $profile = PortfolioProfile::find(1);
        $data = $profile?->only(['full_name', 'display_name', 'job_title', 'tagline', 'bio', 'email', 'phone', 'location', 'github_url', 'linkedin_url']) ?? [];
        $data['cv_url'] = $profile?->cv_path ? route('portfolio.media', 'cv') : null;
        $data['photo_url'] = $profile?->photo_path ? route('portfolio.media', 'photo') : null;

        return view('app', ['portfolio' => [
            'profile' => $data,
            'entries' => PortfolioEntry::where('is_published', true)->orderBy('sort_order')->orderBy('id')
                ->get(['id', 'type', 'title', 'organization', 'period', 'category', 'description', 'url', 'technologies'])->groupBy('type'),
        ]]);
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
}
