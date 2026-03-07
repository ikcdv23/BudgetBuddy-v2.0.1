@extends('layouts.budgetbuddy')

@section('title', 'Dashboard Desktop')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/desktop.css') }}" />
@endpush

@section('content')
<!-- Page Header -->
<div class="page-header">
    <h1 class="page-title">Pagina principal</h1>
</div>

<div class="desktop-grid">
    <!-- Cuentas y Balance total -->
    <section class="desktop-left-column">
        <!-- Selección de Cuentas Bancarias -->
        <div class="card">
            <div class="card-header-compact">
                <h2 class="card-title">Mis Cuentas</h2>
                <div class="account-selector">
                    <select id="bankAccountSelect" aria-label="Selecciona una cuenta bancaria" class="account-dropdown">
                        <option>Cargando cuentas...</option>
                    </select>
                    <div class="dropdown-arrow">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
            </div>

            <div class="account-info-display is-loading" id="accountCard">
                <div class="account-header">
                    <div class="bank-logo">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="bank-info">
                        <h3 class="bank-name">Cargando...</h3>
                        <div class="account-type">...</div>
                    </div>
                </div>

                <div class="account-details-grid">
                    <div class="detail-card">
                        <div class="detail-label">
                            <i class="fas fa-hashtag"></i> IBAN
                        </div>
                        <div class="detail-value iban-number">ESXX XXXX...</div>
                        <button class="copy-btn" title="Copiar IBAN">
                            <i class="far fa-copy"></i>
                        </button>
                    </div>

                    <div class="detail-card">
                        <div class="detail-label">
                            <i class="fas fa-euro-sign"></i> Saldo disponible
                        </div>
                        <div class="detail-value balance-amount">--- &euro;</div>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 10px; align-items: center; margin-top: 20px;">
                <button id="open-account-modal-btn" class="btn-primary" title="Añadir nueva cuenta" aria-label="Añadir nueva cuenta">
                    <i class="fas fa-plus"></i>
                </button>
                <button id="open-transfer-modal-btn" class="btn-primary" title="Nuevo traspaso" aria-label="Nuevo traspaso" style="background: #3b82f6">
                    <i class="fas fa-exchange-alt"></i> Traspaso
                </button>
            </div>

            <!--=== Modal de creación de Nueva Cuenta ===-->
            <dialog id="account-modal" class="tag-modal" aria-labelledby="account-modal-title" aria-modal="true">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="account-modal-title">
                            <i class="fas fa-university" aria-hidden="true"></i> Nueva Cuenta
                        </h3>
                        <button class="close-modal" id="close-account-modal-btn" aria-label="Cerrar ventana modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <div class="modal-body">
                        <form id="create-account-form">
                            <div class="form-group">
                                <label for="acc-name">Nombre del Banco</label>
                                <input type="text" id="acc-name" name="account_name" placeholder="Ej: Santander Ahorro" required aria-required="true" />
                            </div>

                            <div class="form-group">
                                <label for="acc-iban">IBAN</label>
                                <div style="display: flex; align-items: stretch; border: 1px solid #d1d5db; border-radius: 8px; overflow: hidden;">
                                    <select id="acc-iban-country" name="iban_country" aria-label="País del IBAN" style="border: none; background: #f9fafb; padding: 8px 5px; font-weight: 600; color: #374151; cursor: pointer; width: 60px; text-align: center; border-right: 1px solid #e5e7eb;">
                                        <option value="ES" selected>ES</option>
                                        <option value="FR">FR</option>
                                        <option value="DE">DE</option>
                                        <option value="IT">IT</option>
                                        <option value="PT">PT</option>
                                    </select>
                                    <input type="text" id="acc-iban" name="iban_number" placeholder="0000 0000 00..." required aria-required="true" data-format="iban" maxlength="27" inputmode="numeric" style="border: none; flex: 1; padding-left: 10px; border-radius: 0;" />
                                </div>
                                <p id="iban-help" style="font-size: 0.75rem; color: #1f2937; margin-top: 4px;">
                                    Solo los 22 dígitos restantes.
                                </p>
                            </div>

                            <div class="form-group">
                                <label for="acc-balance">Saldo Inicial</label>
                                <input type="number" id="acc-balance" name="initial_balance" step="0.01" placeholder="0.00" required aria-required="true" />
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button class="btn-secondary" id="cancel-account-btn">Cancelar</button>
                        <button class="btn-primary" id="save-account-btn">Guardar</button>
                    </div>
                </div>
            </dialog>

            <!--=== Modal de Traspaso ===-->
            <dialog id="transfer-modal" class="tag-modal" aria-labelledby="transfer-modal-title" aria-modal="true">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="transfer-modal-title">
                            <i class="fas fa-exchange-alt" aria-hidden="true"></i> Nuevo Traspaso
                        </h3>
                        <button class="close-modal" id="close-transfer-modal-btn" aria-label="Cerrar ventana modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <form id="transfer-form" class="modal-body">
                        <div class="form-group">
                            <label for="transfer-origin-account">Cuenta origen</label>
                            <select id="transfer-origin-account" class="account-dropdown">
                                <option value="">Seleccionar cuenta...</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Destino del traspaso</label>
                            <div class="card-type-selector" role="radiogroup">
                                <label class="type-option">
                                    <input type="radio" name="transfer_dest_type" value="own_account" checked />
                                    <div class="type-content">
                                        <i class="fas fa-university" style="color: #3b82f6"></i>
                                        <span>Cuenta propia</span>
                                    </div>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="transfer_dest_type" value="external_iban" />
                                    <div class="type-content">
                                        <i class="fas fa-external-link-alt" style="color: #f59e0b"></i>
                                        <span>IBAN externo</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="form-group" id="transfer-dest-account-group">
                            <label for="transfer-dest-account">Cuenta destino</label>
                            <select id="transfer-dest-account" class="account-dropdown">
                                <option value="">Seleccionar cuenta...</option>
                            </select>
                        </div>

                        <div class="form-group" id="transfer-dest-iban-group" style="display: none">
                            <label for="transfer-dest-iban">IBAN destino</label>
                            <input type="text" id="transfer-dest-iban" placeholder="ES00 0000 0000 0000 0000 0000" maxlength="34" />
                        </div>

                        <div class="form-group">
                            <label for="transfer-amount">Monto (&euro;)</label>
                            <input type="number" id="transfer-amount" step="0.01" placeholder="0.00" required />
                        </div>

                        <div class="form-group">
                            <label for="transfer-description">Concepto</label>
                            <input type="text" id="transfer-description" placeholder="Ej: Traspaso a cuenta ahorro" required />
                        </div>
                    </form>

                    <div class="modal-footer">
                        <button class="btn-secondary" id="cancel-transfer-btn">Cancelar</button>
                        <button class="btn-primary" id="save-transfer-btn">Realizar Traspaso</button>
                    </div>
                </div>
            </dialog>
        </div>

        <!-- Tarjetas vinculadas -->
        <div class="cards-section-wrapper" style="margin-top: 30px">
            <div class="card-header-compact" style="padding: 0 5px; margin-bottom: 15px">
                <h2 class="card-title" style="font-size: 22px">Tarjetas vinculadas</h2>
                <a href="/misTarjetas" class="view-all-btn" style="font-size: 14px">
                    Gestionar <i class="fas fa-arrow-right"></i>
                </a>
            </div>

            <div id="dashboard-cards-container" class="dashboard-cards-grid">
                <div style="width: 100%; text-align: center; padding: 30px; color: #9ca3af;">
                    <i class="fas fa-spinner fa-spin"></i> Cargando tarjetas...
                </div>
            </div>
        </div>
    </section>

    <dialog id="card-modal" class="tag-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-credit-card"></i> Nueva Tarjeta</h3>
                <button class="close-modal" id="close-card-modal-btn">&times;</button>
            </div>

            <form id="create-card-form" class="modal-body">
                <div class="form-group">
                    <label for="card-account-select">Cuenta Vinculada</label>
                    <div style="position: relative">
                        <select id="card-account-select" class="account-dropdown" style="padding: 8px 10px; font-size: 14px"></select>
                        <i class="fas fa-chevron-down" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 12px; color: #757575;"></i>
                    </div>
                </div>

                <div class="form-group">
                    <label for="card-alias">Alias de la tarjeta</label>
                    <input type="text" id="card-alias" placeholder="Ej: Para Viajes" required maxlength="20" />
                </div>

                <div class="form-group">
                    <span id="card-type-label" style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo de Tarjeta</span>
                    <div class="card-type-selector" role="radiogroup" aria-labelledby="card-type-label">
                        <label class="type-option">
                            <input type="radio" name="card_type" value="debit" checked aria-label="Visa Débito" />
                            <div class="type-content visa-style">
                                <i class="fab fa-cc-visa" aria-hidden="true"></i>
                                <span>Visa (Débito)</span>
                            </div>
                        </label>
                        <label class="type-option">
                            <input type="radio" name="card_type" value="credit" aria-label="Mastercard Crédito" />
                            <div class="type-content master-style">
                                <i class="fab fa-cc-mastercard" aria-hidden="true"></i>
                                <span>Mastercard (Crédito)</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div style="display: flex; gap: 15px">
                    <div class="form-group" style="flex: 1">
                        <label for="card-digits">Últimos 4 dígitos</label>
                        <input type="text" id="card-digits" placeholder="1234" maxlength="4" pattern="\d{4}" required data-format="digits" inputmode="numeric" style="letter-spacing: 2px; text-align: center" />
                    </div>
                    <div class="form-group" style="flex: 1">
                        <label for="card-exp">Caducidad</label>
                        <input type="month" id="card-exp" required />
                        <span style="font-size: 0.7rem; color: #6b7280; margin-top: 4px; display: block;">
                            Ej: 12/2028 o usa el calendario
                        </span>
                    </div>
                </div>
            </form>

            <div class="modal-footer">
                <button class="btn-secondary" id="cancel-card-btn">Cancelar</button>
                <button class="btn-primary" id="save-card-btn">Guardar Tarjeta</button>
            </div>
        </div>
    </dialog>

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
                <div class="delete-tag-item" id="delete-tag-area">
                    <div class="delete-tag-icon" style="margin-right: 10px; margin-left: 10px;">
                        <i class="fas fa-trash"></i>
                    </div>
                    <div class="delete-tag-text">
                        <h3>Eliminar etiqueta</h3>
                        <p>Arrastra aquí para eliminar</p>
                    </div>
                </div>
            </div>

            <div id="delete-indicator" class="delete-indicator"></div>
        </div>

        <!-- Metas Financieras -->
        <div class="card" style="min-height: 360px">
            <div class="card-header-compact">
                <h2 class="card-title">Metas Financieras</h2>
                <button onclick="openGoalModal()" style="border: none; background: #e5e7eb; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: var(--primary);" aria-label="Añadir nueva meta financiera">
                    <i class="fas fa-plus"></i>
                </button>
            </div>

            <div class="goals-list" id="goals-container">
                <div style="text-align: center; padding: 20px; color: #6b7280">
                    <i class="fas fa-spinner fa-spin"></i> Cargando metas...
                </div>
            </div>
        </div>
    </section>
</div>

<!-- Modal para añadir etiquetas -->
<dialog id="tagModal" class="tag-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>
                <i class="fas fa-tag" style="color: #4a5568"></i> Crear Nueva Etiqueta
            </h3>
            <button class="close-modal" aria-label="Cerrar ventana de nueva etiqueta" id="closeModal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label for="tagName">Nombre de la etiqueta</label>
                <input type="text" id="tagName" placeholder="Ej: Gimnasio, Netflix, Gasolina..." aria-required="true" />
            </div>
            <div class="form-group">
                <span id="color-label" style="display: block; margin-bottom: 5px; font-weight: bold">Color de la etiqueta</span>
                <div class="color-picker" role="radiogroup" aria-labelledby="color-label">
                    <div class="color-option" style="background-color: #34d399" data-color="#34d399"></div>
                    <div class="color-option" style="background-color: #60a5fa" data-color="#60a5fa"></div>
                    <div class="color-option" style="background-color: #fbbf24" data-color="#fbbf24"></div>
                    <div class="color-option" style="background-color: #ef4444" data-color="#ef4444"></div>
                    <div class="color-option" style="background-color: #a855f7" data-color="#a855f7"></div>
                    <div class="color-option" style="background-color: #10b981" data-color="#10b981"></div>
                </div>
            </div>
            <div class="form-group">
                <span id="icon-label" for="tagIcon">Icono</span>
                <div class="icon-picker" role="radiogroup" aria-labelledby="icon-label">
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

<!-- Modal para añadir metas financieras -->
<dialog id="goal-modal" class="tag-modal" aria-labelledby="goal-modal-title" aria-modal="true">
    <div class="modal-content">
        <div class="modal-header">
            <h3 id="goal-modal-title">
                <i class="fas fa-bullseye" aria-hidden="true"></i> Nueva Meta
            </h3>
            <button class="close-modal" id="close-goal-modal-btn" aria-label="Cerrar ventana modal">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>

        <form id="goal-form" class="modal-body">
            <input type="hidden" id="goal-id" />

            <div class="form-group">
                <label for="goal-name">Nombre de la Meta</label>
                <input type="text" id="goal-name" name="goal_name" placeholder="Ej: Viaje a Japón" required maxlength="30" />
            </div>

            <div style="display: flex; gap: 15px">
                <div class="form-group" style="flex: 1">
                    <label for="goal-target">Meta (&euro;)</label>
                    <input type="number" id="goal-target" name="goal_target" placeholder="2000" required step="10" />
                </div>
                <div class="form-group" style="flex: 1">
                    <label for="goal-current">Ahorrado (&euro;)</label>
                    <input type="number" id="goal-current" name="goal_current" placeholder="0" required step="10" />
                </div>
            </div>

            <div class="form-group">
                <label id="icon-label">Icono</label>
                <div class="icon-picker" id="goal-icon-picker" role="radiogroup" aria-labelledby="icon-label">
                    <div class="icon-option selected" data-icon="plane" role="radio" aria-checked="true" tabindex="0" aria-label="Avión">
                        <i class="fas fa-plane" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="car" role="radio" aria-checked="false" tabindex="0" aria-label="Coche">
                        <i class="fas fa-car" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="home" role="radio" aria-checked="false" tabindex="0" aria-label="Casa">
                        <i class="fas fa-home" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="laptop" role="radio" aria-checked="false" tabindex="0" aria-label="Ordenador">
                        <i class="fas fa-laptop" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="mobile-alt" role="radio" aria-checked="false" tabindex="0" aria-label="Móvil">
                        <i class="fas fa-mobile-alt" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="gift" role="radio" aria-checked="false" tabindex="0" aria-label="Regalo">
                        <i class="fas fa-gift" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="gamepad" role="radio" aria-checked="false" tabindex="0" aria-label="Videojuegos">
                        <i class="fas fa-gamepad" aria-hidden="true"></i>
                    </div>
                    <div class="icon-option" data-icon="graduation-cap" role="radio" aria-checked="false" tabindex="0" aria-label="Graduación">
                        <i class="fas fa-graduation-cap" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </form>

        <div class="modal-footer" style="justify-content: space-between">
            <button class="btn-secondary" id="delete-goal-btn" style="color: #ef4444; border-color: #ef4444; display: none" aria-label="Eliminar meta actual">
                <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
            <div style="display: flex; gap: 10px">
                <button class="btn-secondary" id="cancel-goal-btn">Cancelar</button>
                <button class="btn-primary" id="save-goal-btn">Guardar Meta</button>
            </div>
        </div>
    </div>
</dialog>
@endsection

@push('scripts')
<script src="{{ asset('js/desktop.js') }}"></script>
@endpush
