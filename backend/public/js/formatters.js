/**
 * formatters.js — Auto-formateo de inputs
 *
 * Uso: añadir data-format="iban|phone|digits" al <input>.
 *      Incluir este script ANTES del script principal de la página.
 *
 *  data-format="iban"   → 22 dígitos agrupados de 4 en 4
 *  data-format="phone"  → 9 dígitos formato XXX XXX XXX
 *  data-format="digits" → Solo dígitos (bloquea letras y símbolos)
 *
 * Para leer el valor limpio (sin espacios) desde JS:
 *      input.dataset.rawValue   // siempre disponible tras cada input
 */
(function () {
    'use strict';

    // ── IBAN (22 dígitos sin código país) ─────────────────────
    function handleIBAN(e) {
        const input = e.target;
        const digits = input.value.replace(/\D/g, '').substring(0, 22);
        const formatted = digits.match(/.{1,4}/g)?.join(' ') || '';
        input.value = formatted;
        input.dataset.rawValue = digits;

        // Feedback visual: verde cuando tiene los 22 dígitos
        if (digits.length === 22) {
            input.style.borderColor = '#10b981';
        } else if (digits.length > 0) {
            input.style.borderColor = '';
        }
    }

    // ── Teléfono español (9 dígitos → XXX XXX XXX) ───────────
    function handlePhone(e) {
        const input = e.target;
        let digits = input.value.replace(/\D/g, '');

        // Si escribieron 34… al principio (prefijo), lo quitamos
        if (digits.startsWith('34') && digits.length > 9) {
            digits = digits.substring(2);
        }
        digits = digits.substring(0, 9);

        let formatted = digits;
        if (digits.length > 6) {
            formatted = digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6);
        } else if (digits.length > 3) {
            formatted = digits.slice(0, 3) + ' ' + digits.slice(3);
        }

        input.value = formatted;
        input.dataset.rawValue = digits;

        // Feedback visual
        if (digits.length === 9) {
            input.style.borderColor = '#10b981';
        } else if (digits.length > 0) {
            input.style.borderColor = '';
        }
    }

    // ── Solo dígitos (para últimos 4 de tarjeta, etc.) ───────
    function handleDigitsOnly(e) {
        const input = e.target;
        const digits = input.value.replace(/\D/g, '');
        const max = parseInt(input.maxLength) || digits.length;
        input.value = digits.substring(0, max > 0 ? max : digits.length);
        input.dataset.rawValue = input.value;
    }

    // ── Mapa de formateadores ────────────────────────────────
    var handlers = {
        iban: handleIBAN,
        phone: handlePhone,
        digits: handleDigitsOnly,
    };

    // ── Inicialización automática ────────────────────────────
    function init() {
        var inputs = document.querySelectorAll('[data-format]');
        inputs.forEach(function (input) {
            var type = input.dataset.format;
            var handler = handlers[type];
            if (!handler) return;

            input.addEventListener('input', handler);

            // Si el input ya tiene valor (ej: precargado por el servidor),
            // formatearlo inmediatamente
            if (input.value) {
                handler({ target: input });
            }
        });
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
