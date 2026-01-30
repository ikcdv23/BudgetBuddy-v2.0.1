// tarjetas.js - Оновлена версія

document.addEventListener('DOMContentLoaded', function() {
    // Навігація між картками (як у panel general)
    const prevBtn = document.querySelector('.prev-card-btn');
    const nextBtn = document.querySelector('.next-card-btn');
    const cardCounter = document.querySelector('.card-counter');
    const cards = document.querySelectorAll('.credit-card-compact');
    const cardsTitle = document.getElementById('cards-title');
    
    let currentCardIndex = 0;
    const totalCards = cards.length;
    
    function updateCardNavigation() {
        cards.forEach(card => {
            card.classList.remove('active');
            card.style.display = 'none';
        });
        
        cards[currentCardIndex].classList.add('active');
        cards[currentCardIndex].style.display = 'block';
        
        cardCounter.textContent = `${currentCardIndex + 1}/${totalCards}`;
        
        if (cardsTitle) {
            cardsTitle.textContent = `Tarjeta ${currentCardIndex + 1}`;
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
    
    // Фільтрація транзакцій
    const filterButtons = document.querySelectorAll('.filter-btn');
    const transactionRows = document.querySelectorAll('.transaction-row');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Видаляємо активний клас з усіх кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Додаємо активний клас до натиснутої кнопки
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Фільтруємо транзакції
            transactionRows.forEach(row => {
                const type = row.getAttribute('data-type');
                const month = row.getAttribute('data-month');
                
                let showRow = false;
                
                switch(filter) {
                    case 'all':
                        showRow = true;
                        break;
                    case 'income':
                        showRow = type === 'income';
                        break;
                    case 'payment':
                        showRow = type === 'payment';
                        break;
                    case 'month':
                        showRow = month === 'may';
                        break;
                }
                
                if (showRow) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
    
    // Перемикання періоду діаграми
    const periodButtons = document.querySelectorAll('.period-btn');
    const chartTotal = document.querySelector('.chart-total');
    const legendAmounts = document.querySelectorAll('.legend-amount');
    
    if (periodButtons.length > 0) {
        periodButtons.forEach(button => {
            button.addEventListener('click', function() {
                periodButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const period = this.getAttribute('data-period');
                
                if (period === 'week') {
                    // Дані за тиждень
                    if (chartTotal) chartTotal.textContent = '480€';
                    if (legendAmounts.length >= 5) {
                        legendAmounts[0].textContent = '168€';
                        legendAmounts[1].textContent = '120€';
                        legendAmounts[2].textContent = '96€';
                        legendAmounts[3].textContent = '72€';
                        legendAmounts[4].textContent = '24€';
                    }
                } else {
                    // Дані за місяць
                    if (chartTotal) chartTotal.textContent = '1.240€';
                    if (legendAmounts.length >= 5) {
                        legendAmounts[0].textContent = '434€';
                        legendAmounts[1].textContent = '310€';
                        legendAmounts[2].textContent = '248€';
                        legendAmounts[3].textContent = '186€';
                        legendAmounts[4].textContent = '62€';
                    }
                }
            });
        });
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

    // Адаптація для мобільних пристроїв
    function adaptForMobile() {
        const isMobile = window.innerWidth <= 992;
        
        if (isMobile) {
            // На мобільних пристроях робимо таблицю більш читабельною
            const tableHeaders = document.querySelectorAll('.transactions-table th');
            const tableCells = document.querySelectorAll('.transactions-table td');
            
            // Зменшуємо розмір тексту на мобільних
            tableHeaders.forEach(th => {
                th.style.fontSize = '10px';
                th.style.padding = '8px 5px';
            });
            
            tableCells.forEach(td => {
                td.style.fontSize = '11px';
                td.style.padding = '10px 5px';
            });
            
            // Додаємо прокрутку для фільтрів, якщо вони не поміщаються
            const filtersContainer = document.querySelector('.transactions-filters');
            if (filtersContainer && filtersContainer.scrollWidth > filtersContainer.clientWidth) {
                filtersContainer.style.overflowX = 'auto';
            }
        }
    }

    // Викликаємо при завантаженні та при зміні розміру вікна
    window.addEventListener('load', adaptForMobile);
    window.addEventListener('resize', adaptForMobile);
    
    updateDate();
});