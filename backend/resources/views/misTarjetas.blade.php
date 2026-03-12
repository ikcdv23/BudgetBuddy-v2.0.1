@extends('layouts.budgetbuddy')

@section('title', 'Mis Tarjetas')

@push('styles')
<link rel="stylesheet" href="{{ asset('css/tarjetas.css') }}" />
@endpush

@section('content')
<div class="page-header">
    <h1 class="page-title">
        Mis tarjetas
    </h1>
</div>

<!-- Sección superior: 2 columnas (carrusel + detalle) -->
<div class="tarjetas-top-grid">
    <!-- Izquierda: carrusel de tarjetas -->
    <div class="card tarjetas-carousel-card">
        <div class="card-header-compact">
            <h2 class="card-title">Mis Tarjetas</h2>
            <div class="account-selector">
                <select id="cardAccountSelect" class="account-dropdown">
                    <option value="">Cargando tarjetas...</option>
                </select>
                <div class="dropdown-arrow">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
        </div>

        <div class="cards-section-wrapper">
            <div id="cards-container" class="dashboard-cards-grid">
                <div style="width: 100%; text-align: center; padding: 30px; color: #9ca3af;">
                    <i class="fas fa-spinner fa-spin"></i> Cargando tarjetas...
                </div>
            </div>
        </div>
    </div>

    <!-- Derecha: panel detalle de tarjeta seleccionada -->
    <div class="card tarjeta-detail-card">
        <div id="card-detail-panel">
            <div class="card-detail-empty">
                <i class="fas fa-credit-card"></i>
                <p>Selecciona una tarjeta</p>
            </div>
        </div>
    </div>
</div>

<!-- Sección inferior: transacciones full-width -->
<div class="card tarjetas-transactions-card">
    <div class="card-header-compact">
        <div class="transactions-header">
            <h2 class="card-title">Movimientos</h2>
            <div class="transactions-actions">
                <div class="transactions-filters">
                    <button class="filter-btn active" data-filter="all">Todos</button>
                    <button class="filter-btn" data-filter="income">Ingresos</button>
                    <button class="filter-btn" data-filter="expense">Pagos</button>
                </div>
                <button class="btn-primary" id="createMovementBtn">
                    <i class="fas fa-plus"></i> Nuevo movimiento
                </button>
            </div>
        </div>
    </div>
    <div class="transactions-table">
        <table>
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Monto</th>
                    <th>Categorías</th>
                </tr>
            </thead>
            <tbody id="transactions-body">
                <tr class="loading-row">
                    <td colspan="5" style="text-align: center; padding: 30px">
                        <i class="fas fa-spinner fa-spin"></i> Cargando transacciones...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Modal Nueva Tarjeta -->
<dialog id="cardModal" class="tag-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-credit-card"></i> Nueva Tarjeta</h3>
            <button class="close-modal" id="closeCardModal">&times;</button>
        </div>

        <form id="createCardForm" class="modal-body">
            <div class="form-group">
                <label for="card-account-select">Cuenta Vinculada</label>
                <div class="select-wrapper">
                    <select id="card-account-select" class="account-dropdown" style="padding: 8px 10px; font-size: 14px">
                        <option value="">Cargando cuentas...</option>
                    </select>
                    <i class="fas fa-chevron-down select-icon-overlay"></i>
                </div>
            </div>

            <div class="form-group">
                <label for="card-alias">Alias de la tarjeta</label>
                <input type="text" id="card-alias" placeholder="Ej: Para Viajes" required maxlength="20" />
            </div>

            <div class="form-group">
                <label>Tipo de Tarjeta</label>
                <div class="card-type-selector">
                    <label class="type-option">
                        <input type="radio" name="card_type" value="debit" checked />
                        <div class="type-content visa-style">
                            <i class="fab fa-cc-visa"></i>
                            <span>Visa (Débito)</span>
                        </div>
                    </label>
                    <label class="type-option">
                        <input type="radio" name="card_type" value="credit" />
                        <div class="type-content master-style">
                            <i class="fab fa-cc-mastercard"></i>
                            <span>Mastercard (Crédito)</span>
                        </div>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label for="card-full-number">Numero de tarjeta (opcional)</label>
                <input type="text" id="card-full-number"
                       placeholder="1234 5678 9012 3456" maxlength="23"
                       inputmode="numeric" data-format="card-number"
                       autocomplete="off" />
                <span class="form-hint">Si lo introduces, los ultimos 4 digitos se rellenan automaticamente</span>
            </div>

            <div class="form-row-flex">
                <div class="form-group flex-1">
                    <label for="card-digits">Ultimos 4 digitos</label>
                    <input type="text" id="card-digits" placeholder="1234" maxlength="4" pattern="\d{4}" required data-format="digits" inputmode="numeric" style="letter-spacing: 2px; text-align: center" />
                </div>
                <div class="form-group flex-1">
                    <label for="card-security-code">Codigo de seguridad (opcional)</label>
                    <input type="password" id="card-security-code"
                           placeholder="&bull;&bull;&bull;" maxlength="7"
                           inputmode="numeric" data-format="digits"
                           autocomplete="off" />
                </div>
            </div>

            <div class="form-group">
                <label for="card-exp">Caducidad</label>
                <input type="month" id="card-exp" required />
            </div>
        </form>

        <div class="modal-footer">
            <button class="btn-secondary" id="cancelCardBtn">Cancelar</button>
            <button class="btn-primary" id="saveCardBtn">Guardar Tarjeta</button>
        </div>
    </div>
</dialog>

<!-- Modal Nuevo Movimiento -->
<dialog id="movementModal" class="tag-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-exchange-alt"></i> Nuevo Movimiento</h3>
            <button class="close-modal" id="closeMovementModal">&times;</button>
        </div>

        <form id="movementForm" class="modal-body">
            <div class="form-group">
                <label for="movementType">Tipo de movimiento</label>
                <div class="type-selector">
                    <label class="type-option">
                        <input type="radio" name="movement_type" value="gasto" checked />
                        <div class="type-content">
                            <i class="fas fa-arrow-up text-danger"></i>
                            <span>Gasto</span>
                        </div>
                    </label>
                    <label class="type-option">
                        <input type="radio" name="movement_type" value="ingreso" />
                        <div class="type-content">
                            <i class="fas fa-arrow-down text-success"></i>
                            <span>Ingreso</span>
                        </div>
                    </label>
                    <label class="type-option">
                        <input type="radio" name="movement_type" value="traspaso" />
                        <div class="type-content">
                            <i class="fas fa-exchange-alt text-blue"></i>
                            <span>Traspaso</span>
                        </div>
                    </label>
                </div>
            </div>

            <div class="form-group">
                <label for="movementAmount">Monto (&euro;)</label>
                <input type="number" id="movementAmount" step="0.01" placeholder="0.00" required />
            </div>

            <div class="form-group">
                <label for="movementDescription">Descripción</label>
                <input type="text" id="movementDescription" placeholder="Ej: Compra en supermercado" required />
            </div>

            <div class="form-group">
                <label for="movementDate">Fecha</label>
                <input type="date" id="movementDate" required />
            </div>

            <div class="form-group" id="movementCardGroup">
                <label for="movementCard">Tarjeta</label>
                <select id="movementCard" class="account-dropdown">
                    <option value="">Cargando tarjetas...</option>
                </select>
            </div>

            <div class="form-group" id="movementAccountGroup" style="display: none">
                <label for="movementAccount">Cuenta</label>
                <select id="movementAccount" class="account-dropdown">
                    <option value="">Cargando cuentas...</option>
                </select>
            </div>

            <div class="form-group" id="destinationTypeGroup" style="display: none">
                <label>Destino del traspaso</label>
                <div class="type-selector">
                    <label class="type-option">
                        <input type="radio" name="destination_type" value="own_account" checked />
                        <div class="type-content">
                            <i class="fas fa-university text-blue"></i>
                            <span>Cuenta propia</span>
                        </div>
                    </label>
                    <label class="type-option">
                        <input type="radio" name="destination_type" value="external_iban" />
                        <div class="type-content">
                            <i class="fas fa-external-link-alt text-amber"></i>
                            <span>IBAN externo</span>
                        </div>
                    </label>
                </div>
            </div>

            <div class="form-group" id="destinationAccountGroup" style="display: none">
                <label for="destinationAccount">Cuenta destino</label>
                <select id="destinationAccount" class="account-dropdown">
                    <option value="">Seleccionar cuenta...</option>
                </select>
            </div>

            <div class="form-group" id="destinationIbanGroup" style="display: none">
                <label for="destinationIban">IBAN destino</label>
                <input type="text" id="destinationIban" placeholder="ES00 0000 0000 0000 0000 0000" maxlength="34" />
            </div>

            <div class="form-group">
                <label for="movementCategory">Categoría (Etiqueta)</label>
                <select id="movementCategory" class="account-dropdown">
                    <option value="">Seleccionar etiqueta...</option>
                </select>
            </div>

            <div class="form-group">
                <label for="movementEnvelope">Sobre (Opcional)</label>
                <select id="movementEnvelope" class="account-dropdown">
                    <option value="">Sin sobre</option>
                </select>
            </div>
        </form>

        <div class="modal-footer">
            <button class="btn-secondary" id="cancelMovementBtn">Cancelar</button>
            <button class="btn-primary" id="saveMovementBtn">Guardar Movimiento</button>
        </div>
    </div>
</dialog>
<!-- Modal Revelar Datos Sensibles -->
<dialog id="revealPasswordModal" class="tag-modal">
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header">
            <h3><i class="fas fa-lock"></i> Verificar identidad</h3>
            <button class="close-modal" id="closeRevealModal">&times;</button>
        </div>
        <div class="modal-body">
            <p style="margin-bottom: 16px; color: var(--text-muted); font-size: 14px;">
                Introduce tu contrasena para ver los datos sensibles de esta tarjeta.
            </p>
            <div class="form-group">
                <label for="reveal-password">Contrasena</label>
                <input type="password" id="reveal-password" placeholder="Tu contrasena" required autocomplete="current-password" />
                <span class="form-hint text-danger" id="reveal-password-error" style="display: none;"></span>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn-secondary" id="cancelRevealBtn">Cancelar</button>
            <button class="btn-primary" id="confirmRevealBtn">
                <i class="fas fa-eye"></i> Revelar
            </button>
        </div>
    </div>
</dialog>
@endsection

@push('scripts')
<script src="{{ asset('js/tarjetas.js') }}"></script>
@endpush
