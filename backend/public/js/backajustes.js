/**
 * backajustes.js — Página de Ajustes (rediseño con tabs)
 *
 * Depende de: apiRequest(), showNotification(), getCookie() (core/)
 */
(function () {
    'use strict';

    // ============================
    // AVATAR PRESETS
    // ============================
    var AVATAR_PRESETS = {
        'preset-1': { icon: 'fa-graduation-cap', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', label: 'Graduación' },
        'preset-2': { icon: 'fa-piggy-bank',     gradient: 'linear-gradient(135deg, #ec4899, #be185d)', label: 'Ahorro' },
        'preset-3': { icon: 'fa-chart-line',      gradient: 'linear-gradient(135deg, #10b981, #047857)', label: 'Inversiones' },
        'preset-4': { icon: 'fa-rocket',          gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', label: 'Metas' },
        'preset-5': { icon: 'fa-lightbulb',       gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', label: 'Ideas' },
        'preset-6': { icon: 'fa-star',            gradient: 'linear-gradient(135deg, #f97316, #ea580c)', label: 'Favorito' },
        'preset-7': { icon: 'fa-bullseye',        gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', label: 'Objetivo' },
        'preset-8': { icon: 'fa-flask',           gradient: 'linear-gradient(135deg, #6366f1, #4338ca)', label: 'Ciencia' }
    };

    // ============================
    // STATE
    // ============================
    var data = window.__ajustesData || {};
    var selectedPreset = null;
    var selectedFile = null;

    // ============================
    // INIT
    // ============================
    // Support both full page load and PJAX navigation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initTabs();
        initAvatar();
        initProfileForm();
        initPasswordModal();
        initThemeSelector();
        initExportCSV();
        initDeleteAccount();
        initLogout();
        initModals();

        // Render initial avatar
        renderHeroAvatar(data.avatar);

        console.log('Ajustes cargado.');
    }

    // ============================
    // TABS
    // ============================
    function initTabs() {
        var tabs = document.querySelectorAll('.settings-tab');
        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                var target = tab.getAttribute('data-tab');

                // Update tab buttons
                tabs.forEach(function (t) { t.classList.remove('active'); });
                tab.classList.add('active');

                // Show/hide tab content
                document.querySelectorAll('.tab-content').forEach(function (c) {
                    c.classList.remove('active');
                });
                var el = document.getElementById('tab-' + target);
                if (el) {
                    el.classList.add('active');
                    // Re-trigger animation
                    el.style.animation = 'none';
                    el.offsetHeight; // reflow
                    el.style.animation = '';
                }
            });
        });
    }

    // ============================
    // AVATAR
    // ============================
    function initAvatar() {
        var heroAvatar = document.getElementById('avatar-hero');
        var grid = document.getElementById('avatar-preset-grid');
        var uploadZone = document.getElementById('avatar-upload-zone');
        var fileInput = document.getElementById('avatar-file-input');
        var previewContainer = document.getElementById('avatar-upload-preview');
        var previewImg = document.getElementById('avatar-preview-img');
        var removePreview = document.getElementById('avatar-remove-preview');
        var saveBtn = document.getElementById('avatar-save-btn');

        // Build preset grid
        if (grid) {
            Object.keys(AVATAR_PRESETS).forEach(function (key) {
                var preset = AVATAR_PRESETS[key];
                var option = document.createElement('div');
                option.className = 'avatar-preset-option';
                option.setAttribute('data-preset', key);
                option.setAttribute('title', preset.label);
                option.style.background = preset.gradient;
                option.innerHTML = '<i class="fas ' + preset.icon + '"></i>';

                if (data.avatar === key) {
                    option.classList.add('selected');
                    selectedPreset = key;
                }

                option.addEventListener('click', function () {
                    grid.querySelectorAll('.avatar-preset-option').forEach(function (o) {
                        o.classList.remove('selected');
                    });
                    option.classList.add('selected');
                    selectedPreset = key;
                    selectedFile = null;
                    // Hide upload preview
                    if (previewContainer) previewContainer.classList.add('hidden');
                    if (uploadZone) uploadZone.classList.remove('hidden');
                });

                grid.appendChild(option);
            });
        }

        // Click hero avatar → open modal
        if (heroAvatar) {
            heroAvatar.addEventListener('click', function () {
                openModal('avatar-modal');
            });
        }

        // Upload zone click
        if (uploadZone) {
            uploadZone.addEventListener('click', function () {
                if (fileInput) fileInput.click();
            });

            // Drag & drop
            uploadZone.addEventListener('dragover', function (e) {
                e.preventDefault();
                uploadZone.classList.add('drag-over');
            });
            uploadZone.addEventListener('dragleave', function () {
                uploadZone.classList.remove('drag-over');
            });
            uploadZone.addEventListener('drop', function (e) {
                e.preventDefault();
                uploadZone.classList.remove('drag-over');
                if (e.dataTransfer.files.length > 0) {
                    handleFile(e.dataTransfer.files[0]);
                }
            });
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', function () {
                if (fileInput.files.length > 0) {
                    handleFile(fileInput.files[0]);
                }
            });
        }

        function handleFile(file) {
            // Validate type
            if (!['image/jpeg', 'image/png'].includes(file.type)) {
                showNotification('Solo se permiten archivos JPG o PNG', 'error');
                return;
            }
            // Validate size (2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('El archivo no puede superar los 2 MB', 'error');
                return;
            }

            selectedFile = file;
            selectedPreset = null;

            // Deselect presets
            if (grid) {
                grid.querySelectorAll('.avatar-preset-option').forEach(function (o) {
                    o.classList.remove('selected');
                });
            }

            // Show preview
            var reader = new FileReader();
            reader.onload = function (e) {
                if (previewImg) previewImg.src = e.target.result;
                if (previewContainer) previewContainer.classList.remove('hidden');
                if (uploadZone) uploadZone.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }

        // Remove preview
        if (removePreview) {
            removePreview.addEventListener('click', function () {
                selectedFile = null;
                if (fileInput) fileInput.value = '';
                if (previewContainer) previewContainer.classList.add('hidden');
                if (uploadZone) uploadZone.classList.remove('hidden');
            });
        }

        // Save avatar
        if (saveBtn) {
            saveBtn.addEventListener('click', async function () {
                if (!selectedPreset && !selectedFile) {
                    showNotification('Selecciona un avatar o sube una foto', 'error');
                    return;
                }

                saveBtn.disabled = true;

                try {
                    if (selectedPreset) {
                        var result = await apiRequest('/api/profile/avatar', 'POST', { avatar: selectedPreset });
                        data.avatar = selectedPreset;
                        renderHeroAvatar(selectedPreset);
                        updateHeaderAvatar(selectedPreset);
                        showNotification('Avatar actualizado', 'success');
                    } else if (selectedFile) {
                        var result = await uploadAvatarFile(selectedFile);
                        data.avatar = result.avatar;
                        renderHeroAvatar(result.avatar, result.avatar_url);
                        updateHeaderAvatar(result.avatar, result.avatar_url);
                        showNotification('Avatar actualizado', 'success');
                    }
                    closeModal('avatar-modal');
                } catch (err) {
                    showNotification(err.message || 'Error al guardar avatar', 'error');
                } finally {
                    saveBtn.disabled = false;
                }
            });
        }
    }

    async function uploadAvatarFile(file) {
        await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
        var formData = new FormData();
        formData.append('avatar_file', file);

        var response = await fetch('/api/profile/avatar', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getCookie('XSRF-TOKEN') || ''
            },
            credentials: 'same-origin',
            body: formData
        });

        if (response.status === 422) {
            var errors = await response.json();
            var msg = errors.errors ?
                Object.values(errors.errors).flat().join(', ') :
                errors.message || 'Error de validación';
            throw new Error(msg);
        }

        if (!response.ok) {
            throw new Error('Error HTTP ' + response.status);
        }

        return await response.json();
    }

    // ============================
    // RENDER AVATAR
    // ============================
    function renderHeroAvatar(avatarValue, avatarUrl) {
        var container = document.getElementById('avatar-content');
        if (!container) return;

        if (avatarValue && AVATAR_PRESETS[avatarValue]) {
            var preset = AVATAR_PRESETS[avatarValue];
            container.style.background = preset.gradient;
            container.innerHTML = '<div class="avatar-preset-icon"><i class="fas ' + preset.icon + '"></i></div>';
        } else if (avatarValue && !avatarValue.startsWith('preset-')) {
            var url = avatarUrl || '/storage/' + avatarValue;
            container.style.background = 'none';
            container.innerHTML = '<img src="' + escapeHTML(url) + '" alt="Avatar">';
        } else {
            // Initials fallback
            container.style.background = 'var(--primary)';
            var name = data.name || '';
            var lastname = data.lastname || '';
            var initials = name.charAt(0).toUpperCase();
            if (lastname) initials += lastname.charAt(0).toUpperCase();
            container.textContent = initials;
        }
    }

    function updateHeaderAvatar(avatarValue, avatarUrl) {
        var el = document.querySelector('.user-avatar-top');
        if (!el) return;

        if (avatarValue && AVATAR_PRESETS[avatarValue]) {
            var preset = AVATAR_PRESETS[avatarValue];
            el.className = 'user-avatar-top avatar-preset';
            el.setAttribute('data-preset', avatarValue);
            el.style.background = preset.gradient;
            el.innerHTML = '<i class="fas ' + preset.icon + '" style="color:white;font-size:16px;"></i>';
        } else if (avatarValue && !avatarValue.startsWith('preset-')) {
            var url = avatarUrl || '/storage/' + avatarValue;
            el.className = 'user-avatar-top avatar-photo';
            el.style.background = 'none';
            el.innerHTML = '<img src="' + escapeHTML(url) + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
        } else {
            el.className = 'user-avatar-top';
            el.style.background = '';
            var name = data.name || '';
            var parts = name.trim().split(' ');
            var initials = parts[0].charAt(0).toUpperCase();
            if (parts.length > 1) initials += parts[parts.length - 1].charAt(0).toUpperCase();
            el.textContent = initials;
        }
    }

    // ============================
    // PROFILE FORM
    // ============================
    function initProfileForm() {
        var form = document.getElementById('profile-form');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            var firstName = document.getElementById('first-name').value.trim();
            var lastName = document.getElementById('last-name').value.trim();
            var email = document.getElementById('email').value.trim();
            var phone = document.getElementById('phone').value.trim();
            var phoneCode = document.getElementById('phone_country_code').value;

            var btn = document.getElementById('save-profile-btn');
            if (btn) btn.disabled = true;

            try {
                var result = await apiRequest('/api/profile', 'PUT', {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone: phone,
                    phone_country_code: phoneCode
                });

                // Update hero
                data.name = firstName;
                data.lastname = lastName;
                data.email = email;
                var heroName = document.getElementById('hero-name');
                var heroEmail = document.getElementById('hero-email');
                if (heroName) heroName.textContent = firstName + (lastName ? ' ' + lastName : '');
                if (heroEmail) heroEmail.textContent = email;

                // Update header avatar initials if no custom avatar
                if (!data.avatar || data.avatar === null) {
                    updateHeaderAvatar(null);
                }

                // Refresh cached profile
                if (typeof refreshUserProfile === 'function') refreshUserProfile();

                showNotification('Perfil actualizado correctamente', 'success');
            } catch (err) {
                showNotification(err.message || 'Error al guardar', 'error');
            } finally {
                if (btn) btn.disabled = false;
            }
        });
    }

    // ============================
    // PASSWORD MODAL
    // ============================
    function initPasswordModal() {
        var changeBtn = document.getElementById('change-password-btn');
        var saveBtn = document.getElementById('password-save-btn');

        if (changeBtn) {
            changeBtn.addEventListener('click', function () {
                openModal('password-modal');
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', async function () {
                var current = document.getElementById('current-password').value;
                var newPass = document.getElementById('new-password').value;
                var confirm = document.getElementById('confirm-password').value;

                if (!current || !newPass || !confirm) {
                    showNotification('Completa todos los campos', 'error');
                    return;
                }

                if (newPass !== confirm) {
                    showNotification('Las contraseñas nuevas no coinciden', 'error');
                    return;
                }

                if (newPass.length < 8) {
                    showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
                    return;
                }

                saveBtn.disabled = true;

                try {
                    await apiRequest('/api/profile/password', 'PUT', {
                        current_password: current,
                        new_password: newPass,
                        new_password_confirmation: confirm
                    });

                    showNotification('Contraseña actualizada correctamente', 'success');
                    closeModal('password-modal');

                    // Clear fields
                    document.getElementById('current-password').value = '';
                    document.getElementById('new-password').value = '';
                    document.getElementById('confirm-password').value = '';
                } catch (err) {
                    showNotification(err.message || 'Error al cambiar contraseña', 'error');
                } finally {
                    saveBtn.disabled = false;
                }
            });
        }
    }

    // ============================
    // THEME SELECTOR
    // ============================
    function initThemeSelector() {
        var options = document.querySelectorAll('.theme-option');
        var currentTheme = localStorage.getItem('bb-theme') || 'auto';

        // Set initial state
        options.forEach(function (opt) {
            if (opt.getAttribute('data-theme') === currentTheme) {
                opt.classList.add('active');
            }

            opt.addEventListener('click', function () {
                var theme = opt.getAttribute('data-theme');

                options.forEach(function (o) { o.classList.remove('active'); });
                opt.classList.add('active');

                // Use the existing theme system from theme-toggle.js
                localStorage.setItem('bb-theme', theme);

                // Resolve and apply
                var resolved = theme;
                if (theme === 'auto') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', resolved);

                // Update header toggle icon
                if (typeof bindThemeToggle === 'function') bindThemeToggle();
            });
        });
    }

    // ============================
    // EXPORT CSV
    // ============================
    function initExportCSV() {
        var btn = document.getElementById('export-csv-btn');
        if (!btn) return;

        btn.addEventListener('click', function () {
            window.location.href = '/api/profile/export';
        });
    }

    // ============================
    // DELETE ACCOUNT
    // ============================
    function initDeleteAccount() {
        var openBtn = document.getElementById('delete-account-btn');
        var confirmBtn = document.getElementById('delete-confirm-btn');

        if (openBtn) {
            openBtn.addEventListener('click', function () {
                openModal('delete-account-modal');
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', async function () {
                var password = document.getElementById('delete-password').value;
                if (!password) {
                    showNotification('Introduce tu contraseña', 'error');
                    return;
                }

                confirmBtn.disabled = true;

                try {
                    await apiRequest('/api/profile/account', 'DELETE', { password: password });
                    showNotification('Cuenta eliminada. Redirigiendo...', 'success');
                    setTimeout(function () { window.location.href = '/'; }, 2000);
                } catch (err) {
                    showNotification(err.message || 'Error al eliminar cuenta', 'error');
                    confirmBtn.disabled = false;
                }
            });
        }
    }

    // ============================
    // LOGOUT
    // ============================
    function initLogout() {
        var btn = document.getElementById('logout-btn');
        if (!btn) return;

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('¿Cerrar sesión?')) {
                var form = document.createElement('form');
                form.method = 'POST';
                form.action = '/logout';

                var csrfToken = document.querySelector('meta[name="csrf-token"]').content;
                var hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = '_token';
                hiddenInput.value = csrfToken;

                form.appendChild(hiddenInput);
                document.body.appendChild(form);
                form.submit();
            }
        });
    }

    // ============================
    // MODAL HELPERS
    // ============================
    function initModals() {
        // Close buttons (data-modal="xxx")
        document.querySelectorAll('[data-modal]').forEach(function (el) {
            if (el.classList.contains('close-modal') || el.classList.contains('btn-secondary')) {
                el.addEventListener('click', function () {
                    closeModal(el.getAttribute('data-modal'));
                });
            }
        });

        // Click outside to close
        document.querySelectorAll('.modal').forEach(function (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });
    }

    function openModal(id) {
        var modal = document.getElementById(id);
        if (modal) modal.style.display = 'flex';
    }

    function closeModal(id) {
        var modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    }

})();
