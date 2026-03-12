/**
 * modules/drag-drop.js — Lógica genérica de drag & drop con zona de eliminar
 *
 * Uso:
 *   window.initDragAndDrop({
 *       items:       '.tag-item:not(.delete-tag-item)',  // selector de items arrastrables
 *       dropZone:    '#delete-tag-area',                 // selector de zona de drop (eliminar)
 *       indicator:   '#delete-indicator',                // (opcional) selector de indicador visual
 *       dataAttr:    'data-id',                          // atributo con el ID del item
 *       onDragStart: function(el, id) { ... },           // (opcional) callback al iniciar drag
 *       onDragEnd:   function(el) { ... },               // (opcional) callback al terminar drag
 *       onDrop:      async function(id, el) { ... }      // callback al soltar sobre la zona
 *   });
 *
 * Depende de: nada (standalone)
 */
(function () {
    'use strict';

    function initDragAndDrop(config) {
        if (!config || !config.items || !config.dropZone || !config.onDrop) {
            console.warn('initDragAndDrop: faltan parámetros requeridos (items, dropZone, onDrop)');
            return;
        }

        var dropZone = document.querySelector(config.dropZone);
        var indicator = config.indicator ? document.querySelector(config.indicator) : null;
        var items = document.querySelectorAll(config.items);
        var dataAttr = config.dataAttr || 'data-id';

        if (!dropZone) {
            console.warn('initDragAndDrop: zona de drop no encontrada:', config.dropZone);
            return;
        }

        items.forEach(function (item) {
            // Evitar duplicados de listeners
            item.removeEventListener('dragstart', item._ddDragStart);
            item.removeEventListener('dragend', item._ddDragEnd);

            item.setAttribute('draggable', 'true');

            item._ddDragStart = function (e) {
                var id = this.getAttribute(dataAttr);
                e.dataTransfer.setData('text/plain', id);
                this.classList.add('dragging');
                dropZone.classList.add('active');

                if (indicator) {
                    indicator.textContent = 'Arrastra a la zona roja para eliminar';
                    indicator.classList.add('active');
                }

                if (config.onDragStart) config.onDragStart(this, id);
            };

            item._ddDragEnd = function () {
                this.classList.remove('dragging');
                dropZone.classList.remove('active', 'drag-over');
                dropZone.style.transform = '';

                if (indicator) indicator.classList.remove('active');

                if (config.onDragEnd) config.onDragEnd(this);
            };

            item.addEventListener('dragstart', item._ddDragStart);
            item.addEventListener('dragend', item._ddDragEnd);
        });

        // Drop zone listeners
        dropZone.removeEventListener('dragover', dropZone._ddDragOver);
        dropZone.removeEventListener('dragleave', dropZone._ddDragLeave);
        dropZone.removeEventListener('drop', dropZone._ddDrop);

        dropZone._ddDragOver = function (e) {
            e.preventDefault();
            dropZone.classList.add('drag-over');
            dropZone.style.transform = 'scale(1.02)';
        };

        dropZone._ddDragLeave = function () {
            dropZone.classList.remove('drag-over');
            dropZone.style.transform = '';
        };

        dropZone._ddDrop = function (e) {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            dropZone.style.transform = '';

            var id = e.dataTransfer.getData('text/plain');
            if (!id) return;

            var item = document.querySelector(config.items + '[' + dataAttr + '="' + id + '"]');
            config.onDrop(id, item);
        };

        dropZone.addEventListener('dragover', dropZone._ddDragOver);
        dropZone.addEventListener('dragleave', dropZone._ddDragLeave);
        dropZone.addEventListener('drop', dropZone._ddDrop);
    }

    // ========== EXPORTAR A WINDOW ==========

    window.initDragAndDrop = initDragAndDrop;

})();
