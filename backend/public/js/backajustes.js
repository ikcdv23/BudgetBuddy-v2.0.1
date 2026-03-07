(function() {
    console.log('✅ Ajustes en modo Blade cargado.');

    // 1. REFERENCIAS
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const profileViewMode = document.getElementById('profile-view-mode');
    const profileEditMode = document.getElementById('profile-edit-mode');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Modales
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordModal = document.getElementById('password-modal');
    const closePasswordModal = document.getElementById('close-password-modal');
    const cancelPasswordBtn = document.getElementById('cancel-password-btn');

    // 2. CAMBIAR ENTRE VISTA Y EDICIÓN
    function showEditMode() {
        if (profileViewMode) profileViewMode.style.display = 'none';
        if (profileEditMode) profileEditMode.style.display = 'block';
        if (editProfileBtn) editProfileBtn.style.display = 'none';
    }

    function showViewMode() {
        if (profileEditMode) profileEditMode.style.display = 'none';
        if (profileViewMode) profileViewMode.style.display = 'block';
        if (editProfileBtn) editProfileBtn.style.display = 'flex';
    }

    if (editProfileBtn) editProfileBtn.addEventListener('click', showEditMode);
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', showViewMode);

    // 3. DETECTAR ERRORES DEL SERVIDOR
    // Si Laravel devolvió errores (div invisible inyectado en Blade), abrimos el formulario
    if (document.getElementById('form-has-errors')) {
        showEditMode();
    }

    // 4. LOGOUT (Envío de formulario POST oculto)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/logout'; // Ruta de Laravel
                
                const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = '_token';
                hiddenInput.value = csrfToken;
                
                form.appendChild(hiddenInput);
                document.body.appendChild(form);
                form.submit();
            }
        });
    }

    // 5. MODALES (Solo visual)
    function openModal(modal) { if(modal) modal.style.display = 'flex'; }
    function closeModal(modal) { if(modal) modal.style.display = 'none'; }

    if (changePasswordBtn) changePasswordBtn.addEventListener('click', () => openModal(passwordModal));
    if (closePasswordModal) closePasswordModal.addEventListener('click', () => closeModal(passwordModal));
    if (cancelPasswordBtn) cancelPasswordBtn.addEventListener('click', () => closeModal(passwordModal));
})();