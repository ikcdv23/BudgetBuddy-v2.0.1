// invoices-modal.js - Скрипт для модального вікна фактур

document.addEventListener('DOMContentLoaded', function() {
    const viewAllBtn = document.getElementById('viewAllInvoices');
    const invoicesModal = document.getElementById('invoicesModal');
    const closeModalBtn = document.getElementById('closeModal');
    
    if (viewAllBtn && invoicesModal && closeModalBtn) {
        // Відкрити модальне вікно при кліку на "Ver todas"
        viewAllBtn.addEventListener('click', function() {
            invoicesModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Заборонити скрол сторінки
        });
        
        // Закрити модальне вікно при кліку на хрестик
        closeModalBtn.addEventListener('click', function() {
            invoicesModal.classList.remove('active');
            document.body.style.overflow = ''; // Дозволити скрол сторінки
        });
        
        // Закрити модальне вікно при кліку на затемнену область
        invoicesModal.addEventListener('click', function(event) {
            if (event.target === invoicesModal) {
                invoicesModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Закрити модальне вікно при натисканні клавіші ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && invoicesModal.classList.contains('active')) {
                invoicesModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Функція для перевірки скрола в фактурах
    function checkInvoicesScroll() {
        const invoicesList = document.querySelector('.invoices-list');
        if (!invoicesList) return;
        
        const invoiceItems = invoicesList.querySelectorAll('.invoice-item');
        
        // Якщо фактур більше 5 - додаємо скрол
        if (invoiceItems.length > 5) {
            invoicesList.classList.add('has-scroll');
        } else {
            invoicesList.classList.remove('has-scroll');
        }
    }
    
    // Перевіряємо при завантаженні
    checkInvoicesScroll();
    
    // Також перевіряємо при зміні розміру вікна
    window.addEventListener('resize', checkInvoicesScroll);
});