/**
 * modules/carousel-nav.js — Flechas de navegación para carruseles horizontales
 *
 * Uso: envolver el contenedor scrollable en un .carousel-wrapper
 *      que contenga botones .carousel-arrow.left y .carousel-arrow.right
 *
 * Se auto-inicializa buscando todos los .carousel-wrapper del DOM.
 * Cada wrapper espera:
 *   - Un hijo con [data-carousel-track] (el contenedor scrollable)
 *   - Dos botones .carousel-arrow.left y .carousel-arrow.right
 *
 * window.initCarousels() puede llamarse para re-inicializar tras contenido dinámico.
 */
(function () {
    'use strict';

    function initCarousel(wrapper) {
        var track = wrapper.querySelector('[data-carousel-track]');
        var btnLeft = wrapper.querySelector('.carousel-arrow.left');
        var btnRight = wrapper.querySelector('.carousel-arrow.right');

        if (!track || !btnLeft || !btnRight) return;

        // Detectar ancho de un item para calcular cuánto scrollear
        function getScrollStep() {
            var firstItem = track.querySelector('.mini-card, .ghost-card');
            if (firstItem) {
                return firstItem.offsetWidth + 15; // ancho + gap
            }
            return 280; // fallback
        }

        function updateArrows() {
            var scrollLeft = Math.round(track.scrollLeft);
            var maxScroll = track.scrollWidth - track.clientWidth;

            // Ocultar flecha izquierda si estamos al inicio
            if (scrollLeft <= 5) {
                btnLeft.classList.add('hidden');
            } else {
                btnLeft.classList.remove('hidden');
            }

            // Ocultar flecha derecha si estamos al final o no hay overflow
            if (scrollLeft >= maxScroll - 5 || maxScroll <= 0) {
                btnRight.classList.add('hidden');
            } else {
                btnRight.classList.remove('hidden');
            }
        }

        btnLeft.addEventListener('click', function () {
            track.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
        });

        btnRight.addEventListener('click', function () {
            track.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
        });

        track.addEventListener('scroll', updateArrows);

        // Observer para detectar cambios en el contenido (tarjetas cargadas dinámicamente)
        var observer = new MutationObserver(function () {
            setTimeout(updateArrows, 100);
        });
        observer.observe(track, { childList: true, subtree: true });

        // Detectar resize
        window.addEventListener('resize', updateArrows);

        // Estado inicial
        setTimeout(updateArrows, 200);

        // Marcar como inicializado
        wrapper.dataset.carouselInit = 'true';
    }

    function initAll() {
        var wrappers = document.querySelectorAll('.carousel-wrapper');
        wrappers.forEach(function (wrapper) {
            if (!wrapper.dataset.carouselInit) {
                initCarousel(wrapper);
            }
        });
    }

    // Inicializar cuando DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }

    // Exportar para re-inicialización tras carga dinámica (pjax)
    window.initCarousels = initAll;
})();
