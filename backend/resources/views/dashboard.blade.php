@extends('layouts.app')

@section('title', 'Panel General')

@section('content')

<div class="desktop-container">
    <!-- Main Content -->
    <main class="desktop-main">
        <!-- Page Header -->
        <div class="page-header">
            <h1 class="page-title">
                Pagina principal
                <div class="date-container">28 Abr, 2028</div>
            </h1>
        </div>

        <div class="desktop-grid">
            <!-- Tarjeta y Balance total -->
            <section class="desktop-left-column">
                <!-- Tarjeta principal con navegación -->
                <div class="card card-small">
                    <div class="card-header-compact">
                        <h2 class="card-title" id="card-title">Tarjeta 1</h2>
                        <div class="card-nav">
                            <button class="card-nav-btn prev-btn" aria-label="Previous card"></button>
                            <i class="fas fa-chevron-left"></i>
                            <span class="card-counter">1/3</span>
                            <button class="card-nav-btn next-btn" aria-label="Next card">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div class="cards-carousel">
                        <!-- Card 1 -->
                        <div class="credit-card-compact card-black active">
                            <div class="card-type">
                                <span>EHT</span>
                                <span>1.827,50€</span>
                            </div>
                            <div class="card-number">**** **** **** 2543</div>
                            <div class="card-details">
                                <div class="card-expiry">Expiry 08/31</div>
                                <div class="card-cvv">CVV 123</div>
                            </div>
                        </div>

                        <!-- Card 2 -->
                        <div class="credit-card-compact card-blue">
                            <div class="card-type">
                                <span>VISA</span>
                                <span>1.250,50€</span>
                            </div>
                            <div class="card-number">**** **** **** 9800</div>
                            <div class="card-details">
                                <div class="card-expiry">Expiry 04/26</div>
                                <div class="card-cvv">CVV 456</div>
                            </div>
                        </div>

                        <!-- Card 3 -->
                        <div class="credit-card-compact card-orange">
                            <div class="card-type">
                                <span>VISA</span>
                                <span>2.150,00€</span>
                            </div>
                            <div class="card-number">**** **** **** 0032</div>
                            <div class="card-details">
                                <div class="card-expiry">Expiry 09/24</div>
                                <div class="card-cvv">CVV 789</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Balance total con transacciones -->
                <div class="card balance-card">
                    <div class="card-header-compact">
                        <h2 class="card-title">Balance total</h2>
                        <div class="date-badge" style="color: var(--border);">Este mes</div>
                    </div>

                    <div class="balance-main">
                        <div class="balance-amount">30.300€</div>
                        <div class="balance-percent">
                            <i class="fas fa-arrow-up"></i> 3.2
                        </div>
                    </div>

                    <div class="balance-actions">
                        <button class="btn btn-deposit">
                            <i class="fas fa-plus"></i> Depósito
                        </button>
                        <button class="btn btn-transfer">
                            <i class="fas fa-exchange-alt"></i> Transferencia
                        </button>
                    </div>

                    <div class="balance-details-compact">
                        <div class="balance-item-compact">
                            <div class="balance-label">Saldo principal</div>
                            <div class="balance-value">23.300€</div>
                        </div>
                        <div class="balance-item-compact">
                            <div class="balance-label">Saldo de crédito</div>
                            <div class="balance-value">5.000€</div>
                        </div>
                    </div>

                    <div class="progress-container">
                        <div class="progress-header">
                            <span class="progress-label">2.000€ usados del crédito</span>
                            <span class="progress-percentage">42%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                    </div>

                    <!-- Transacciones recientes -->
                    <div class="transactions-list">
                        <h3 class="transactions-title" style="margin-bottom: 25px;">
                            <i class="fas fa-exchange-alt"></i> Transacciones Recientes
                        </h3>
                        <div class="transaction-item">
                            <div class="transaction-left">
                                <div class="transaction-icon red">
                                    <i class="fas fa-coffee"></i>
                                </div>
                                <div class="transaction-info">
                                    <h4>Starbucks</h4>
                                    <div class="transaction-date">12 Mayo, 15:40</div>
                                </div>
                            </div>
                            <div class="transaction-amount negative">-25,90€</div>
                        </div>

                        <div class="transaction-item">
                            <div class="transaction-left">
                                <div class="transaction-icon">
                                    <i class="fas fa-arrow-down"></i>
                                </div>
                                <div class="transaction-info">
                                    <h4>Rembolso Mendibil</h4>
                                    <div class="transaction-date">11 Mayo, 14:10</div>
                                </div>
                            </div>
                            <div class="transaction-amount positive">+340,80€</div>
                        </div>

                        <div class="transaction-item">
                            <div class="transaction-left">
                                <div class="transaction-icon red">
                                    <i class="fas fa-home"></i>
                                </div>
                                <div class="transaction-info">
                                    <h4>Pago de la renta</h4>
                                    <div class="transaction-date">11 Mayo, 16:00</div>
                                </div>
                            </div>
                            <div class="transaction-amount negative">-1.200,00€</div>
                        </div>

                        <div class="transaction-item">
                            <div class="transaction-left">
                                <div class="transaction-icon red">
                                    <i class="fas fa-shopping-bag"></i>
                                </div>
                                <div class="transaction-info">
                                    <h4>Arenal</h4>
                                    <div class="transaction-date">11 Mayo, 13:55</div>
                                </div>
                            </div>
                            <div class="transaction-amount negative">-743,00€</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Etiquetas y Metas Financieras -->
            <section class="desktop-right-column">
                <!-- Mis Etiquetas -->
                <div class="card tags-card">
                    <div class="card-header-compact">
                        <h2 class="card-title">Mis Etiquetas</h2>
                        <button class="add-tag-btn" id="desktop-add-tag">
                            <i class="fas fa-plus"></i> Nueva
                        </button>
                    </div>

                    <div class="tags-list">
                        <div class="tag-item" style="--tag-color: #34d399" draggable="true" data-id="1">
                            <div class="tag-icon">
                                <i class="fas fa-dumbbell"></i>
                            </div>
                            <div class="tag-info">
                                <h3>Gimnasio</h3>
                            </div>
                        </div>

                        <div class="tag-item" style="--tag-color: #60a5fa" draggable="true" data-id="2">
                            <div class="tag-icon">
                                <i class="fas fa-wifi"></i>
                            </div>
                            <div class="tag-info">
                                <h3>Internet</h3>
                            </div>
                        </div>

                        <div class="tag-item" style="--tag-color: #fbbf24" draggable="true" data-id="3">
                            <div class="tag-icon">
                                <i class="fas fa-gas-pump"></i>
                            </div>
                            <div class="tag-info">
                                <h3>Gasolina</h3>
                            </div>
                        </div>

                        <div class="tag-item" style="--tag-color: #ef4444" draggable="true" data-id="4">
                            <div class="tag-icon">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="tag-info">
                                <h3>Supermercado</h3>
                            </div>
                        </div>

                        <div class="tag-item" style="--tag-color: #a855f7" draggable="true" data-id="5">
                            <div class="tag-icon">
                                <i class="fas fa-gamepad"></i>
                            </div>
                            <div class="tag-info">
                                <h3>Entretenimiento</h3>
                            </div>
                        </div>

                        <!-- Змінено з Añadir etiqueta на Eliminar etiqueta -->
                        <div class="delete-tag-item" id="delete-tag-area">
                            <div class="delete-tag-icon" style="margin-right: 10px; margin-left: 10px;">
                                <i class="fas fa-trash"></i>
                            </div>
                            <div class="delete-tag-text">
                                <h4>Eliminar etiqueta</h4>
                                <p>Arrastra aquí para eliminar</p>
                            </div>
                        </div>
                    </div>

                    <div id="delete-indicator" class="delete-indicator"></div>
                </div>

                <!-- Metas Financieras -->
                <div class="card">
                    <div class="card-header-compact">
                        <h2 class="card-title">Metas Financieras</h2>
                        <button class="view-all-btn" style="font-size: 14px;">
                            Ver todas <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>

                    <div class="goals-list">
                        <div class="goal-item">
                            <div class="goal-left">
                                <div class="goal-progress">
                                    <svg class="progress-circle" viewBox="0 0 36 36">
                                        <circle class="progress-circle-bg" cx="18" cy="18" r="16"></circle>
                                        <circle class="progress-circle-fill" cx="18" cy="18" r="16" style="--progress: 30"></circle>
                                    </svg>
                                    <div class="progress-text">30%</div>
                                </div>
                                <div class="goal-info">
                                    <h4>Comprar iPhone 15</h4>
                                    <div class="goal-date">Fecha límite: 8 mayo 2024</div>
                                </div>
                            </div>
                            <div class="goal-stats">
                                <div class="goal-stat-item">
                                    <span class="goal-stat-label">Ahorrado</span>
                                    <span class="goal-stat-value ahorrado">360€</span>
                                </div>
                                <div class="goal-stat-item">
                                    <span class="goal-stat-label">Meta</span>
                                    <span class="goal-stat-value meta">1.200€</span>
                                </div>
                            </div>
                        </div>

                        <div class="goal-item">
                            <div class="goal-left">
                                <div class="goal-progress">
                                    <svg class="progress-circle" viewBox="0 0 36 36">
                                        <circle class="progress-circle-bg" cx="18" cy="18" r="16"></circle>
                                        <circle class="progress-circle-fill" cx="18" cy="18" r="16" style="--progress: 90"></circle>
                                    </svg>
                                    <div class="progress-text">90%</div>
                                </div>
                                <div class="goal-info">
                                    <h4>Nuevo portátil para la uni</h4>
                                    <div class="goal-date">Fecha límite: 16 agosto 2024</div>
                                </div>
                            </div>
                            <div class="goal-stats">
                                <div class="goal-stat-item">
                                    <span class="goal-stat-label">Ahorrado</span>
                                    <span class="goal-stat-value ahorrado">1.080€</span>
                                </div>
                                <div class="goal-stat-item">
                                    <span class="goal-stat-label">Meta</span>
                                    <span class="goal-stat-value meta">1.200€</span>
                                </div>
                            </div>
                        </div>

                        <div class="goal-item">
                            <div class="goal-left">
                                <div class="goal-progress">
                                    <svg class="progress-circle" viewBox="0 0 36 36">
                                        <circle class="progress-circle-bg" cx="18" cy="18" r="16"></circle>
                                        <circle class="progress-circle-fill" cx="18" cy="18" r="16" style="--progress: 77"></circle>
                                    </svg>
                                    <div class="progress-text">77%</div>
                                </div>
                                <div class="goal-info">
                                    <h4>Fiestas de graduación</h4>
                                    <div class="goal-date">Fecha límite: 12 mayo 2025</div>
                                </div>
                            </div>
                            <div class="goal-stats">
                                <div class="goal-stat-item">
                                    <span class="goal-stat-label">Ahorrado</span>
                                    <span class="goal-stat-value ahorrado">770€</span>
                                </div>
                                <div class="goal-stat-item">
                                    <span class="goal-stat-label">Meta</span>
                                    <span class="goal-stat-value meta">1.000€</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </main>
</div>

<!-- Modal para añadir etiquetas -->
<dialog id="tagModal" class="tag-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-tag"></i> Crear Nueva Etiqueta</h3>
            <button class="close-modal" id="closeModal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label for="tagName">Nombre de la etiqueta</label>
                <input type="text" id="tagName" placeholder="Ej: Gimnasio, Netflix, Gasolina..." />
            </div>
            <div class="form-group">
                <label for="tagColor">Color de la etiqueta</label>
                <div class="color-picker">
                    <div class="color-option" style="background-color: #34d399;" data-color="#34d399"></div>
                    <div class="color-option" style="background-color: #60a5fa;" data-color="#60a5fa"></div>
                    <div class="color-option" style="background-color: #fbbf24;" data-color="#fbbf24"></div>
                    <div class="color-option" style="background-color: #ef4444;" data-color="#ef4444"></div>
                    <div class="color-option" style="background-color: #a855f7;" data-color="#a855f7"></div>
                    <div class="color-option" style="background-color: #10b981;" data-color="#10b981"></div>
                </div>
            </div>
            <div class="form-group">
                <label for="tagIcon">Icono</label>
                <div class="icon-picker">
                    <div class="icon-option" data-icon="dumbbell"><i class="fas fa-dumbbell"></i></div>
                    <div class="icon-option" data-icon="wifi"><i class="fas fa-wifi"></i></div>
                    <div class="icon-option" data-icon="car"><i class="fas fa-car"></i></div>
                    <div class="icon-option" data-icon="shopping-cart"><i class="fas fa-shopping-cart"></i></div>
                    <div class="icon-option" data-icon="gamepad"><i class="fas fa-gamepad"></i></div>
                    <div class="icon-option" data-icon="tshirt"><i class="fas fa-tshirt"></i></div>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" id="cancelTag">Cancelar</button>
            <button class="btn-primary" id="saveTag">Crear Etiqueta</button>
        </div>
    </div>
</dialog>



<!-- Comentado temporalmente para evitar conflictos
    <script type="module" src="../js/main.js"></script> -->
@endsection