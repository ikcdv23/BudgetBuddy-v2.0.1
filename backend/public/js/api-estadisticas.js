// api-estadisticas.js - Con datos reales de API y header transparente

// Configuración de API
const API_CONFIG = {
    alphaVantageKey: 'TU_CLAVE_AQUI',
    useYahooAsBackup: true,
    updateInterval: 60000, // Actualizar cada 60 segundos
    simulateIfNoApi: true
};

// URLs de API
const API_URLS = {
    ibexRealtime: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EIBEX?interval=1m',
    ibexDaily: 'https://query1.finance.yahoo.com/v8/finance/chart/%5EIBEX?interval=1d&range=1mo',
    sp500: 'https://query1.finance.yahoo.com/v8/finance/chart/SPY',
    msciWorld: 'https://query1.finance.yahoo.com/v8/finance/chart/URTH'
};

// Datos iniciales
const initialData = {
    ibex: {
        precio: 17719.00,
        cambio: 38.50,
        cambioPorcentaje: 0.22,
        max: 17744.60,
        min: 17680.50,
        apertura: 17744.60,
        cierreAnterior: 17680.50
    },
    sp500: {
        precio: 451.42,
        cambio: 0.19,
        cambioPorcentaje: 0.04
    },
    msci: {
        precio: 120.45,
        cambio: 0.00,
        cambioPorcentaje: 0.00
    }
};

// Variables globales
let charts = {};
let currentTimeframe = "1D";
let marketData = { ...initialData };

document.addEventListener('DOMContentLoaded', function() {
    console.log("BudgetBuddy - Cargando estadísticas de mercado...");
    
    // 1. СУПЕР-ПРОСТИЙ ФІКС ДЛЯ HEADER
    fixHeaderTransparency();
    
    // 2. Actualizar fecha
    updateCurrentDate();
    
    // 3. Configurar botones de tiempo
    setupTimeButtons();
    
    // 4. Cargar datos REALES de la API
    loadRealMarketData();
    
    // 5. Configurar eventos
    setupEventListeners();
    
    // 6. Iniciar actualización automática
    startAutoUpdate();
});

// ============ СУПЕР-ПРОСТИЙ ФІКС ============
function fixHeaderTransparency() {
    const header = document.querySelector('.desktop-header');
    if (!header) return;
    
    // ВИДАЛИТИ ВСІ inline-стилі
    header.removeAttribute('style');
    
    // Просто додати клас "scrolled" з CSS
    header.classList.add('scrolled');
    
    // Простий скролл-ефект
    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            header.classList.add('scrolled-active');
        } else {
            header.classList.remove('scrolled-active');
        }
    });
    
    // Початковий стан
    if (window.scrollY > 20) {
        header.classList.add('scrolled-active');
    }
}

// ============ FUNCIONES DE API ============

async function loadRealMarketData() {
    console.log("📡 Obteniendo datos del mercado en tiempo real...");
    
    try {
        const [ibexData, sp500Data, msciData] = await Promise.allSettled([
            fetchYahooFinanceData('IBEX'),
            fetchYahooFinanceData('SPY'),
            fetchYahooFinanceData('URTH')
        ]);
        
        if (ibexData.status === 'fulfilled' && ibexData.value) {
            updateIBEXData(ibexData.value);
            console.log("✅ Datos del IBEX obtenidos correctamente");
        } else {
            console.warn("⚠️ No se pudieron obtener datos del IBEX, usando datos simulados");
            useSimulatedData('ibex');
        }
        
        if (sp500Data.status === 'fulfilled' && sp500Data.value) {
            updateSP500Data(sp500Data.value);
            console.log("✅ Datos del S&P 500 obtenidos correctamente");
        } else {
            useSimulatedData('sp500');
        }
        
        if (msciData.status === 'fulfilled' && msciData.value) {
            updateMSCIData(msciData.value);
            console.log("✅ Datos del MSCI World obtenidos correctamente");
        } else {
            useSimulatedData('msci');
        }
        
        createAllCharts();
        
        showNotification('Datos del mercado actualizados', 'success');
        
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        useAllSimulatedData();
        createAllCharts();
        showNotification('Usando datos simulados. Regístrate en Alpha Vantage para datos reales.', 'warning');
    }
}

async function fetchYahooFinanceData(symbol) {
    try {
        let url;
        
        if (symbol === 'IBEX') {
            url = `https://query1.finance.yahoo.com/v8/finance/chart/%5E${symbol}?interval=1m&range=1d`;
        } else {
            url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la respuesta');
        
        const data = await response.json();
        const result = data.chart.result[0];
        const meta = result.meta;
        const indicators = result.indicators;
        
        return {
            precio: meta.regularMarketPrice,
            cambio: meta.regularMarketPrice - meta.previousClose,
            cambioPorcentaje: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100),
            max: meta.regularMarketDayHigh,
            min: meta.regularMarketDayLow,
            apertura: meta.regularMarketOpen,
            cierreAnterior: meta.previousClose,
            volumen: meta.regularMarketVolume,
            timestamp: meta.regularMarketTime,
            historial: indicators.quote[0].close.slice(-20)
        };
        
    } catch (error) {
        console.warn(`Error obteniendo ${symbol}:`, error);
        return null;
    }
}

function updateIBEXData(data) {
    marketData.ibex = {
        precio: data.precio,
        cambio: data.cambio,
        cambioPorcentaje: data.cambioPorcentaje,
        max: data.max,
        min: data.min,
        apertura: data.apertura,
        cierreAnterior: data.cierreAnterior,
        volumen: data.volumen,
        historial1D: data.historial
    };
    
    updateIBEXUI();
}

function updateIBEXUI() {
    const ibex = marketData.ibex;
    
    document.getElementById('ibex-price').textContent = `€${ibex.precio.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
    
    const changeElement = document.getElementById('ibex-change');
    const isPositive = ibex.cambio >= 0;
    changeElement.textContent = `${isPositive ? '+' : ''}${ibex.cambio.toFixed(2)} (${isPositive ? '+' : ''}${ibex.cambioPorcentaje.toFixed(2)}%)`;
    changeElement.className = `change ${isPositive ? 'positive' : 'negative'}`;
    
    document.getElementById('ibex-high').textContent = `€${ibex.max.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
    document.getElementById('ibex-low').textContent = `€${ibex.min.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
    
    if (ibex.volumen) {
        document.getElementById('ibex-volume').textContent = formatVolume(ibex.volumen);
    }
}

function updateSP500Data(data) {
    marketData.sp500 = {
        precio: data.precio,
        cambio: data.cambio,
        cambioPorcentaje: data.cambioPorcentaje,
        max: data.max,
        min: data.min,
        volumen: data.volumen,
        historial1D: data.historial
    };
    
    updateSP500UI();
}

function updateSP500UI() {
    const sp500 = marketData.sp500;
    
    document.getElementById('sp500-price').textContent = `$${sp500.precio.toFixed(2)}`;
    
    const changeElement = document.getElementById('sp500-change');
    const isPositive = sp500.cambio >= 0;
    changeElement.textContent = `${isPositive ? '+' : ''}${sp500.cambio.toFixed(2)} (${isPositive ? '+' : ''}${sp500.cambioPorcentaje.toFixed(2)}%)`;
    changeElement.className = `change ${isPositive ? 'positive' : 'negative'}`;
    
    document.getElementById('sp500-high').textContent = `$${sp500.max.toFixed(2)}`;
    document.getElementById('sp500-low').textContent = `$${sp500.min.toFixed(2)}`;
    
    if (sp500.volumen) {
        document.getElementById('sp500-volume').textContent = formatVolume(sp500.volumen);
    }
}

function updateMSCIData(data) {
    marketData.msci = {
        precio: data.precio,
        cambio: data.cambio,
        cambioPorcentaje: data.cambioPorcentaje,
        max: data.max,
        min: data.min,
        volumen: data.volumen,
        historial1D: data.historial
    };
    
    updateMSCIUI();
}

function updateMSCIUI() {
    const msci = marketData.msci;
    
    document.getElementById('msci-price').textContent = `$${msci.precio.toFixed(2)}`;
    
    const changeElement = document.getElementById('msci-change');
    const isPositive = msci.cambio >= 0;
    changeElement.textContent = `${isPositive ? '+' : ''}${msci.cambio.toFixed(2)} (${isPositive ? '+' : ''}${msci.cambioPorcentaje.toFixed(2)}%)`;
    changeElement.className = `change ${isPositive ? 'positive' : 'negative'}`;
    
    document.getElementById('msci-high').textContent = `$${msci.max.toFixed(2)}`;
    document.getElementById('msci-low').textContent = `$${msci.min.toFixed(2)}`;
    
    if (msci.volumen) {
        document.getElementById('msci-volume').textContent = formatVolume(msci.volumen);
    }
}

function useSimulatedData(etf) {
    console.log(`Usando datos simulados para ${etf}`);
    const variation = (Math.random() - 0.5) * (etf === 'ibex' ? 50 : 2);
    
    marketData[etf] = {
        ...initialData[etf],
        precio: initialData[etf].precio + variation,
        cambio: initialData[etf].cambio + variation,
        cambioPorcentaje: ((initialData[etf].cambio + variation) / initialData[etf].precio * 100),
        historial1D: generateSimulatedData(initialData[etf].precio, 5)
    };
}

function useAllSimulatedData() {
    Object.keys(initialData).forEach(etf => {
        useSimulatedData(etf);
    });
}

// ============ FUNCIONES DE GRÁFICOS ============

function createAllCharts() {
    createETFChart('sp500', '#217a4a');
    createETFChart('msci', '#3b82f6');
    createETFChart('ibex', '#ef4444');
    createComparisonChart();
    updateMarketStatus();
}

function createETFChart(etfId, color) {
    const canvas = document.getElementById(`${etfId}-chart`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const data = marketData[etfId];
    
    if (charts[etfId]) {
        charts[etfId].destroy();
    }
    
    const labels = getLabelsForTimeframe(currentTimeframe);
    const chartData = getChartDataForTimeframe(etfId, currentTimeframe);
    
    charts[etfId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: chartData,
                borderColor: color,
                backgroundColor: color + '20',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4
            }]
        },
        options: getChartOptions(etfId)
    });
}

function createComparisonChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    
    if (charts.comparison) {
        charts.comparison.destroy();
    }
    
    charts.comparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'IBEX 35',
                    data: [0, 2.8, 5.2, 7.5, 10.1, 12.3],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'S&P 500',
                    data: [0, 3.2, 6.1, 9.5, 12.8, 15.2],
                    borderColor: '#217a4a',
                    backgroundColor: 'rgba(33, 122, 74, 0.1)',
                    borderWidth: 3,
                    fill: true
                },
                {
                    label: 'MSCI World',
                    data: [0, 2.5, 4.8, 7.3, 9.7, 11.5],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true
                }
            ]
        },
        options: getComparisonChartOptions()
    });
}

// ============ FUNCIONES AUXILIARES ============

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateStr = now.toLocaleDateString('es-ES', options);
    document.getElementById('current-date').textContent = dateStr;
}

function setupTimeButtons() {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTimeframe = this.dataset.timeframe;
            updateChartsTimeframe();
        });
    });
}

function updateChartsTimeframe() {
    ['sp500', 'msci', 'ibex'].forEach(etfId => {
        if (charts[etfId]) {
            charts[etfId].data.labels = getLabelsForTimeframe(currentTimeframe);
            charts[etfId].data.datasets[0].data = getChartDataForTimeframe(etfId, currentTimeframe);
            charts[etfId].update();
        }
    });
}

function getLabelsForTimeframe(timeframe) {
    const now = new Date();
    switch(timeframe) {
        case '1D':
            return ['9:30', '11:00', '12:30', '14:00', now.getHours() + ':' + now.getMinutes().toString().padStart(2, '0')];
        case '1W':
            return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        case '1M':
            const days = [];
            for (let i = 6; i >= 0; i -= 2) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                days.push(date.getDate() + '/' + (date.getMonth() + 1));
            }
            return days;
        default:
            return ['Punto 1', 'Punto 2', 'Punto 3', 'Punto 4', 'Punto 5'];
    }
}

function getChartDataForTimeframe(etfId, timeframe) {
    const basePrice = marketData[etfId].precio;
    
    switch(timeframe) {
        case '1D':
            if (marketData[etfId].historial1D) {
                return marketData[etfId].historial1D;
            }
            return generateSimulatedData(basePrice, 5);
        default:
            return generateSimulatedData(basePrice, 5);
    }
}

function generateSimulatedData(basePrice, points) {
    const data = [basePrice * 0.995];
    for (let i = 1; i < points; i++) {
        const change = (Math.random() - 0.5) * basePrice * 0.01;
        data.push(data[i-1] + change);
    }
    data[data.length-1] = basePrice;
    return data;
}

function getChartOptions(etfId) {
    const isIbex = etfId === 'ibex';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const symbol = isIbex ? '€' : '$';
                        const value = isIbex ? context.parsed.y.toLocaleString('es-ES') : context.parsed.y.toFixed(2);
                        return `${symbol}${value}`;
                    }
                }
            }
        },
        scales: {
            x: { display: false },
            y: {
                ticks: {
                    callback: (value) => {
                        const symbol = isIbex ? '€' : '$';
                        const formatted = isIbex ? value.toLocaleString('es-ES') : value.toFixed(0);
                        return symbol + formatted;
                    }
                }
            }
        },
        interaction: { intersect: false }
    };
}

function getComparisonChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
                }
            }
        },
        scales: {
            y: {
                ticks: { callback: (value) => value + '%' },
                title: { display: true, text: 'Rendimiento (%)' }
            }
        }
    };
}

function formatVolume(volume) {
    if (volume >= 1000000) {
        return (volume / 1000000).toFixed(1) + 'M';
    } else if (volume >= 1000) {
        return (volume / 1000).toFixed(1) + 'K';
    }
    return volume.toString();
}

function updateMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const isMarketOpen = hour >= 15 && hour < 21;
    const isSpanishMarketOpen = hour >= 9 && hour < 17.5;
    
    document.getElementById('sp500-status').textContent = 
        isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado';
    document.getElementById('sp500-status').className = 
        `market-status ${isMarketOpen ? 'open' : 'closed'}`;
    
    document.getElementById('msci-status').textContent = 
        isMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado';
    
    document.getElementById('ibex-status').textContent = 
        isSpanishMarketOpen ? 'Mercado Abierto' : 'Mercado Cerrado';
    document.getElementById('ibex-status').className = 
        `market-status ${isSpanishMarketOpen ? 'open' : 'closed'}`;
}

function startAutoUpdate() {
    setInterval(() => {
        loadRealMarketData();
    }, API_CONFIG.updateInterval);
    
    setInterval(updateCurrentDate, 60000);
}

function setupEventListeners() {
    document.querySelector('.notification-btn')?.addEventListener('click', () => {
        showNotification('Los datos se actualizan automáticamente cada minuto', 'info');
    });
    
    document.querySelectorAll('.edu-card').forEach(card => {
        card.addEventListener('click', function() {
            const title = this.querySelector('h3').textContent;
            showNotification(`Educación: ${title} - Más información en nuestro blog`, 'info');
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-family: 'Roboto', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

console.log('✅ BudgetBuddy - Módulo de estadísticas cargado');