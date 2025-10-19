// Управление навигацией по разделам
const navigationManager = {
    // Текущий активный раздел
    currentSection: 'about',
    
    // Все разделы
    sections: {
        about: 'aboutSection',
        goals: 'goalsSection', 
        library: 'librarySection',
        reading: 'readingSection'
    },
    
    // Инициализация
    init: function() {
        this.setupEventListeners();
        this.showSection('about'); // Показываем "О проекте" по умолчанию
        console.log('🧭 NavigationManager инициализирован');
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Обработчики для навигационных ссылок
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            utils.on(link, 'click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                
                if (href.startsWith('#')) {
                    const sectionName = href.substring(1);
                    this.navigateToSection(sectionName);
                }
            });
        });
        
        // Плавная прокрутка при клике на якорные ссылки
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            utils.on(link, 'click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const targetId = href.substring(1);
                this.scrollToSection(targetId);
            });
        });
        
        // Обработка кнопок "Читать" в разделах
        const readingButtons = document.querySelectorAll('.start-reading-btn');
        readingButtons.forEach(btn => {
            utils.on(btn, 'click', () => {
                this.navigateToSection('library');
            });
        });
    },
    
    // Навигация к разделу
    navigateToSection: function(sectionName) {
        console.log(`🧭 Переход к разделу: ${sectionName}`);
        
        // Специальная обработка для библиотеки и чтения
        if (sectionName === 'library') {
            if (typeof libraryManager !== 'undefined') {
                libraryManager.showLibrary();
            }
            this.updateActiveNavigation('library');
            return;
        }
        
        if (sectionName === 'reading') {
            // Если есть текущая книга, показываем читалку
            if (readerManager.currentBook) {
                readerManager.showReaderUI();
            } else {
                // Иначе переходим к библиотеке
                this.navigateToSection('library');
                authManager.showNotification('Сначала выберите книгу для чтения', 'info');
            }
            return;
        }
        
        // Обычные разделы
        this.showSection(sectionName);
        this.scrollToSection(sectionName);
        this.updateActiveNavigation(sectionName);
    },
    
    // Показать раздел
    showSection: function(sectionName) {
        // Скрываем все разделы
        Object.values(this.sections).forEach(sectionId => {
            const section = utils.get(sectionId);
            if (section) {
                section.style.display = 'none';
            }
        });
        
        // Показываем нужный раздел
        const targetSectionId = this.sections[sectionName];
        if (targetSectionId) {
            const targetSection = utils.get(targetSectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
                this.currentSection = sectionName;
            }
        }
    },
    
    // Плавная прокрутка к разделу
    scrollToSection: function(sectionName) {
        const targetSectionId = this.sections[sectionName] || sectionName + 'Section';
        const targetElement = utils.get(targetSectionId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },
    
    // Обновить активную навигацию
    updateActiveNavigation: function(sectionName) {
        // Убираем активный класс со всех ссылок
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Добавляем активный класс нужной ссылке
        const activeLinks = document.querySelectorAll(`a[href="#${sectionName}"]`);
        activeLinks.forEach(link => {
            link.classList.add('active');
        });
    },
    
    // Получить текущий раздел
    getCurrentSection: function() {
        return this.currentSection;
    },
    
    // Показать главную страницу (о проекте)
    showHomePage: function() {
        this.navigateToSection('about');
    }
};

// Инициализация вызывается из app.js