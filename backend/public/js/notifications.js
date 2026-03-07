// notifications.js - Sistema de notificaciones (popup campana)
// showNotification() se define en app-base.js (accesible globalmente)

(function() {
    // ===========================================
    // VARIABLES
    // ===========================================
    var notificationsPopup, notificationsBtn, closeNotificationsBtn, notificationsOverlay;
    var markAllReadBtn, clearAllBtn, notificationItems, notificationActions;

    // ===========================================
    // INICIALIZACIÓN
    // ===========================================
    function initNotifications() {
        notificationsPopup = document.getElementById('notifications-popup');
        notificationsBtn = document.querySelector('.notification-btn') || document.querySelector('.top-icon.notification-btn');
        closeNotificationsBtn = document.getElementById('close-notifications');

        if (!document.querySelector('.notifications-overlay')) {
            notificationsOverlay = document.createElement('div');
            notificationsOverlay.className = 'notifications-overlay';
            document.body.appendChild(notificationsOverlay);
        } else {
            notificationsOverlay = document.querySelector('.notifications-overlay');
        }

        markAllReadBtn = document.getElementById('mark-all-read');
        clearAllBtn = document.getElementById('clear-all');

        updateNotificationBadge();

        var newNotifications = document.querySelectorAll('.notification-item.new');
        if (newNotifications.length > 0 && notificationsBtn) {
            notificationsBtn.classList.add('shake');
            setTimeout(function() {
                notificationsBtn.classList.remove('shake');
            }, 2000);
        }
    }

    // ===========================================
    // FUNCIONES PRINCIPALES
    // ===========================================
    function toggleNotifications() {
        if (notificationsPopup && notificationsOverlay) {
            if (notificationsPopup.classList.contains('show')) {
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

            var newNotifications = document.querySelectorAll('.notification-item.new');
            newNotifications.forEach(function(notification) {
                notification.classList.remove('new');
                notification.querySelector('.notification-action i').className = 'fas fa-trash';
                notification.querySelector('.notification-action').title = 'Eliminar';
            });

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
        var notificationBadge = document.querySelector('.notification-badge');
        var newCount = document.querySelectorAll('.notification-item.new').length;

        if (notificationBadge) {
            if (newCount > 0) {
                notificationBadge.textContent = newCount > 9 ? '9+' : newCount.toString();
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }

    function markNotificationAsRead(notificationId) {
        var notification = document.querySelector('#notifications-popup .notification-item[data-id="' + notificationId + '"]');
        if (notification) {
            notification.classList.remove('new');
            notification.querySelector('.notification-action i').className = 'fas fa-trash';
            notification.querySelector('.notification-action').title = 'Eliminar';

            var notificationTitle = notification.querySelector('h4').textContent;
            showNotification('Notificación marcada como leída: ' + notificationTitle, 'success');

            updateNotificationBadge();

            var remaining = document.querySelectorAll('.notification-item.new').length;
            if (remaining === 0) {
                showEmptyNotificationsState();
            }
        }
    }

    function deleteNotification(notificationId) {
        var notification = document.querySelector('#notifications-popup .notification-item[data-id="' + notificationId + '"]');
        if (notification) {
            var notificationTitle = notification.querySelector('h4').textContent;
            notification.style.animation = 'slideOut 0.3s ease';

            setTimeout(function() {
                notification.remove();
                showNotification('Notificación eliminada: ' + notificationTitle, 'info');

                updateNotificationBadge();

                var remaining = document.querySelectorAll('.notification-item').length;
                if (remaining === 0) {
                    showEmptyNotificationsState();
                }
            }, 300);
        }
    }

    function showEmptyNotificationsState() {
        var el = document.getElementById('notifications-empty');
        if (el) el.style.display = 'block';
    }

    function hideEmptyNotificationsState() {
        var el = document.getElementById('notifications-empty');
        if (el) el.style.display = 'none';
    }

    // ===========================================
    // EVENT LISTENERS
    // ===========================================
    function initEventListeners() {
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', toggleNotifications);
        }

        if (closeNotificationsBtn) {
            closeNotificationsBtn.addEventListener('click', closeNotifications);
        }

        if (notificationsOverlay) {
            notificationsOverlay.addEventListener('click', closeNotifications);
        }

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeNotifications();
            }
        });

        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                var allNotifications = document.querySelectorAll('#notifications-popup .notification-item');

                allNotifications.forEach(function(notification) {
                    notification.classList.remove('new');
                    notification.querySelector('.notification-action i').className = 'fas fa-trash';
                    notification.querySelector('.notification-action').title = 'Eliminar';
                });

                showNotification('Todas las notificaciones marcadas como leídas', 'success');
                updateNotificationBadge();
                showEmptyNotificationsState();
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
                    var allNotifications = document.querySelectorAll('#notifications-popup .notification-item');

                    allNotifications.forEach(function(notification) {
                        notification.style.animation = 'slideOut 0.3s ease';
                        setTimeout(function() { notification.remove(); }, 300);
                    });

                    setTimeout(function() {
                        showNotification('Todas las notificaciones eliminadas', 'info');
                        updateNotificationBadge();
                        showEmptyNotificationsState();
                    }, 400);
                }
            });
        }

        notificationItems = document.querySelectorAll('.notification-item');
        notificationActions = document.querySelectorAll('.notification-action');

        notificationItems.forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (!e.target.closest('.notification-action')) {
                    var notificationId = this.getAttribute('data-id');
                    var title = this.querySelector('h4').textContent;

                    if (this.classList.contains('new')) {
                        markNotificationAsRead(notificationId);
                    }

                    showNotification('Notificación: ' + title, 'info');
                }
            });
        });

        notificationActions.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.stopPropagation();

                var notificationItem = this.closest('.notification-item');
                var notificationId = notificationItem.getAttribute('data-id');

                if (this.querySelector('.fa-check')) {
                    markNotificationAsRead(notificationId);
                } else if (this.querySelector('.fa-trash')) {
                    if (confirm('¿Eliminar esta notificación?')) {
                        deleteNotification(notificationId);
                    }
                }
            });
        });
    }

    // ===========================================
    // INIT
    // ===========================================
    if (document.getElementById('notifications-popup')) {
        initNotifications();
        initEventListeners();
    }
})();
