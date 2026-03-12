@extends('layouts.budgetbuddy')

@section('title', 'Estadísticas de Mercado')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/api-estadisticas.css') }}" />
@endpush

@section('content')
<div class="page-header">
    <h1 class="page-title">
        Estadísticas de Mercado
        <span class="date-container" id="current-date" aria-label="Fecha actual">28 Abr, 2028</span>
    </h1>
</div>

<section class="market-summary" aria-label="Resumen de mercado">
    <div class="summary-card">
        <div class="summary-icon">
            <i class="fab fa-usps" aria-hidden="true"></i>
        </div>
        <div class="summary-content">
            <h3>SPDR S&amp;P 500 ETF</h3>
            <p class="price" id="sp500-price">$451.23</p>
            <p class="change positive" id="sp500-change">
                <span class="sr-only">Sube</span> +2.11 (+0.47%)
            </p>
        </div>
    </div>

    <div class="summary-card">
        <div class="summary-icon">
            <i class="fas fa-globe" aria-hidden="true"></i>
        </div>
        <div class="summary-content">
            <h3>iShares MSCI World</h3>
            <p class="price" id="msci-price">$120.45</p>
            <p class="change positive" id="msci-change">
                <span class="sr-only">Sube</span> +1.25 (+1.05%)
            </p>
        </div>
    </div>

    <div class="summary-card">
        <div class="summary-icon">
            <i class="fas fa-flag" aria-hidden="true"></i>
        </div>
        <div class="summary-content">
            <h3>IBEX 35 ETF</h3>
            <p class="price" id="ibex-price">&euro;9.85</p>
            <p class="change negative" id="ibex-change">
                <span class="sr-only">Baja</span> -0.15 (-1.50%)
            </p>
        </div>
    </div>
</section>

<div class="timeframe-selector" role="group" aria-label="Filtro de tiempo">
    <button class="time-btn active" data-timeframe="1D" aria-pressed="true">1 Día</button>
    <button class="time-btn" data-timeframe="1W" aria-pressed="false">1 Semana</button>
    <button class="time-btn" data-timeframe="1M" aria-pressed="false">1 Mes</button>
    <button class="time-btn" data-timeframe="3M" aria-pressed="false">3 Meses</button>
    <button class="time-btn" data-timeframe="1Y" aria-pressed="false">1 Año</button>
</div>

<div class="charts-container">
    <div class="chart-card">
        <div class="chart-header">
            <h3>SPDR S&amp;P 500 ETF (SPY)</h3>
            <div class="chart-info">
                <span class="symbol">NYSEARCA: SPY</span>
                <span class="market-status open" id="sp500-status">Mercado Abierto</span>
            </div>
        </div>
        <div class="chart-wrapper">
            <canvas id="sp500-chart" role="img" aria-label="Gráfico de evolución del precio del S&P 500"></canvas>
        </div>
        <div class="chart-stats">
            <div class="stat">
                <span class="stat-label">Máximo del día:</span>
                <span class="stat-value" id="sp500-high">$452.89</span>
            </div>
            <div class="stat">
                <span class="stat-label">Mínimo del día:</span>
                <span class="stat-value" id="sp500-low">$449.67</span>
            </div>
            <div class="stat">
                <span class="stat-label">Volumen:</span>
                <span class="stat-value" id="sp500-volume">23.4M</span>
            </div>
        </div>
    </div>

    <div class="chart-card">
        <div class="chart-header">
            <h3>iShares MSCI World (URTH)</h3>
            <div class="chart-info">
                <span class="symbol">NYSEARCA: URTH</span>
                <span class="market-status open" id="msci-status">Mercado Abierto</span>
            </div>
        </div>
        <div class="chart-wrapper">
            <canvas id="msci-chart" role="img" aria-label="Gráfico de evolución del precio del MSCI World"></canvas>
        </div>
        <div class="chart-stats">
            <div class="stat">
                <span class="stat-label">Máximo del día:</span>
                <span class="stat-value" id="msci-high">$121.80</span>
            </div>
            <div class="stat">
                <span class="stat-label">Mínimo del día:</span>
                <span class="stat-value" id="msci-low">$119.20</span>
            </div>
            <div class="stat">
                <span class="stat-label">Volumen:</span>
                <span class="stat-value" id="msci-volume">5.8M</span>
            </div>
        </div>
    </div>

    <div class="chart-card">
        <div class="chart-header">
            <h3>Amundi IBEX 35 ETF (CBIX)</h3>
            <div class="chart-info">
                <span class="symbol">BME: CBIX</span>
                <span class="market-status closed" id="ibex-status">Mercado Cerrado</span>
            </div>
        </div>
        <div class="chart-wrapper">
            <canvas id="ibex-chart" role="img" aria-label="Gráfico de evolución del precio del IBEX 35"></canvas>
        </div>
        <div class="chart-stats">
            <div class="stat">
                <span class="stat-label">Máximo del día:</span>
                <span class="stat-value" id="ibex-high">&euro;9.95</span>
            </div>
            <div class="stat">
                <span class="stat-label">Mínimo del día:</span>
                <span class="stat-value" id="ibex-low">&euro;9.75</span>
            </div>
            <div class="stat">
                <span class="stat-label">Volumen:</span>
                <span class="stat-value" id="ibex-volume">1.2M</span>
            </div>
        </div>
    </div>
</div>

<div class="etf-comparison">
    <h2 class="section-title">Comparativa de ETFs</h2>
    <p class="section-desc">Rendimiento comparativo de los principales fondos</p>

    <div class="comparison-chart">
        <canvas id="performanceChart" role="img" aria-label="Gráfico comparativo de rendimiento entre ETFs"></canvas>
    </div>

    <div class="etf-details">
        <div class="etf-card">
            <div class="etf-header"><h4>S&amp;P 500 ETF</h4></div>
            <div class="etf-content">
                <p>El ETF más líquido del mundo que replica el índice S&amp;P 500, compuesto por las 500 mayores empresas estadounidenses.</p>
                <ul class="etf-features">
                    <li><i class="fas fa-percentage" aria-hidden="true"></i> <strong>Expense Ratio:</strong> 0.09%</li>
                    <li><i class="fas fa-layer-group" aria-hidden="true"></i> <strong>Activos:</strong> $400B+</li>
                    <li><i class="fas fa-calendar-alt" aria-hidden="true"></i> <strong>Desde:</strong> 1993</li>
                    <li><i class="fas fa-industry" aria-hidden="true"></i> <strong>Sectores:</strong> Tecnología, Salud, Finanzas</li>
                </ul>
            </div>
        </div>

        <div class="etf-card">
            <div class="etf-header"><h4>MSCI World ETF</h4></div>
            <div class="etf-content">
                <p>ETF que sigue el índice MSCI World, compuesto por empresas de 23 países desarrollados, ofreciendo exposición global.</p>
                <ul class="etf-features">
                    <li><i class="fas fa-percentage" aria-hidden="true"></i> <strong>Expense Ratio:</strong> 0.24%</li>
                    <li><i class="fas fa-layer-group" aria-hidden="true"></i> <strong>Activos:</strong> $25B+</li>
                    <li><i class="fas fa-calendar-alt" aria-hidden="true"></i> <strong>Desde:</strong> 2012</li>
                    <li><i class="fas fa-industry" aria-hidden="true"></i> <strong>Sectores:</strong> Diversificado global</li>
                </ul>
            </div>
        </div>

        <div class="etf-card">
            <div class="etf-header"><h4>IBEX 35 ETF</h4></div>
            <div class="etf-content">
                <p>ETF que replica el índice IBEX 35, compuesto por las 35 empresas más líquidas de la Bolsa de Madrid.</p>
                <ul class="etf-features">
                    <li><i class="fas fa-percentage" aria-hidden="true"></i> <strong>Expense Ratio:</strong> 0.15%</li>
                    <li><i class="fas fa-layer-group" aria-hidden="true"></i> <strong>Activos:</strong> &euro;1B+</li>
                    <li><i class="fas fa-calendar-alt" aria-hidden="true"></i> <strong>Desde:</strong> 2006</li>
                    <li><i class="fas fa-industry" aria-hidden="true"></i> <strong>Sectores:</strong> Banca, Energía, Turismo</li>
                </ul>
            </div>
        </div>
    </div>
</div>

<div class="educational-content">
    <h2 class="section-title">¿Por qué seguir estos ETFs?</h2>
    <p class="section-desc">Educación financiera para estudiantes</p>

    <div class="educational-grid">
        <div class="edu-card">
            <div class="edu-icon"><i class="fas fa-university" aria-hidden="true"></i></div>
            <h3>Diversificación</h3>
            <p>Los ETFs permiten invertir en cientos de empresas con una sola operación, reduciendo el riesgo.</p>
        </div>
        <div class="edu-card">
            <div class="edu-icon"><i class="fas fa-euro-sign" aria-hidden="true"></i></div>
            <h3>Bajo Coste</h3>
            <p>Comisiones mucho más bajas que los fondos de inversión tradicionales, ideal para estudiantes.</p>
        </div>
        <div class="edu-card">
            <div class="edu-icon"><i class="fas fa-chart-bar" aria-hidden="true"></i></div>
            <h3>Transparencia</h3>
            <p>Sabes exactamente en qué empresas inviertes y el precio se actualiza en tiempo real.</p>
        </div>
        <div class="edu-card">
            <div class="edu-icon"><i class="fas fa-graduation-cap" aria-hidden="true"></i></div>
            <h3>Educación Práctica</h3>
            <p>Seguir estos mercados te ayuda a entender cómo funcionan los mercados financieros.</p>
        </div>
    </div>

    <div class="disclaimer">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <p>
            <strong>Importante:</strong> Esta información es solo con fines educativos. No constituye asesoramiento de inversión. Los mercados financieros implican riesgos. Consulta con un asesor financiero antes de tomar decisiones de inversión.
        </p>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="{{ asset('js/api-estadisticas.js') }}"></script>
@endpush
