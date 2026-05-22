<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script>(function(){var t=localStorage.getItem('bb-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.setAttribute('data-theme','dark');else document.documentElement.setAttribute('data-theme','light');})();</script>
    <title>BudgetBuddy | @yield('title')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link rel="stylesheet" href="{{ asset('css/app-variables.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-dark-mode.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-layout.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-modals.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-forms.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-utilities.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/notification.css') }}" />
    @stack('styles')
</head>
<body class="desktop-body">
    @if (session('success'))
    <div class="notification notification-success notification-flash">
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>{{ session('success') }}</span>
        </div>
    </div>
    <script>setTimeout(() => document.querySelector('.notification-success')?.remove(), 4000);</script>
    @endif

    @if ($errors->any())
    <div class="notification notification-danger notification-flash notification-flash-danger">
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

    <script src="{{ asset('js/core/formatters.js') }}"></script>
    <script src="{{ asset('js/core/utils.js') }}"></script>
    <script src="{{ asset('js/core/api-client.js') }}"></script>
    <script src="{{ asset('js/core/theme-toggle.js') }}"></script>
    <script src="{{ asset('js/core/notifications.js') }}"></script>
    <script src="{{ asset('js/modules/drag-drop.js') }}"></script>
    <script src="{{ asset('js/modules/carousel-nav.js') }}"></script>
    @stack('scripts')
    <script src="{{ asset('js/pjax-nav.js') }}"></script>
</body>
</html>
