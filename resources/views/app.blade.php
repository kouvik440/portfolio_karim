@php
    $identity = $portfolio['profile'];
    $study = $portfolio['project_detail'] ?? $portfolio['news_detail'] ?? null;
    $isNews = isset($portfolio['news_page']) || isset($portfolio['news_detail']);
    $personName = $identity['full_name'] ?? 'Karim';
    $pageTitle = $study ? $study['title'].' — '.$personName : ($isNews ? 'Actualités — '.$personName : (($identity['meta_title'] ?? null) ?: $personName.' — '.($identity['job_title'] ?? 'Portfolio')));
    $pageDescription = \Illuminate\Support\Str::limit($study['description'] ?? (($identity['meta_description'] ?? null) ?: ($identity['bio'] ?? 'Portfolio de développeur full-stack. Découvrez les projets et le parcours.')), 320, '');
    $ogImage = $study['cover_url'] ?? $identity['photo_url'] ?? null;
    $schema = [
        '@context' => 'https://schema.org', '@type' => $isNews ? ($study ? 'BlogPosting' : 'Blog') : ($study ? 'CreativeWork' : 'ProfilePage'),
        'name' => $pageTitle, 'description' => $pageDescription, 'url' => $canonical,
        $study ? 'author' : 'mainEntity' => [
            '@type' => 'Person', 'name' => $personName, 'jobTitle' => $identity['job_title'] ?? 'Développeur',
            'url' => $portfolio['home_url'], 'sameAs' => array_values(array_filter([$identity['github_url'] ?? null, $identity['linkedin_url'] ?? null])),
        ],
    ];
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{{ $pageDescription }}">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0a0d14">
    <meta name="color-scheme" content="dark light">
    <link rel="canonical" href="{{ $canonical }}">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta property="og:title" content="{{ $pageTitle }}">
    <meta property="og:description" content="{{ $pageDescription }}">
    <meta property="og:url" content="{{ $canonical }}">
    @if($ogImage)<meta property="og:image" content="{{ $ogImage }}">@endif
    <meta name="twitter:card" content="summary_large_image">
    <title>{{ $pageTitle }}</title>
    <script>
        (() => {
            const fallback = {{ \Illuminate\Support\Js::from($identity['default_theme'] ?? 'dark') }};
            let mode = fallback;
            try { mode = localStorage.getItem('portfolio-theme') || fallback; } catch {}
            if (!['dark', 'light', 'system'].includes(mode)) mode = fallback;
            document.documentElement.dataset.theme = mode === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;
        })();
    </script>
    <script type="application/ld+json">{!! \Illuminate\Support\Js::encode($schema) !!}</script>
    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body>
    <div id="app" data-contact-url="{{ route('contact.store') }}"></div>
    <script type="application/json" id="portfolio-data">{!! \Illuminate\Support\Js::encode($portfolio) !!}</script>
    <noscript>
        <main style="max-width:70ch;margin:2rem auto;padding:1rem;font-family:sans-serif;line-height:1.6">
            <h1>{{ $study['title'] ?? ($isNews ? 'Actualités' : $personName) }}</h1>
            <p>{{ $study['description'] ?? $identity['job_title'] ?? '' }}</p>
            @if($study)
                @foreach(['problem' => 'Le besoin', 'solution' => 'La solution', 'contribution' => 'Ma contribution', 'result' => 'Résultats vérifiés'] as $field => $heading)
                    @if($study[$field] ?? null)<h2>{{ $heading }}</h2><p>{{ $study[$field] }}</p>@endif
                @endforeach
                <a href="{{ route('home') }}">Retour au portfolio</a>
            @else
                @if($isNews)
                    @forelse($portfolio['news_page']['posts'] as $post)
                        <article><h2><a href="{{ $post['detail_url'] }}">{{ $post['title'] }}</a></h2><p>{{ $post['description'] }}</p></article>
                    @empty
                        <p>Aucune actualité publiée pour le moment.</p>
                    @endforelse
                @endif
                <p>{{ $identity['bio'] ?? '' }}</p>
                @foreach($portfolio['entries']['project'] ?? [] as $project)
                    <h2><a href="{{ $project['detail_url'] }}">{{ $project['title'] }}</a></h2><p>{{ $project['description'] }}</p>
                @endforeach
                @if($identity['cv_url'])<p><a href="{{ $identity['cv_url'] }}">Télécharger le CV</a></p>@endif
                @if($identity['email'] ?? null)<p><a href="mailto:{{ $identity['email'] }}">{{ $identity['email'] }}</a></p>@endif
            @endif
        </main>
    </noscript>
</body>
</html>
