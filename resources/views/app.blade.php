<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Karim, développeur web. Découvrez mes projets Laravel et React et parlons de votre prochain projet.">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0a0d14">
    <title>{{ $portfolio['profile']['full_name'] ?? 'Karim' }} — Portfolio</title>

    @viteReactRefresh
    @vite('resources/js/app.jsx')
</head>
<body>
    <div id="app" data-contact-url="{{ route('contact.store') }}"></div>
    <script type="application/json" id="portfolio-data">{!! \Illuminate\Support\Js::encode($portfolio) !!}</script>
    <noscript>Activez JavaScript pour découvrir le portfolio de Karim.</noscript>
</body>
</html>
