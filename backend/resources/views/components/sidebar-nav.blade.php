@props(['active' => ''])

<div class="sidebar">
    <div class="nav-menu">
        <a href="/desktop" class="nav-item {{ $active === 'desktop' ? 'active' : '' }}" data-page="dashboard" title="Panel general" aria-label="Panel general">
            <i class="fas fa-home" aria-hidden="true"></i>
        </a>
        <a href="/estadisticas" class="nav-item {{ $active === 'estadisticas' ? 'active' : '' }}" data-page="estadisticas" title="Estadísticas" aria-label="Estadísticas">
            <i class="fas fa-chart-line" aria-hidden="true"></i>
        </a>
        <a href="/misTarjetas" class="nav-item {{ $active === 'misTarjetas' ? 'active' : '' }}" data-page="cards" title="Mis tarjetas" aria-label="Mis tarjetas">
            <i class="fas fa-credit-card" aria-hidden="true"></i>
        </a>
        <a href="/ajustes" class="nav-item {{ $active === 'ajustes' ? 'active' : '' }}" data-page="profile" title="Mi cuenta" aria-label="Ajustes de cuenta">
            <i class="fas fa-cog" aria-hidden="true"></i>
        </a>
    </div>
</div>
