/**
 * formatters.js — Auto-formateo y validación de inputs numéricos
 *
 * Uso: añadir data-format="iban|phone|digits|card-number" al <input>.
 *      Incluir este script ANTES del script principal de la página.
 *
 *  data-format="iban"        → Dígitos agrupados de 4 en 4 (longitud según país)
 *  data-format="phone"       → Dígitos agrupados (longitud según país)
 *  data-format="digits"      → Solo dígitos (bloquea letras y símbolos)
 *  data-format="card-number" → 16 dígitos en grupos de 4 (XXXX XXXX XXXX XXXX)
 *
 * Atributos opcionales:
 *  data-country-select="selectId" → Vincula un <select> de país para IBAN o teléfono
 *
 * Para leer el valor limpio (sin espacios) desde JS:
 *      input.dataset.rawValue   // siempre disponible tras cada input
 */
(function () {
    'use strict';

    // ── Longitudes IBAN por país (dígitos sin código de país) ──
    var IBAN_LENGTHS = {
        ES: 22, FR: 25, DE: 20, IT: 25, PT: 23, GB: 20
    };

    // ── Longitudes teléfono por prefijo ────────────────────────
    var PHONE_LENGTHS = {
        '+34': 9, '+33': 9, '+49': 11, '+39': 10, '+351': 9, '+44': 10, '+1': 10
    };

    // ── Algoritmo de Luhn (validación real de tarjetas) ────────
    function luhnCheck(num) {
        var sum = 0;
        var alt = false;
        for (var i = num.length - 1; i >= 0; i--) {
            var n = parseInt(num[i], 10);
            if (alt) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            sum += n;
            alt = !alt;
        }
        return sum % 10 === 0;
    }

    // ── Obtener país del <select> vinculado ────────────────────
    function getLinkedCountry(input) {
        var selectId = input.dataset.countrySelect;
        if (!selectId) return null;
        var select = document.getElementById(selectId);
        return select ? select.value : null;
    }

    // ── IBAN (dígitos sin código país, agrupados de 4) ─────────
    function handleIBAN(e) {
        var input = e.target;
        var country = getLinkedCountry(input) || 'ES';
        var maxDigits = IBAN_LENGTHS[country] || 22;

        var digits = input.value.replace(/\D/g, '').substring(0, maxDigits);
        var formatted = digits.match(/.{1,4}/g)?.join(' ') || '';
        input.value = formatted;
        input.dataset.rawValue = digits;

        if (digits.length === maxDigits) {
            input.style.borderColor = '#10b981';
        } else if (digits.length > 0) {
            input.style.borderColor = '';
        } else {
            input.style.borderColor = '';
        }

        // Actualizar hint si existe
        var hintId = input.dataset.ibanHint;
        if (hintId) {
            var hint = document.getElementById(hintId);
            if (hint) hint.textContent = 'Solo los ' + maxDigits + ' dígitos restantes (' + digits.length + '/' + maxDigits + ')';
        }
    }

    // ── Teléfono (longitud según país, agrupado de 3) ──────────
    function handlePhone(e) {
        var input = e.target;
        var country = getLinkedCountry(input) || '+34';
        var maxLen = PHONE_LENGTHS[country] || 9;

        var digits = input.value.replace(/\D/g, '');

        // Si escribieron el prefijo nacional al inicio, lo quitamos
        if (country === '+34' && digits.startsWith('34') && digits.length > maxLen) {
            digits = digits.substring(2);
        }
        digits = digits.substring(0, maxLen);

        // Formatear en grupos de 3 (último grupo puede ser más largo)
        var formatted = '';
        for (var i = 0; i < digits.length; i += 3) {
            if (i > 0) formatted += ' ';
            formatted += digits.slice(i, i + 3);
        }

        input.value = formatted;
        input.dataset.rawValue = digits;

        if (digits.length === maxLen) {
            input.style.borderColor = '#10b981';
        } else if (digits.length > 0) {
            input.style.borderColor = '';
        } else {
            input.style.borderColor = '';
        }
    }

    // ── Solo dígitos (para CVC, últimos 4, etc.) ───────────────
    function handleDigitsOnly(e) {
        var input = e.target;
        var digits = input.value.replace(/\D/g, '');
        var max = parseInt(input.maxLength) || digits.length;
        input.value = digits.substring(0, max > 0 ? max : digits.length);
        input.dataset.rawValue = input.value;
    }

    // ── Número de tarjeta (exactamente 16 dígitos, XXXX XXXX XXXX XXXX) ──
    function handleCardNumber(e) {
        var input = e.target;
        var digits = input.value.replace(/\D/g, '').substring(0, 16);
        var formatted = digits.match(/.{1,4}/g)?.join(' ') || '';
        input.value = formatted;
        input.dataset.rawValue = digits;

        if (digits.length === 16) {
            input.style.borderColor = '#10b981';
        } else if (digits.length > 0) {
            input.style.borderColor = '';
        } else {
            input.style.borderColor = '';
        }
    }

    // ── Mapa de formateadores ────────────────────────────────
    var handlers = {
        iban: handleIBAN,
        phone: handlePhone,
        digits: handleDigitsOnly,
        'card-number': handleCardNumber,
    };

    // ── Vincular selectores de país ────────────────────────────
    function bindCountrySelectors() {
        var inputs = document.querySelectorAll('[data-country-select]');
        inputs.forEach(function (input) {
            var selectId = input.dataset.countrySelect;
            var select = document.getElementById(selectId);
            if (!select) return;

            select.addEventListener('change', function () {
                // Re-disparar el formateador para re-validar con nueva longitud
                var type = input.dataset.format;
                var handler = handlers[type];
                if (handler) handler({ target: input });
            });
        });
    }

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

        bindCountrySelectors();
    }

    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ── Exportar utilidades para uso externo ───────────────────
    window.IBAN_LENGTHS = IBAN_LENGTHS;
    window.PHONE_LENGTHS = PHONE_LENGTHS;
    window.luhnCheck = luhnCheck;
})();
