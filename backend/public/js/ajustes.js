function getCookie(name) {
	let matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" +
				name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
				"=([^;]*)"
		)
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

// ajustes.js - Оновлена версія без функцій повідомлень
document.addEventListener("DOMContentLoaded", function () {
	// ===========================================
	// ОГОЛОШЕННЯ ВСІХ ЗМІННИХ
	// ===========================================
	let editProfileBtn, profileViewMode, profileEditMode, cancelEditBtn;
	let viewFirstName,
		viewLastName,
		viewEmail,
		viewPhone,
		viewCountry,
		profileFullNameView;
	let firstNameInput, lastNameInput, emailInput, phoneInput, countrySelect;
	let profileForm,
		saveChangesBtn,
		userAvatarTop,
		profileAvatarLarge,
		profileAvatarLargeEdit;
	let changeAvatarBtn, removeAvatarBtn, logoutBtn;
	let changePasswordBtn, viewSessionsBtn, twoFactorToggle;
	let emailNotificationsToggle, pushNotificationsToggle, spendingAlertsToggle;
	let changeLanguageBtn, changeCurrencyBtn, exportDataBtn;
	let passwordModal, closePasswordModal, cancelPasswordBtn, passwordForm;

	let initialFormValues = {};

	// ===========================================
	// ФУНКЦІЇ ДЛЯ РОБОТИ З МОДАЛЬНИМИ ВІКНАМИ
	// ===========================================
	function openModal(modal) {
		if (modal) {
			modal.style.display = "flex";
			document.body.style.overflow = "hidden";
			document.addEventListener("keydown", handleEscapeKey);
		}
	}

	function closeModal(modal) {
		if (modal) {
			modal.style.display = "none";
			document.body.style.overflow = "auto";
			document.removeEventListener("keydown", handleEscapeKey);
		}
	}

	function handleEscapeKey(e) {
		if (e.key === "Escape") {
			const openModals = document.querySelectorAll(
				'.modal[style*="display: flex"]'
			);
			openModals.forEach((modal) => {
				closeModal(modal);
				const forms = modal.querySelectorAll("form");
				forms.forEach((form) => form.reset());
			});
		}
	}

	function changePassword() {
		openModal(passwordModal);
	}

	// ===========================================
	// ФУНКЦІЇ ДЛЯ КНОПОК МОВИ ТА ВАЛЮТИ
	// ===========================================
	function cambiarMoneda() {
		const monedas = [
			{
				codigo: "EUR",
				nombre: "Euro",
				simbolo: "€",
				pais: "🇪🇺",
				descripcion: "Moneda oficial de la Unión Europea",
			},
			{
				codigo: "USD",
				nombre: "Dólar estadounidense",
				simbolo: "$",
				pais: "🇺🇸",
				descripcion: "Moneda oficial de Estados Unidos",
			},
			{
				codigo: "CAD",
				nombre: "Dólar canadiense",
				simbolo: "C$",
				pais: "🇨🇦",
				descripcion: "Moneda oficial de Canadá",
			},
			{
				codigo: "AUD",
				nombre: "Dólar australiano",
				simbolo: "A$",
				pais: "🇦🇺",
				descripcion: "Moneda oficial de Australia",
			},
		];

		// Створюємо модальне вікно для вибору валюти
		const modalHTML = `
            <div class="modal" id="currency-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-money-bill-wave"></i> Seleccionar moneda</h3>
                        <button class="close-modal" id="close-currency-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="modal-description">Elige la moneda principal para tus transacciones y presupuestos:</p>
                        
                        <div class="currency-options">
                            ${monedas
															.map(
																(moneda) => `
                                <div class="currency-option" data-code="${
																	moneda.codigo
																}">
                                    <div class="currency-symbol">${
																			moneda.simbolo
																		}</div>
                                    <div class="currency-info">
                                        <h4>${moneda.nombre}</h4>
                                        <div class="currency-details">
                                            <span class="currency-code">${
																							moneda.codigo
																						}</span>
                                            <span class="currency-country">${
																							moneda.pais
																						}</span>
                                        </div>
                                        ${
																					moneda.descripcion
																						? `<div class="currency-extra-info">${moneda.descripcion}</div>`
																						: ""
																				}
                                    </div>
                                    <div class="currency-check">
                                        <i class="fas fa-check ${
																					moneda.codigo === "EUR"
																						? "active"
																						: ""
																				}"></i>
                                    </div>
                                </div>
                            `
															)
															.join("")}
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-currency-btn">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="save-currency-btn">Guardar cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

		// Додаємо модальне вікно на сторінку
		document.body.insertAdjacentHTML("beforeend", modalHTML);

		const currencyModal = document.getElementById("currency-modal");
		const closeCurrencyModal = document.getElementById("close-currency-modal");
		const cancelCurrencyBtn = document.getElementById("cancel-currency-btn");
		const saveCurrencyBtn = document.getElementById("save-currency-btn");
		const currencyOptions = document.querySelectorAll(".currency-option");

		let selectedCurrency = "EUR";

		// Функція закриття модального вікна
		function closeCurrencyModalFunc() {
			if (currencyModal) {
				currencyModal.remove();
				closeModal(currencyModal);
			}
		}

		// Відкриваємо модальне вікно
		openModal(currencyModal);

		// Обробники подій для вибору валюти
		currencyOptions.forEach((option) => {
			option.addEventListener("click", function () {
				// Знімаємо виділення з усіх опцій
				currencyOptions.forEach((opt) => {
					opt.classList.remove("selected");
					opt.querySelector(".fa-check").classList.remove("active");
				});

				// Виділяємо вибрану опцію
				this.classList.add("selected");
				this.querySelector(".fa-check").classList.add("active");
				selectedCurrency = this.getAttribute("data-code");

				// Додаємо анімацію натискання
				this.style.transform = "scale(0.98)";
				setTimeout(() => {
					this.style.transform = "";
				}, 150);
			});
		});

		// Виділяємо поточну валюту (євро)
		const currentCurrencyOption = document.querySelector(
			'.currency-option[data-code="EUR"]'
		);
		if (currentCurrencyOption) {
			currentCurrencyOption.classList.add("selected");
		}

		// Обробники закриття
		if (closeCurrencyModal) {
			closeCurrencyModal.addEventListener("click", closeCurrencyModalFunc);
		}

		if (cancelCurrencyBtn) {
			cancelCurrencyBtn.addEventListener("click", closeCurrencyModalFunc);
		}

		if (saveCurrencyBtn) {
			saveCurrencyBtn.addEventListener("click", function () {
				const monedaSeleccionada = monedas.find(
					(moneda) => moneda.codigo === selectedCurrency
				);

				if (monedaSeleccionada) {
					// Оновлюємо текст на сторінці
					const settingsInfo = document.querySelector(
						".settings-item:nth-child(2) .settings-info p"
					);
					if (settingsInfo) {
						settingsInfo.textContent = `${monedaSeleccionada.nombre} (${monedaSeleccionada.simbolo})`;
					}

					// Показуємо успішне сповіщення з іконкою валюти
					showNotification(
						`<i class="fas fa-money-bill-wave"></i> Moneda cambiada a ${monedaSeleccionada.simbolo} ${monedaSeleccionada.nombre}`,
						"success"
					);

					// Зберігаємо вибір у localStorage
					localStorage.setItem("selectedCurrency", selectedCurrency);
				}

				closeCurrencyModalFunc();
			});
		}

		// Закриття при кліку на затемнену область
		currencyModal.addEventListener("click", function (e) {
			if (e.target === currencyModal) {
				closeCurrencyModalFunc();
			}
		});

		// Адаптація для мобільних пристроїв
		function adaptForMobile() {
			if (window.innerWidth <= 768) {
				// Додаємо свайп-жест для закриття на мобільних
				let startY;
				currencyModal.addEventListener(
					"touchstart",
					(e) => {
						startY = e.touches[0].clientY;
					},
					{ passive: true }
				);

				currencyModal.addEventListener(
					"touchmove",
					(e) => {
						if (!startY) return;

						const currentY = e.touches[0].clientY;
						const diff = currentY - startY;

						if (diff > 50) {
							// Свайп вниз
							closeCurrencyModalFunc();
						}
					},
					{ passive: true }
				);
			}
		}

		adaptForMobile();
		window.addEventListener("resize", adaptForMobile);
	}

	function exportarDatos() {
		// Створюємо модальне вікно для вибору формату
		const modalHTML = `
            <div class="modal" id="export-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-download"></i> Exportar datos</h3>
                        <button class="close-modal" id="close-export-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="modal-description">Selecciona el formato de exportación y los datos que deseas incluir:</p>
                        
                        <div class="export-options">
                            <div class="export-option" data-format="csv">
                                <i class="fas fa-file-csv"></i>
                                <span>CSV<br><small>Excel, Google Sheets</small></span>
                            </div>
                            <div class="export-option" data-format="pdf">
                                <i class="fas fa-file-pdf"></i>
                                <span>PDF<br><small>Impresión, compartir</small></span>
                            </div>
                            <div class="export-option" data-format="excel">
                                <i class="fas fa-file-excel"></i>
                                <span>Excel<br><small>.xlsx nativo</small></span>
                            </div>
                            <div class="export-option" data-format="json">
                                <i class="fas fa-file-code"></i>
                                <span>JSON<br><small>Desarrollo, backup</small></span>
                            </div>
                        </div>
                        
                        <div class="export-preview">
                            <h4><i class="fas fa-list-check"></i> Datos a exportar:</h4>
                            <ul>
                                <li>
                                    <input type="checkbox" id="export-profile" checked>
                                    <label for="export-profile">Información del perfil</label>
                                </li>
                                <li>
                                    <input type="checkbox" id="export-transactions" checked>
                                    <label for="export-transactions">Transacciones (todas)</label>
                                </li>
                                <li>
                                    <input type="checkbox" id="export-cards">
                                    <label for="export-cards">Tarjetas y cuentas</label>
                                </li>
                                <li>
                                    <input type="checkbox" id="export-reports">
                                    <label for="export-reports">Reportes y análisis</label>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="export-progress" id="export-progress" style="display: none;">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Preparando tu archivo de exportación...</p>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-export-btn">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="start-export-btn">
                                <i class="fas fa-download"></i> Iniciar exportación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

		// Додаємо модальне вікно на сторінку
		document.body.insertAdjacentHTML("beforeend", modalHTML);

		const exportModal = document.getElementById("export-modal");
		const closeExportModal = document.getElementById("close-export-modal");
		const cancelExportBtn = document.getElementById("cancel-export-btn");
		const startExportBtn = document.getElementById("start-export-btn");
		const exportOptions = document.querySelectorAll(".export-option");
		const exportProgress = document.getElementById("export-progress");

		let selectedFormat = "csv";

		// Функція закриття модального вікна
		function closeExportModalFunc() {
			if (exportModal) {
				exportModal.remove();
				closeModal(exportModal);
			}
		}

		// Відкриваємо модальне вікно
		openModal(exportModal);

		// Обробники подій
		exportOptions.forEach((option) => {
			option.addEventListener("click", function () {
				exportOptions.forEach((opt) => opt.classList.remove("active"));
				this.classList.add("active");
				selectedFormat = this.getAttribute("data-format");
			});
		});

		// Вибираємо CSV за замовчуванням
		exportOptions[0].classList.add("active");

		if (closeExportModal) {
			closeExportModal.addEventListener("click", closeExportModalFunc);
		}

		if (cancelExportBtn) {
			cancelExportBtn.addEventListener("click", closeExportModalFunc);
		}

		if (startExportBtn) {
			startExportBtn.addEventListener("click", function () {
				// Перевіряємо, чи вибрано хоча б один тип даних
				const exportProfile = document.getElementById("export-profile").checked;
				const exportTransactions = document.getElementById(
					"export-transactions"
				).checked;
				const exportCards = document.getElementById("export-cards").checked;
				const exportReports = document.getElementById("export-reports").checked;

				if (
					!exportProfile &&
					!exportTransactions &&
					!exportCards &&
					!exportReports
				) {
					showNotification(
						"Por favor, selecciona al menos un tipo de dato para exportar.",
						"info"
					);
					return;
				}

				// Показуємо індикатор прогресу
				exportProgress.style.display = "block";
				startExportBtn.disabled = true;
				startExportBtn.innerHTML =
					'<i class="fas fa-spinner fa-spin"></i> Procesando...';

				// Готуємо повідомлення про експорт
				let exportMessage =
					"Exportando datos en formato " +
					selectedFormat.toUpperCase() +
					"...\n\n";
				exportMessage += "Incluyendo: ";

				const selectedItems = [];
				if (exportProfile) selectedItems.push("perfil");
				if (exportTransactions) selectedItems.push("transacciones");
				if (exportCards) selectedItems.push("tarjetas");
				if (exportReports) selectedItems.push("reportes");

				exportMessage += selectedItems.join(", ");

				showNotification(exportMessage, "info");

				// Симуляція процесу експорту
				setTimeout(() => {
					// Створюємо фейковий файл для завантаження
					let fileContent = "";
					let fileName = `budgetbuddy_export_${
						new Date().toISOString().split("T")[0]
					}`;
					let mimeType = "text/plain";

					switch (selectedFormat) {
						case "csv":
							fileContent = "Fecha,Descripción,Categoría,Monto,Tipo\n";
							fileContent +=
								"2024-04-28,Compra supermercado,Alimentación,45.50,Gasto\n";
							fileContent +=
								"2024-04-27,Salario mensual,Ingresos,2500.00,Ingreso\n";
							fileContent +=
								"2024-04-26,Pago electricidad,Servicios,85.30,Gasto\n";
							fileName += ".csv";
							mimeType = "text/csv";
							break;
						case "pdf":
							fileContent = "Contenido PDF generado automáticamente\n\n";
							fileContent += "Resumen de tu cuenta\n";
							fileContent +=
								"Fecha de exportación: " +
								new Date().toLocaleDateString() +
								"\n";
							fileContent += "Total de transacciones: 156\n";
							fileContent += "Balance actual: €2,345.67\n";
							fileName += ".pdf";
							mimeType = "application/pdf";
							break;
						case "excel":
							fileContent = "EXCEL_CONTENT_PLACEHOLDER";
							fileName += ".xlsx";
							mimeType =
								"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
							break;
						case "json":
							fileContent = JSON.stringify(
								{
									metadata: {
										exportDate: new Date().toISOString(),
										format: "json",
										version: "1.0",
									},
									profile: exportProfile
										? {
												nombre: "John",
												apellido: "Doe",
												email: "john.doe@example.com",
												telefono: "+34 123 456 789",
										  }
										: null,
									transactions: exportTransactions ? [] : null,
									cards: exportCards ? [] : null,
									reports: exportReports ? [] : null,
								},
								null,
								2
							);
							fileName += ".json";
							mimeType = "application/json";
							break;
					}

					// Приховуємо індикатор прогресу
					exportProgress.style.display = "none";
					startExportBtn.disabled = false;
					startExportBtn.innerHTML =
						'<i class="fas fa-download"></i> Iniciar exportación';

					// Створюємо посилання для завантаження
					const blob = new Blob([fileContent], { type: mimeType });
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = fileName;
					document.body.appendChild(a);
					a.click();
					document.body.removeChild(a);
					URL.revokeObjectURL(url);

					showNotification(
						`<i class="fas fa-check-circle"></i> Datos exportados exitosamente como ${fileName}`,
						"success"
					);

					// Закриваємо модальне вікно
					setTimeout(() => {
						closeExportModalFunc();
					}, 1500);
				}, 2000);
			});
		}

		// Закриття при кліку на затемнену область
		exportModal.addEventListener("click", function (e) {
			if (e.target === exportModal) {
				closeExportModalFunc();
			}
		});

		// Адаптація для мобільних пристроїв
		function adaptExportForMobile() {
			if (window.innerWidth <= 768) {
				// Оптимізація для мобільних
				const exportOptionsContainer =
					document.querySelector(".export-options");
				if (exportOptionsContainer) {
					exportOptionsContainer.style.gap = "8px";
				}

				// Додаємо свайп для закриття
				let startY;
				exportModal.addEventListener(
					"touchstart",
					(e) => {
						startY = e.touches[0].clientY;
					},
					{ passive: true }
				);

				exportModal.addEventListener(
					"touchmove",
					(e) => {
						if (!startY) return;

						const currentY = e.touches[0].clientY;
						const diff = currentY - startY;

						if (diff > 50) {
							closeExportModalFunc();
						}
					},
					{ passive: true }
				);
			}
		}

		adaptExportForMobile();
		window.addEventListener("resize", adaptExportForMobile);
	}

	function verSesiones() {
		// Дані про сесії - тільки айфон та макбук, обидва з Барселони
		const sesiones = [
			{
				id: 1,
				dispositivo: "iPhone 13 Pro",
				navegador: "Safari 16",
				sistema: "iOS 16.4",
				ubicacion: "Barcelona, España",
				ip: "192.168.1.100",
				ultimaActividad: "Hace 5 minutos",
				fechaInicio: "Hoy, 10:30",
				esActual: true,
				icono: "fas fa-mobile-alt",
			},
			{
				id: 2,
				dispositivo: "MacBook Pro",
				navegador: "Chrome 112",
				sistema: "macOS Ventura",
				ubicacion: "Barcelona, España",
				ip: "192.168.1.101",
				ultimaActividad: "Hace 2 horas",
				fechaInicio: "Ayer, 14:20",
				esActual: false,
				icono: "fas fa-laptop",
			},
		];

		// Створюємо модальне вікно для перегляду сесій
		const modalHTML = `
            <div class="modal" id="sessions-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-user-clock"></i> Sesiones activas</h3>
                        <button class="close-modal" id="close-sessions-modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="modal-description">Revisa y gestiona todas las sesiones activas de tu cuenta:</p>
                        
                        <div class="sessions-list">
                            ${sesiones
															.map(
																(sesion) => `
                                <div class="session-item ${
																	sesion.esActual ? "active" : ""
																}" data-id="${sesion.id}">
                                    <div class="session-icon">
                                        <i class="${sesion.icono}"></i>
                                    </div>
                                    <div class="session-info">
                                        <h4>${sesion.dispositivo}</h4>
                                        <div class="session-details">
                                            <span class="session-detail">
                                                <i class="fas fa-globe"></i> ${
																									sesion.navegador
																								}
                                            </span>
                                            <span class="session-detail">
                                                <i class="fas fa-map-marker-alt"></i> ${
																									sesion.ubicacion
																								}
                                            </span>
                                            <span class="session-detail">
                                                <i class="fas fa-clock"></i> ${
																									sesion.ultimaActividad
																								}
                                            </span>
                                        </div>
                                        <div class="session-status ${
																					sesion.esActual
																						? "active"
																						: "inactive"
																				}">
                                            <span class="status-dot ${
																							sesion.esActual
																								? "active"
																								: "inactive"
																						}"></span>
                                            ${
																							sesion.esActual
																								? "Sesión actual"
																								: "Inactiva desde " +
																								  sesion.ultimaActividad
																						}
                                        </div>
                                    </div>
                                    <div class="session-actions">
                                        ${
																					!sesion.esActual
																						? `
                                            <button class="session-action-btn danger" title="Cerrar sesión" data-action="logout">
                                                <i class="fas fa-sign-out-alt"></i>
                                            </button>
                                        `
																						: ""
																				}
                                        <button class="session-action-btn info" title="Más información" data-action="info">
                                            <i class="fas fa-info-circle"></i>
                                        </button>
                                    </div>
                                </div>
                            `
															)
															.join("")}
                        </div>
                        
                        <div class="sessions-actions">
                            <button class="btn btn-secondary" id="close-all-sessions">
                                <i class="fas fa-sign-out-alt"></i> Cerrar todas las sesiones
                            </button>
                            <button class="btn btn-primary" id="refresh-sessions">
                                <i class="fas fa-sync-alt"></i> Actualizar lista
                            </button>
                        </div>
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancel-sessions-btn">Cerrar</button>
                            <button type="button" class="btn btn-primary" id="help-sessions-btn">
                                <i class="fas fa-question-circle"></i> Ayuda
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

		// Додаємо модальне вікно на сторінку
		document.body.insertAdjacentHTML("beforeend", modalHTML);

		const sessionsModal = document.getElementById("sessions-modal");
		const closeSessionsModal = document.getElementById("close-sessions-modal");
		const cancelSessionsBtn = document.getElementById("cancel-sessions-btn");
		const helpSessionsBtn = document.getElementById("help-sessions-btn");
		const closeAllSessionsBtn = document.getElementById("close-all-sessions");
		const refreshSessionsBtn = document.getElementById("refresh-sessions");
		const sessionItems = document.querySelectorAll(".session-item");
		const actionButtons = document.querySelectorAll(".session-action-btn");

		// Функція закриття модального вікна
		function closeSessionsModalFunc() {
			if (sessionsModal) {
				sessionsModal.remove();
				closeModal(sessionsModal);
			}
		}

		// Відкриваємо модальне вікно
		openModal(sessionsModal);

		// Обробник закриття всіх сесій
		if (closeAllSessionsBtn) {
			closeAllSessionsBtn.addEventListener("click", function () {
				if (
					confirm(
						"¿Estás seguro de que quieres cerrar todas las sesiones excepto la actual?"
					)
				) {
					// Показуємо індикатор завантаження
					const btnText = closeAllSessionsBtn.innerHTML;
					closeAllSessionsBtn.innerHTML =
						'<i class="fas fa-spinner fa-spin"></i> Cerrando sesiones...';
					closeAllSessionsBtn.disabled = true;

					setTimeout(() => {
						// Симулюємо закриття сесій
						const nonCurrentSessions = document.querySelectorAll(
							".session-item:not(.active)"
						);
						nonCurrentSessions.forEach((session) => {
							session.classList.add("danger");
							session.style.opacity = "0.5";
							session.style.pointerEvents = "none";

							// Прибираємо кнопку виходу
							const logoutBtn = session.querySelector(
								'.session-action-btn[data-action="logout"]'
							);
							if (logoutBtn) {
								logoutBtn.style.display = "none";
							}
						});

						showNotification(
							'<i class="fas fa-check-circle"></i> Todas las sesiones han sido cerradas correctamente.',
							"success"
						);

						// Повертаємо кнопку в початковий стан
						closeAllSessionsBtn.innerHTML = btnText;
						closeAllSessionsBtn.disabled = false;
						closeAllSessionsBtn.innerHTML =
							'<i class="fas fa-check"></i> Sesiones cerradas';
						closeAllSessionsBtn.disabled = true;

						setTimeout(() => {
							closeAllSessionsBtn.innerHTML =
								'<i class="fas fa-sign-out-alt"></i> Cerrar todas las sesiones';
							closeAllSessionsBtn.disabled = false;
						}, 2000);
					}, 1500);
				}
			});
		}

		// Обробник оновлення списку
		if (refreshSessionsBtn) {
			refreshSessionsBtn.addEventListener("click", function () {
				const btnText = refreshSessionsBtn.innerHTML;
				refreshSessionsBtn.innerHTML =
					'<i class="fas fa-spinner fa-spin"></i> Actualizando...';
				refreshSessionsBtn.disabled = true;

				setTimeout(() => {
					showNotification(
						'<i class="fas fa-sync-alt"></i> Lista de sesiones actualizada.',
						"success"
					);
					refreshSessionsBtn.innerHTML = btnText;
					refreshSessionsBtn.disabled = false;
				}, 1000);
			});
		}

		// Обробники дій для кожної сесії
		actionButtons.forEach((button) => {
			button.addEventListener("click", function () {
				const action = this.getAttribute("data-action");
				const sessionItem = this.closest(".session-item");
				const sessionId = sessionItem.getAttribute("data-id");
				const session = sesiones.find((s) => s.id === parseInt(sessionId));

				if (action === "logout") {
					if (
						confirm(
							`¿Estás seguro de que quieres cerrar la sesión en ${session.dispositivo}?`
						)
					) {
						// Показуємо анімацію закриття
						this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
						this.disabled = true;

						setTimeout(() => {
							sessionItem.classList.add("danger");
							sessionItem.style.opacity = "0.5";
							sessionItem.style.pointerEvents = "none";
							this.style.display = "none";

							// Оновлюємо статус
							const statusElement =
								sessionItem.querySelector(".session-status");
							if (statusElement) {
								statusElement.innerHTML = `
                                    <span class="status-dot danger"></span>
                                    Sesión cerrada
                                `;
								statusElement.className = "session-status danger";
							}

							showNotification(
								`<i class="fas fa-check-circle"></i> Sesión en ${session.dispositivo} cerrada correctamente.`,
								"success"
							);
						}, 1000);
					}
				} else if (action === "info") {
					// Показуємо детальну інформацію про сесію
					const modalInfoHTML = `
                        <div class="modal" id="session-info-modal">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h3><i class="${
																			session.icono
																		}"></i> Información de sesión</h3>
                                    <button class="close-modal" id="close-info-modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                                        <div style="width: 60px; height: 60px; border-radius: 15px; background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                                            <i class="${session.icono}"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0 0 5px 0; font-size: 18px;">${
																							session.dispositivo
																						}</h4>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <span class="status-dot ${
																									session.esActual
																										? "active"
																										: "inactive"
																								}"></span>
                                                <span style="color: ${
																									session.esActual
																										? "#00B934"
																										: "var(--text-muted)"
																								}; font-size: 14px;">
                                                    ${
																											session.esActual
																												? "Sesión actual"
																												: "Sesión inactiva"
																										}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="background: var(--gray-light); padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                                        <h5 style="margin: 0 0 10px 0; color: var(--text-main);">Detalles de la sesión:</h5>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Dispositivo:</div>
                                                <div style="font-weight: 500;">${
																									session.dispositivo
																								}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Navegador:</div>
                                                <div style="font-weight: 500;">${
																									session.navegador
																								}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Sistema:</div>
                                                <div style="font-weight: 500;">${
																									session.sistema
																								}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Ubicación:</div>
                                                <div style="font-weight: 500;">${
																									session.ubicacion
																								}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">IP:</div>
                                                <div style="font-weight: 500; font-family: monospace;">${
																									session.ip
																								}</div>
                                            </div>
                                            <div>
                                                <div style="font-size: 12px; color: var(--text-muted);">Fecha inicio:</div>
                                                <div style="font-weight: 500;">${
																									session.fechaInicio
																								}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="margin-bottom: 20px;">
                                        <h5 style="margin: 0 0 10px 0; color: var(--text-main);">Actividad reciente:</h5>
                                        <ul style="margin: 0; padding-left: 20px;">
                                            <li>Inicio de sesión: ${
																							session.fechaInicio
																						}</li>
                                            <li>Última actividad: ${
																							session.ultimaActividad
																						}</li>
                                            ${
																							session.esActual
																								? "<li>Sesión actualmente activa</li>"
																								: "<li>Sesión inactiva</li>"
																						}
                                        </ul>
                                    </div>
                                    
                                    <div style="display: flex; gap: 10px;">
                                        ${
																					!session.esActual
																						? `
                                            <button class="btn btn-danger" id="logout-this-session" style="flex: 1;">
                                                <i class="fas fa-sign-out-alt"></i> Cerrar esta sesión
                                            </button>
                                        `
																						: ""
																				}
                                        <button class="btn btn-secondary" id="close-info-btn" style="flex: 1;">
                                            Cerrar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

					document.body.insertAdjacentHTML("beforeend", modalInfoHTML);
					const infoModal = document.getElementById("session-info-modal");
					const closeInfoModal = document.getElementById("close-info-modal");
					const closeInfoBtn = document.getElementById("close-info-btn");
					const logoutThisSession = document.getElementById(
						"logout-this-session"
					);

					openModal(infoModal);

					// Закриття модального вікна інформації
					function closeInfoModalFunc() {
						if (infoModal) {
							infoModal.remove();
							closeModal(infoModal);
						}
					}

					if (closeInfoModal)
						closeInfoModal.addEventListener("click", closeInfoModalFunc);
					if (closeInfoBtn)
						closeInfoBtn.addEventListener("click", closeInfoModalFunc);

					// Закриття конкретної сесії з вікна інформації
					if (logoutThisSession) {
						logoutThisSession.addEventListener("click", function () {
							if (
								confirm(
									`¿Estás seguro de que quieres cerrar la sesión en ${session.dispositivo}?`
								)
							) {
								closeInfoModalFunc();

								// Симулюємо закриття сесії
								sessionItem.classList.add("danger");
								sessionItem.style.opacity = "0.5";
								sessionItem.style.pointerEvents = "none";

								const logoutBtn = sessionItem.querySelector(
									'.session-action-btn[data-action="logout"]'
								);
								if (logoutBtn) {
									logoutBtn.style.display = "none";
								}

								// Оновлюємо статус
								const statusElement =
									sessionItem.querySelector(".session-status");
								if (statusElement) {
									statusElement.innerHTML = `
                                        <span class="status-dot danger"></span>
                                        Sesión cerrada
                                    `;
									statusElement.className = "session-status danger";
								}

								showNotification(
									`<i class="fas fa-check-circle"></i> Sesión en ${session.dispositivo} cerrada correctamente.`,
									"success"
								);
							}
						});
					}

					// Закриття при кліку на затемнену область
					infoModal.addEventListener("click", function (e) {
						if (e.target === infoModal) {
							closeInfoModalFunc();
						}
					});
				}
			});
		});

		// Обробники закриття
		if (closeSessionsModal) {
			closeSessionsModal.addEventListener("click", closeSessionsModalFunc);
		}

		if (cancelSessionsBtn) {
			cancelSessionsBtn.addEventListener("click", closeSessionsModalFunc);
		}

		if (helpSessionsBtn) {
			helpSessionsBtn.addEventListener("click", function () {
				showNotification(
					'<i class="fas fa-question-circle"></i> Las sesiones muestran los dispositivos donde has iniciado sesión. Puedes cerrar sesiones no autorizadas aquí.',
					"info"
				);
			});
		}

		// Закриття при кліку на затемнену область
		sessionsModal.addEventListener("click", function (e) {
			if (e.target === sessionsModal) {
				closeSessionsModalFunc();
			}
		});

		// Адаптація для мобільних пристроїв
		function adaptSessionsForMobile() {
			if (window.innerWidth <= 768) {
				// Додаємо свайп для закриття
				let startY;
				sessionsModal.addEventListener(
					"touchstart",
					(e) => {
						startY = e.touches[0].clientY;
					},
					{ passive: true }
				);

				sessionsModal.addEventListener(
					"touchmove",
					(e) => {
						if (!startY) return;

						const currentY = e.touches[0].clientY;
						const diff = currentY - startY;

						if (diff > 50) {
							closeSessionsModalFunc();
						}
					},
					{ passive: true }
				);
			}
		}

		adaptSessionsForMobile();
		window.addEventListener("resize", adaptSessionsForMobile);
	}

	// ===========================================
	// ІНІЦІАЛІЗАЦІЯ ЕЛЕМЕНТІВ (ФУНКЦІЯ)
	// ===========================================
	function initElements() {
		// Елементи для перемикання режимів
		editProfileBtn = document.getElementById("edit-profile-btn");
		profileViewMode = document.getElementById("profile-view-mode");
		profileEditMode = document.getElementById("profile-edit-mode");
		cancelEditBtn = document.getElementById("cancel-edit-btn");

		// Елементи режиму перегляду
		viewEmail = document.getElementById("view-email");
		viewPhone = document.getElementById("view-phone");
		profileFullNameView = document.getElementById("profile-full-name-view");

		// Елементи режиму редагування
		firstNameInput = document.getElementById("first-name");
		lastNameInput = document.getElementById("last-name");
		emailInput = document.getElementById("email");
		phoneInput = document.getElementById("phone");

		// Елементи для роботи з профілем
		profileForm = document.getElementById("profile-form");
		saveChangesBtn = document.getElementById("save-changes-btn");
		userAvatarTop = document.getElementById("user-avatar-top");
		profileAvatarLarge = document.getElementById("profile-avatar-large");
		profileAvatarLargeEdit = document.getElementById(
			"profile-avatar-large-edit"
		);
		changeAvatarBtn = document.getElementById("change-avatar-btn");
		removeAvatarBtn = document.getElementById("remove-avatar-btn");

		// Нові елементи
		logoutBtn = document.getElementById("logout-btn");

		// Інші елементи
		changePasswordBtn = document.getElementById("change-password-btn");
		viewSessionsBtn = document.getElementById("view-sessions-btn");
		twoFactorToggle = document.getElementById("two-factor-toggle");
		emailNotificationsToggle = document.getElementById(
			"email-notifications-toggle"
		);
		pushNotificationsToggle = document.getElementById(
			"push-notifications-toggle"
		);
		spendingAlertsToggle = document.getElementById("spending-alerts-toggle");
		changeCurrencyBtn = document.getElementById("change-currency-btn");
		exportDataBtn = document.getElementById("export-data-btn");

		// Модальні вікна
		passwordModal = document.getElementById("password-modal");
		closePasswordModal = document.getElementById("close-password-modal");
		cancelPasswordBtn = document.getElementById("cancel-password-btn");
		passwordForm = document.getElementById("password-form");
	}

	// ===========================================
	// ФУНКЦІЇ ДЛЯ ПЕРЕМИКАННЯ РЕЖИМІВ
	// ===========================================
	async function initializeProfileData() {
		try {
			// Petición al backend para obtener el usuario real
			const response = await fetch("/api/profile", {
				headers: { Accept: "application/json" },
			});

			if (!response.ok) throw new Error("No se pudo cargar el perfil");

			const user = await response.json();

			// TRUCO: Laravel guarda "Nombre Apellido" junto. Aquí lo separamos.
			const names = user.name ? user.name.split(" ") : ["Usuario", ""];
			const firstName = names[0];
			const lastName = names.slice(1).join(" ") || "";

			const userData = {
				firstName: firstName,
				lastName: lastName,
				email: user.email,
				phone: user.phone || "", // Si no tienes telf, sale vacío
			};

			initialFormValues = { ...userData };

			// Actualizamos la pantalla con los datos reales
			updateViewMode(userData);
			updateEditMode(userData);
			updateAvatar(userData.firstName, userData.lastName);
		} catch (error) {
			console.error(error);
			// Si falla, mostramos notificación pero no rompemos la app
			if (typeof showNotification === "function") {
				showNotification("Error conectando con el servidor", "error");
			}
		}
	}

	function updateEditMode(data) {
		if (firstNameInput) firstNameInput.value = data.firstName;
		if (lastNameInput) lastNameInput.value = data.lastName;
		if (emailInput) emailInput.value = data.email;
		if (phoneInput) phoneInput.value = data.phone;
	}

	function switchToEditMode() {
		if (profileViewMode) profileViewMode.style.display = "none";
		if (profileEditMode) profileEditMode.style.display = "block";
		if (editProfileBtn) editProfileBtn.style.display = "none";
	}

	function switchToViewMode() {
		if (profileEditMode) profileEditMode.style.display = "none";
		if (profileViewMode) profileViewMode.style.display = "block";
		if (editProfileBtn) editProfileBtn.style.display = "flex";

		updateEditMode(initialFormValues);
	}

	function updateAvatar(firstName, lastName) {
		const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
		if (userAvatarTop) userAvatarTop.textContent = initials;
		if (profileAvatarLarge) profileAvatarLarge.textContent = initials;
		if (profileAvatarLargeEdit) profileAvatarLargeEdit.textContent = initials;
	}

	async function saveProfileChanges() {
		const btn = document.getElementById("save-changes-btn");
		const originalText = btn.innerHTML;
		btn.disabled = true;
		btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

		try {
			// 1. Pedir permiso a Laravel (CSRF)
			await fetch("/sanctum/csrf-cookie", { method: "GET" });

			// 2. Preparar los datos (Juntamos nombre y apellido)
			const fullName =
				document.getElementById("first-name").value +
				" " +
				document.getElementById("last-name").value;

			const updatedData = {
				name: fullName.trim(),
				email: document.getElementById("email").value,
				phone: document.getElementById("phone").value,
			};

			// 3. Enviar al servidor (PUT)
			const response = await fetch("/api/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					"X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
				},
				body: JSON.stringify(updatedData),
			});

			if (!response.ok) throw new Error("Error al guardar");

			const result = await response.json();

			// 4. Actualizar visualmente con la respuesta del servidor
			const names = result.user.name.split(" ");
			const newData = {
				firstName: names[0],
				lastName: names.slice(1).join(" ") || "",
				email: result.user.email,
				phone: result.user.phone || "",
			};

			updateViewMode(newData);
			updateAvatar(newData.firstName, newData.lastName);
			switchToViewMode();
			showNotification(
				'<i class="fas fa-check-circle"></i> Guardado en la base de datos.',
				"success"
			);
		} catch (error) {
			console.error(error);
			showNotification("⚠️ Error al guardar los datos.", "error");
		} finally {
			btn.disabled = false;
			btn.innerHTML = originalText;
		}
	}

	// ===========================================
	// ІНШІ ФУНКЦІЇ
	// ===========================================
	async function logoutUser() {
		if (!confirm("¿Estás seguro de que quieres salir?")) return;

		try {
			await fetch("/sanctum/csrf-cookie", { method: "GET" });

			const response = await fetch("/api/logout", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					"X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
				},
			});

			// Tanto si sale bien como si da error (sesión caducada), redirigimos
			showNotification(
				'<i class="fas fa-sign-out-alt"></i> Saliendo...',
				"info"
			);
			setTimeout(() => {
				window.location.href = "/login";
			}, 1000);
		} catch (error) {
			console.error("Error logout:", error);
			window.location.href = "/login";
		}
	}

	function showNotification(message, type = "info") {
		// Видаляємо старі сповіщення
		const oldNotifications = document.querySelectorAll(".notification");
		oldNotifications.forEach((notification) => {
			notification.remove();
		});

		const notification = document.createElement("div");
		notification.className = `notification notification-${type}`;

		const icon =
			type === "success"
				? "check-circle"
				: type === "info"
				? "info-circle"
				: "exclamation-triangle";

		notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

		notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${
							type === "success"
								? "#d1fae5"
								: type === "info"
								? "#fef3c7"
								: "#fee2e2"
						};
            color: ${
							type === "success"
								? "#065f46"
								: type === "info"
								? "#92400e"
								: "#991b1b"
						};
            padding: 14px 18px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            z-index: 3000;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            animation: slideIn 0.3s ease;
            border-left: 4px solid ${
							type === "success"
								? "#10b981"
								: type === "info"
								? "#f59e0b"
								: "#ef4444"
						};
            font-family: 'Roboto', sans-serif;
        `;

		const style = document.createElement("style");
		style.textContent = `
            @keyframes slideIn { 
                from { 
                    transform: translateX(100%); 
                    opacity: 0; 
                } 
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                } 
            }
            @keyframes slideOut { 
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                } 
                to { 
                    transform: translateX(100%); 
                    opacity: 0; 
                } 
            }
        `;
		document.head.appendChild(style);

		document.body.appendChild(notification);

		const closeBtn = notification.querySelector(".notification-close");
		closeBtn.addEventListener("click", () => {
			notification.style.animation = "slideOut 0.3s ease";
			setTimeout(() => notification.remove(), 300);
		});

		// Адаптація для мобільних
		if (window.innerWidth <= 768) {
			notification.style.top = "10px";
			notification.style.right = "10px";
			notification.style.left = "10px";
			notification.style.maxWidth = "calc(100% - 20px)";
			notification.style.padding = "12px 16px";
		}

		setTimeout(() => {
			if (notification.parentNode) {
				notification.style.animation = "slideOut 0.3s ease";
				setTimeout(() => notification.remove(), 300);
			}
		}, 5000);
	}

	// ===========================================
	// ІНІЦІАЛІЗАЦІЯ ТА ПІДПИСКА НА ПОДІЇ
	// ===========================================
	function initEventListeners() {
		// Основні події
		if (editProfileBtn)
			editProfileBtn.addEventListener("click", switchToEditMode);
		if (cancelEditBtn)
			cancelEditBtn.addEventListener("click", switchToViewMode);

		// Подія форми профілю
		if (profileForm) {
			profileForm.addEventListener("submit", function (e) {
				e.preventDefault();
				saveProfileChanges();
			});
		}

		// Подія кнопки збереження (додатково)
		if (saveChangesBtn) {
			saveChangesBtn.addEventListener("click", function (e) {
				e.preventDefault();
				saveProfileChanges();
			});
		}

		// Подія кнопки "Cambiar contraseña"
		if (changePasswordBtn) {
			changePasswordBtn.addEventListener("click", changePassword);
		}

		// Подія кнопки "Salir"
		if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

		// Подія кнопки "Cambiar foto"
		if (changeAvatarBtn) {
			changeAvatarBtn.addEventListener("click", function () {
				const fileInput = document.createElement("input");
				fileInput.type = "file";
				fileInput.accept = "image/*";
				fileInput.style.display = "none";
				fileInput.addEventListener("change", function (e) {
					if (e.target.files && e.target.files[0]) {
						showNotification(
							'<i class="fas fa-camera"></i> Foto de perfil actualizada correctamente.',
							"success"
						);
					}
				});
				document.body.appendChild(fileInput);
				fileInput.click();
				document.body.removeChild(fileInput);
			});
		}

		// Подія кнопки "Eliminar" (аватар)
		if (removeAvatarBtn) {
			removeAvatarBtn.addEventListener("click", function () {
				if (
					confirm("¿Estás seguro de que quieres eliminar tu foto de perfil?")
				) {
					const firstName = firstNameInput ? firstNameInput.value : "John";
					const lastName = lastNameInput ? lastNameInput.value : "Doe";
					updateAvatar(firstName, lastName);
					showNotification(
						'<i class="fas fa-trash"></i> Foto de perfil eliminada.',
						"success"
					);
				}
			});
		}

		// Обробники для кнопок закриття модального вікна пароля
		if (closePasswordModal) {
			closePasswordModal.addEventListener("click", function () {
				closeModal(passwordModal);
				if (passwordForm) passwordForm.reset();
			});
		}

		if (cancelPasswordBtn) {
			cancelPasswordBtn.addEventListener("click", function () {
				closeModal(passwordModal);
				if (passwordForm) passwordForm.reset();
			});
		}

		// Закриття при кліку на затемнену область
		if (passwordModal) {
			passwordModal.addEventListener("click", function (e) {
				if (e.target === passwordModal) {
					closeModal(passwordModal);
					if (passwordForm) passwordForm.reset();
				}
			});
		}

		// Подія відправки форми пароля
		if (passwordForm) {
			passwordForm.addEventListener("submit", function (e) {
				e.preventDefault();
				const newPassword = document.getElementById("new-password").value;
				const confirmPassword =
					document.getElementById("confirm-password").value;

				if (newPassword !== confirmPassword) {
					showNotification(
						'<i class="fas fa-exclamation-triangle"></i> Las contraseñas no coinciden.',
						"info"
					);
					return;
				}

				if (newPassword.length < 8) {
					showNotification(
						'<i class="fas fa-exclamation-triangle"></i> La contraseña debe tener al menos 8 caracteres.',
						"info"
					);
					return;
				}

				showNotification(
					'<i class="fas fa-check-circle"></i> Contraseña cambiada correctamente.',
					"success"
				);
				closeModal(passwordModal);
				passwordForm.reset();
			});
		}

		// Інші обробники подій
		if (viewSessionsBtn) {
			viewSessionsBtn.addEventListener("click", verSesiones);
		}

		if (twoFactorToggle) {
			twoFactorToggle.addEventListener("change", function () {
				showNotification(
					`<i class="fas fa-shield-alt"></i> Autenticación de dos factores ${
						this.checked ? "activada" : "desactivada"
					}.`,
					"info"
				);
			});
		}

		if (emailNotificationsToggle) {
			emailNotificationsToggle.addEventListener("change", function () {
				showNotification(
					`<i class="fas fa-envelope"></i> Notificaciones por email ${
						this.checked ? "activadas" : "desactivadas"
					}.`,
					"info"
				);
			});
		}

		if (pushNotificationsToggle) {
			pushNotificationsToggle.addEventListener("change", function () {
				showNotification(
					`<i class="fas fa-bell"></i> Notificaciones push ${
						this.checked ? "activadas" : "desactivadas"
					}.`,
					"info"
				);
			});
		}

		if (spendingAlertsToggle) {
			spendingAlertsToggle.addEventListener("change", function () {
				showNotification(
					`<i class="fas fa-exclamation-circle"></i> Alertas de gastos ${
						this.checked ? "activadas" : "desactivadas"
					}.`,
					"info"
				);
			});
		}

		// Подія кнопки "Moneda"
		if (changeCurrencyBtn) {
			changeCurrencyBtn.addEventListener("click", cambiarMoneda);
		}

		// Подія кнопки "Exportar datos"
		if (exportDataBtn) {
			exportDataBtn.addEventListener("click", exportarDatos);
		}
	}

	// ===========================================
	// ГОЛОВНА ІНІЦІАЛІЗАЦІЯ
	// ===========================================
	function init() {
		console.log("Ініціалізація сторінки Mi cuenta...");

		initElements(); // Спочатку ініціалізуємо елементи
		initializeProfileData(); // Потім дані
		initEventListeners(); // Потім обробники подій

		// Відновлюємо вибрану валюту з localStorage
		const savedCurrency = localStorage.getItem("selectedCurrency");
		if (savedCurrency) {
			const settingsInfo = document.querySelector(
				".settings-item:nth-child(2) .settings-info p"
			);
			if (settingsInfo) {
				// Оновлюємо відображення валюти на основі збереженого значення
				const currencies = {
					EUR: "Euro (€)",
					USD: "Dólar estadounidense ($)",
					CAD: "Dólar canadiense (C$)",
					AUD: "Dólar australiano (A$)",
				};
				settingsInfo.textContent = currencies[savedCurrency] || "Euro (€)";
			}
		}

		console.log("Сторінка Mi cuenta завантажена успішно!");
	}

	// Запускаємо ініціалізацію
	init();
});
