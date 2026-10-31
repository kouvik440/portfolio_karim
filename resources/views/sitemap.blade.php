{!! '<'.'?xml version="1.0" encoding="UTF-8"?'.'>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>{{ route('home') }}</loc>@if($profile?->updated_at)<lastmod>{{ $profile->updated_at->toAtomString() }}</lastmod>@endif</url>
    <url><loc>{{ route('news.index') }}</loc></url>
    @foreach($projects as $project)
        <url><loc>{{ route($project->type === 'news' ? 'news.show' : 'projects.show', $project->slug) }}</loc><lastmod>{{ $project->updated_at->toAtomString() }}</lastmod></url>
    @endforeach
</urlset>
