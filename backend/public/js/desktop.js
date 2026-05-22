// desktop.js
(function() {
'use strict';

// escapeHTML, getCookie, formatDate, formatCurrency, apiRequest -> core/utils.js + core/api-client.js

function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return "52, 211, 153";
	const r = parseInt(result[1], 16);
	const g = parseInt(result[2], 16);
	const b = parseInt(result[3], 16);
	return `${r}, ${g}, ${b}`;
}

// ========== GESTIÓN DE CUENTAS BANCARIAS (Lógica Real) ==========

// 1. Variable vacía (se llenará desde la BD)
let accountsData = {};

// Elementos DOM de Cuentas
const accountCard = document.getElementById("accountCard"); // El contenedor principal
const accountSelect = document.getElementById("bankAccountSelect");
const bankNameElement = document.querySelector(".bank-name");
const accountTypeElement = document.querySelector(".account-type");
const bankLogoElement = document.querySelector(".bank-logo i");
const ibanElement = document.querySelector(".iban-number");
const balanceElement = document.querySelector(".balance-amount");

/**
 * Cargar Metas Financieras (Envelopes)
 */
async function loadGoalsFromServer() {
	const container = document.getElementById("goals-container");

	// 1. ESTADO DE CARGA (Spinner)
	container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
            <p style="margin-top: 10px">Cargando tus metas...</p>
        </div>`;

	try {
		const goals = await apiRequest("/api/envelopes");
		if (!goals || goals.length === 0) {
			renderEmptyState();
		} else {
			renderGoals(goals);
		}
	} catch (error) {
		console.error("Error cargando metas:", error);
		renderErrorState();
	}
}

/**
 * CASO 1: Renderizar cuando SÍ hay metas
 */
function renderGoals(goals) {
	const container = document.getElementById("goals-container");
	container.innerHTML = "";

	// Tomamos las primeras 3 para la vista previa
	const previewGoals = goals.slice(0, 3);

	previewGoals.forEach((goal) => {
		// Cálculos seguros (evitar NaN)
		const current = parseFloat(goal.allocated_amount || 0);
		const target = parseFloat(goal.target_amount || 1);
		let percentage = Math.round((current / target) * 100);

		// Limitar visualmente al 100%
		const visualPercentage = percentage > 100 ? 100 : percentage;

		const goalItem = document.createElement("div");
		goalItem.className = "goal-item";

		// Usamos tu estructura HTML exacta
		// Nota: Inyectamos la variable CSS --progress inline para que funcione el círculo
		const safeGoalName = escapeHTML(goal.name);
		const safeGoalIcon = escapeHTML(goal.icon || "fas fa-bullseye");

		goalItem.innerHTML = `
            <div class="goal-left">
                <div class="goal-progress">
                    <svg class="progress-circle" viewBox="0 0 36 36">
                        <circle class="progress-circle-bg" cx="18" cy="18" r="16"></circle>
                        <circle class="progress-circle-fill" cx="18" cy="18" r="16"
                                style="--progress: ${visualPercentage}; stroke-dasharray: 100 100; stroke-dashoffset: ${100 - visualPercentage
			};">
                        </circle>
                    </svg>
                    <div class="progress-text">${percentage}%</div>
                </div>
                <div class="goal-info">
                    <h4>${safeGoalName}</h4>
                    <div class="goal-date" style="font-size: 0.8rem; color: #9ca3af">
                        <i class="${safeGoalIcon}"></i> Meta Activa
                    </div>
                </div>
            </div>
            <div class="goal-stats">
                <div class="goal-stat-item">
                    <span class="goal-stat-label">Ahorrado</span>
                    <span class="goal-stat-value ahorrado">${current.toLocaleString(
				"es-ES",
				{ minimumFractionDigits: 0 },
			)}€</span>
                </div>
                <div class="goal-stat-item">
                    <span class="goal-stat-label">Meta</span>
                    <span class="goal-stat-value meta">${target.toLocaleString(
				"es-ES",
				{ minimumFractionDigits: 0 },
			)}€</span>
                </div>
            </div>
        `;

		// --- NUEVO: HACER CLICKEABLE PARA EDITAR ---
		goalItem.style.cursor = "pointer";
		goalItem.addEventListener("click", () => {
			// Llamamos a la función de abrir modal pasando los datos de ESTA meta
			openGoalModal(goal);
		});
		// -------------------------------------------
		container.appendChild(goalItem);
	});
}

/**
 * CASO 2: Renderizar cuando NO existen (Botón de crear)
 */
function renderEmptyState() {
	const container = document.getElementById("goals-container");
	container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: #6b7280; display: flex; flex-direction: column; align-items: center; gap: 15px;">
            <div style="background: #f3f4f6; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-piggy-bank" style="font-size: 24px; color: #9ca3af;"></i>
            </div>
            <div>
                <h3 style="color: var(--text-main); margin-bottom: 5px;">Aún no tienes metas</h3>
                <p style="font-size: 0.9rem;">Crea un sobre digital para empezar a ahorrar.</p>
            </div>
            
            <button onclick="openGoalModal()" 
                    style="background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 8px; transition: all 0.2s;">
                <i class="fas fa-plus"></i> Crear mi primer sobre
            </button>
        </div>`;
}

/**
 * CASO 3: Renderizar cuando hay ERROR (Botón de reintentar)
 */
function renderErrorState() {
	const container = document.getElementById("goals-container");
	container.innerHTML = `
        <div style="text-align: center; padding: 30px 10px; color: #ef4444; display: flex; flex-direction: column; align-items: center; gap: 10px;">
            <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
            <p>No se pudieron cargar las metas.</p>
            <button onclick="loadGoalsFromServer()" 
                    style="background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 5px 15px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                <i class="fas fa-sync"></i> Reintentar
            </button>
        </div>`;
}

/**
 * Cargar cuentas desde el servidor (Laravel API)
 */
async function loadAccountsFromServer() {
	console.log("Cargando cuentas...");

	// 1. ACTIVAR MODO CARGA
	if (accountCard) accountCard.classList.add("is-loading");

	try {
		await new Promise((r) => setTimeout(r, 800));

		const accounts = await apiRequest("/api/accounts");
		if (!accounts) return;

		// Mapeo de datos
		accountsData = {};
		accounts.forEach((acc) => {
			accountsData[acc.id] = {
				bankName: acc.bank_name,
				accountType: "Cuenta Corriente",
				iban: acc.iban,
				balance: formatCurrency(acc.current_balance),
				rawBalance: acc.current_balance,
				spendable_balance: acc.spendable_balance,
				logoIcon: getBankIcon(acc.bank_name),
			};
		});

		renderAccountDropdown(accounts);

		if (accounts.length > 0) {
			updateAccountInfo(accounts[0].id.toString());
		} else {
			bankNameElement.textContent = "Sin cuentas";
		}
	} catch (error) {
		console.error("Error cargando cuentas:", error);
		showNotification("Error al cargar cuentas", "error");
	} finally {
		if (accountCard) accountCard.classList.remove("is-loading");
	}
}

/**
 * Pintar las opciones en el <select>
 */
function renderAccountDropdown(accounts) {
	if (!accountSelect) return;

	accountSelect.innerHTML = ""; // Limpiar "Cargando..."

	accounts.forEach((acc) => {
		const option = document.createElement("option");
		option.value = acc.id;
		const shortIban = acc.iban ? acc.iban.slice(-4) : "????";
		option.textContent = `${acc.bank_name} - **** ${shortIban}`;
		accountSelect.appendChild(option);
	});
}

function updateAccountInfo(accountId) {
	const account = accountsData[accountId];
	if (!account) return;

	// Actualizar textos básicos
	bankNameElement.textContent = account.bankName;
	accountTypeElement.textContent = account.accountType;
	bankLogoElement.className = account.logoIcon;
	ibanElement.textContent = account.iban;

	// --- LÓGICA DE SALDO DISPONIBLE ---
	// Nota: Necesitamos asegurarnos de que accountsData tenga el nuevo campo.
	// Si hiciste el paso 1 y 2, la API ya lo devuelve.

	// Si la API devuelve el spendable_balance, lo usamos. Si no, usamos el total.
	const rawBalance =
		account.spendable_balance !== undefined
			? account.spendable_balance
			: account.rawBalance;

	const formattedAvailable = formatCurrency(rawBalance);

	// Pintamos el Saldo Disponible (El real menos las metas)
	balanceElement.innerHTML = `
        ${formattedAvailable}
        <div style="font-size: 0.8rem; color: #9ca3af; font-weight: normal; margin-top: 5px;">
            Disponible Real (Total: ${account.balance})
        </div>
    `;

	// Carga las tarjetas asociadas
	loadCardsForAccount(accountId);
}
// Dibuja la tarjeta de credito
function renderMockCards(container) {
	container.innerHTML = ""; // Limpiar spinner

	// Simulamos datos que vendrán de Laravel
	const mockCards = [
		{ alias: "Visa Compra", type: "visa", number: "4532", balance: "1.250,50" },
		{
			alias: "Mastercard Ahorro",
			type: "mastercard",
			number: "8821",
			balance: "500,00",
		},
	];

	mockCards.forEach((card) => {
		const cardEl = document.createElement("div");
		// Añadimos clases para el CSS: 'mini-card' y el tipo ('visa' o 'mastercard')
		cardEl.className = `mini-card ${card.type}`;

		// HTML interno (Estructura Wallet)
		cardEl.innerHTML = `
            <div class="mini-card-top">
                <span style="font-weight: 500; font-size: 0.9rem">${escapeHTML(card.alias)}</span>
                <i class="fab fa-cc-${escapeHTML(card.type)}" style="font-size: 1.5rem"></i>
            </div>
            <div class="mini-card-number">
                **** **** **** ${escapeHTML(card.number)}
            </div>
            <div class="mini-card-bottom">
                <div>
                    <div style="font-size: 0.7rem; opacity: 0.8">Saldo</div>
                    <div style="font-weight: bold">${escapeHTML(card.balance)}€</div>
                </div>
                <div style="font-size: 0.7rem">Exp: 12/28</div>
            </div>
        `;

		// Hacemos que sea clickeable para ir al detalle
		cardEl.addEventListener("click", () => {
			window.location.href = "/misTarjetas"; // En el futuro pasaremos ?id=X
		});

		container.appendChild(cardEl);
	});
}


/**
 * Carga las tarjetas asociadas a una cuenta específica
 */
async function loadCardsForAccount(accountId) {
	const container = document.getElementById("dashboard-cards-container");
	if (!container) return;

	// Spinner
	container.innerHTML = `
        <div style="min-width: 260px; height: 160px; display:flex; align-items:center; justify-content:center; background: #f3f4f6; border-radius: 16px; color: #9ca3af;">
            <i class="fas fa-spinner fa-spin"></i>
        </div>`;

	try {
		const cards = await apiRequest(`/api/accounts/${accountId}/cards`);
		if (cards) {
			renderCards(container, cards);
		}
	} catch (e) {
		console.error("Error cargando tarjetas:", e);
		container.innerHTML =
			'<div style="padding:20px; color: #ef4444">Error al cargar tarjetas</div>';
	}
}

/**
 * Pinta las tarjetas REALES + la Tarjeta Fantasma
 */
function renderCards(container, cards) {
	container.innerHTML = "";

	// Obtenemos la cuenta actual del select principal para pasársela al modal
	const currentAccountId = document.getElementById("bankAccountSelect").value;

	// CASO 1: SIN TARJETAS
	if (cards.length === 0) {
		container.innerHTML = `
            <div style="min-width: 260px; height: 160px; display:flex; flex-direction:column; align-items:center; justify-content:center; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 16px; color: #9ca3af;">
                <i class="fas fa-credit-card" style="font-size: 24px; margin-bottom: 10px;"></i>
                <span style="font-size: 0.9rem;">Sin tarjetas</span>
                <button onclick="openAddCardModal('${currentAccountId}')" style="margin-top: 10px; background: var(--primary); color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 500; font-size: 0.9rem;">
                    Añadir tarjeta
                </button>
            </div>`;
		return;
	}

	// CASO 2: HAY TARJETAS (Pintar lista)
	cards.forEach((card) => {
		const cardEl = document.createElement("div");

		let visualType = "visa";
		if (card.type === "credit") visualType = "mastercard";

		cardEl.className = `mini-card ${visualType}`;

		const balanceFormatted = formatCurrency(card.balance || 0);

		let expDateFormatted = "??/??";
		if (card.expiration_date) {
			const dateObj = new Date(card.expiration_date);
			const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
			const year = dateObj.getFullYear().toString().slice(-2);
			expDateFormatted = `${month}/${year}`;
		}

		cardEl.innerHTML = `
            <div class="mini-card-top">
                <span style="font-weight: 500; font-size: 0.9rem; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${escapeHTML(card.alias)
			}</span>
                <i class="fab fa-cc-${escapeHTML(visualType)}" style="font-size: 1.8rem; opacity: 0.9;"></i>
            </div>
            <div class="mini-card-number">
                **** **** **** ${escapeHTML(card.last_4_digits || "0000")}
            </div>
            <div class="mini-card-bottom">
                <div style="text-align: right;">
                    <div style="font-size: 0.6rem; opacity: 0.7;">Expira</div>
                    <div style="font-size: 0.8rem">${escapeHTML(expDateFormatted)}</div>
                </div>
            </div>
        `;

		cardEl.addEventListener("click", () => {
			window.location.href = "/misTarjetas";
		});

		container.appendChild(cardEl);
	});

	// CASO 3: AÑADIR LA TARJETA FANTASMA AL FINAL (GHOST CARD)
	const ghostCard = document.createElement("div");
	ghostCard.className = "mini-card ghost-card";
	ghostCard.innerHTML = `
        <div class="ghost-content">
            <div class="ghost-icon">
                <i class="fas fa-plus"></i>
            </div>
            <span style="font-size: 0.9rem; font-weight: 500;">Nueva Tarjeta</span>
        </div>
    `;

	// Al hacer clic, abrimos el modal preseleccionando la cuenta actual
	ghostCard.addEventListener("click", () => {
		openAddCardModal(currentAccountId);
	});

	container.appendChild(ghostCard);
}
// Scroll horizontal de tarjetas gestionado por carousel-nav.js + flechas
/**
 * Elegir icono según el nombre del banco
 */
function getBankIcon(bankName) {
	const name = (bankName || "").toLowerCase();
	if (name.includes("caixa")) return "fas fa-star";
	if (name.includes("bbva")) return "fas fa-location-arrow";
	if (name.includes("santander")) return "fas fa-fire";
	if (name.includes("ing")) return "fas fa-lion";
	return "fas fa-university";
}

// Event Listener para cambio de cuenta
if (accountSelect) {
	accountSelect.addEventListener("change", function () {
		updateAccountInfo(this.value);
	});
}

// Botones copiar IBAN
const copyButtons = document.querySelectorAll(".copy-btn");
copyButtons.forEach((button) => {
	button.addEventListener("click", function () {
		const iban = ibanElement.textContent;
		navigator.clipboard
			.writeText(iban)
			.then(() => {
				const originalIcon = this.innerHTML;
				this.innerHTML = '<i class="fas fa-check"></i>';
				this.style.color = "var(--income-green)";
				setTimeout(() => {
					this.innerHTML = originalIcon;
					this.style.color = "";
				}, 2000);
			})
			.catch(() => alert("No se pudo copiar el IBAN."));
	});
});

// ==========================================
// GESTIÓN MODAL NUEVA TARJETA (JS)
// ==========================================

const cardModal = document.getElementById("card-modal");
const closeCardModalBtn = document.getElementById("close-card-modal-btn");
const cancelCardBtn = document.getElementById("cancel-card-btn");
const saveCardBtn = document.getElementById("save-card-btn");
const cardAccountSelect = document.getElementById("card-account-select");

// Auto-rellenar últimos 4 dígitos desde número completo
const desktopCardFullNumber = document.getElementById("card-full-number");
const desktopCardDigits = document.getElementById("card-digits");
if (desktopCardFullNumber && desktopCardDigits) {
	desktopCardFullNumber.addEventListener('input', function () {
		const raw = this.dataset.rawValue || this.value.replace(/\D/g, '');
		if (raw.length >= 4) {
			desktopCardDigits.value = raw.slice(-4);
			desktopCardDigits.dataset.rawValue = raw.slice(-4);
		} else {
			desktopCardDigits.value = '';
			desktopCardDigits.dataset.rawValue = '';
		}
	});
}

// Cerrar modal
if (closeCardModalBtn)
	closeCardModalBtn.addEventListener("click", () => cardModal.close());
if (cancelCardBtn)
	cancelCardBtn.addEventListener("click", () => cardModal.close());

/**
 * Abre el modal para crear tarjeta.
 * @param {string|null} preselectedAccountId - ID de la cuenta si venimos del Dashboard
 */
function openAddCardModal(preselectedAccountId = null) {
	// 1. Limpiar el formulario
	document.getElementById("create-card-form").reset();

	// 2. Rellenar el select de cuentas disponibles
	if (cardAccountSelect) {
		cardAccountSelect.innerHTML = "";
		// Usamos la variable global accountsData que ya cargamos al inicio
		for (const [id, acc] of Object.entries(accountsData)) {
			const option = document.createElement("option");
			option.value = id;
			option.textContent = acc.bankName; // "Caixa Bank..."
			cardAccountSelect.appendChild(option);
		}

		// 3. Pre-seleccionar la cuenta si estamos en el Dashboard
		if (preselectedAccountId) {
			cardAccountSelect.value = preselectedAccountId;
			// Opcional: Bloquear el select para que no cambie de cuenta
			// cardAccountSelect.disabled = true;
		} else {
			cardAccountSelect.disabled = false;
		}
	}

	// 4. Mostrar Modal
	cardModal.showModal();
}

/**
 * GUARDAR TARJETA (POST API)
 */
if (saveCardBtn) {
	saveCardBtn.addEventListener("click", async (e) => {
		e.preventDefault();

		// Recoger datos
		const accountId = cardAccountSelect.value;
		const alias = document.getElementById("card-alias").value;
		const expInput = document.getElementById("card-exp").value;
		const typeRadio = document.querySelector('input[name="card_type"]:checked');

		const cardFullNumberEl = document.getElementById("card-full-number");
		const cardNumberRaw = cardFullNumberEl ? (cardFullNumberEl.dataset.rawValue || cardFullNumberEl.value.replace(/\D/g, '')) : '';
		const securityCode = document.getElementById("card-security-code") ? document.getElementById("card-security-code").value.replace(/\D/g, '') : '';

		// Validaciones
		if (!alias || !expInput) {
			showNotification("Por favor, rellena todos los datos correctamente", "error");
			return;
		}

		if (cardNumberRaw.length !== 16) {
			showNotification("El número de tarjeta debe tener exactamente 16 dígitos", "error");
			return;
		}

		if (securityCode.length !== 3) {
			showNotification("El CVC debe tener exactamente 3 dígitos", "error");
			return;
		}

		let expDate = "";
		if (/^\d{4}-\d{2}$/.test(expInput)) {
			expDate = expInput + "-01";
		} else if (/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expInput)) {
			let parts = expInput.split('/');
			let month = parts[0];
			let year = parts[1].length === 2 ? "20" + parts[1] : parts[1];
			expDate = `${year}-${month}-01`;
		} else {
			showNotification("Formato de caducidad inválido. Usa AAAA-MM o MM/AAAA", "error");
			return;
		}

		// UI Loading
		const originalText = saveCardBtn.innerHTML;
		saveCardBtn.disabled = true;
		saveCardBtn.innerHTML =
			'<i class="fas fa-spinner fa-spin"></i> Guardando...';

		try {
			await apiRequest("/api/cards", "POST", {
				account_id: accountId,
				alias: alias,
				type: typeRadio.value,
				card_number: cardNumberRaw,
				security_code: securityCode,
				expiration_date: expDate,
			});

			showNotification("Tarjeta añadida correctamente", "success");
			cardModal.close();

			const currentDashboardAccount =
				document.getElementById("bankAccountSelect").value;
			if (currentDashboardAccount === accountId) {
				loadCardsForAccount(accountId);
			}
		} catch (error) {
			console.error(error);
			showNotification("Error al crear tarjeta", "error");
		} finally {
			saveCardBtn.disabled = false;
			saveCardBtn.innerHTML = originalText;
		}
	});
}

// ========== GESTIÓN DE ETIQUETAS (TAGS) ==========

async function loadTagsFromServer() {
	console.log("Cargando etiquetas...");
	try {
		const tags = await apiRequest("/api/tags");
		if (tags && typeof renderTags === "function") {
			renderTags(tags);
		}
		return tags;
	} catch (error) {
		console.error("Error cargando etiquetas:", error);
	}
}

function renderTags(tags) {
	const tagsList = document.querySelector(".tags-list");
	const deleteTagArea = document.getElementById("delete-tag-area");

	if (!tagsList) return;

	// Limpiar viejas (manteniendo el área de borrar)
	document.querySelectorAll(".tag-item").forEach((tag) => {
		if (!tag.classList.contains("delete-tag-item")) {
			tag.remove();
		}
	});

	tags.forEach((tag) => {
		const tagElement = document.createElement("div");
		tagElement.className = "tag-item";
		tagElement.setAttribute("draggable", "true");
		tagElement.setAttribute("data-id", tag.id.toString());
		tagElement.style.setProperty("--tag-color", tag.color);

		const safeTagColor = escapeHTML(tag.color);
		const safeTagIcon = escapeHTML(tag.icon || "tag");
		const safeTagName = escapeHTML(tag.name);

		tagElement.innerHTML = `
            <div class="tag-icon" style="background-color: rgba(${hexToRgb(
			tag.color,
		)}, 0.1); color: ${safeTagColor};">
                <i class="fas fa-${safeTagIcon}"></i>
            </div>
            <div class="tag-info">
                <h3>${safeTagName}</h3>
                <p>${tag.created_at
				? "Creada: " + escapeHTML(formatDate(tag.created_at))
				: "Etiqueta"
			}</p>
            </div>
        `;
		tagsList.insertBefore(tagElement, deleteTagArea);
	});

	initializeDragAndDrop();
}

// ========== SISTEMA DRAG & DROP ETIQUETAS (usa modules/drag-drop.js) ==========

function initializeDragAndDrop() {
	window.initDragAndDrop({
		items: ".tag-item:not(.delete-tag-item)",
		dropZone: "#delete-tag-area",
		indicator: "#delete-indicator",
		dataAttr: "data-id",
		onDrop: async function (tagId, tagEl) {
			if (!tagEl) return;

			if (!confirm("¿Estás seguro de eliminar esta etiqueta?")) return;

			tagEl.style.opacity = "0.5";

			try {
				await apiRequest(`/api/tags/${tagId}`, "DELETE");
				tagEl.remove();
				showNotification("Etiqueta eliminada", "success");
				loadTagsFromServer();
			} catch (error) {
				console.error(error);
				showNotification("No se pudo eliminar (¿Está en uso?)", "error");
				tagEl.style.opacity = "1";
			}
		},
	});
}

// ==========================================
// GESTIÓN DE METAS (GOALS) - CREAR / EDITAR
// ==========================================

const goalModal = document.getElementById("goal-modal");
const closeGoalBtn = document.getElementById("close-goal-modal-btn");
const cancelGoalBtn = document.getElementById("cancel-goal-btn");
const saveGoalBtn = document.getElementById("save-goal-btn");
const deleteGoalBtn = document.getElementById("delete-goal-btn");

// Listeners básicos cerrar
if (closeGoalBtn)
	closeGoalBtn.addEventListener("click", () => goalModal.close());
if (cancelGoalBtn)
	cancelGoalBtn.addEventListener("click", () => goalModal.close());

// Selección de Iconos
document.querySelectorAll("#goal-icon-picker .icon-option").forEach((opt) => {
	opt.addEventListener("click", function () {
		document
			.querySelectorAll("#goal-icon-picker .icon-option")
			.forEach((o) => o.classList.remove("selected"));
		this.classList.add("selected");
	});
});

/**
 * Abre el modal de Metas
 * @param {Object|null} goalData - Objeto con datos de la meta (si es editar) o null (crear)
 */
function openGoalModal(goalData = null) {
	const title = document.getElementById("goal-modal-title");
	const form = document.getElementById("goal-form");
	const idInput = document.getElementById("goal-id");

	// Limpiar formulario
	form.reset();

	// Resetear iconos
	document
		.querySelectorAll("#goal-icon-picker .icon-option")
		.forEach((o) => o.classList.remove("selected"));

	if (goalData) {
		// MODO EDICIÓN
		title.innerHTML = '<i class="fas fa-edit"></i> Editar Meta';
		idInput.value = goalData.id;
		document.getElementById("goal-name").value = goalData.name;
		document.getElementById("goal-target").value = goalData.target_amount;
		document.getElementById("goal-current").value = goalData.allocated_amount;

		// Seleccionar icono
		const iconName = goalData.icon
			? goalData.icon.replace("fas fa-", "")
			: "bullseye";
		const iconEl = document.querySelector(
			`#goal-icon-picker .icon-option[data-icon="${iconName}"]`,
		);
		if (iconEl) iconEl.classList.add("selected");
		else
			document
				.querySelector("#goal-icon-picker .icon-option")
				.classList.add("selected"); // fallback

		// Mostrar botón borrar
		if (deleteGoalBtn) deleteGoalBtn.style.display = "block";
	} else {
		// MODO CREAR
		title.innerHTML = '<i class="fas fa-bullseye"></i> Nueva Meta';
		idInput.value = "";
		document
			.querySelector("#goal-icon-picker .icon-option")
			.classList.add("selected"); // Default

		// Ocultar botón borrar
		if (deleteGoalBtn) deleteGoalBtn.style.display = "none";
	}

	goalModal.showModal();
}

/**
 * GUARDAR META (Crear o Editar)
 */
if (saveGoalBtn) {
	saveGoalBtn.addEventListener("click", async (e) => {
		e.preventDefault();

		const id = document.getElementById("goal-id").value;
		const name = document.getElementById("goal-name").value;
		const target = document.getElementById("goal-target").value;
		const current = document.getElementById("goal-current").value || "0";

		// Obtener icono seleccionado
		const selectedIconDiv = document.querySelector(
			"#goal-icon-picker .icon-option.selected",
		);
		const iconName = selectedIconDiv
			? selectedIconDiv.getAttribute("data-icon")
			: "bullseye";
		const fullIconClass = `fas fa-${iconName}`;

		// Obtener ID de cuenta (Usamos la seleccionada en el dashboard o la primera disponible)
		// NOTA: Para simplificar, asignamos a la cuenta actualmente seleccionada en el dashboard
		const accountId = document.getElementById("bankAccountSelect").value;

		if (!name || !target || !accountId) {
			showNotification("Rellena nombre y meta", "error");
			return;
		}

		const originalText = saveGoalBtn.innerHTML;
		saveGoalBtn.disabled = true;
		saveGoalBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';

		try {
			let url = "/api/envelopes";
			let method = "POST";

			if (id) {
				url += `/${id}`;
				method = "PUT";
			}

			await apiRequest(url, method, {
				account_id: accountId,
				name: name,
				target_amount: target,
				allocated_amount: current,
				icon: fullIconClass,
			});

			goalModal.close();
			showNotification(id ? "Meta actualizada" : "Meta creada", "success");
			loadGoalsFromServer();
			loadAccountsFromServer();
		} catch (error) {
			goalModal.close();
			console.error(error);
			var msg = (error && error.message) ? error.message : "Error al guardar meta";
			showNotification(msg, "error");
		} finally {
			saveGoalBtn.disabled = false;
			saveGoalBtn.innerHTML = originalText;
		}
	});
}

/**
 * BORRAR META
 */
if (deleteGoalBtn) {
	deleteGoalBtn.addEventListener("click", async () => {
		const id = document.getElementById("goal-id").value;
		if (!id) return;

		if (!confirm("¿Seguro que quieres eliminar esta meta?")) return;

		try {
			await apiRequest(`/api/envelopes/${id}`, "DELETE");
			goalModal.close();
			showNotification("Meta eliminada", "success");
			loadGoalsFromServer();
			loadAccountsFromServer();
		} catch (e) {
			goalModal.close();
			console.error(e);
			showNotification("No se pudo eliminar", "error");
		}
	});
}

// ========== CREACIÓN DE ETIQUETAS (MODAL) ==========

const tagModal = document.getElementById("tagModal");
const addTagBtn = document.getElementById("desktop-add-tag");
const closeModal = document.getElementById("closeModal");
const cancelTag = document.getElementById("cancelTag");
const saveTag = document.getElementById("saveTag");
const tagNameInput = document.getElementById("tagName");
let selectedColor = "#34d399";
let selectedIcon = "dumbbell";

// Setup Listeners Modal
if (addTagBtn) {
	addTagBtn.addEventListener("click", () => {
		if (tagNameInput) tagNameInput.value = "";
		tagModal.showModal();
	});
}
if (closeModal) closeModal.addEventListener("click", () => tagModal.close());
if (cancelTag) cancelTag.addEventListener("click", () => tagModal.close());

// Color Pickers
document.querySelectorAll(".color-option").forEach((opt) => {
	opt.addEventListener("click", function () {
		document
			.querySelectorAll(".color-option")
			.forEach((o) => o.classList.remove("selected"));
		this.classList.add("selected");
		selectedColor = this.getAttribute("data-color");
	});
});

// Icon Pickers
document.querySelectorAll(".icon-option").forEach((opt) => {
	opt.addEventListener("click", function () {
		document
			.querySelectorAll(".icon-option")
			.forEach((o) => o.classList.remove("selected"));
		this.classList.add("selected");
		selectedIcon = this.getAttribute("data-icon");
	});
});

if (saveTag) {
	saveTag.addEventListener("click", async () => {
		const name = tagNameInput.value.trim();
		if (!name) return showNotification("Pon un nombre", "error");

		saveTag.disabled = true;
		try {
			await apiRequest("/api/tags", "POST", {
				name,
				color: selectedColor,
				icon: selectedIcon,
			});
			tagModal.close();
			showNotification("Creada correctamente", "success");
			loadTagsFromServer();
		} catch (e) {
			console.error(e);
			showNotification("Error al crear", "error");
		} finally {
			saveTag.disabled = false;
		}
	});
}

// ===========================================
// LÓGICA DE CREACIÓN DE CUENTAS (Estilo Ajustes.js)
// ===========================================

// Variables
let accountModal,
	openAccountBtn,
	closeAccountBtn,
	cancelAccountBtn,
	saveAccountBtn;
let accNameInput, accIbanInput, accBalanceInput;
let selectedAccColor = "#217A4A";

// Inicializar elementos
function initAccountElements() {
	accountModal = document.getElementById("account-modal");
	openAccountBtn = document.getElementById("open-account-modal-btn");
	closeAccountBtn = document.getElementById("close-account-modal-btn");
	cancelAccountBtn = document.getElementById("cancel-account-btn");
	saveAccountBtn = document.getElementById("save-account-btn");

	accNameInput = document.getElementById("acc-name");
	accIbanInput = document.getElementById("acc-iban");
	accBalanceInput = document.getElementById("acc-balance");

	// Listener para abrir
	if (openAccountBtn) {
		openAccountBtn.addEventListener("click", () => {
			// Limpiar formulario
			accNameInput.value = "";
			accIbanInput.value = "";
			accBalanceInput.value = "";
			accountModal.showModal();
		});
	}

	// IBAN formatting handled by formatters.js (data-format="iban" + data-country-select)

	// Listeners para cerrar
	if (closeAccountBtn)
		closeAccountBtn.addEventListener("click", () => accountModal.close());
	if (cancelAccountBtn)
		cancelAccountBtn.addEventListener("click", () => accountModal.close());

	// Listener para colores
	const colorOptions = document.querySelectorAll(
		"#acc-color-picker .color-option",
	);
	colorOptions.forEach((opt) => {
		opt.addEventListener("click", function () {
			colorOptions.forEach((o) => o.classList.remove("selected"));
			this.classList.add("selected");
			selectedAccColor = this.getAttribute("data-color");
		});
	});

	// Listener para GUARDAR
	if (saveAccountBtn) {
		saveAccountBtn.addEventListener("click", saveNewAccount);
	}
}

// Función principal de guardado (Igual que saveProfileChanges)
async function saveNewAccount(e) {
	e.preventDefault();

	// Validar campos obligatorios
	if (!accNameInput.value || !accIbanInput.value || !accBalanceInput.value) {
		showNotification("Por favor rellena todos los campos", "error");
		return;
	}

	// Validar longitud IBAN según país
	const countrySelect = document.getElementById("acc-iban-country");
	const countryCode = countrySelect ? countrySelect.value : "ES";
	const ibanDigits = (accIbanInput.dataset.rawValue || accIbanInput.value).replace(/\s+/g, '');
	const expectedLen = (window.IBAN_LENGTHS && window.IBAN_LENGTHS[countryCode]) || 22;

	if (ibanDigits.length !== expectedLen) {
		showNotification("El IBAN para " + countryCode + " debe tener " + expectedLen + " dígitos (" + ibanDigits.length + " introducidos)", "error");
		return;
	}

	const originalText = saveAccountBtn.innerHTML;
	saveAccountBtn.disabled = true;
	saveAccountBtn.innerHTML =
		'<i class="fas fa-spinner fa-spin"></i> Guardando...';

	const newAccountData = {
		bank_name: accNameInput.value,
		iban: countryCode + ibanDigits,
		current_balance: parseFloat(accBalanceInput.value),
		color: selectedAccColor,
	};

	try {
		await apiRequest("/api/accounts", "POST", newAccountData);
		showNotification("Cuenta creada correctamente", "success");
		accountModal.close();
		await loadAccountsFromServer();
	} catch (error) {
		console.error(error);
		showNotification("Error al crear la cuenta", "error");
	} finally {
		saveAccountBtn.disabled = false;
		saveAccountBtn.innerHTML = originalText;
	}
}

// ========== GESTIÓN MODAL TRASPASO ==========

const transferModal = document.getElementById("transfer-modal");
const openTransferBtn = document.getElementById("open-transfer-modal-btn");
const closeTransferBtn = document.getElementById("close-transfer-modal-btn");
const cancelTransferBtn = document.getElementById("cancel-transfer-btn");
const saveTransferBtn = document.getElementById("save-transfer-btn");
const transferOriginSelect = document.getElementById("transfer-origin-account");
const transferDestSelect = document.getElementById("transfer-dest-account");
const transferDestAccountGroup = document.getElementById("transfer-dest-account-group");
const transferDestIbanGroup = document.getElementById("transfer-dest-iban-group");
const transferDestIbanInput = document.getElementById("transfer-dest-iban");

if (closeTransferBtn) closeTransferBtn.addEventListener("click", () => transferModal.close());
if (cancelTransferBtn) cancelTransferBtn.addEventListener("click", () => transferModal.close());

function populateTransferSelects() {
	if (!transferOriginSelect) return;
	transferOriginSelect.innerHTML = '<option value="">Seleccionar cuenta...</option>';
	if (transferDestSelect) {
		transferDestSelect.innerHTML = '<option value="">Seleccionar cuenta...</option>';
	}

	for (const [id, acc] of Object.entries(accountsData)) {
		const opt1 = document.createElement("option");
		opt1.value = id;
		const shortIban = acc.iban ? acc.iban.slice(-4) : "????";
		opt1.textContent = `${acc.bankName} - **** ${shortIban}`;
		transferOriginSelect.appendChild(opt1);

		if (transferDestSelect) {
			const opt2 = document.createElement("option");
			opt2.value = id;
			opt2.textContent = `${acc.bankName} - **** ${shortIban}`;
			transferDestSelect.appendChild(opt2);
		}
	}

	// Pre-seleccionar la cuenta actual del dashboard como origen
	const currentAccountId = accountSelect ? accountSelect.value : null;
	if (currentAccountId) {
		transferOriginSelect.value = currentAccountId;
		updateTransferDestOptions(currentAccountId);
	}
}

function updateTransferDestOptions(excludeId) {
	if (!transferDestSelect) return;
	transferDestSelect.innerHTML = '<option value="">Seleccionar cuenta...</option>';
	for (const [id, acc] of Object.entries(accountsData)) {
		if (id === excludeId) continue;
		const opt = document.createElement("option");
		opt.value = id;
		const shortIban = acc.iban ? acc.iban.slice(-4) : "????";
		opt.textContent = `${acc.bankName} - **** ${shortIban}`;
		transferDestSelect.appendChild(opt);
	}
}

if (transferOriginSelect) {
	transferOriginSelect.addEventListener("change", function () {
		const destType = document.querySelector('input[name="transfer_dest_type"]:checked');
		if (destType && destType.value === "own_account") {
			updateTransferDestOptions(this.value);
		}
	});
}

// Toggle destino: cuenta propia vs IBAN externo
document.querySelectorAll('input[name="transfer_dest_type"]').forEach(radio => {
	radio.addEventListener("change", function () {
		if (this.value === "own_account") {
			if (transferDestAccountGroup) transferDestAccountGroup.style.display = "";
			if (transferDestIbanGroup) transferDestIbanGroup.style.display = "none";
			updateTransferDestOptions(transferOriginSelect ? transferOriginSelect.value : null);
		} else {
			if (transferDestAccountGroup) transferDestAccountGroup.style.display = "none";
			if (transferDestIbanGroup) transferDestIbanGroup.style.display = "";
		}
	});
});

function openTransferModal() {
	document.getElementById("transfer-form").reset();
	// Reset radios
	const ownRadio = document.querySelector('input[name="transfer_dest_type"][value="own_account"]');
	if (ownRadio) ownRadio.checked = true;
	if (transferDestAccountGroup) transferDestAccountGroup.style.display = "";
	if (transferDestIbanGroup) transferDestIbanGroup.style.display = "none";

	populateTransferSelects();
	transferModal.showModal();
}

if (openTransferBtn) {
	openTransferBtn.addEventListener("click", openTransferModal);
}

if (saveTransferBtn) {
	saveTransferBtn.addEventListener("click", async (e) => {
		e.preventDefault();

		const originId = transferOriginSelect ? transferOriginSelect.value : "";
		const amount = parseFloat(document.getElementById("transfer-amount").value);
		const description = document.getElementById("transfer-description").value;
		const destType = document.querySelector('input[name="transfer_dest_type"]:checked').value;

		if (!originId || !amount || isNaN(amount) || !description) {
			showNotification("Rellena todos los campos obligatorios", "error");
			return;
		}

		const payload = {
			type: "traspaso",
			account_id: parseInt(originId),
			amount: Math.abs(amount),
			description: description,
			date: new Date().toISOString().split("T")[0],
			destination_type: destType,
		};

		if (destType === "own_account") {
			const destId = transferDestSelect ? transferDestSelect.value : "";
			if (!destId) {
				showNotification("Selecciona una cuenta de destino", "error");
				return;
			}
			payload.destination_account_id = parseInt(destId);
		} else {
			const iban = transferDestIbanInput ? transferDestIbanInput.value.trim() : "";
			if (!iban) {
				showNotification("Introduce el IBAN de destino", "error");
				return;
			}
			payload.destination_iban = iban;
		}

		const originalText = saveTransferBtn.innerHTML;
		saveTransferBtn.disabled = true;
		saveTransferBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

		try {
			await apiRequest("/api/movements", "POST", payload);
			transferModal.close();
			showNotification("Traspaso realizado correctamente", "success");
			loadAccountsFromServer();
		} catch (error) {
			console.error("Transfer error:", error);
			showNotification("Error al realizar el traspaso", "error");
		} finally {
			saveTransferBtn.disabled = false;
			saveTransferBtn.innerHTML = originalText;
		}
	});
}

// ========== INICIALIZACIÓN PRINCIPAL ==========

// Exponer funciones usadas desde onclick inline en el HTML
window.openGoalModal = openGoalModal;
window.loadGoalsFromServer = loadGoalsFromServer;
window.openAddCardModal = openAddCardModal;

(function initDesktop() {
	console.log("Desktop.js cargado e iniciando...");

	initAccountElements();

	loadAccountsFromServer();

	loadGoalsFromServer();

	loadTagsFromServer();

	setTimeout(initializeDragAndDrop, 500);
})();

})(); // Fin IIFE desktop.js
