// desktop.js - Спрощена працююча версія

document.addEventListener('DOMContentLoaded', function() {
    console.log('Desktop.js завантажено!');
    
    // ========== ТІЛЬКИ ДЛЯ СТОРІНОК У РОЗРОБЦІ (href="#") ==========
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const title = this.getAttribute('title') || 'цієї сторінки';
            showNotification(`Página "${title}" en desarrollo`, 'info');
            
            // Для sidebar навігації на десктопі оновлюємо активний клас
            if (this.classList.contains('nav-item')) {
                document.querySelectorAll('.nav-item').forEach(nav => {
                    nav.classList.remove('active');
                });
                this.classList.add('active');
                
                // Оновлюємо заголовок сторінки
                const pageTitleElement = document.querySelector('.page-title');
                if (pageTitleElement && title !== 'Panel general') {
                    pageTitleElement.textContent = title;
                }
            }
        });
    });
    
    // ========== НАВІГАЦІЯ КАРТОЧЕК ==========
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const cardCounter = document.querySelector('.card-counter');
    const cards = document.querySelectorAll('.credit-card-compact');
    const cardTitle = document.getElementById('card-title');
    
    if (cards.length > 0) {
        let currentCardIndex = 0;
        const totalCards = cards.length;
        
        function updateCardNavigation() {
            cards.forEach(card => {
                card.classList.remove('active');
                card.style.display = 'none';
            });
            
            if (cards[currentCardIndex]) {
                cards[currentCardIndex].classList.add('active');
                cards[currentCardIndex].style.display = 'block';
            }
            
            if (cardCounter) {
                cardCounter.textContent = `${currentCardIndex + 1}/${totalCards}`;
            }
            
            if (cardTitle) {
                cardTitle.textContent = `Tarjeta ${currentCardIndex + 1}`;
            }
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentCardIndex = (currentCardIndex - 1 + totalCards) % totalCards;
                updateCardNavigation();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentCardIndex = (currentCardIndex + 1) % totalCards;
                updateCardNavigation();
            });
        }
        
        updateCardNavigation();
    }
    
    // ========== ДРАГ-ЕНД-ДРОП ДЛЯ ТЕГІВ ==========
    const deleteTagArea = document.getElementById('delete-tag-area');
    const deleteIndicator = document.getElementById('delete-indicator');
    
    if (deleteTagArea) {
        function initializeDragAndDrop() {
            const tagItems = document.querySelectorAll('.tag-item');
            
            tagItems.forEach(tag => {
                tag.addEventListener('dragstart', handleDragStart);
                tag.addEventListener('dragend', handleDragEnd);
            });
            
            deleteTagArea.addEventListener('dragover', handleDragOver);
            deleteTagArea.addEventListener('dragleave', handleDragLeave);
            deleteTagArea.addEventListener('drop', handleDrop);
        }
        
        function handleDragStart(e) {
            e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
            this.classList.add('dragging');
            if (deleteIndicator) {
                deleteIndicator.textContent = 'Arrastra a la zona roja para eliminar';
                deleteIndicator.classList.add('active');
            }
        }
        
        function handleDragEnd() {
            this.classList.remove('dragging');
            if (deleteIndicator) {
                deleteIndicator.classList.remove('active');
            }
            deleteTagArea.classList.remove('drag-over');
            deleteTagArea.style.transform = 'scale(1)';
        }
        
        function handleDragOver(e) {
            e.preventDefault();
            deleteTagArea.classList.add('drag-over');
            deleteTagArea.style.transform = 'scale(1.02)';
        }
        
        function handleDragLeave() {
            deleteTagArea.classList.remove('drag-over');
            deleteTagArea.style.transform = 'scale(1)';
        }
        
        function handleDrop(e) {
            e.preventDefault();
            const tagId = e.dataTransfer.getData('text/plain');
            const tagToDelete = document.querySelector(`.tag-item[data-id="${tagId}"]`);
            
            if (tagToDelete) {
                tagToDelete.style.opacity = '0';
                tagToDelete.style.transform = 'translateX(100px) rotate(10deg)';
                
                setTimeout(() => {
                    tagToDelete.remove();
                    
                    if (deleteIndicator) {
                        deleteIndicator.textContent = '¡Etiqueta eliminada correctamente!';
                        deleteIndicator.classList.add('active');
                        
                        setTimeout(() => {
                            deleteIndicator.textContent = '';
                            deleteIndicator.classList.remove('active');
                        }, 2000);
                    }
                    
                    initializeDragAndDrop();
                }, 300);
            }
            
            deleteTagArea.classList.remove('drag-over');
            deleteTagArea.style.transform = 'scale(1)';
        }
        
        initializeDragAndDrop();
    }
    
    // ========== МОДАЛЬНЕ ВІКНО ДЛЯ ТЕГІВ ==========
    const tagModal = document.getElementById('tagModal');
    const addTagBtn = document.getElementById('desktop-add-tag');
    const closeModal = document.getElementById('closeModal');
    const cancelTag = document.getElementById('cancelTag');
    const saveTag = document.getElementById('saveTag');
    const colorOptions = document.querySelectorAll('.color-option');
    const iconOptions = document.querySelectorAll('.icon-option');
    
    let selectedColor = '#34d399';
    let selectedIcon = 'dumbbell';
    
    if (addTagBtn && tagModal) {
        addTagBtn.addEventListener('click', () => {
            tagModal.showModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            tagModal.close();
        });
    }
    
    if (cancelTag) {
        cancelTag.addEventListener('click', () => {
            tagModal.close();
        });
    }
    
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedColor = this.getAttribute('data-color');
        });
    });
    
    iconOptions.forEach(option => {
        option.addEventListener('click', function() {
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.getAttribute('data-icon');
        });
    });
    
    if (saveTag) {
        saveTag.addEventListener('click', function() {
            const tagName = document.getElementById('tagName').value;
            
            if (!tagName.trim()) {
                showNotification('Por favor, ingresa un nombre para la etiqueta', 'error');
                return;
            }
            
            const tagsList = document.querySelector('.tags-list');
            const deleteTagArea = document.getElementById('delete-tag-area');
            
            const existingTags = document.querySelectorAll('.tag-item');
            const newId = existingTags.length + 1;
            
            const newTagItem = document.createElement('div');
            newTagItem.className = 'tag-item';
            newTagItem.setAttribute('draggable', 'true');
            newTagItem.setAttribute('data-id', newId);
            newTagItem.style.setProperty('--tag-color', selectedColor);
            
            const iconClass = `fas fa-${selectedIcon}`;
            
            newTagItem.innerHTML = `
                <div class="tag-icon" style="background-color: rgba(${hexToRgb(selectedColor)}, 0.1); color: ${selectedColor};">
                    <i class="${iconClass}"></i>
                </div>
                <div class="tag-info">
                    <h3>${tagName}</h3>
                    <p>Etiqueta personalizada</p>
                </div>
                <div class="tag-amount"></div>
            `;
            
            tagsList.insertBefore(newTagItem, deleteTagArea);
            document.getElementById('tagName').value = '';
            
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            
            colorOptions[0].classList.add('selected');
            iconOptions[0].classList.add('selected');
            selectedColor = '#34d399';
            selectedIcon = 'dumbbell';
            
            tagModal.close();
            showNotification('Etiqueta creada exitosamente', 'success');
        });
    }
    
    // ========== УТІЛІТИ ==========
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return '52, 211, 153';
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `${r}, ${g}, ${b}`;
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        let icon = 'info-circle';
        let bgColor = '#3b82f6';
        
        if (type === 'success') {
            icon = 'check-circle';
            bgColor = '#10b981';
        } else if (type === 'error') {
            icon = 'exclamation-circle';
            bgColor = '#ef4444';
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: ${bgColor};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 10000;
        `;
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Оновлення дати
    function updateDate() {
        const now = new Date();
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        const formattedDate = now.toLocaleDateString('es-ES', options);
        const dateElement = document.querySelector('.date-container');
        if (dateElement) {
            dateElement.textContent = formattedDate;
        }
    }
    
    updateDate();
    
    // Оновлення кругових прогресів
    function updateProgressCircles() {
        document.querySelectorAll('.progress-circle-fill').forEach(circle => {
            const progress = circle.style.getPropertyValue('--progress');
            const circumference = 100;
            const offset = circumference - (progress / 100 * circumference);
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;
        });
    }
    
    updateProgressCircles();
});