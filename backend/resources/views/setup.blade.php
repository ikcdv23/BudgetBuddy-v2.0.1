<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <script>(function(){var t=localStorage.getItem('bb-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.setAttribute('data-theme','dark');else document.documentElement.setAttribute('data-theme','light');})();</script>
    <title>Configuración Inicial | BudgetBuddy</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@300;400;500;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <link rel="stylesheet" href="{{ asset('css/app-variables.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-dark-mode.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-utilities.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/app-forms.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/setup.css') }}" />
</head>
<body>
    <div class="wizard-container">
        <div class="wizard-header">
            <img src="{{ asset('images/logo.png') }}" alt="Logo" />
            <h2>Configuración</h2>
            <p>Paso <span id="step-number">1</span> de 4</p>
        </div>

        <div class="wizard-body">
            <div class="step-indicator">
                <div class="step-dot active" id="dot-1"></div>
                <div class="step-dot" id="dot-2"></div>
                <div class="step-dot" id="dot-3"></div>
                <div class="step-dot" id="dot-4"></div>
            </div>

            <form id="setup-form">
                <div id="step-1" class="step-content active">
                    <h3 style="margin-bottom: 15px; color: var(--text-main)">1. Completa tu Perfil</h3>
                    <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 20px">Confirmemos tus datos antes de configurar la cuenta.</p>

                    <div class="form-group">
                        <label>Nombre</label>
                        <div class="input-wrapper">
                            <i class="fas fa-user"></i>
                            <input type="text" id="setup_firstname" placeholder="Tu nombre" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Apellidos</label>
                        <div class="input-wrapper">
                            <i class="fas fa-user-tag"></i>
                            <input type="text" id="setup_lastname" placeholder="Tus apellidos" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Teléfono (Opcional)</label>
                        <div class="input-wrapper" style="display: flex; align-items: stretch;">
                            <select id="setup_phone_country" style="min-width: 120px; width: auto; border-right: none; border-radius: 8px 0 0 8px;">
                                <option value="+34" selected>+34</option>
                                <option value="+33">+33</option>
                                <option value="+49">+49</option>
                                <option value="+39">+39</option>
                                <option value="+351">+351</option>
                                <option value="+44">+44</option>
                                <option value="+1">+1</option>
                            </select>
                            <input type="tel" id="setup_phone" placeholder="612 345 678" data-format="phone" maxlength="11" inputmode="numeric" style="border-radius: 0 8px 8px 0;" />
                        </div>
                    </div>

                    <div class="wizard-buttons">
                        <div></div>
                        <button type="button" class="btn-primary" id="btn-step-1">
                            Siguiente <i class="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>

                <div id="step-2" class="step-content">
                    <h3 style="margin-bottom: 15px; color: var(--text-main)">2. Tu Cuenta Principal</h3>

                    <div class="form-group">
                        <label>Nombre del Banco</label>
                        <div class="input-wrapper">
                            <i class="fas fa-university"></i>
                            <input type="text" id="bank_name" placeholder="Ej: BBVA Principal" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="iban_number">IBAN</label>
                        <div class="input-wrapper iban-composite" style="display: flex; align-items: stretch">
                            <select id="iban_country" class="country-select" style="min-width: 100px; width: auto">
                                <option value="ES" selected>ES</option>
                                <option value="FR">FR</option>
                                <option value="DE">DE</option>
                                <option value="IT">IT</option>
                                <option value="PT">PT</option>
                                <option value="GB">GB</option>
                            </select>
                            <input type="text" id="iban_number" placeholder="0000 0000 00..." data-format="iban" maxlength="27" inputmode="numeric" style="padding-inline-start: 10px !important; border-inline-start: none; border-start-start-radius: 0; border-end-start-radius: 0;" />
                        </div>
                        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px">Selecciona el país y escribe los dígitos.</p>
                    </div>

                    <div class="form-group">
                        <label>Saldo Actual (&euro;)</label>
                        <div class="input-wrapper">
                            <i class="fas fa-euro-sign"></i>
                            <input type="number" id="current_balance" step="0.01" placeholder="0.00" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Color</label>
                        <div class="color-picker-container">
                            <div class="color-circle selected" data-color="#217A4A" style="background: #217a4a"></div>
                            <div class="color-circle" data-color="#34d399" style="background: #34d399"></div>
                            <div class="color-circle" data-color="#60a5fa" style="background: #60a5fa"></div>
                            <div class="color-circle" data-color="#fbbf24" style="background: #fbbf24"></div>
                            <div class="color-circle" data-color="#ef4444" style="background: #ef4444"></div>
                        </div>
                        <input type="hidden" id="account_color" value="#217A4A" />
                    </div>

                    <div class="wizard-buttons">
                        <button type="button" class="btn-primary btn-outline" onclick="goToStep(1)">Atrás</button>
                        <button type="button" class="btn-primary" onclick="goToStep(3)">Siguiente <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>

                <div id="step-3" class="step-content">
                    <h3 style="margin-block-end: 15px; color: var(--text-main)">3. Tarjeta Asociada</h3>

                    <div class="skip-toggle" id="toggle-card" onclick="toggleSection('card')">
                        <div>
                            <span style="font-weight: 600">¿Añadir Tarjeta?</span>
                            <p style="font-size: 0.8rem; margin: 0; color: var(--text-muted)">Vincular tarjeta física o virtual</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="has_card" style="pointer-events: none" />
                        </div>
                    </div>

                    <div id="card-fields" style="display: none">
                        <div class="form-group">
                            <label>Alias</label>
                            <input type="text" id="card_alias" placeholder="Ej: Visa Oro" />
                        </div>

                        <div class="form-group">
                            <label>Tipo</label>
                            <div class="card-type-selector">
                                <label class="type-option">
                                    <input type="radio" name="card_type" value="debit" checked />
                                    <div class="type-content"><span>Débito</span></div>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="card_type" value="credit" />
                                    <div class="type-content"><span>Crédito</span></div>
                                </label>
                            </div>
                        </div>

                        <div class="form-row-flex">
                            <div class="form-group flex-1">
                                <label>Últimos 4</label>
                                <input type="text" id="card_digits" maxlength="4" placeholder="1234" data-format="digits" inputmode="numeric" />
                            </div>
                            <div class="form-group flex-1">
                                <label for="card-exp">Caducidad</label>
                                <input type="month" id="card_expiration" />
                                <span class="form-hint-text">Ej: 12/2028 o usa el calendario</span>
                            </div>
                        </div>
                    </div>

                    <div class="wizard-buttons">
                        <button type="button" class="btn-primary btn-outline" onclick="goToStep(2)">Atrás</button>
                        <button type="button" class="btn-primary" onclick="goToStep(4)">Siguiente <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>

                <div id="step-4" class="step-content">
                    <h3 style="margin-block-end: 15px; color: var(--text-main)">4. Sobre Digital (Presupuesto)</h3>

                    <div class="skip-toggle" id="toggle-envelope" onclick="toggleSection('envelope')">
                        <div>
                            <span style="font-weight: 600">¿Crear primer Sobre?</span>
                            <p style="font-size: 0.8rem; margin: 0; color: var(--text-muted)">Separa dinero para un objetivo</p>
                        </div>
                        <div class="toggle-switch">
                            <input type="checkbox" id="has_envelope" style="pointer-events: none" />
                        </div>
                    </div>

                    <div id="envelope-fields" style="display: none">
                        <div class="form-group">
                            <label>Nombre del Objetivo</label>
                            <input type="text" id="env_name" placeholder="Ej: Ahorro Coche..." />
                        </div>

                        <div class="form-row-flex">
                            <div class="form-group flex-1">
                                <label>Meta (&euro;)</label>
                                <input type="number" id="env_target" placeholder="1000" />
                            </div>
                            <div class="form-group flex-1">
                                <label>Apartado (&euro;)</label>
                                <input type="number" id="env_allocated" placeholder="0" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Icono</label>
                            <div class="icon-grid">
                                <div class="icon-option selected" data-icon="fas fa-piggy-bank"><i class="fas fa-piggy-bank"></i></div>
                                <div class="icon-option" data-icon="fas fa-car"><i class="fas fa-car"></i></div>
                                <div class="icon-option" data-icon="fas fa-home"><i class="fas fa-home"></i></div>
                                <div class="icon-option" data-icon="fas fa-plane"><i class="fas fa-plane"></i></div>
                                <div class="icon-option" data-icon="fas fa-gamepad"><i class="fas fa-gamepad"></i></div>
                                <div class="icon-option" data-icon="fas fa-shopping-cart"><i class="fas fa-shopping-cart"></i></div>
                                <div class="icon-option" data-icon="fas fa-utensils"><i class="fas fa-utensils"></i></div>
                                <div class="icon-option" data-icon="fas fa-mobile-alt"><i class="fas fa-mobile-alt"></i></div>
                                <div class="icon-option" data-icon="fas fa-heart"><i class="fas fa-heart"></i></div>
                                <div class="icon-option" data-icon="fas fa-graduation-cap"><i class="fas fa-graduation-cap"></i></div>
                            </div>
                        </div>
                    </div>

                    <div class="wizard-buttons">
                        <button type="button" class="btn-primary btn-outline" onclick="goToStep(3)">Atrás</button>
                        <button type="submit" id="btn-submit" class="btn-primary btn-success">
                            <i class="fas fa-check"></i> Finalizar
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <script src="{{ asset('js/core/formatters.js') }}"></script>
    <script src="{{ asset('js/core/utils.js') }}"></script>
    <script src="{{ asset('js/core/api-client.js') }}"></script>
    <script src="{{ asset('js/setup.js') }}"></script>
</body>
</html>
