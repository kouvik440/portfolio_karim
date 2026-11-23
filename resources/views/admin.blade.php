<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="robots" content="noindex,nofollow">
    <title>Administration — Portfolio Karim</title>
    @viteReactRefresh
    @vite('resources/js/admin.jsx')
</head>
<body>
    <div id="admin-root"></div>
    <script type="application/json" id="admin-config">{!! \Illuminate\Support\Js::encode([
        'login' => $login,
        'register' => $register ?? false,
        'home' => route('home'),
        'loginUrl' => route('admin.login'),
        'registerUrl' => route('admin.register.submit'),
        'logoutUrl' => route('admin.logout'),
        'usersUrl' => route('admin.users.index'),
        'rolesUrl' => route('admin.roles.index'),
        'dataUrl' => route('admin.data'),
        'profileUrl' => route('admin.profile'),
        'settingsUrl' => route('admin.settings'),
        'entriesUrl' => route('admin.entries.store'),
        'messagesUrl' => route('admin.messages'),
    ]) !!}</script>
    <noscript>Activez JavaScript pour utiliser l’administration.</noscript>
</body>
</html>
