/**
 * pjax-nav.js — Navegación SPA-like para BudgetBuddy
 *
 * Intercepta clicks en los links de la sidebar y mobile nav,
 * hace fetch de la nueva página, y reemplaza solo el contenido
 * central (<main>) + CSS/JS específicos de cada página.
 * Header y nav nunca se recargan.
 */
(function () {
    'use strict';

    // Rutas que manejan la navegación PJAX (páginas con layout compartido)
    const PJAX_ROUTES = ['/desktop', '/estadisticas', '/misTarjetas', '/ajustes'];

    // Estado
    let currentScripts = [];
    let navigating = false;

    function init() {
        // Interceptar clicks en nav links
        document.addEventListener('click', handleNavClick);
        // Manejar botón atrás/adelante del navegador
        window.addEventListener('popstate', handlePopState);
    }

    function handleNavClick(e) {
        const link = e.target.closest('.nav-item, .mobile-nav-item');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || !PJAX_ROUTES.includes(href)) return;

        // Si ya estamos en esa página, ignorar
        if (href === window.location.pathname) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        navigateTo(href, true);
    }

    function handlePopState() {
        const path = window.location.pathname;
        if (PJAX_ROUTES.includes(path)) {
            navigateTo(path, false);
        } else {
            // Ruta fuera de PJAX, navegar normalmente
            window.location.reload();
        }
    }

    async function navigateTo(url, pushState) {
        if (navigating) return;
        navigating = true;

        try {
            const resp = await fetch(url, {
                credentials: 'same-origin',
                headers: { 'Accept': 'text/html' }
            });

            if (resp.redirected) {
                window.location.href = resp.url;
                return;
            }
            if (!resp.ok) {
                window.location.href = url;
                return;
            }

            const html = await resp.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 1. Extraer el nuevo <main>
            const newMain = doc.querySelector('.desktop-main');
            if (!newMain) {
                window.location.href = url;
                return;
            }

            // 2. Extraer CSS específicos de la página (los que están después de notification.css)
            const newStyles = extractPageStyles(doc);

            // 3. Extraer scripts específicos de la página (después de notifications.js)
            const newScripts = extractPageScripts(doc);

            // 4. Actualizar título
            document.title = doc.title;

            // 5. Swap CSS: quitar los viejos de página y poner los nuevos
            replacePageStyles(newStyles);

            // 6. Swap contenido del <main> con fade
            const main = document.querySelector('.desktop-main');
            main.style.opacity = '0';
            main.style.transition = 'opacity 0.15s ease';

            await new Promise(r => setTimeout(r, 150));
            main.innerHTML = newMain.innerHTML;
            main.style.opacity = '1';

            // 7. Actualizar active state en nav
            updateNavActive(url);

            // 8. Actualizar CSRF token si cambió
            const newToken = doc.querySelector('meta[name="csrf-token"]');
            if (newToken) {
                const current = document.querySelector('meta[name="csrf-token"]');
                if (current) current.setAttribute('content', newToken.getAttribute('content'));
            }

            // 9. Cargar scripts de la nueva página
            await loadPageScripts(newScripts);

            // 10. Actualizar URL en el navegador
            if (pushState) {
                history.pushState({pjax: true}, '', url);
            }

        } catch (err) {
            console.error('PJAX navigation failed:', err);
            window.location.href = url;
        } finally {
            navigating = false;
        }
    }

    /**
     * Extrae las URLs de los <link rel="stylesheet"> específicos de la página
     * (los que no son backstyle.css, notification.css, ni CDNs)
     */
    function extractPageStyles(doc) {
        const baseStyles = ['app-variables', 'app-dark-mode', 'app-layout', 'app-modals', 'app-forms', 'app-utilities', 'notification.css', 'fonts.googleapis', 'font-awesome'];
        const links = doc.querySelectorAll('link[rel="stylesheet"]');
        const pageStyles = [];
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const isBase = baseStyles.some(b => href.includes(b));
            if (!isBase) pageStyles.push(href);
        });
        return pageStyles;
    }

    /**
     * Extrae las URLs de los <script src> específicos de la página
     * (los que no son formatters.js, notifications.js, pjax-nav.js, ni CDNs de fonts)
     */
    function extractPageScripts(doc) {
        const baseScripts = ['core/', 'modules/', 'pjax-nav.js'];
        const scripts = doc.querySelectorAll('script[src]');
        const pageScripts = [];
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (!src) return;
            const isBase = baseScripts.some(b => src.includes(b));
            if (!isBase) pageScripts.push(src);
        });
        return pageScripts;
    }

    /**
     * Reemplaza los <link> CSS de la página anterior con los nuevos
     */
    function replacePageStyles(newStyleUrls) {
        // Quitar estilos de página anteriores (marcados con data-pjax-style)
        document.querySelectorAll('link[data-pjax-style]').forEach(el => el.remove());

        // Añadir nuevos
        const head = document.head;
        newStyleUrls.forEach(href => {
            // Verificar si ya existe
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.setAttribute('data-pjax-style', '');
            head.appendChild(link);
        });
    }

    /**
     * Carga y ejecuta los scripts de la nueva página
     */
    function loadPageScripts(newScriptUrls) {
        // Quitar scripts de página anteriores
        currentScripts.forEach(el => el.remove());
        currentScripts = [];

        return new Promise(resolve => {
            let loaded = 0;
            const total = newScriptUrls.length;

            if (total === 0) {
                resolve();
                return;
            }

            newScriptUrls.forEach(src => {
                const script = document.createElement('script');
                script.src = src + '?_=' + Date.now(); // Cache bust para forzar re-ejecución
                script.onload = script.onerror = () => {
                    loaded++;
                    if (loaded >= total) resolve();
                };
                currentScripts.push(script);
                document.body.appendChild(script);
            });
        });
    }

    /**
     * Actualiza la clase 'active' en sidebar y mobile nav
     */
    function updateNavActive(url) {
        // Sidebar
        document.querySelectorAll('.sidebar .nav-item').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === url);
        });
        // Mobile nav
        document.querySelectorAll('.mobile-nav .mobile-nav-item').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === url);
        });
    }

    // Marcar los estilos iniciales de página como pjax-managed
    function markInitialPageStyles() {
        const baseStyles = ['app-variables', 'app-dark-mode', 'app-layout', 'app-modals', 'app-forms', 'app-utilities', 'notification.css', 'fonts.googleapis', 'font-awesome'];
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            const isBase = baseStyles.some(b => href.includes(b));
            if (!isBase) link.setAttribute('data-pjax-style', '');
        });
    }

    // Iniciar
    markInitialPageStyles();
    init();
})();
