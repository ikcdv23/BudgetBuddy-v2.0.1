document.addEventListener("DOMContentLoaded", async function () {
    let currentStep = 1;
    const totalSteps = 4;

    // ==========================================
    // 1. CARGA INICIAL (PERFIL)
    // ==========================================
    try {
        const res = await fetch('/api/profile', {
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            const user = await res.json();
            // Si el usuario ya tiene nombre, lo ponemos en el input
            if (user.name) document.getElementById('setup_firstname').value = user.name;
        }
    } catch (e) {
        console.error("Error cargando usuario inicial", e);
    }

    // ==========================================
    // 2. NAVEGACIÓN Y VISUAL (WIZARD)
    // ==========================================
    
    // Función global para los botones onclick del HTML
    window.goToStep = async function(step) {
        // Si estamos saliendo del paso 1, guardamos el perfil primero
        if (currentStep === 1 && step > 1) {
            const saved = await saveProfileStep();
            if (!saved) return; 
        }
        showStep(step);
    };

    // Listener especial para el botón del paso 1
    const btnStep1 = document.getElementById('btn-step-1');
    if(btnStep1) btnStep1.addEventListener('click', () => window.goToStep(2));

    function showStep(step) {
        // Ocultar todos los pasos
        document.querySelectorAll('.step-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step-dot').forEach(el => el.classList.remove('active'));

        // Mostrar el actual
        document.getElementById(`step-${step}`).classList.add('active');
        
        // Activar los puntos (dots) hasta el actual
        for(let i=1; i<=step; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if(dot) dot.classList.add('active');
        }
        // Desactivar los futuros
        for(let i=step+1; i<=totalSteps; i++) {
            const dot = document.getElementById(`dot-${i}`);
            if(dot) dot.classList.remove('active');
        }

        // Actualizar texto del header
        const stepNum = document.getElementById('step-number');
        if(stepNum) stepNum.innerText = step;
        
        currentStep = step;
    }

    // Función para los Toggles (Tarjeta y Sobre)
    window.toggleSection = function(section) {
        const fields = document.getElementById(`${section}-fields`);
        const checkbox = document.getElementById(`has_${section}`);
        const toggleDiv = document.getElementById(`toggle-${section}`);

        if (fields.style.display === 'none') {
            fields.style.display = 'block';
            checkbox.checked = true;
            toggleDiv.classList.add('active');
            setTimeout(() => fields.scrollIntoView({behavior: 'smooth', block: 'center'}), 100);
        } else {
            fields.style.display = 'none';
            checkbox.checked = false;
            toggleDiv.classList.remove('active');
        }
    };

    // Lógica para selección de Iconos (Sobres)
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Quitar clase selected de todos
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            // Poner al clickado
            this.classList.add('selected');
        });
    });

    // Lógica para selección de Colores (Cuenta)
    const colorOptions = document.querySelectorAll('.color-circle');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            // Actualizar input hidden si existe
            const hiddenInput = document.getElementById('account_color');
            if(hiddenInput) hiddenInput.value = this.dataset.color;
        });
    });

    // ==========================================
    // 3. LÓGICA DE GUARDADO (API)
    // ==========================================

    // A. GUARDAR PERFIL (PASO 1)
    async function saveProfileStep() {
        const btn = document.getElementById('btn-step-1');
        const originalText = btn.innerHTML;
        const firstName = document.getElementById('setup_firstname').value.trim();
        const lastName = document.getElementById('setup_lastname').value.trim();
        const phone = document.getElementById('setup_phone').value.trim();

        if (!firstName || !lastName) {
            alert("Por favor, completa nombre y apellidos.");
            return false;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';

        try {
            // Obtenemos email actual para evitar error de validación unique
            const userRes = await fetch('/api/profile', { headers: {'Accept': 'application/json'} });
            const user = await userRes.json();

            await fetch('/sanctum/csrf-cookie'); 

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCookie('XSRF-TOKEN')
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: user.email, 
                    phone: phone
                })
            });

            if (!response.ok) throw new Error("Error al guardar perfil");
            return true;

        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
            return false;
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }

    // B. FINALIZAR (PASO 4 -> Submit del Formulario)
    const form = document.getElementById('setup-form');
    if(form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = document.getElementById('btn-submit');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizando...';

            try {
                await fetch('/sanctum/csrf-cookie');
                const csrfToken = getCookie('XSRF-TOKEN');
                const headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': csrfToken
                };

                // --- 1. CREAR CUENTA BANCARIA ---
                const country = document.getElementById('iban_country').value;
                const number = document.getElementById('iban_number').value;
                
                const accountData = {
                    bank_name: document.getElementById('bank_name').value,
                    iban: country + number, // Concatenamos ES + 0000...
                    current_balance: document.getElementById('current_balance').value,
                    color: document.getElementById('account_color').value
                };

                const accRes = await fetch('/api/accounts', {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(accountData)
                });

                if(!accRes.ok) throw new Error("Error creando la cuenta. Revisa el IBAN.");
                const accResult = await accRes.json();
                const accountId = accResult.account.id; // ID para vincular lo demás

                // --- 2. CREAR TARJETA (Si está marcado) ---
                if(document.getElementById('has_card').checked) {
                    // Obtenemos el valor del radio button seleccionado
                    const typeRadio = document.querySelector('input[name="card_type"]:checked');
                    const cardType = typeRadio ? typeRadio.value : 'debit';
                    
                    // Formatear fecha: input type="month" da "2024-05", Laravel suele pedir "2024-05-01"
                    let expDate = document.getElementById('card_expiration').value;
                    if(expDate) expDate += "-01";

                    const cardData = {
                        account_id: accountId,
                        alias: document.getElementById('card_alias').value,
                        type: cardType,
                        last_four_digits: document.getElementById('card_digits').value,
                        expiration_date: expDate,
                        // Si tu backend pide balance para la tarjeta, pon 0 o el mismo de la cuenta
                        balance: 0 
                    };
                    
                    await fetch('/api/cards', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(cardData)
                    });
                }

                // --- 3. CREAR SOBRE (Si está marcado) ---
                if(document.getElementById('has_envelope').checked) {
                    // Buscar el icono seleccionado en el grid
                    const selectedIconDiv = document.querySelector('.icon-option.selected');
                    // Sacar la clase del atributo data-icon o usar un default
                    const iconClass = selectedIconDiv ? selectedIconDiv.getAttribute('data-icon') : 'fas fa-piggy-bank';

                    const envData = {
                        account_id: accountId,
                        name: document.getElementById('env_name').value,
                        target_amount: document.getElementById('env_target').value,
                        current_amount: document.getElementById('env_allocated').value || 0,
                        icon: iconClass
                    };

                    await fetch('/api/envelopes', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(envData)
                    });
                }

                // --- TODO ÉXITO -> REDIRIGIR ---
                window.location.href = '/dashboard';

            } catch (error) {
                console.error(error);
                alert("Ocurrió un error: " + error.message);
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
});

// Función auxiliar para las cookies (obligatoria para Laravel)
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}