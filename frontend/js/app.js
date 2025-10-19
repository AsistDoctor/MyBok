// Основной файл приложения
const app = {
    // Инициализация приложения
    init: function() {
        console.log('Инициализация приложения Читалка...');
        
        // Инициализация менеджеров
        themeManager.init();
        authManager.init();
        readerManager.init();
        bookManager.init();
        libraryManager.init();
        navigationManager.init();
        
        // Настройка глобальных обработчиков
        this.setupGlobalEventListeners();
        
        // Показать приветственное сообщение
        this.showWelcomeMessage();
        
        console.log('Приложение успешно инициализировано');
    },
    
    // Настройка глобальных обработчиков событий
    setupGlobalEventListeners: function() {
        // Закрытие выпадающих меню при клике вне их
        document.addEventListener('click', (e) => {
            // Закрыть меню пользователя
            const userMenu = utils.get('userMenu');
            const userToggle = utils.get('userToggle');
            
            if (userMenu && userToggle && 
                !userMenu.contains(e.target) && 
                !userToggle.contains(e.target)) {
                userMenu.classList.remove('active');
            }
            
            // Закрыть мобильное меню при клике на ссылку
            if (window.innerWidth <= 768) {
                if (e.target.classList.contains('mobile-nav-link')) {
                    console.log('📱 Клик по ссылке в мобильном меню');
                    this.toggleMobileMenu();
                }
            }
        });
        
        // Обработка мобильного меню
        utils.on(utils.get('mobileMenuToggle'), 'click', () => this.toggleMobileMenu());
        
        // Пасхальная кнопка
        utils.on(utils.get('easterEggBtn'), 'click', () => this.showDevelopersModal());
        
        // Обработка изменения размера окна
        window.addEventListener('resize', utils.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    },
    
    // Переключение мобильного меню
    toggleMobileMenu: function() {
        const mobileMenu = utils.get('mobileMenu');
        const menuToggle = utils.get('mobileMenuToggle');
        
        if (!mobileMenu || !menuToggle) {
            console.error('Мобильное меню не найдено');
            return;
        }
        
        const isActive = mobileMenu.classList.contains('active');
        
        if (isActive) {
            // Закрываем меню
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.innerHTML = '<span></span><span></span><span></span>';
            console.log('📱 Мобильное меню закрыто');
        } else {
            // Открываем меню
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('active');
            menuToggle.classList.add('active');
            menuToggle.innerHTML = '✕';
            console.log('📱 Мобильное меню открыто');
        }
    },
    
    // Обработка изменения размера окна
    handleResize: function() {
        // Закрыть мобильное меню при увеличении окна
        if (window.innerWidth > 768) {
            const mobileMenu = utils.get('mobileMenu');
            const menuToggle = utils.get('mobileMenuToggle');
            
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.innerHTML = '<span></span><span></span><span></span>';
        }
    },
    
    // Обработка нажатий клавиш
    handleKeydown: function(e) {
        // Esc - закрыть модальные окна и меню
        if (e.key === 'Escape') {
            authManager.closeAllModals();
            readerManager.closeSettingsPanel();
            this.closeDevelopersModal();
            
            const userMenu = utils.get('userMenu');
            if (userMenu) userMenu.classList.remove('active');
        }
        
        // Стрелки влево/вправо - навигация по главам
        if (e.key === 'ArrowLeft') {
            readerManager.navigateChapter(-1);
        } else if (e.key === 'ArrowRight') {
            readerManager.navigateChapter(1);
        }
        
        // Ctrl + +/- - изменение размера шрифта
        if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
            e.preventDefault();
            readerManager.changeFontSize(1);
        } else if (e.ctrlKey && e.key === '-') {
            e.preventDefault();
            readerManager.changeFontSize(-1);
        }
        
        // Ctrl + D - переключение темы
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            themeManager.toggleTheme();
        }
    },
    
    // Показать приветственное сообщение
    showWelcomeMessage: function() {
        // Показываем только при первом посещении
        const hasVisited = utils.loadFromStorage('has-visited');
        
        if (!hasVisited) {
            setTimeout(() => {
                authManager.showNotification(
                    'Добро пожаловать в Читалку! Начните читать вашу первую книгу.',
                    'success'
                );
                utils.saveToStorage('has-visited', true);
            }, 1000);
        }
    },
    
    // Показать модальное окно разработчиков
    showDevelopersModal: function() {
        const modal = utils.get('developersModal');
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
        
        // Добавляем обработчик закрытия (если еще не добавлен)
        const closeBtn = utils.get('closeDevelopersModal');
        if (closeBtn && !closeBtn.hasAttribute('data-listener-added')) {
            utils.on(closeBtn, 'click', () => this.closeDevelopersModal());
            closeBtn.setAttribute('data-listener-added', 'true');
        }
        
        // Закрытие по клику вне модального окна
        utils.on(modal, 'click', (e) => {
            if (e.target === modal) {
                this.closeDevelopersModal();
            }
        });
    },
    
    // Закрыть модальное окно разработчиков
    closeDevelopersModal: function() {
        const modal = utils.get('developersModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    },
    
    // Утилита для отладки
    debug: function() {
        console.log('=== ДЕБАГ ИНФОРМАЦИЯ ===');
        console.log('Тема:', themeManager.getCurrentTheme());
        console.log('Пользователь:', authManager.currentUser);
        console.log('Текущая книга:', readerManager.currentBook);
        console.log('Настройки:', readerManager.settings);
    }
};

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Экспорт для глобального доступа (если нужно)
window.app = app;