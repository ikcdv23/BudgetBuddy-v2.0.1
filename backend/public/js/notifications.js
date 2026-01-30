// notifications.js - Спільний файл для повідомлень на всіх сторінках

document.addEventListener('DOMContentLoaded', function() {
    // ===========================================
    // ОГОЛОШЕННЯ ЗМІННИХ
    // ===========================================
    let notificationsPopup, notificationsBtn, closeNotificationsBtn, notificationsOverlay;
    let markAllReadBtn, clearAllBtn, notificationItems, notificationActions;
    
    // ===========================================
    // ІНІЦІАЛІЗАЦІЯ ПОВІДОМЛЕНЬ
    // ===========================================
    function initNotifications() {
        // Знаходимо елементи
        notificationsPopup = document.getElementById('notifications-popup');
        notificationsBtn = document.querySelector('.notification-btn') || document.querySelector('.top-icon.notification-btn');
        closeNotificationsBtn = document.getElementById('close-notifications');
        
        // Створюємо оверлей, якщо його ще немає
        if (!document.querySelector('.notifications-overlay')) {
            notificationsOverlay = document.createElement('div');
            notificationsOverlay.className = 'notifications-overlay';
            document.body.appendChild(notificationsOverlay);
        } else {
            notificationsOverlay = document.querySelector('.notifications-overlay');
        }
        
        // Знаходимо нові елементи
        markAllReadBtn = document.getElementById('mark-all-read');
        clearAllBtn = document.getElementById('clear-all');
        
        // Оновлюємо бейдж
        updateNotificationBadge();
        
        // Анімація дзвіночка при нових повідомленнях
        const newNotifications = document.querySelectorAll('.notification-item.new');
        if (newNotifications.length > 0 && notificationsBtn) {
            notificationsBtn.classList.add('shake');
            setTimeout(() => {
                notificationsBtn.classList.remove('shake');
            }, 2000);
        }
    }
    
    // ===========================================
    // ОСНОВНІ ФУНКЦІЇ ПОВІДОМЛЕНЬ
    // ===========================================
    function toggleNotifications() {
        if (notificationsPopup && notificationsOverlay) {
            const isVisible = notificationsPopup.classList.contains('show');
            
            if (isVisible) {
                closeNotifications();
            } else {
                openNotifications();
            }
        }
    }
    
    function openNotifications() {
        if (notificationsPopup) {
            notificationsPopup.classList.add('show');
            notificationsOverlay.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Позначаємо всі повідомлення як прочитані при відкритті
            const newNotifications = document.querySelectorAll('.notification-item.new');
            newNotifications.forEach(notification => {
                notification.classList.remove('new');
                notification.querySelector('.notification-action i').className = 'fas fa-trash';
                notification.querySelector('.notification-action').title = 'Eliminar';
            });
            
            // Оновлюємо бейдж
            updateNotificationBadge();
        }
    }
    
    function closeNotifications() {
        if (notificationsPopup) {
            notificationsPopup.classList.remove('show');
            notificationsOverlay.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
    }
    
    function updateNotificationBadge() {
        const notificationBadge = document.querySelector('.notification-badge');
        const newNotifications = document.querySelectorAll('.notification-item.new').length;
        
        if (notificationBadge) {
            if (newNotifications > 0) {
                notificationBadge.textContent = newNotifications > 9 ? '9+' : newNotifications.toString();
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }
    
    function markNotificationAsRead(notificationId) {
        const notification = document.querySelector(`#notifications-popup .notification-item[data-id="${notificationId}"]`);
        if (notification) {
            notification.classList.remove('new');
            notification.querySelector('.notification-action i').className = 'fas fa-trash';
            notification.querySelector('.notification-action').title = 'Eliminar';
            
            // Показуємо сповіщення
            const notificationTitle = notification.querySelector('h4').textContent;
            showNotification(`<i class="fas fa-check"></i> Notificación marcada como leída: ${notificationTitle}`, 'success');
            
            // Оновлюємо бейдж
            updateNotificationBadge();
            
            // Перевіряємо чи є ще непрочитані повідомлення
            const newNotifications = document.querySelectorAll('.notification-item.new').length;
            if (newNotifications === 0) {
                showEmptyNotificationsState();
            }
        }
    }
    
    function deleteNotification(notificationId) {
        const notification = document.querySelector(`#notifications-popup .notification-item[data-id="${notificationId}"]`);
        if (notification) {
            const notificationTitle = notification.querySelector('h4').textContent;
            notification.style.animation = 'slideOut 0.3s ease';
            
            setTimeout(() => {
                notification.remove();
                showNotification(`<i class="fas fa-trash"></i> Notificación eliminada: ${notificationTitle}`, 'info');
                
                // Оновлюємо бейдж після видалення
                updateNotificationBadge();
                
                // Перевіряємо чи є ще повідомлення
                const remainingNotifications = document.querySelectorAll('.notification-item').length;
                if (remainingNotifications === 0) {
                    showEmptyNotificationsState();
                }
            }, 300);
        }
    }
    
    function showEmptyNotificationsState() {
        const notificationsEmpty = document.getElementById('notifications-empty');
        if (notificationsEmpty) {
            notificationsEmpty.style.display = 'block';
        }
    }
    
    function hideEmptyNotificationsState() {
        const notificationsEmpty = document.getElementById('notifications-empty');
        if (notificationsEmpty) {
            notificationsEmpty.style.display = 'none';
        }
    }
    
    // ===========================================
    // ДОПОМІЖНІ ФУНКЦІЇ
    // ===========================================
    function showNotification(message, type = 'info') {
        // Видаляємо старі сповіщення
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'info' ? 'info-circle' : 
                    'exclamation-triangle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#d1fae5' : 
                            type === 'info' ? '#fef3c7' : 
                            '#fee2e2'};
            color: ${type === 'success' ? '#065f46' : 
                    type === 'info' ? '#92400e' : 
                    '#991b1b'};
            padding: 14px 18px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            z-index: 3000;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
            max-width: 400px;
            animation: slideIn 0.3s ease;
            border-left: 4px solid ${type === 'success' ? '#10b981' : 
                                type === 'info' ? '#f59e0b' : 
                                '#ef4444'};
            font-family: 'Roboto', sans-serif;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn { 
                from { 
                    transform: translateX(100%); 
                    opacity: 0; 
                } 
                to { 
                    transform: translateX(0); 
                    opacity: 1; 
                } 
            }
            @keyframes slideOut { 
                from { 
                    transform: translateX(0); 
                    opacity: 1; 
                } 
                to { 
                    transform: translateX(100%); 
                    opacity: 0; 
                } 
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Адаптація для мобільних
        if (window.innerWidth <= 768) {
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.left = '10px';
            notification.style.maxWidth = 'calc(100% - 20px)';
            notification.style.padding = '12px 16px';
        }
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    // ===========================================
    // ПІДПИСКА НА ПОДІЇ
    // ===========================================
    function initEventListeners() {
        // Повідомлення
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', toggleNotifications);
        }
        
        if (closeNotificationsBtn) {
            closeNotificationsBtn.addEventListener('click', closeNotifications);
        }
        
        if (notificationsOverlay) {
            notificationsOverlay.addEventListener('click', closeNotifications);
        }
        
        // Закриття по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeNotifications();
            }
        });
        
        // Маркування всіх повідомлень як прочитаних
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                // ЗМІНА: Шукаємо повідомлення ТІЛЬКИ всередині попапу
                const allNotifications = document.querySelectorAll('#notifications-popup .notification-item');
                
                allNotifications.forEach(notification => {
                    notification.classList.remove('new');
                    notification.querySelector('.notification-action i').className = 'fas fa-trash';
                    notification.querySelector('.notification-action').title = 'Eliminar';
                });
                
                showNotification('<i class="fas fa-check-double"></i> Todas las notificaciones marcadas como leídas', 'success');
                updateNotificationBadge();
                showEmptyNotificationsState();
            });
        }
        
        // Очищення всіх повідомлень
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
                    // ЗМІНА: Шукаємо повідомлення ТІЛЬКИ всередині попапу
                    const allNotifications = document.querySelectorAll('#notifications-popup .notification-item');
                    
                    allNotifications.forEach(notification => {
                        notification.style.animation = 'slideOut 0.3s ease';
                        setTimeout(() => notification.remove(), 300);
                    });
                    
                    setTimeout(() => {
                        showNotification('<i class="fas fa-trash"></i> Todas las notificaciones eliminadas', 'info');
                        updateNotificationBadge();
                        showEmptyNotificationsState();
                    }, 400);
                }
            });
        }
        
        // Отримуємо всі елементи повідомлень
        notificationItems = document.querySelectorAll('.notification-item');
        notificationActions = document.querySelectorAll('.notification-action');
        
        // Обробники для окремих повідомлень
        notificationItems.forEach(item => {
            item.addEventListener('click', function(e) {
                // Не реагуємо на кліки по кнопкам дій
                if (!e.target.closest('.notification-action')) {
                    const notificationId = this.getAttribute('data-id');
                    const notification = this.querySelector('h4').textContent;
                    
                    // Маркуємо як прочитане при кліку
                    if (this.classList.contains('new')) {
                        markNotificationAsRead(notificationId);
                    }
                    
                    // Показуємо деталі повідомлення
                    showNotification(`<i class="fas fa-info-circle"></i> Notificación: ${notification}`, 'info');
                }
            });
        });
        
        // Дії з окремими повідомленнями
        notificationActions.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Запобігаємо спливання події
                
                const notificationItem = this.closest('.notification-item');
                const notificationId = notificationItem.getAttribute('data-id');
                
                if (this.querySelector('.fa-check')) {
                    // Маркуємо як прочитане
                    markNotificationAsRead(notificationId);
                } else if (this.querySelector('.fa-trash')) {
                    // Видаляємо
                    if (confirm('¿Eliminar esta notificación?')) {
                        deleteNotification(notificationId);
                    }
                }
            });
        });
    }
    
    // ===========================================
    // ГОЛОВНА ІНІЦІАЛІЗАЦІЯ
    // ===========================================
    function init() {
        // Перевіряємо, чи є на сторінці попап повідомлень
        if (document.getElementById('notifications-popup')) {
            console.log('Ініціалізація повідомлень...');
            initNotifications();
            initEventListeners();
            console.log('Повідомлення успішно ініціалізовані!');
        }
    }
    
    // Запускаємо ініціалізацію
    init();
});