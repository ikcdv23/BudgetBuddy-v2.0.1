<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>BudgetBuddy | @yield('title')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link rel="stylesheet" href="{{ asset('css/backstyle.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/notification.css') }}" />
    @stack('styles')
</head>
<body class="desktop-body">
    @if (session('success'))
    <div class="notification notification-success" style="position:fixed; top:20px; right:20px; z-index:9999; display:flex;">
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>{{ session('success') }}</span>
        </div>
    </div>
    <script>setTimeout(() => document.querySelector('.notification-success')?.remove(), 4000);</script>
    @endif

    @if ($errors->any())
    <div class="notification notification-danger" style="position:fixed; top:20px; right:20px; z-index:9999; display:flex; background-color:#fee2e2; color:#991b1b;">
        <div class="notification-content">
            <i class="fas fa-exclamation-circle"></i>
            <span>Por favor, corrige los errores del formulario.</span>
        </div>
    </div>
    @endif

    <x-app-header />
    <x-mobile-nav :active="$currentPage" />
    <x-sidebar-nav :active="$currentPage" />

    <div class="desktop-container">
        <main class="desktop-main">
            @yield('content')
        </main>
    </div>

    <script src="{{ asset('js/formatters.js') }}"></script>
    <script src="{{ asset('js/app-base.js') }}"></script>
    <script src="{{ asset('js/notifications.js') }}"></script>
    @stack('scripts')
    <script src="{{ asset('js/pjax-nav.js') }}"></script>
</body>
</html>
