/**
 * setup.js - VERSIÓN ADAPTADA A TUS ERRORES DE LOG
 */

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
}

document.addEventListener("DOMContentLoaded", async function () {
    let currentStep = 1;
    let currentUserEmail = ""; // Variable para guardar el email si logramos bajarlo

    // ==========================================
    // A. CARGA INICIAL (Intentar obtener nombre y email)
    // ==========================================
    try {
        // Hacemos una llamada segura para intentar ver si la sesión está viva
        const res = await fetch("/ajustes", {
            headers: { "Accept": "application/json" }
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
            await fetch("/sanctum/csrf-cookie");

            const response = await fetch("/ajustes", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone_country_code: phoneCountryCode,
                    phone: phone,
                    email: currentUserEmail
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Error API:", data);
                if (data.errors) {
                    // Muestra el primer error que encuentre
                    const firstMsg = Object.values(data.errors)[0][0];
                    alert("Error: " + firstMsg);
                } else {
                    alert("Error al guardar: " + (data.message || "Desconocido"));
                }
                return false;
            }

            return true;

        } catch (error) {
            console.error(error);
            alert("Error de conexión. Asegúrate de estar logueado.");
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
                await fetch("/sanctum/csrf-cookie");
                const csrfToken = getCookie("XSRF-TOKEN");
                const commonHeaders = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-XSRF-TOKEN": csrfToken,
                };

                const country = document.getElementById("iban_country").value;
                const numberRaw = document.getElementById("iban_number").value.replace(/\s+/g, '');

                if (numberRaw.length !== 22) {
                    throw new Error("El IBAN debe tener 24 caracteres (ES + 22 dígitos).");
                }

                // Crear CUENTA
                const accRes = await fetch("/api/accounts", {
                    method: "POST",
                    headers: commonHeaders,
                    body: JSON.stringify({
                        bank_name: document.getElementById("bank_name").value,
                        iban: country + numberRaw,
                        current_balance: document.getElementById("current_balance").value,
                        color: document.getElementById("account_color").value,
                    }),
                });

                if (!accRes.ok) {
                    const errorData = await accRes.json();
                    throw new Error(errorData.message || "Error al crear cuenta");
                }

                const accResult = await accRes.json();
                const accountId = accResult.account.id;

                // Crear TARJETA (Opcional)
                if (document.getElementById("has_card").checked) {
                    const typeRadio = document.querySelector('input[name="card_type"]:checked');
                    const expInput = document.getElementById("card_expiration").value;
                    let expDate = "";

                    // Caso A: Formato nativo del calendario (Chrome) -> YYYY-MM
                    if (/^\d{4}-\d{2}$/.test(expInput)) {
                        expDate = expInput + "-01";
                    }
                    // Caso B: El usuario lo escribió a mano (Firefox) -> MM/YYYY o MM/YY
                    else if (/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(expInput)) {
                        let parts = expInput.split('/');
                        let month = parts[0];
                        let year = parts[1].length === 2 ? "20" + parts[1] : parts[1]; // Si pone 28, lo convertimos a 2028
                        expDate = `${year}-${month}-01`;
                    }
                    // Caso C: El usuario escribió cualquier otra cosa mal (Ej: "hola", "2028/12")
                    else {
                        showNotification("Formato de caducidad inválido. Usa AAAA-MM o MM/AAAA", "error");
                        return; // ¡Frenamos el código aquí para no provocar el error 500!
                    }
                    await fetch("/api/cards", {
                        method: "POST",
                        headers: commonHeaders,
                        body: JSON.stringify({
                            account_id: accountId,
                            alias: document.getElementById("card_alias").value,
                            type: typeRadio ? typeRadio.value : "debit",
                            last_4_digits: document.getElementById("card_digits").value,
                            expiration_date: expDate,
                            balance: 0,
                        }),
                    });
                }

                // Crear SOBRE (Opcional)
                if (document.getElementById("has_envelope").checked) {
                    const selectedIconDiv = document.querySelector(".icon-option.selected");
                    await fetch("/api/envelopes", {
                        method: "POST",
                        headers: commonHeaders,
                        body: JSON.stringify({
                            account_id: accountId,
                            name: document.getElementById("env_name").value,
                            target_amount: document.getElementById("env_target").value,
                            allocated_amount: document.getElementById("env_allocated").value || 0,
                            icon: selectedIconDiv ? selectedIconDiv.getAttribute("data-icon") : "fas fa-piggy-bank",
                        }),
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