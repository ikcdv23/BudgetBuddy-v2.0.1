<!-- Modal Nueva Tarjeta (componente compartido) -->
<dialog id="card-modal" class="tag-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3><i class="fas fa-credit-card"></i> Nueva Tarjeta</h3>
            <button class="close-modal" id="close-card-modal-btn" aria-label="Cerrar">&times;</button>
        </div>

        <form id="create-card-form" class="modal-body">
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
                <span id="card-type-label" class="form-label-bold">Tipo de Tarjeta</span>
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

            <div class="form-group">
                <label for="card-full-number">Número de tarjeta</label>
                <input type="text" id="card-full-number"
                       placeholder="1234 5678 9012 3456" maxlength="19"
                       inputmode="numeric" data-format="card-number"
                       autocomplete="off" required />
                <span class="form-hint-text">Los últimos 4 dígitos se rellenan automáticamente</span>
            </div>

            <div class="form-row-flex">
                <div class="form-group flex-1">
                    <label for="card-digits">Últimos 4 dígitos</label>
                    <input type="text" id="card-digits" placeholder="1234" maxlength="4"
                           pattern="\d{4}" required data-format="digits" inputmode="numeric"
                           style="letter-spacing: 2px; text-align: center" readonly />
                </div>
                <div class="form-group flex-1">
                    <label for="card-security-code">CVC</label>
                    <input type="password" id="card-security-code"
                           placeholder="&bull;&bull;&bull;" maxlength="3"
                           inputmode="numeric" data-format="digits"
                           autocomplete="off" required />
                    <span class="form-hint-text">3 dígitos del reverso</span>
                </div>
            </div>

            <div class="form-group">
                <label for="card-exp">Caducidad</label>
                <input type="month" id="card-exp" required />
                <span class="form-hint-text">Ej: 12/2028 o usa el calendario</span>
            </div>
        </form>

        <div class="modal-footer">
            <button class="btn-secondary" id="cancel-card-btn">Cancelar</button>
            <button class="btn-primary" id="save-card-btn">Guardar Tarjeta</button>
        </div>
    </div>
</dialog>
