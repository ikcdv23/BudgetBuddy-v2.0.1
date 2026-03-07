@props(['active' => ''])

<nav class="mobile-nav" aria-label="Navegación móvil">
    <ul class="mobile-nav-items">
        <li>
            <a href="/desktop" class="mobile-nav-item {{ $active === 'desktop' ? 'active' : '' }}" data-page="dashboard" title="Panel general">
                <i class="fas fa-home"></i>
                <span>Inicio</span>
            </a>
        </li>
        <li>
            <a href="/estadisticas" class="mobile-nav-item {{ $active === 'estadisticas' ? 'active' : '' }}" data-page="estadisticas" title="Estadísticas">
                <i class="fas fa-chart-line"></i>
                <span>Estadísticas</span>
            </a>
        </li>
        <li>
            <a href="/misTarjetas" class="mobile-nav-item {{ $active === 'misTarjetas' ? 'active' : '' }}" data-page="cards" title="Mis tarjetas">
                <i class="fas fa-credit-card"></i>
                <span>Tarjetas</span>
            </a>
        </li>
        <li>
            <a href="/ajustes" class="mobile-nav-item {{ $active === 'ajustes' ? 'active' : '' }}" data-page="profile" title="Mi cuenta">
                <i class="fas fa-cog"></i>
                <span>Ajustes</span>
            </a>
        </li>
    </ul>
</nav>
