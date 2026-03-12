/**
 * core/api-client.js — Cliente API centralizado para BudgetBuddy
 *
 * Proporciona window.apiRequest() con:
 *  - CSRF cookie automático para mutaciones (POST/PUT/DELETE)
 *  - Manejo de 401 (sesión expirada → redirect login)
 *  - Manejo de 422 (errores de validación)
 *  - Headers con XSRF-TOKEN automático
 *
 * Depende de: core/utils.js (getCookie, showNotification)
 */
(function () {
    'use strict';

    async function apiRequest(url, method, data) {
        method = method || 'GET';
        data = data || null;

        // Obtener CSRF cookie antes de peticiones mutantes
        if (method !== 'GET') {
            await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
        }

        var options = {
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

        console.log('API ' + method + ' ' + url, data);

        try {
            var response = await fetch(url, options);
            console.log('Response ' + response.status + ' from ' + url);

            if (response.status === 401) {
                showNotification('Sesión expirada. Redirigiendo al login...', 'error');
                setTimeout(function () { window.location.href = '/login'; }, 2000);
                return null;
            }

            if (response.status === 422) {
                var errors = await response.json();
                var errorMessages = errors.errors ?
                    Object.values(errors.errors).flat().join(', ') :
                    errors.message || 'Error de validación';
                throw new Error(errorMessages);
            }

            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }

            if (response.status === 204 || method === 'DELETE') {
                return { success: true };
            }

            return await response.json();

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========== EXPORTAR A WINDOW ==========

    window.apiRequest = apiRequest;

})();
