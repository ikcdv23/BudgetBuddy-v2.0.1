// tarjetas.js

(function () {
    // getCookie, escapeHTML, formatDate, formatCurrency, showNotification, apiRequest -> core/utils.js + core/api-client.js

    // ==========================================
    // 1. API CONFIGURATION
    // ==========================================
    const API = {
        CARDS: {
            INDEX: '/api/cards',
            STORE: '/api/cards',
            DESTROY: '/api/cards/',
            REVEAL: '/api/cards/',  // + cardId + '/reveal'
        },
        TAGS: {
            INDEX: '/api/tags',
        },
        MOVEMENTS: {
            INDEX: '/api/movements',
            STORE: '/api/movements',
        },
        ACCOUNTS: {
            INDEX: '/api/accounts',
        },
        ENVELOPES: {
            INDEX: '/api/envelopes'
        }
    };

    // ==========================================
    // 2. VARIABLES
    // ==========================================
    let currentCards = [];
    let currentTags = [];
    let currentMovements = [];
    let currentAccounts = [];
    let selectedCardId = null;
    let draggedCardId = null;

    // ==========================================
    // 3. ELEMENTOS DOM
    // ==========================================
    const dom = {
        cardAccountSelect: document.getElementById('cardAccountSelect'),
        cardsContainer: document.getElementById('cards-container'),
        cardDetailPanel: document.getElementById('card-detail-panel'),
        transactionsBody: document.getElementById('transactions-body'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        createMovementBtn: document.getElementById('createMovementBtn'),
        cardModal: document.getElementById('card-modal'),
        closeCardModal: document.getElementById('close-card-modal-btn'),
        cancelCardBtn: document.getElementById('cancel-card-btn'),
        saveCardBtn: document.getElementById('save-card-btn'),
        createCardForm: document.getElementById('create-card-form'),
        movementModal: document.getElementById('movementModal'),
        closeMovementModal: document.getElementById('closeMovementModal'),
        cancelMovementBtn: document.getElementById('cancelMovementBtn'),
        saveMovementBtn: document.getElementById('saveMovementBtn'),
        movementForm: document.getElementById('movementForm'),
        movementCardSelect: document.getElementById('movementCard'),
        movementCardGroup: document.getElementById('movementCardGroup'),
        movementAccountSelect: document.getElementById('movementAccount'),
        movementAccountGroup: document.getElementById('movementAccountGroup'),
        destinationTypeGroup: document.getElementById('destinationTypeGroup'),
        destinationAccountGroup: document.getElementById('destinationAccountGroup'),
        destinationAccountSelect: document.getElementById('destinationAccount'),
        destinationIbanGroup: document.getElementById('destinationIbanGroup'),
        destinationIbanInput: document.getElementById('destinationIban'),
        movementCategorySelect: document.getElementById('movementCategory'),
        // Card creation: full number + security code
        cardFullNumber: document.getElementById('card-full-number'),
        cardSecurityCode: document.getElementById('card-security-code'),
        cardDigits: document.getElementById('card-digits'),
        // Reveal password modal
        revealPasswordModal: document.getElementById('revealPasswordModal'),
        closeRevealModal: document.getElementById('closeRevealModal'),
        cancelRevealBtn: document.getElementById('cancelRevealBtn'),
        confirmRevealBtn: document.getElementById('confirmRevealBtn'),
        revealPasswordInput: document.getElementById('reveal-password'),
        revealPasswordError: document.getElementById('reveal-password-error')
    };

    // Estado para el modal de reveal
    let pendingRevealCardId = null;

    // ==========================================
    // 4. HELPER FUNCTIONS
    // ==========================================
    // formatCurrency → window.formatCurrency (core/utils.js)

    // apiRequest → window.apiRequest (core/api-client.js)

    // ==========================================
    // 4b. AUTO-FILL ÚLTIMOS 4 DÍGITOS + REVEAL
    // ==========================================
    if (dom.cardFullNumber) {
        dom.cardFullNumber.addEventListener('input', function () {
            const raw = this.dataset.rawValue || this.value.replace(/\D/g, '');
            if (raw.length >= 4) {
                dom.cardDigits.value = raw.slice(-4);
                dom.cardDigits.dataset.rawValue = raw.slice(-4);
                dom.cardDigits.readOnly = true;
                dom.cardDigits.style.opacity = '0.6';
            } else if (raw.length === 0) {
                dom.cardDigits.readOnly = false;
                dom.cardDigits.style.opacity = '1';
                dom.cardDigits.value = '';
                dom.cardDigits.dataset.rawValue = '';
            }
        });
    }

    function openRevealModal(cardId) {
        pendingRevealCardId = cardId;
        if (dom.revealPasswordInput) dom.revealPasswordInput.value = '';
        if (dom.revealPasswordError) {
            dom.revealPasswordError.style.display = 'none';
            dom.revealPasswordError.textContent = '';
        }
        if (dom.revealPasswordModal) dom.revealPasswordModal.showModal();
    }

    function closeRevealModal() {
        pendingRevealCardId = null;
        if (dom.revealPasswordModal) dom.revealPasswordModal.close();
    }

    async function revealSensitiveData(cardId, password) {
        try {
            const data = await apiRequest(API.CARDS.REVEAL + cardId + '/reveal', 'POST', { password });
            return data;
        } catch (error) {
            throw error;
        }
    }

    function formatCardNumberDisplay(num) {
        if (!num) return '';
        return num.match(/.{1,4}/g)?.join(' ') || num;
    }

    function copyToClipboard(text, btnEl) {
        navigator.clipboard.writeText(text).then(function () {
            showNotification('Copiado al portapapeles', 'success');
            if (btnEl) {
                btnEl.classList.add('copied');
                btnEl.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(function () {
                    btnEl.classList.remove('copied');
                    btnEl.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            }
        }).catch(function () {
            showNotification('No se pudo copiar', 'error');
        });
    }

    // ==========================================
    // 5. CARGA DE DATOS
    // ==========================================
    async function loadCards() {
        try {
            const data = await apiRequest(API.CARDS.INDEX);
            if (data) {
                currentCards = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentCards.length} cards`);
                renderCardDropdown();
                renderCards();
                initializeDragAndDrop();

                if (currentCards.length > 0 && !selectedCardId) {
                    selectedCardId = currentCards[0].id;
                    if (dom.cardAccountSelect) {
                        dom.cardAccountSelect.value = selectedCardId;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading cards:', error);
            currentCards = [];
            renderCardDropdown();
            renderCards();
        }
    }

    async function loadTags() {
        try {
            const data = await apiRequest(API.TAGS.INDEX);
            if (data) {
                currentTags = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentTags.length} tags`);
                renderTagDropdown();
            }
        } catch (error) {
            console.error('Error loading tags:', error);
            currentTags = [];
        }
    }

    async function loadMovements() {
        try {
            let url = API.MOVEMENTS.INDEX;
            if (selectedCardId) {
                url += `?card_id=${selectedCardId}`;
            }

            const data = await apiRequest(url);
            if (data) {
                currentMovements = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentMovements.length} movements`);
                renderMovements();
            }
        } catch (error) {
            console.error('Error loading movements:', error);
            currentMovements = [];
            renderMovements();
        }
    }

    // Variable para guardar los sobres
    let currentEnvelopes = [];

    // Cargar sobres del servidor
    async function loadEnvelopes() {
        try {
            const data = await apiRequest(API.ENVELOPES.INDEX);
            if (data) {
                currentEnvelopes = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentEnvelopes.length} envelopes`);
                renderEnvelopeDropdown(); // Actualizamos el desplegable
            }
        } catch (error) {
            console.error('Error loading envelopes:', error);
            currentEnvelopes = [];
        }
    }

    async function loadAccounts() {
        try {
            const data = await apiRequest(API.ACCOUNTS.INDEX);
            if (data) {
                currentAccounts = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentAccounts.length} accounts`);
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
            currentAccounts = [];
        }
    }

    function populateAccountSelect(selectEl, excludeId) {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="">Seleccionar cuenta...</option>';
        currentAccounts.forEach(acc => {
            if (excludeId && acc.id === excludeId) return;
            const option = document.createElement('option');
            option.value = acc.id;
            const shortIban = acc.iban ? acc.iban.slice(-4) : '????';
            option.textContent = `${acc.bank_name} - **** ${shortIban}`;
            selectEl.appendChild(option);
        });
    }

    // Mostrar lista de sobres en el modal
    function renderEnvelopeDropdown() {
        const envelopeSelect = document.getElementById('movementEnvelope');
        if (!envelopeSelect) return;

        envelopeSelect.innerHTML = '<option value="">Sin sobre</option>';

        currentEnvelopes.forEach(env => {
            const option = document.createElement('option');
            option.value = env.id;
            option.textContent = env.name;
            envelopeSelect.appendChild(option);
        });
    }

    async function deleteCard(cardId) {
        try {
            if (!confirm('¿Estás seguro de eliminar esta tarjeta? Esta acción no se puede deshacer.')) {
                return false;
            }

            const result = await apiRequest(`${API.CARDS.DESTROY}${cardId}`, 'DELETE');
            if (result && result.success) {
                showNotification('Tarjeta eliminada correctamente', 'success');
                await loadCards();
                await loadMovements();
                return true;
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            showNotification('Error al eliminar la tarjeta', 'error');
            return false;
        }
    }

    async function createMovement(movementData) {
        try {
            console.log('Creating movement:', movementData);

            // El backend ya maneja el signo del amount según el tipo
            // Siempre enviar positivo
            movementData.amount = Math.abs(movementData.amount);

            const result = await apiRequest(API.MOVEMENTS.STORE, 'POST', movementData);
            if (result) {
                showNotification('Movimiento creado correctamente', 'success');
                await loadMovements();
                return true;
            }
        } catch (error) {
            console.error('Error creating movement:', error);
            showNotification(error.message || 'Error al crear el movimiento', 'error');
            return false;
        }
    }

    async function createCard(cardData) {
        try {
            console.log('Creating card:', cardData);
            const result = await apiRequest(API.CARDS.STORE, 'POST', cardData);
            if (result) {
                showNotification('Tarjeta creada correctamente', 'success');
                await loadCards();
                return true;
            }
        } catch (error) {
            console.error('Error creating card:', error);
            return false;
        }
    }

    // ==========================================
    // 6. RENDERIZADO DE INTERFAZ
    // ==========================================
    function renderCardDropdown() {
        if (!dom.cardAccountSelect) return;

        dom.cardAccountSelect.innerHTML = '';

        if (currentCards.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No hay tarjetas';
            dom.cardAccountSelect.appendChild(option);
            return;
        }

        currentCards.forEach(card => {
            const option = document.createElement('option');
            option.value = card.id;
            const shortDigits = card.last_4_digits || '0000';
            option.textContent = `${card.alias} - **** ${shortDigits}`;
            dom.cardAccountSelect.appendChild(option);
        });

        if (currentCards.length > 0 && !selectedCardId) {
            selectedCardId = currentCards[0].id;
            dom.cardAccountSelect.value = selectedCardId;
        }
    }

    function renderCards() {
        if (!dom.cardsContainer) return;

        dom.cardsContainer.innerHTML = '';

        if (currentCards.length === 0) {
            dom.cardsContainer.innerHTML = `
                <div class="no-cards-message">
                    <i class="fas fa-credit-card"></i>
                    <h3>No tienes tarjetas</h3>
                    <p>Añade tu primera tarjeta para empezar</p>
                    <button onclick="openCardModal()" class="btn-primary">
                        <i class="fas fa-plus"></i> Añadir tarjeta
                    </button>
                </div>
            `;
            return;
        }

        // Renderizar tarjetas
        currentCards.forEach((card) => {
            const cardEl = document.createElement('div');
            let visualType = card.type === "credit" ? "mastercard" : "visa";

            const isSelected = card.id === selectedCardId;
            cardEl.className = `mini-card ${visualType}${isSelected ? ' selected' : ''}`;
            cardEl.setAttribute('draggable', 'true');
            cardEl.setAttribute('data-card-id', card.id.toString());

            // Formatear fecha
            let expDateFormatted = "??/??";
            if (card.expiration_date) {
                try {
                    const dateObj = new Date(card.expiration_date);
                    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
                    const year = dateObj.getFullYear().toString().slice(-2);
                    expDateFormatted = `${month}/${year}`;
                } catch (e) { }
            }

            // Balance
            const balance = card.account?.current_balance || card.account?.balance || 0;

            cardEl.innerHTML = `
                <div class="mini-card-top">
                    <span style="font-weight: 500; font-size: 0.9rem;">${escapeHTML(card.alias)}</span>
                    <i class="fab fa-cc-${escapeHTML(visualType)}" style="font-size: 1.8rem; opacity: 0.9;"></i>
                </div>
                <div class="mini-card-number">
                    **** **** **** ${escapeHTML(card.last_4_digits || "0000")}
                </div>
                <div class="mini-card-bottom">
                    <div>
                        <div style="font-size: 0.7rem; opacity: 0.7; margin-bottom:2px;">Saldo</div>
                        <div style="font-weight: bold; font-size: 1.1rem;">${formatCurrency(balance)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.6rem; opacity: 0.7;">Expira</div>
                        <div style="font-size: 0.8rem">${escapeHTML(expDateFormatted)}</div>
                    </div>
                </div>
            `;

            cardEl.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedCardId = card.id;
                if (dom.cardAccountSelect) {
                    dom.cardAccountSelect.value = selectedCardId;
                }
                // Update highlight on all mini-cards
                document.querySelectorAll('.mini-card').forEach(mc => mc.classList.remove('selected'));
                cardEl.classList.add('selected');
                showNotification(`Seleccionada: ${card.alias}`, 'info');
                loadMovements().then(() => renderCardDetail(card));
            });

            dom.cardsContainer.appendChild(cardEl);
        });

        // Las acciones (añadir / eliminar) están en .card-actions-row (Blade estático)
        // Scroll horizontal gestionado por carousel-nav.js + flechas
    }

    // Delete zone es estática en el Blade (#deleteCardZone)

    function renderTagDropdown() {
        if (!dom.movementCategorySelect) return;

        dom.movementCategorySelect.innerHTML = '<option value="">Seleccionar etiqueta...</option>';

        currentTags.forEach(tag => {
            const option = document.createElement('option');
            option.value = tag.id;
            option.textContent = tag.name;
            option.style.color = tag.color || '#000000';
            dom.movementCategorySelect.appendChild(option);
        });
    }

    function renderCardDetail(card) {
        const panel = dom.cardDetailPanel;
        if (!panel) return;

        if (!card) {
            panel.innerHTML = `<div class="card-detail-empty">
                <i class="fas fa-credit-card"></i>
                <p>Selecciona una tarjeta</p>
            </div>`;
            return;
        }

        const visualType = card.type === 'credit' ? 'mastercard' : 'visa';
        const iconClass = card.type === 'credit' ? 'fab fa-cc-mastercard' : 'fab fa-cc-visa';
        const typeName = card.type === 'credit' ? 'Crédito' : 'Débito';
        const balance = card.account?.current_balance || card.account?.balance || 0;
        const bankName = card.account?.bank_name || 'Cuenta vinculada';
        const shortIban = card.account?.iban ? '****' + card.account.iban.slice(-4) : '';

        let expFormatted = '--/--';
        if (card.expiration_date) {
            try {
                const d = new Date(card.expiration_date);
                expFormatted = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            } catch (e) { }
        }

        // Stats from currentMovements (already filtered by selected card)
        const cardMovements = currentMovements;
        const totalMov = cardMovements.length;
        const totalGastos = cardMovements
            .filter(m => parseFloat(m.amount) < 0)
            .reduce((sum, m) => sum + Math.abs(parseFloat(m.amount)), 0);
        const totalIngresos = cardMovements
            .filter(m => parseFloat(m.amount) > 0)
            .reduce((sum, m) => sum + parseFloat(m.amount), 0);

        // Campos sensibles HTML
        let sensitiveHTML = '';
        if (card.has_full_number || card.has_security_code) {
            sensitiveHTML += '<div class="card-sensitive-fields">';
            if (card.has_full_number) {
                sensitiveHTML += `
                    <div class="card-sensitive-field" data-field="card_number">
                        <div class="sensitive-label">Numero de tarjeta</div>
                        <div class="sensitive-value">
                            <span class="sensitive-masked">&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; ${escapeHTML(card.last_4_digits || '0000')}</span>
                            <span class="sensitive-revealed" style="display:none"></span>
                        </div>
                        <div class="sensitive-actions">
                            <button class="btn-reveal" title="Mostrar numero completo" data-card-id="${card.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-copy" title="Copiar al portapapeles" style="display:none" data-field="card_number">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>`;
            }
            if (card.has_security_code) {
                sensitiveHTML += `
                    <div class="card-sensitive-field" data-field="security_code">
                        <div class="sensitive-label">CVC</div>
                        <div class="sensitive-value">
                            <span class="sensitive-masked">&bull;&bull;&bull;</span>
                            <span class="sensitive-revealed" style="display:none"></span>
                        </div>
                        <div class="sensitive-actions">
                            <button class="btn-reveal" title="Mostrar codigo" data-card-id="${card.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-copy" title="Copiar al portapapeles" style="display:none" data-field="security_code">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>`;
            }
            sensitiveHTML += '</div>';
        }

        panel.innerHTML = `
            <div class="card-detail-header">
                <div class="card-detail-icon ${escapeHTML(visualType)}-bg">
                    <i class="${escapeHTML(iconClass)}"></i>
                </div>
                <div class="card-detail-info">
                    <h3>${escapeHTML(card.alias)}</h3>
                    <p>${escapeHTML(typeName)} · ${escapeHTML(visualType.charAt(0).toUpperCase() + visualType.slice(1))}</p>
                </div>
            </div>
            <div class="card-detail-number">
                **** **** **** ${escapeHTML(card.last_4_digits || '0000')}
            </div>
            <div class="card-detail-meta">
                <div class="card-detail-meta-row">
                    <span class="card-detail-meta-label"><i class="fas fa-calendar"></i> Caducidad</span>
                    <span class="card-detail-meta-value">${escapeHTML(expFormatted)}</span>
                </div>
                <div class="card-detail-meta-row">
                    <span class="card-detail-meta-label"><i class="fas fa-university"></i> Cuenta</span>
                    <span class="card-detail-meta-value">${escapeHTML(bankName)} ${escapeHTML(shortIban)}</span>
                </div>
            </div>
            ${sensitiveHTML}
            <div class="card-stats-grid">
                <div class="card-stat-item">
                    <div class="card-stat-label">Saldo</div>
                    <div class="card-stat-value">${formatCurrency(balance)}</div>
                </div>
                <div class="card-stat-item">
                    <div class="card-stat-label">Movimientos</div>
                    <div class="card-stat-value">${totalMov}</div>
                </div>
                <div class="card-stat-item">
                    <div class="card-stat-label">Gastos</div>
                    <div class="card-stat-value amount-expense">-${formatCurrency(totalGastos)}</div>
                </div>
                <div class="card-stat-item">
                    <div class="card-stat-label">Ingresos</div>
                    <div class="card-stat-value amount-income">+${formatCurrency(totalIngresos)}</div>
                </div>
            </div>
        `;

        // Bind reveal buttons
        panel.querySelectorAll('.btn-reveal').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openRevealModal(card.id);
            });
        });

        // Bind copy buttons (will be shown after reveal)
        panel.querySelectorAll('.btn-copy').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const text = this.dataset.revealedValue || '';
                copyToClipboard(text, this);
            });
        });
    }

    function renderMovements() {
        if (!dom.transactionsBody) return;

        dom.transactionsBody.innerHTML = '';

        if (currentMovements.length === 0) {
            dom.transactionsBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        <i class="fas fa-exchange-alt" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        No hay movimientos registrados
                    </td>
                </tr>`;
            return;
        }

        currentMovements.forEach(movement => {
            const row = document.createElement('tr');

            let tagHTML = '<span class="category-tag" style="background-color: #9ca3af;">Sin categoria</span>';
            if (movement.tags && movement.tags.length > 0) {
                tagHTML = movement.tags.map(tag =>
                    `<span class="category-tag" style="background-color: ${escapeHTML(tag.color || '#9ca3af')};">${escapeHTML(tag.name)}</span>`
                ).join('');
            }

            let amountClass = 'amount-income';
            const amount = parseFloat(movement.amount) || 0;

            if (movement.type === 'gasto' || amount < 0) {
                amountClass = 'amount-expense';
            } else if (movement.type === 'traspaso') {
                amountClass = 'amount-transfer';
            }

            const formattedAmount = amount >= 0 ?
                `+€${Math.abs(amount).toFixed(2)}` :
                `-€${Math.abs(amount).toFixed(2)}`;

            row.innerHTML = `
                <td>${escapeHTML(movement.description || 'Sin descripcion')}</td>
                <td>#${escapeHTML(movement.id || 'N/A')}</td>
                <td>${escapeHTML(formatDate(movement.date || movement.created_at))}</td>
                <td class="${amountClass}">${escapeHTML(formattedAmount)}</td>
                <td><div class="category-tags">${tagHTML}</div></td>
            `;

            dom.transactionsBody.appendChild(row);
        });
    }

    // initializeHorizontalScroll eliminado — la navegación la gestionan
    // las flechas del carrusel (carousel-nav.js) y el scroll táctil nativo.

    // ==========================================
    // 7. DRAG & DROP (usa modules/drag-drop.js)
    // ==========================================
    function initializeDragAndDrop() {
        window.initDragAndDrop({
            items: '.mini-card',
            dropZone: '#deleteCardZone',
            dataAttr: 'data-card-id',
            onDrop: async function (id) {
                draggedCardId = id;
                const card = currentCards.find(c => c.id.toString() === id);
                if (!card) return;
                const success = await deleteCard(id);
                if (success) {
                    draggedCardId = null;
                }
            }
        });
    }

    // ==========================================
    // 8. FUNCIONES DE MODALES
    // ==========================================
    function openCardModal() {
        loadAccountsForCardModal();

        const now = new Date();
        const nextYear = new Date(now.getFullYear() + 4, now.getMonth(), 1);
        const month = (nextYear.getMonth() + 1).toString().padStart(2, '0');
        const year = nextYear.getFullYear();

        const expInput = document.getElementById('card-exp');
        if (expInput) {
            expInput.value = `${year}-${month}`;
        }

        if (dom.cardModal) {
            dom.cardModal.showModal();
        }
    }

    async function loadAccountsForCardModal() {
        try {
            const data = await apiRequest(API.ACCOUNTS.INDEX);
            const select = document.getElementById('card-account-select');

            if (select && data) {
                select.innerHTML = '<option value="">Seleccionar cuenta...</option>';
                data.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    const shortIban = account.iban ? account.iban.slice(-4) : '????';
                    option.textContent = `${account.bank_name} - **** ${shortIban}`;
                    select.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }

    function openMovementModal() {
        // Reset tipo a gasto
        const gastoRadio = document.querySelector('input[name="movement_type"][value="gasto"]');
        if (gastoRadio) gastoRadio.checked = true;

        // Reset visibility: gasto = solo tarjeta
        if (dom.movementCardGroup) dom.movementCardGroup.style.display = '';
        if (dom.movementAccountGroup) dom.movementAccountGroup.style.display = 'none';
        if (dom.destinationTypeGroup) dom.destinationTypeGroup.style.display = 'none';
        if (dom.destinationAccountGroup) dom.destinationAccountGroup.style.display = 'none';
        if (dom.destinationIbanGroup) dom.destinationIbanGroup.style.display = 'none';

        if (dom.movementCardSelect) {
            dom.movementCardSelect.innerHTML = '';

            if (currentCards.length === 0) {
                dom.movementCardSelect.innerHTML = '<option value="">No hay tarjetas disponibles</option>';
            } else {
                currentCards.forEach(card => {
                    const option = document.createElement('option');
                    option.value = card.id;
                    const shortDigits = card.last_4_digits || '0000';
                    option.textContent = `${card.alias} (**** ${shortDigits})`;
                    dom.movementCardSelect.appendChild(option);
                });

                if (selectedCardId) {
                    dom.movementCardSelect.value = selectedCardId;
                }
            }
        }

        if (dom.movementCategorySelect) {
            renderTagDropdown();
        }

        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('movementDate');
        if (dateInput) dateInput.value = today;

        if (dom.movementModal) {
            dom.movementModal.showModal();
        }
    }

    // ==========================================
    // 9. EVENT HANDLERS
    // ==========================================
    if (dom.cardAccountSelect) {
        dom.cardAccountSelect.addEventListener('change', function () {
            selectedCardId = this.value ? parseInt(this.value) : null;
            // Update highlight on mini-cards
            document.querySelectorAll('.mini-card').forEach(mc => mc.classList.remove('selected'));
            const activeMiniCard = document.querySelector(`.mini-card[data-card-id="${selectedCardId}"]`);
            if (activeMiniCard) activeMiniCard.classList.add('selected');
            const card = currentCards.find(c => c.id === selectedCardId);
            loadMovements().then(() => renderCardDetail(card || null));
        });
    }

    if (dom.filterButtons) {
        dom.filterButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                dom.filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');
                let filteredMovements = currentMovements;

                if (filter === 'income') {
                    filteredMovements = currentMovements.filter(m => parseFloat(m.amount) > 0);
                } else if (filter === 'expense') {
                    filteredMovements = currentMovements.filter(m => parseFloat(m.amount) < 0);
                }

                const tempBody = document.getElementById('transactions-body');
                if (tempBody) {
                    tempBody.innerHTML = '';
                    filteredMovements.forEach(movement => {
                        const row = document.createElement('tr');
                        const amount = parseFloat(movement.amount) || 0;
                        const amountClass = amount >= 0 ? 'amount-income' : 'amount-expense';
                        const formattedAmount = amount >= 0 ?
                            `+€${Math.abs(amount).toFixed(2)}` :
                            `-€${Math.abs(amount).toFixed(2)}`;

                        row.innerHTML = `
                            <td>${escapeHTML(movement.description || 'Sin descripcion')}</td>
                            <td>#${escapeHTML(movement.id || 'N/A')}</td>
                            <td>${escapeHTML(formatDate(movement.date || movement.created_at))}</td>
                            <td class="${amountClass}">${escapeHTML(formattedAmount)}</td>
                            <td><div class="category-tags">${movement.tags ? movement.tags.map(t => `<span class="category-tag">${escapeHTML(t.name)}</span>`).join('') : ''}</div></td>
                        `;
                        tempBody.appendChild(row);
                    });
                }

                showNotification(`Filtro aplicado: ${this.textContent}`, 'info');
            });
        });
    }

    // Toggle campos según tipo de movimiento
    document.querySelectorAll('input[name="movement_type"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const type = this.value;
            // Gasto: solo tarjeta
            if (type === 'gasto') {
                if (dom.movementCardGroup) dom.movementCardGroup.style.display = '';
                if (dom.movementAccountGroup) dom.movementAccountGroup.style.display = 'none';
                if (dom.destinationTypeGroup) dom.destinationTypeGroup.style.display = 'none';
                if (dom.destinationAccountGroup) dom.destinationAccountGroup.style.display = 'none';
                if (dom.destinationIbanGroup) dom.destinationIbanGroup.style.display = 'none';
            }
            // Ingreso: solo cuenta
            else if (type === 'ingreso') {
                if (dom.movementCardGroup) dom.movementCardGroup.style.display = 'none';
                if (dom.movementAccountGroup) dom.movementAccountGroup.style.display = '';
                populateAccountSelect(dom.movementAccountSelect);
                if (dom.destinationTypeGroup) dom.destinationTypeGroup.style.display = 'none';
                if (dom.destinationAccountGroup) dom.destinationAccountGroup.style.display = 'none';
                if (dom.destinationIbanGroup) dom.destinationIbanGroup.style.display = 'none';
            }
            // Traspaso: cuenta origen + destino
            else if (type === 'traspaso') {
                if (dom.movementCardGroup) dom.movementCardGroup.style.display = 'none';
                if (dom.movementAccountGroup) dom.movementAccountGroup.style.display = '';
                populateAccountSelect(dom.movementAccountSelect);
                if (dom.destinationTypeGroup) dom.destinationTypeGroup.style.display = '';
                // Reset destination type to own_account
                const ownRadio = document.querySelector('input[name="destination_type"][value="own_account"]');
                if (ownRadio) ownRadio.checked = true;
                if (dom.destinationAccountGroup) dom.destinationAccountGroup.style.display = '';
                populateAccountSelect(dom.destinationAccountSelect);
                if (dom.destinationIbanGroup) dom.destinationIbanGroup.style.display = 'none';
            }
        });
    });

    // Toggle destino traspaso (cuenta propia vs IBAN externo)
    document.querySelectorAll('input[name="destination_type"]').forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === 'own_account') {
                if (dom.destinationAccountGroup) dom.destinationAccountGroup.style.display = '';
                if (dom.destinationIbanGroup) dom.destinationIbanGroup.style.display = 'none';
                // Excluir cuenta origen del destino
                const originId = dom.movementAccountSelect ? parseInt(dom.movementAccountSelect.value) : null;
                populateAccountSelect(dom.destinationAccountSelect, originId);
            } else {
                if (dom.destinationAccountGroup) dom.destinationAccountGroup.style.display = 'none';
                if (dom.destinationIbanGroup) dom.destinationIbanGroup.style.display = '';
            }
        });
    });

    // Cuando cambia la cuenta origen en traspaso, actualizar cuenta destino
    if (dom.movementAccountSelect) {
        dom.movementAccountSelect.addEventListener('change', function () {
            const type = document.querySelector('input[name="movement_type"]:checked');
            const destType = document.querySelector('input[name="destination_type"]:checked');
            if (type && type.value === 'traspaso' && destType && destType.value === 'own_account') {
                populateAccountSelect(dom.destinationAccountSelect, parseInt(this.value));
            }
        });
    }

    if (dom.createMovementBtn) {
        dom.createMovementBtn.addEventListener('click', openMovementModal);
    }

    // Botón "Nueva tarjeta" debajo del carrusel
    const addCardActionBtn = document.getElementById('addCardActionBtn');
    if (addCardActionBtn) {
        addCardActionBtn.addEventListener('click', openCardModal);
    }

    if (dom.closeCardModal) {
        dom.closeCardModal.addEventListener('click', () => {
            if (dom.cardModal) dom.cardModal.close();
        });
    }

    if (dom.cancelCardBtn) {
        dom.cancelCardBtn.addEventListener('click', () => {
            if (dom.cardModal) dom.cardModal.close();
        });
    }

    if (dom.saveCardBtn) {
        dom.saveCardBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const accountId = document.getElementById('card-account-select').value;
            const alias = document.getElementById('card-alias').value;
            const digits = document.getElementById('card-digits').value;
            const expInput = document.getElementById('card-exp').value;
            const typeRadio = document.querySelector('input[name="card_type"]:checked');
            const fullNumberRaw = dom.cardFullNumber ? (dom.cardFullNumber.dataset.rawValue || dom.cardFullNumber.value.replace(/\D/g, '')) : '';
            const securityCode = dom.cardSecurityCode ? dom.cardSecurityCode.value.replace(/\D/g, '') : '';

            if (!accountId || !alias || !digits || !expInput || digits.length !== 4 || !/^\d{4}$/.test(digits)) {
                showNotification('Por favor, complete todos los campos correctamente', 'error');
                return;
            }

            // Validar número completo (obligatorio, exactamente 16 dígitos)
            if (fullNumberRaw.length !== 16) {
                showNotification('El número de tarjeta debe tener exactamente 16 dígitos', 'error');
                return;
            }

            // Validar código de seguridad (obligatorio, exactamente 3 dígitos)
            if (securityCode.length !== 3) {
                showNotification('El CVC debe tener exactamente 3 dígitos', 'error');
                return;
            }

            const expDate = expInput + '-01';

            const originalText = dom.saveCardBtn.innerHTML;
            dom.saveCardBtn.disabled = true;
            dom.saveCardBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                const cardData = {
                    account_id: parseInt(accountId),
                    alias: alias,
                    type: typeRadio.value,
                    last_4_digits: digits,
                    expiration_date: expDate
                };

                cardData.card_number = fullNumberRaw;
                cardData.security_code = securityCode;

                const success = await createCard(cardData);
                if (success) {
                    dom.cardModal.close();
                    dom.createCardForm.reset();
                    // Reset readonly state on digits field
                    if (dom.cardDigits) {
                        dom.cardDigits.readOnly = false;
                        dom.cardDigits.style.opacity = '1';
                    }
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                dom.saveCardBtn.disabled = false;
                dom.saveCardBtn.innerHTML = originalText;
            }
        });
    }

    if (dom.closeMovementModal) {
        dom.closeMovementModal.addEventListener('click', () => {
            if (dom.movementModal) dom.movementModal.close();
        });
    }

    if (dom.cancelMovementBtn) {
        dom.cancelMovementBtn.addEventListener('click', () => {
            if (dom.movementModal) dom.movementModal.close();
        });
    }

    if (dom.saveMovementBtn) {
        dom.saveMovementBtn.addEventListener('click', async function (e) {
            e.preventDefault();

            const envelopeValue = document.getElementById('movementEnvelope').value;
            const type = document.querySelector('input[name="movement_type"]:checked').value;
            const amount = Math.abs(parseFloat(document.getElementById('movementAmount').value));
            const description = document.getElementById('movementDescription').value;
            const date = document.getElementById('movementDate').value;

            if (!amount || isNaN(amount) || !description) {
                showNotification('Por favor, complete todos los campos obligatorios', 'error');
                return;
            }

            // Construir payload según tipo
            const movementData = {
                type: type,
                amount: amount,
                description: description,
                date: date,
                tag_id: dom.movementCategorySelect.value ? parseInt(dom.movementCategorySelect.value) : null,
                envelope_id: envelopeValue ? parseInt(envelopeValue) : null,
            };

            if (type === 'gasto') {
                if (!dom.movementCardSelect.value) {
                    showNotification('Selecciona una tarjeta para el gasto', 'error');
                    return;
                }
                movementData.card_id = parseInt(dom.movementCardSelect.value);
            } else if (type === 'ingreso') {
                if (!dom.movementAccountSelect.value) {
                    showNotification('Selecciona una cuenta para el ingreso', 'error');
                    return;
                }
                movementData.account_id = parseInt(dom.movementAccountSelect.value);
            } else if (type === 'traspaso') {
                if (!dom.movementAccountSelect.value) {
                    showNotification('Selecciona una cuenta de origen', 'error');
                    return;
                }
                movementData.account_id = parseInt(dom.movementAccountSelect.value);
                const destType = document.querySelector('input[name="destination_type"]:checked').value;
                movementData.destination_type = destType;
                if (destType === 'own_account') {
                    if (!dom.destinationAccountSelect.value) {
                        showNotification('Selecciona una cuenta de destino', 'error');
                        return;
                    }
                    movementData.destination_account_id = parseInt(dom.destinationAccountSelect.value);
                } else {
                    if (!dom.destinationIbanInput.value) {
                        showNotification('Introduce el IBAN de destino', 'error');
                        return;
                    }
                    movementData.destination_iban = dom.destinationIbanInput.value;
                }
            }

            const originalText = dom.saveMovementBtn.innerHTML;
            dom.saveMovementBtn.disabled = true;
            dom.saveMovementBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

            try {
                console.log('Saving movement data:', movementData);
                const success = await createMovement(movementData);
                if (success) {
                    dom.movementModal.close();
                    dom.movementForm.reset();
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                dom.saveMovementBtn.disabled = false;
                dom.saveMovementBtn.innerHTML = originalText;
            }
        });
    }
    // ==========================================
    // 9b. REVEAL MODAL HANDLERS
    // ==========================================
    if (dom.closeRevealModal) {
        dom.closeRevealModal.addEventListener('click', closeRevealModal);
    }
    if (dom.cancelRevealBtn) {
        dom.cancelRevealBtn.addEventListener('click', closeRevealModal);
    }
    if (dom.confirmRevealBtn) {
        dom.confirmRevealBtn.addEventListener('click', async function () {
            const password = dom.revealPasswordInput ? dom.revealPasswordInput.value : '';
            if (!password) {
                if (dom.revealPasswordError) {
                    dom.revealPasswordError.textContent = 'Introduce tu contrasena';
                    dom.revealPasswordError.style.display = 'block';
                }
                return;
            }

            const originalText = dom.confirmRevealBtn.innerHTML;
            dom.confirmRevealBtn.disabled = true;
            dom.confirmRevealBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';

            try {
                const data = await revealSensitiveData(pendingRevealCardId, password);
                closeRevealModal();

                // Update the detail panel with revealed data
                const panel = dom.cardDetailPanel;
                if (panel && data) {
                    if (data.card_number) {
                        const field = panel.querySelector('[data-field="card_number"]');
                        if (field) {
                            const masked = field.querySelector('.sensitive-masked');
                            const revealed = field.querySelector('.sensitive-revealed');
                            const revealBtn = field.querySelector('.btn-reveal');
                            const copyBtn = field.querySelector('.btn-copy');
                            if (masked) masked.style.display = 'none';
                            if (revealed) {
                                revealed.textContent = formatCardNumberDisplay(data.card_number);
                                revealed.style.display = '';
                            }
                            if (revealBtn) {
                                revealBtn.style.display = 'none';
                            }
                            if (copyBtn) {
                                copyBtn.style.display = '';
                                copyBtn.dataset.revealedValue = data.card_number;
                            }
                        }
                    }
                    if (data.security_code) {
                        const field = panel.querySelector('[data-field="security_code"]');
                        if (field) {
                            const masked = field.querySelector('.sensitive-masked');
                            const revealed = field.querySelector('.sensitive-revealed');
                            const revealBtn = field.querySelector('.btn-reveal');
                            const copyBtn = field.querySelector('.btn-copy');
                            if (masked) masked.style.display = 'none';
                            if (revealed) {
                                revealed.textContent = data.security_code;
                                revealed.style.display = '';
                            }
                            if (revealBtn) {
                                revealBtn.style.display = 'none';
                            }
                            if (copyBtn) {
                                copyBtn.style.display = '';
                                copyBtn.dataset.revealedValue = data.security_code;
                            }
                        }
                    }
                }

                showNotification('Datos revelados correctamente', 'success');
            } catch (error) {
                console.error('Reveal error:', error);
                if (dom.revealPasswordError) {
                    dom.revealPasswordError.textContent = 'Contrasena incorrecta';
                    dom.revealPasswordError.style.display = 'block';
                }
            } finally {
                dom.confirmRevealBtn.disabled = false;
                dom.confirmRevealBtn.innerHTML = originalText;
            }
        });
    }

    // Allow Enter key to submit reveal modal
    if (dom.revealPasswordInput) {
        dom.revealPasswordInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (dom.confirmRevealBtn) dom.confirmRevealBtn.click();
            }
        });
    }

    // ==========================================
    // 10. INITIALIZATION
    // ==========================================
    async function init() {
        console.log('Initializing tarjetas.js...');

        const results = await Promise.allSettled([
            loadCards(),
            loadTags(),
            loadMovements(),
            loadEnvelopes(),
            loadAccounts()
        ]);

        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
            console.error('Some loads failed:', failed);
            showNotification('Algunos datos no se pudieron cargar', 'error');
        }

        // Render detail panel for the first selected card
        if (selectedCardId) {
            const card = currentCards.find(c => c.id === selectedCardId);
            renderCardDetail(card || null);
        } else {
            renderCardDetail(null);
        }

    }



    window.openCardModal = openCardModal;
    init();
})();