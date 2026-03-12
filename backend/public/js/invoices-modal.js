// invoices-modal.js - Script para el modal de facturas

document.addEventListener('DOMContentLoaded', function() {
    const viewAllBtn = document.getElementById('viewAllInvoices');
    const invoicesModal = document.getElementById('invoicesModal');
    const closeModalBtn = document.getElementById('closeModal');
    
    if (viewAllBtn && invoicesModal && closeModalBtn) {
        // Abrir modal al hacer clic en "Ver todas"
        viewAllBtn.addEventListener('click', function() {
            invoicesModal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloquear scroll de la página
        });
        
        // Cerrar modal al hacer clic en la X
        closeModalBtn.addEventListener('click', function() {
            invoicesModal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll de la página
        });
        
        // Cerrar modal al hacer clic en el fondo oscuro
        invoicesModal.addEventListener('click', function(event) {
            if (event.target === invoicesModal) {
                invoicesModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Cerrar modal al presionar la tecla ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && invoicesModal.classList.contains('active')) {
                invoicesModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Función para verificar scroll en facturas
    function checkInvoicesScroll() {
        const invoicesList = document.querySelector('.invoices-list');
        if (!invoicesList) return;
        
        const invoiceItems = invoicesList.querySelectorAll('.invoice-item');
        
        // Si hay más de 5 facturas, añadir scroll
        if (invoiceItems.length > 5) {
            invoicesList.classList.add('has-scroll');
        } else {
            invoicesList.classList.remove('has-scroll');
        }
    }
    
    // Verificar al cargar
    checkInvoicesScroll();
    
    // También verificar al cambiar el tamaño de la ventana
    window.addEventListener('resize', checkInvoicesScroll);
});