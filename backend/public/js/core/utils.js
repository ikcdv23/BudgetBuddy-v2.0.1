/**
 * core/utils.js — Utilidades compartidas para todas las páginas de BudgetBuddy
 *
 * Se carga UNA vez en el layout (antes de notifications.js y los scripts de página).
 * Exporta funciones a window para que sean accesibles desde cualquier IIFE de página.
 */
(function () {
    'use strict';

    // ========== UTILIDADES GENERALES ==========

    function getCookie(name) {
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length === 2)
            return decodeURIComponent(parts.pop().split(';').shift());
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatDate(dateString) {
        try {
            var date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    function formatCurrency(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) amount = 0;
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Parsea una fecha de caducidad en múltiples formatos.
     * Acepta: "2026-03", "03/26", "03/2026"
     * Devuelve: "2026-03-01" o null si inválido
     */
    function parseExpirationDate(input) {
        if (!input) return null;

        // Caso A: Formato nativo (Chrome month input) -> YYYY-MM
        if (/^\d{4}-\d{2}$/.test(input)) {
            return input + '-01';
        }
        // Caso B: Escrito a mano -> MM/YYYY o MM/YY
        if (/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(input)) {
            var parts = input.split('/');
            var month = parts[0];
            var year = parts[1].length === 2 ? '20' + parts[1] : parts[1];
            return year + '-' + month + '-01';
        }
        // Formato no reconocido
        return null;
    }

    // ========== NOTIFICACIONES (Toast) ==========

    function showNotification(message, type) {
        type = type || 'info';

        // Eliminar toasts anteriores
        document.querySelectorAll('.bb-toast').forEach(function (n) { n.remove(); });

        var notification = document.createElement('div');
        notification.className = 'bb-toast';

        var iconName = type === 'error' ? 'exclamation-circle'
            : type === 'success' ? 'check-circle'
            : 'info-circle';

        notification.innerHTML =
            '<div class="bb-toast-content">' +
                '<i class="fas fa-' + iconName + '"></i>' +
                '<span>' + escapeHTML(message) + '</span>' +
            '</div>' +
            '<button class="bb-toast-close"><i class="fas fa-times"></i></button>';

        var bgColor = type === 'success' ? '#d1fae5'
            : type === 'error' ? '#fee2e2'
            : '#fef3c7';
        var textColor = type === 'success' ? '#065f46'
            : type === 'error' ? '#991b1b'
            : '#92400e';
        var borderColor = type === 'success' ? '#10b981'
            : type === 'error' ? '#ef4444'
            : '#f59e0b';

        notification.style.cssText =
            'position:fixed;top:20px;right:20px;' +
            'background-color:' + bgColor + ';' +
            'color:' + textColor + ';' +
            'padding:14px 18px;border-radius:12px;' +
            'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
            'z-index:3000;box-shadow:0 8px 25px rgba(0,0,0,0.15);' +
            'max-width:400px;animation:bbToastIn 0.3s ease;' +
            'border-left:4px solid ' + borderColor + ';' +
            "font-family:'Roboto',sans-serif;";

        // Inyectar keyframes una sola vez (usando id para evitar duplicados)
        if (!document.getElementById('bb-toast-keyframes')) {
            var style = document.createElement('style');
            style.id = 'bb-toast-keyframes';
            style.textContent =
                '@keyframes bbToastIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}' +
                '@keyframes bbToastOut{from{transform:translateX(0);opacity:1}to{transform:translateX(100%);opacity:0}}';
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Botón cerrar
        var closeBtn = notification.querySelector('.bb-toast-close');
        if (closeBtn) {
            closeBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:inherit;font-size:14px;padding:0;';
            closeBtn.addEventListener('click', function () {
                notification.style.animation = 'bbToastOut 0.3s ease';
                setTimeout(function () { notification.remove(); }, 300);
            });
        }

        // Responsive
        if (window.innerWidth <= 768) {
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.left = '10px';
            notification.style.maxWidth = 'calc(100% - 20px)';
        }

        // Auto-cerrar a los 5 segundos
        setTimeout(function () {
            if (notification.parentNode) {
                notification.style.animation = 'bbToastOut 0.3s ease';
                setTimeout(function () { notification.remove(); }, 300);
            }
        }, 5000);
    }

    // ========== PERFIL DE USUARIO (Avatar) ==========

    // Cache del perfil — se carga UNA vez y se reutiliza en navegaciones PJAX
    var userProfileCache = null;

    function loadUserProfile() {
        if (userProfileCache) {
            updateAvatarUI(userProfileCache.name);
            return Promise.resolve(userProfileCache);
        }

        return fetch('/api/user', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin'
        })
        .then(function (response) {
            if (response.ok) return response.json();
            throw new Error('HTTP ' + response.status);
        })
        .then(function (user) {
            userProfileCache = user;
            updateAvatarUI(user.name);
            return user;
        })
        .catch(function (error) {
            console.error('Error cargando usuario:', error);
        });
    }

    function updateAvatarUI(fullName) {
        var el = document.querySelector('.user-avatar-top');
        if (!el || !fullName) return;

        var parts = fullName.trim().split(' ');
        var initials = parts[0].charAt(0).toUpperCase();
        if (parts.length > 1) {
            initials += parts[parts.length - 1].charAt(0).toUpperCase();
        }

        el.textContent = initials;
        el.title = fullName;
    }

    function refreshUserProfile() {
        userProfileCache = null;
        return loadUserProfile();
    }

    // Cargar perfil al inicio (una sola vez)
    loadUserProfile();

    // ========== EXPORTAR A WINDOW ==========

    window.getCookie = getCookie;
    window.escapeHTML = escapeHTML;
    window.formatDate = formatDate;
    window.formatCurrency = formatCurrency;
    window.parseExpirationDate = parseExpirationDate;
    window.showNotification = showNotification;
    window.loadUserProfile = loadUserProfile;
    window.updateAvatarUI = updateAvatarUI;
    window.refreshUserProfile = refreshUserProfile;

})();
