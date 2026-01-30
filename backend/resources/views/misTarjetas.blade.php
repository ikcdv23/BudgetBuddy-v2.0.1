@extends('layouts.app')

@section('title', 'Panel General')

@section('content')
<!-- Top Bar -->
<header class="desktop-header">
    <div class="desktop-brand">
        <img src="../images/logo_budget2-removebg-preview (1).png" alt="" />
    </div>

    <div class="desktop-header-right">
        <div class="top-icon" title="Buscar">
            <i class="fas fa-search"></i>
        </div>
        <div class="top-icon notification-btn" title="Notificaciones">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
        </div>
        <div class="user-profile-top">
            <div class="user-avatar-top" title="Mi perfil">JD</div>
        </div>
    </div>
</header>

<!-- Мобільна навігаційна панель -->
<nav class="mobile-nav">
    <ul class="mobile-nav-items">
        <li>
            <a
                href="/desktop"
                class="mobile-nav-item active"
                data-page="dashboard"
                title="Panel general">
                <i class="fas fa-home"></i>
                <span>Inicio</span>
            </a>
        </li>
        <li>
            <a
                href="/api-estadisticas"
                class="mobile-nav-item"
                data-page="estadisticas"
                title="Estadísticas">
                <i class="fas fa-chart-line"></i>
                <span>Estadísticas</span>
            </a>
        </li>
        <li>
            <a
                href="/misTarjetas"
                class="mobile-nav-item"
                data-page="cards"
                title="Mis tarjetas">
                <i class="fas fa-credit-card"></i>
                <span>Tarjetas</span>
            </a>
        </li>
        <li>
            <a
                href="/ajustes"
                class="mobile-nav-item"
                data-page="profile"
                title="Mi cuenta">
                <i class="fas fa-cog"></i>
                <span>Ajustes</span>
            </a>
        </li>
    </ul>
</nav>

<!-- Sidebar Navigation -->
<div class="sidebar">
    <div class="nav-menu">
        <a href="/dashboard" class="nav-item active" data-page="dashboard" title="Panel general">
            <i class="fas fa-home"></i>
        </a>
        <a href="/api-estadisticas" class="nav-item" data-page="estadisticas" title="Estadísticas">
            <i class="fas fa-chart-line"></i>
        </a>
        <a href="/misTarjetas" class="nav-item" data-page="cards" title="Mis tarjetas">
            <i class="fas fa-credit-card"></i>
        </a>
        <a href="/ajustes" class="nav-item" data-page="profile" title="Mi cuenta">
            <i class="fas fa-cog"></i>
        </a>
    </div>
</div>

<div class="desktop-container">
    <!-- Main Content -->
    <main class="desktop-main">
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">
                Mis tarjetas
                <div class="date-container">28 Abr, 2024</div>
            </h1>
        </div>

        <div class="desktop-grid">
            <!-- Ліва колонка: Картки та Транзакції -->
            <section class="desktop-left-column">
                <!-- Картки -->
                <div class="card card-small">
                    <div class="card-header-compact">
                        <h2 class="card-title" id="cards-title">Tarjeta 1</h2>
                        <div class="card-nav">
                            <button class="card-nav-btn prev-card-btn">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <span
                                class="card-counter"
                                style="font-size: 18px; color: black">1/3</span>
                            <button class="card-nav-btn next-card-btn">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div class="cards-carousel">
                        <!-- Card 1 -->
                        <div
                            class="credit-card-compact card-black active"
                            data-card="1">
                            <div class="card-type">
                                <span>VISA</span>
                                <span>1.827,50€</span>
                            </div>
                            <div class="card-number">**** **** **** 3090</div>
                            <div class="card-details">
                                <div class="card-expiry">Exp: 09/24</div>
                                <div class="card-cvv">National Bank</div>
                            </div>
                        </div>

                        <!-- Card 2 -->
                        <div class="credit-card-compact card-blue" data-card="2">
                            <div class="card-type">
                                <span>VISA</span>
                                <span>1.250,50€</span>
                            </div>
                            <div class="card-number">**** **** **** 9800</div>
                            <div class="card-details">
                                <div class="card-expiry">Exp: 04/26</div>
                                <div class="card-cvv">National Bank</div>
                            </div>
                        </div>

                        <!-- Card 3 -->
                        <div class="credit-card-compact card-orange" data-card="3">
                            <div class="card-type">
                                <span>VISA</span>
                                <span>2.150,00€</span>
                            </div>
                            <div class="card-number">**** **** **** 0032</div>
                            <div class="card-details">
                                <div class="card-expiry">Exp: 09/24</div>
                                <div class="card-cvv">National Bank</div>
                            </div>
                        </div>
                    </div>

                    <!-- Статистика використання -->
                    <div class="card-usage">
                        <div class="usage-item">
                            <div class="usage-label" style="font-size: 14px">
                                Gastos semanales
                            </div>
                            <div class="usage-amount" style="font-size: 25px">480€</div>
                        </div>
                        <div class="usage-item">
                            <div class="usage-label" style="font-size: 14px">
                                Disponible
                            </div>
                            <div class="usage-amount available" style="font-size: 25px">
                                1.827€
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Транзакції -->
                <div class="card">
                    <div class="card-header-compact">
                        <div class="transactions-header">
                            <h2 class="card-title">Transacciones</h2>
                            <div class="transactions-filters" style="font-size: 18px">
                                <button
                                    class="filter-btn active"
                                    data-filter="all"
                                    style="font-size: 14px">
                                    Todos
                                </button>
                                <button
                                    class="filter-btn"
                                    data-filter="income"
                                    style="font-size: 14px">
                                    Ingresos
                                </button>
                                <button
                                    class="filter-btn"
                                    data-filter="payment"
                                    style="font-size: 14px">
                                    Pagos
                                </button>
                                <button
                                    class="filter-btn"
                                    data-filter="month"
                                    style="font-size: 14px">
                                    Este mes
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>ID transacción</th>
                                    <th>Terminal</th>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    class="transaction-row"
                                    data-type="payment"
                                    data-month="may">
                                    <td>
                                        <div class="transaction-name">
                                            <div class="transaction-icon-small red">
                                                <i class="fas fa-coffee"></i>
                                            </div>
                                            Starbucks
                                        </div>
                                    </td>
                                    <td>#12548796</td>
                                    <td>***** 9800</td>
                                    <td>12 Mayo, 17:40</td>
                                    <td class="amount negative">-25,90€</td>
                                </tr>
                                <tr
                                    class="transaction-row"
                                    data-type="income"
                                    data-month="may">
                                    <td>
                                        <div class="transaction-name">
                                            <div class="transaction-icon-small green">
                                                <i class="fas fa-arrow-down"></i>
                                            </div>
                                            Rembolso Zara
                                        </div>
                                    </td>
                                    <td>#56478767</td>
                                    <td>***** 9800</td>
                                    <td>12 Mayo, 20:00</td>
                                    <td class="amount positive">+340,80€</td>
                                </tr>
                                <tr
                                    class="transaction-row"
                                    data-type="payment"
                                    data-month="may">
                                    <td>
                                        <div class="transaction-name">
                                            <div class="transaction-icon-small red">
                                                <i class="fas fa-tools"></i>
                                            </div>
                                            TCS Services
                                        </div>
                                    </td>
                                    <td>#09873425</td>
                                    <td>***** 3090</td>
                                    <td>11 Mayo, 15:23</td>
                                    <td class="amount negative">-150,00€</td>
                                </tr>
                                <tr
                                    class="transaction-row"
                                    data-type="payment"
                                    data-month="may">
                                    <td>
                                        <div class="transaction-name">
                                            <div class="transaction-icon-small red">
                                                <i class="fas fa-shopping-cart"></i>
                                            </div>
                                            Grocery store
                                        </div>
                                    </td>
                                    <td>#09740001</td>
                                    <td>***** 0032</td>
                                    <td>10 Mayo, 12:40</td>
                                    <td class="amount negative">-143,00€</td>
                                </tr>
                                <tr
                                    class="transaction-row"
                                    data-type="payment"
                                    data-month="may">
                                    <td>
                                        <div class="transaction-name">
                                            <div class="transaction-icon-small red">
                                                <i class="fas fa-tshirt"></i>
                                            </div>
                                            Nike store
                                        </div>
                                    </td>
                                    <td>#00043651</td>
                                    <td>***** 0032</td>
                                    <td>8 Mayo, 15:40</td>
                                    <td class="amount negative">-100,00€</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <!-- Права колонка: Діаграма та Facturas -->
            <section class="desktop-right-column">
                <!-- Діаграма Gastos -->
                <div class="card">
                    <div class="card-header-compact">
                        <h2 class="card-title">Gastos</h2>
                        <div class="chart-period">
                            <button
                                class="period-btn active"
                                data-period="week"
                                style="font-size: 14px">
                                Semana
                            </button>
                            <button
                                class="period-btn"
                                data-period="month"
                                style="font-size: 14px">
                                Mes
                            </button>
                        </div>
                    </div>

                    <div class="chart-container">
                        <div class="chart-wrapper">
                            <!-- Проста кругова діаграма -->
                            <div class="pie-chart">
                                <div class="pie-chart-circle">
                                    <svg viewBox="0 0 100 100" class="pie-svg">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            class="pie-background"></circle>
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            class="pie-segment food"
                                            stroke-dasharray="35 100"></circle>
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            class="pie-segment shopping"
                                            stroke-dasharray="25 100"
                                            stroke-dashoffset="-35"></circle>
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            class="pie-segment entertainment"
                                            stroke-dasharray="20 100"
                                            stroke-dashoffset="-60"></circle>
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            class="pie-segment transport"
                                            stroke-dasharray="15 100"
                                            stroke-dashoffset="-80"></circle>
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            class="pie-segment other"
                                            stroke-dasharray="5 100"
                                            stroke-dashoffset="-95"></circle>
                                    </svg>
                                </div>
                                <div class="chart-center">
                                    <div class="chart-total">1.240€</div>
                                    <div class="chart-label">Total gastos</div>
                                </div>
                            </div>

                            <div class="chart-legend">
                                <div class="legend-item">
                                    <div class="legend-color food-color"></div>
                                    <div class="legend-text">Comida (35%)</div>
                                    <div class="legend-amount">434€</div>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color shopping-color"></div>
                                    <div class="legend-text">Compras (25%)</div>
                                    <div class="legend-amount">310€</div>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color entertainment-color"></div>
                                    <div class="legend-text">Entretenimiento (20%)</div>
                                    <div class="legend-amount">248€</div>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color transport-color"></div>
                                    <div class="legend-text">Transporte (15%)</div>
                                    <div class="legend-amount">186€</div>
                                </div>
                                <div class="legend-item">
                                    <div class="legend-color other-color"></div>
                                    <div class="legend-text">Otros (5%)</div>
                                    <div class="legend-amount">62€</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Facturas -->
                <div class="card">
                    <div class="card-header-compact">
                        <h2 class="card-title">Facturas</h2>
                        <button class="view-all-btn" style="font-size: 14px">
                            Ver todas <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <div class="invoices-list">
                        <div class="invoice-item">
                            <div class="invoice-left">
                                <div class="invoice-icon red">
                                    <i class="fab fa-apple"></i>
                                </div>
                                <div class="invoice-info">
                                    <h4>Apple store</h4>
                                    <div class="invoice-time">Hace 12 minutos</div>
                                </div>
                            </div>
                            <div class="invoice-amount">320,00€</div>
                        </div>

                        <div class="invoice-item">
                            <div class="invoice-left">
                                <div class="invoice-icon">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="invoice-info">
                                    <h4>John Smith</h4>
                                    <div class="invoice-time">Hace 6 horas</div>
                                </div>
                            </div>
                            <div class="invoice-amount">50,00€</div>
                        </div>

                        <div class="invoice-item">
                            <div class="invoice-left">
                                <div class="invoice-icon">
                                    <i class="fas fa-gamepad"></i>
                                </div>
                                <div class="invoice-info">
                                    <h4>Playstation</h4>
                                    <div class="invoice-time">Hace 16 horas</div>
                                </div>
                            </div>
                            <div class="invoice-amount">80,20€</div>
                        </div>

                        <div class="invoice-item">
                            <div class="invoice-left">
                                <div class="invoice-icon">
                                    <i class="fas fa-tv"></i>
                                </div>
                                <div class="invoice-info">
                                    <h4>Megogo</h4>
                                    <div class="invoice-time">Hace 1 día</div>
                                </div>
                            </div>
                            <div class="invoice-amount">12,99€</div>
                        </div>

                        <div class="invoice-item">
                            <div class="invoice-left">
                                <div class="invoice-icon">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div class="invoice-info">
                                    <h4>Sarah S.</h4>
                                    <div class="invoice-time">Hace 13:45</div>
                                </div>
                            </div>
                            <div class="invoice-amount">35,90€</div>
                        </div>

                        <div class="invoice-item">
                            <div class="invoice-left">
                                <div class="invoice-icon">
                                    <i class="fas fa-film"></i>
                                </div>
                                <div class="invoice-info">
                                    <h4>Netflix</h4>
                                    <div class="invoice-time">Hace 15:12</div>
                                </div>
                            </div>
                            <div class="invoice-amount">20,00€</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
</div>

<script src="../js/tarjetas.js"></script>
@endsection