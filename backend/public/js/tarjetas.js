// tarjetas.js

(function () {
    // getCookie, escapeHTML, formatDate, showNotification -> app-base.js

    // ==========================================
    // 1. API CONFIGURATION
    // ==========================================
    const API = {
        CARDS: {
            INDEX: '/api/cards',
            STORE: '/api/cards',
            DESTROY: '/api/cards/',
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
    // 2. ЗМІННІ
    // ==========================================
    let currentCards = [];
    let currentTags = [];
    let currentMovements = [];
    let currentAccounts = [];
    let selectedCardId = null;
    let draggedCardId = null;

    // ==========================================
    // 3. DOM ЕЛЕМЕНТИ
    // ==========================================
    const dom = {
        cardAccountSelect: document.getElementById('cardAccountSelect'),
        cardsContainer: document.getElementById('cards-container'),
        transactionsBody: document.getElementById('transactions-body'),
        filterButtons: document.querySelectorAll('.filter-btn'),
        createMovementBtn: document.getElementById('createMovementBtn'),
        cardModal: document.getElementById('cardModal'),
        closeCardModal: document.getElementById('closeCardModal'),
        cancelCardBtn: document.getElementById('cancelCardBtn'),
        saveCardBtn: document.getElementById('saveCardBtn'),
        createCardForm: document.getElementById('createCardForm'),
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
        dateContainer: document.getElementById('current-date')
    };

    // ==========================================
    // 4. HELPER FUNCTIONS
    // ==========================================
    function formatCurrency(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) amount = 0;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function updateDate() {
        if (!dom.dateContainer) return;
        const now = new Date();
        dom.dateContainer.textContent = now.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    async function apiRequest(url, method = 'GET', data = null) {
        // Obtener CSRF cookie antes de peticiones mutantes
        if (method !== 'GET') {
            await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || '',
            },
            credentials: 'same-origin'
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        console.log(`API ${method} ${url}`, data);

        try {
            const response = await fetch(url, options);
            console.log(`Response ${response.status} from ${url}`);

            if (response.status === 401) {
                showNotification('Sesión expirada. Redirigiendo al login...', 'error');
                setTimeout(() => window.location.href = '/login', 2000);
                return null;
            }

            if (response.status === 422) {
                const errors = await response.json();
                const errorMessages = errors.errors ?
                    Object.values(errors.errors).flat().join(', ') :
                    errors.message || 'Error de validación';
                throw new Error(errorMessages);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (response.status === 204 || method === 'DELETE') {
                return { success: true };
            }

            return await response.json();

        } catch (error) {
            console.error('API Error:', error);
            showNotification(`Error: ${error.message}`, 'error');
            throw error;
        }
    }

    // ==========================================
    // 5. ЗАВАНТАЖЕННЯ ДАНИХ
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

    // Змінна для збереження конвертів / Variable para guardar los sobres
    let currentEnvelopes = [];

    // Завантаження конвертів з сервера / Cargar sobres del servidor
    async function loadEnvelopes() {
        try {
            const data = await apiRequest(API.ENVELOPES.INDEX);
            if (data) {
                currentEnvelopes = Array.isArray(data) ? data : [];
                console.log(`Loaded ${currentEnvelopes.length} envelopes`);
                renderEnvelopeDropdown(); // Оновлюємо випадаючий список / Actualizamos el desplegable
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

    // Відображення списку конвертів у модальному вікні / Mostrar lista de sobres en el modal
    function renderEnvelopeDropdown() {
        const envelopeSelect = document.getElementById('movementEnvelope');
        if (!envelopeSelect) return;

        envelopeSelect.innerHTML = '<option value="">Sin sobre</option>'; // Опція за замовчуванням / Opción por defecto

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

            // Для витрат робимо суму негативною
            if (movementData.type === 'gasto') {
                movementData.amount = -Math.abs(movementData.amount);
            }

            const result = await apiRequest(API.MOVEMENTS.STORE, 'POST', movementData);
            if (result) {
                showNotification('Movimiento creado correctamente', 'success');
                await loadMovements();
                return true;
            }
        } catch (error) {
            console.error('Error creating movement:', error);
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
    // 6. РЕНДЕРИНГ ІНТЕРФЕЙСУ
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

        // Рендеримо картки
        currentCards.forEach((card) => {
            const cardEl = document.createElement('div');
            let visualType = card.type === "credit" ? "mastercard" : "visa";

            cardEl.className = `mini-card ${visualType}`;
            cardEl.setAttribute('draggable', 'true');
            cardEl.setAttribute('data-card-id', card.id.toString());

            // Форматуємо дату
            let expDateFormatted = "??/??";
            if (card.expiration_date) {
                try {
                    const dateObj = new Date(card.expiration_date);
                    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
                    const year = dateObj.getFullYear().toString().slice(-2);
                    expDateFormatted = `${month}/${year}`;
                } catch (e) { }
            }

            // Баланс
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
                showNotification(`Seleccionada: ${card.alias}`, 'info');
                loadMovements();
            });

            dom.cardsContainer.appendChild(cardEl);
        });

        // Примарна картка
        const ghostCard = document.createElement('div');
        ghostCard.className = 'mini-card ghost-card';
        ghostCard.innerHTML = `
            <div class="ghost-content">
                <div class="ghost-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <span style="font-size: 0.9rem; font-weight: 500;">Nueva Tarjeta</span>
            </div>
        `;
        ghostCard.addEventListener('click', openCardModal);
        dom.cardsContainer.appendChild(ghostCard);

        // Зона видалення
        createDeleteZone();

        // Скрол
        initializeHorizontalScroll();
    }

    function createDeleteZone() {
        const oldZone = document.getElementById('deleteCardZone');
        if (oldZone) oldZone.remove();

        const deleteZone = document.createElement('div');
        deleteZone.className = 'delete-card-zone';
        deleteZone.id = 'deleteCardZone';
        deleteZone.innerHTML = `
            <div class="delete-card-icon">
                <i class="fas fa-trash"></i>
            </div>
            <div class="delete-card-text">
                <h4>Eliminar tarjeta</h4>
                <p>Arrastra aquí para eliminar</p>
            </div>
        `;

        if (dom.cardsContainer) {
            dom.cardsContainer.appendChild(deleteZone);
        }
    }

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

    function initializeHorizontalScroll() {
        const container = dom.cardsContainer;
        if (!container) return;

        container.style.overflowX = 'auto';
        container.style.overflowY = 'hidden';
        container.style.cursor = 'grab';

        let isDragging = false;
        let startX;
        let scrollLeft;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            container.style.cursor = 'grabbing';
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        });

        container.addEventListener('mouseleave', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mouseup', () => {
            isDragging = false;
            container.style.cursor = 'grab';
        });

        container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 2;
            container.scrollLeft = scrollLeft - walk;
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        }, { passive: false });
    }

    // ==========================================
    // 7. DRAG & DROP
    // ==========================================
    function initializeDragAndDrop() {
        const cardItems = document.querySelectorAll('.mini-card:not(.ghost-card)');
        const deleteZone = document.getElementById('deleteCardZone');

        if (!deleteZone) {
            console.warn('Delete zone not found!');
            return;
        }

        cardItems.forEach((card) => {
            card.addEventListener('dragstart', handleDragStart);
            card.addEventListener('dragend', handleDragEnd);
        });

        deleteZone.addEventListener('dragover', handleDragOver);
        deleteZone.addEventListener('dragleave', handleDragLeave);
        deleteZone.addEventListener('drop', handleDrop);
    }

    function handleDragStart(e) {
        draggedCardId = this.getAttribute('data-card-id');
        e.dataTransfer.setData('text/plain', draggedCardId);
        this.classList.add('dragging');

        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.add('active');
        }
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.remove('active', 'drag-over');
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.add('drag-over');
        }
    }

    function handleDragLeave() {
        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.remove('drag-over');
        }
    }

    async function handleDrop(e) {
        e.preventDefault();

        const deleteZone = document.getElementById('deleteCardZone');
        if (deleteZone) {
            deleteZone.classList.remove('drag-over');
        }

        if (!draggedCardId) return;

        const card = currentCards.find(c => c.id.toString() === draggedCardId);
        if (!card) return;

        const success = await deleteCard(draggedCardId);
        if (success) {
            draggedCardId = null;
        }
    }

    // ==========================================
    // 8. ФУНКЦІЇ МОДАЛІВ
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
    // 9. ОБРОБНИКИ ПОДІЙ
    // ==========================================
    if (dom.cardAccountSelect) {
        dom.cardAccountSelect.addEventListener('change', function () {
            selectedCardId = this.value;
            loadMovements();
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

            if (!accountId || !alias || !digits || !expInput || digits.length !== 4 || !/^\d{4}$/.test(digits)) {
                showNotification('Por favor, complete todos los campos correctamente', 'error');
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

                const success = await createCard(cardData);
                if (success) {
                    dom.cardModal.close();
                    dom.createCardForm.reset();
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
    // 10. INITIALIZATION
    // ==========================================
    async function init() {
        console.log('Initializing tarjetas.js...');
        updateDate();

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
        } else {
            showNotification('Sistema cargado correctamente', 'success');
        }

        setInterval(updateDate, 60000);
    }



    window.openCardModal = openCardModal;
    init();
})();