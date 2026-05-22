/**
 * setup.js - Wizard de configuración inicial
 * Depende de: core/utils.js (getCookie, showNotification), core/api-client.js (apiRequest)
 */

document.addEventListener("DOMContentLoaded", async function () {
    let currentStep = 1;
    let currentUserEmail = ""; // Variable para guardar el email si logramos bajarlo

    // ==========================================
    // A. CARGA INICIAL (Intentar obtener nombre y email)
    // ==========================================
    try {
        // Hacemos una llamada segura para intentar ver si la sesión está viva
        const res = await fetch("/api/profile", {
            headers: { "Accept": "application/json" },
            credentials: "same-origin"
        });

        // Verificamos si la respuesta es JSON real antes de leerla
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const user = await res.json();

            // Guardamos el email porque EL BACKEND LO EXIGE en el paso siguiente
            if (user.email) currentUserEmail = user.email;

            // Rellenar nombre si existe
            if (user.name) {
                // Intentamos separar nombre y apellido si vienen juntos
                const parts = user.name.split(" ");
                document.getElementById("setup_firstname").value = parts[0] || "";
                document.getElementById("setup_lastname").value = parts.slice(1).join(" ") || "";
            }
            // Si tu backend usa estructura profile.lastname
            if (user.profile && user.profile.lastname) {
                document.getElementById("setup_lastname").value = user.profile.lastname;
            }
        } else {
            console.warn("La API devolvió HTML (posiblemente login o 404). Se continuará sin autocompletar.");
        }
    } catch (e) {
        console.error("Error silencioso en carga inicial:", e);
    }

    // ==========================================
    // B. NAVEGACIÓN Y GUARDADO
    // ==========================================

    window.goToStep = async function (step) {
        if (currentStep === 1 && step > 1) {
            const guardado = await saveProfileStep();
            if (!guardado) return;
        }
        showStep(step);
    };

    const btnStep1 = document.getElementById("btn-step-1");
    if (btnStep1) btnStep1.addEventListener("click", () => window.goToStep(2));

    // ==========================================
    // C. FUNCIÓN DE GUARDADO (Paso 1) - CORREGIDA
    // ==========================================
    async function saveProfileStep() {
        const btn = document.getElementById("btn-step-1");
        const originalText = btn.innerHTML;

        const firstName = document.getElementById("setup_firstname").value.trim();
        const lastName = document.getElementById("setup_lastname").value.trim();
        const phoneInput = document.getElementById("setup_phone");
        const phone = (phoneInput.dataset.rawValue || phoneInput.value).replace(/\s+/g, '').trim();
        const phoneCountrySelect = document.getElementById("setup_phone_country");
        const phoneCountryCode = phoneCountrySelect ? phoneCountrySelect.value : "+34";

        if (!firstName || !lastName) {
            alert("El nombre y los apellidos son obligatorios.");
            return false;
        }

        // Si la carga inicial falló, no tenemos email. 
        // Tu backend lo exige. Si no lo tenemos, preguntamos o usamos el del input si existiera.
        if (!currentUserEmail) {
            // Intento desesperado: pedirlo de nuevo al backend antes de guardar
            try {
                const check = await fetch("/profile", { headers: { "Accept": "application/json" } });
                if (check.ok) {
                    const u = await check.json();
                    currentUserEmail = u.email;
                }
            } catch (e) { }

            // Si sigue vacío, alertamos (o podrías poner un prompt si quieres forzarlo)
            if (!currentUserEmail) {
                console.warn("No se pudo recuperar el email del usuario. El guardado podría fallar si el backend lo requiere.");
                // Opcional: currentUserEmail = prompt("Por seguridad, confirma tu email:");
            }
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';

        try {
            await apiRequest("/api/profile", "PUT", {
                first_name: firstName,
                last_name: lastName,
                phone_country_code: phoneCountryCode,
                phone: phone,
                email: currentUserEmail
            });
            return true;
        } catch (error) {
            console.error(error);
            alert("Error al guardar: " + error.message);
            return false;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // ==========================================
    // D. UTILIDADES UI (Sin cambios)
    // ==========================================
    function showStep(step) {
        document.querySelectorAll(".step-content").forEach((el) => el.classList.remove("active"));
        const stepEl = document.getElementById(`step-${step}`);
        if (stepEl) stepEl.classList.add("active");

        document.querySelectorAll(".step-dot").forEach((el) => el.classList.remove("active"));
        for (let i = 1; i <= step; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if (dot) dot.classList.add("active");
        }
        const stepNum = document.getElementById("step-number");
        if (stepNum) stepNum.innerText = step;
        currentStep = step;
    }

    window.toggleSection = function (section) {
        const fields = document.getElementById(`${section}-fields`);
        const checkbox = document.getElementById(`has_${section}`);
        const toggleDiv = document.getElementById(`toggle-${section}`);

        if (fields.style.display === "none") {
            fields.style.display = "block";
            checkbox.checked = true;
            toggleDiv.classList.add("active");
            setTimeout(() => fields.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        } else {
            fields.style.display = "none";
            checkbox.checked = false;
            toggleDiv.classList.remove("active");
        }
    };

    document.querySelectorAll(".icon-option").forEach((option) => {
        option.addEventListener("click", function () {
            document.querySelectorAll(".icon-option").forEach((opt) => opt.classList.remove("selected"));
            this.classList.add("selected");
        });
    });

    document.querySelectorAll(".color-circle").forEach((option) => {
        option.addEventListener("click", function () {
            document.querySelectorAll(".color-circle").forEach((opt) => opt.classList.remove("selected"));
            this.classList.add("selected");
            const hiddenInput = document.getElementById("account_color");
            if (hiddenInput) hiddenInput.value = this.dataset.color;
        });
    });

    // IBAN formatting is handled by utils/formatters.js (data-format="iban")

    // ==========================================
    // E. SUBMIT FINAL (Sin cambios lógicos)
    // ==========================================
    const form = document.getElementById("setup-form");
    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const btn = document.getElementById("btn-submit");
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando...';

            try {
                const country = document.getElementById("iban_country").value;
                const ibanInput = document.getElementById("iban_number");
                const numberRaw = (ibanInput.dataset.rawValue || ibanInput.value).replace(/\s+/g, '');

                var expectedIbanLen = (window.IBAN_LENGTHS && window.IBAN_LENGTHS[country]) || 22;
                if (numberRaw.length !== expectedIbanLen) {
                    throw new Error("El IBAN para " + country + " debe tener " + expectedIbanLen + " dígitos (" + numberRaw.length + " introducidos).");
                }

                // Crear CUENTA
                const accResult = await apiRequest("/api/accounts", "POST", {
                    bank_name: document.getElementById("bank_name").value,
                    iban: country + numberRaw,
                    current_balance: document.getElementById("current_balance").value,
                    color: document.getElementById("account_color").value,
                });

                const accountId = accResult.account.id;

                // Crear TARJETA (Opcional)
                if (document.getElementById("has_card").checked) {
                    const typeRadio = document.querySelector('input[name="card_type"]:checked');
                    const expInput = document.getElementById("card_expiration").value;
                    const expDate = parseExpirationDate(expInput);

                    if (!expDate) {
                        showNotification("Formato de caducidad inválido. Usa AAAA-MM o MM/AAAA", "error");
                        return;
                    }

                    const cardNumberInput = document.getElementById("card_number");
                    const cardNumber = (cardNumberInput.dataset.rawValue || cardNumberInput.value).replace(/\s+/g, '');
                    const cvc = document.getElementById("card_cvc").value.trim();

                    if (!cardNumber || cardNumber.length !== 16) {
                        throw new Error("El número de tarjeta debe tener exactamente 16 dígitos.");
                    }
                    if (!cvc || cvc.length !== 3) {
                        throw new Error("El CVC debe tener exactamente 3 dígitos.");
                    }

                    await apiRequest("/api/cards", "POST", {
                        account_id: accountId,
                        alias: document.getElementById("card_alias").value,
                        type: typeRadio ? typeRadio.value : "debit",
                        card_number: cardNumber,
                        security_code: cvc,
                        expiration_date: expDate,
                    });
                }

                // Crear SOBRE (Opcional)
                if (document.getElementById("has_envelope").checked) {
                    const selectedIconDiv = document.querySelector(".icon-option.selected");
                    await apiRequest("/api/envelopes", "POST", {
                        account_id: accountId,
                        name: document.getElementById("env_name").value,
                        target_amount: document.getElementById("env_target").value,
                        allocated_amount: document.getElementById("env_allocated").value || 0,
                        icon: selectedIconDiv ? selectedIconDiv.getAttribute("data-icon") : "fas fa-piggy-bank",
                    });
                }

                window.location.href = "/dashboard";

            } catch (error) {
                console.error(error);
                alert("Ocurrió un error: " + error.message);
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
});