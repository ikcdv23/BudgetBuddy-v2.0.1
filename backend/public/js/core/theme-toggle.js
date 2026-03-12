/**
 * theme-toggle.js — Toggle de tema claro/oscuro/auto para BudgetBuddy
 *
 * 3 estados: light (sol), dark (luna), auto (medio-circulo)
 * Ciclo: light -> dark -> auto -> light
 * Persiste en localStorage('bb-theme')
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'bb-theme';
    const ICONS = {
        light: 'fa-sun',
        dark: 'fa-moon',
        auto: 'fa-circle-half-stroke'
    };
    const TITLES = {
        light: 'Tema: Claro',
        dark: 'Tema: Oscuro',
        auto: 'Tema: Auto (sistema)'
    };

    function getPreference() {
        return localStorage.getItem(STORAGE_KEY) || 'auto';
    }

    function resolveTheme(pref) {
        if (pref === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return pref;
    }

    function applyTheme(pref) {
        var resolved = resolveTheme(pref);
        document.documentElement.setAttribute('data-theme', resolved);
        updateIcon(pref);
    }

    function updateIcon(pref) {
        var btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;
        var icon = btn.querySelector('i');
        if (!icon) return;

        // Remove all theme icons
        icon.classList.remove(ICONS.light, ICONS.dark, ICONS.auto);
        // Add current
        icon.classList.add(ICONS[pref]);
        btn.setAttribute('title', TITLES[pref]);
        btn.setAttribute('aria-label', TITLES[pref]);
    }

    function cycleTheme() {
        var current = getPreference();
        var next;
        if (current === 'light') next = 'dark';
        else if (current === 'dark') next = 'auto';
        else next = 'light';

        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }

    function bindThemeToggle() {
        var btn = document.getElementById('theme-toggle-btn');
        if (btn) {
            btn.addEventListener('click', cycleTheme);
        }
        // Set initial icon state
        updateIcon(getPreference());
    }

    // Listen for OS theme changes (re-apply if mode is auto)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (getPreference() === 'auto') {
            applyTheme('auto');
        }
    });

    // Apply theme on script load (backup — FOUC script in <head> handles initial)
    applyTheme(getPreference());

    // Bind on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindThemeToggle);
    } else {
        bindThemeToggle();
    }

    // Export for PJAX re-binding
    window.cycleTheme = cycleTheme;
    window.bindThemeToggle = bindThemeToggle;
})();
