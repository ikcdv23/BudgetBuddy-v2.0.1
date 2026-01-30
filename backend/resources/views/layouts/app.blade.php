<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BudgetBuddy | @yield('title', 'Dashboard')</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <link rel="stylesheet" href="{{ asset('css/desktop.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/style.css') }}" />
</head>
<body class="desktop-body">

    {{-- 1. NAVEGACIÓN MÓVIL --}}
    <nav class="mobile-nav">
        <ul class="mobile-nav-items">
            <li>
                {{-- Usamos route() y request()->routeIs() para la clase active dinámica --}}
                <a href="#" class="mobile-nav-item {{ request()->routeIs('dashboard') ? 'active' : '' }}" title="Inicio">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </a>
            </li>
            <li>
                <a href="#" class="mobile-nav-item {{ request()->routeIs('stats') ? 'active' : '' }}" title="Estadísticas">
                    <i class="fas fa-chart-line"></i>
                    <span>Estadísticas</span>
                </a>
            </li>
            <li>
                <a href="#" class="mobile-nav-item {{ request()->routeIs('cards') ? 'active' : '' }}" title="Tarjetas">
                    <i class="fas fa-credit-card"></i>
                    <span>Tarjetas</span>
                </a>
            </li>
            <li>
                <a href="#" class="mobile-nav-item {{ request()->routeIs('profile') ? 'active' : '' }}" title="Ajustes">
                    <i class="fas fa-cog"></i>
                    <span>Ajustes</span>
                </a>
            </li>
        </ul>
    </nav>

    {{-- 2. HEADER SUPERIOR (DESKTOP) --}}
    <header class="desktop-header">
        <div class="desktop-brand">
            <img src="{{ asset('images/logo_budget_expand.png') }}" alt="budgetBuddy Logo" class="desktop-logo" />
        </div>
        
        <div class="desktop-header-right">
            <div class="top-icon" title="Buscar">
                <i class="fas fa-search"></i>
            </div>
            <div class="top-icon notification-btn" title="Notificaciones">
                <i class="fas fa-bell"></i>
                <span class="notification-badge">3</span>
            </div>
            
            {{-- Perfil de Usuario Dinámico --}}
            <div class="user-profile-top">
                <div class="user-avatar-top" title="Mi perfil">
                    {{-- Obtenemos las iniciales del usuario logueado --}}
                    {{ Auth::user() ? substr(Auth::user()->name, 0, 2) : 'G' }}
                </div>
            </div>
        </div>
    </header>
    
    {{-- 3. SIDEBAR (DESKTOP) --}}
    <div class="sidebar">   
        <div class="nav-menu">
            <a href="#" class="nav-item {{ request()->routeIs('dashboard') ? 'active' : '' }}" title="Panel general">
                <i class="fas fa-home"></i>
            </a>
            <a href="#" class="nav-item {{ request()->routeIs('stats') ? 'active' : '' }}" title="Estadísticas">
                <i class="fas fa-chart-line"></i>
            </a>
            <a href="#" class="nav-item {{ request()->routeIs('cards') ? 'active' : '' }}" title="Mis tarjetas">
                <i class="fas fa-credit-card"></i>
            </a>
            <a href="#" class="nav-item {{ request()->routeIs('profile') ? 'active' : '' }}" title="Mi cuenta">
                <i class="fas fa-cog"></i>
            </a>
            
            {{-- Botón de Logout Seguro --}}
            <form method="POST" action="{{ route('logout') }}" class="nav-item" style="cursor: pointer;">
                @csrf
                <button type="submit" style="background:none; border:none; color:inherit; width:100%; height:100%;">
                    <i class="fas fa-sign-out-alt"></i>
                </button>
            </form>
        </div>
    </div>
    
    {{-- 4. CONTENEDOR PRINCIPAL --}}
    <div class="desktop-container">
        <main class="desktop-main">
            {{-- Aquí se inyectará el contenido de cada página --}}
            @yield('content')
        </main>
    </div>

    {{-- Scripts --}}
    <script src="{{ asset('js/desktop.js') }}"></script>
    @stack('scripts')
</body>
</html>