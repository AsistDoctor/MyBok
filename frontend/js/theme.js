// Управление темами приложения
const themeManager = {
    // Ключ для localStorage
    storageKey: 'reader-theme',
    
    // Доступные темы
    themes: {
        light: 'light',
        dark: 'dark'
    },
    
    // Инициализация темы
    init: function() {
        const savedTheme = utils.loadFromStorage(this.storageKey) || this.themes.light;
        this.setTheme(savedTheme);
        
        // Обработчик переключения темы
        utils.on(utils.get('themeToggle'), 'click', () => {
            this.toggleTheme();
        });
        
        // Обработчик ночного режима в настройках
        utils.on(utils.get('nightMode'), 'change', (e) => {
            this.setTheme(e.target.checked ? this.themes.dark : this.themes.light);
        });
    },
    
    // Установить тему
    setTheme: function(theme) {
        const body = document.body;
        const themeIcon = utils.get('themeIcon');
        const nightModeCheckbox = utils.get('nightMode');
        
        if (theme === this.themes.dark) {
            body.classList.add('dark-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
            if (nightModeCheckbox) nightModeCheckbox.checked = true;
        } else {
            body.classList.remove('dark-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (nightModeCheckbox) nightModeCheckbox.checked = false;
        }
        
        // Сохранить выбор
        utils.saveToStorage(this.storageKey, theme);
        
        // Обновить текст кнопки
        const themeToggle = utils.get('themeToggle');
        if (themeToggle) {
            themeToggle.title = theme === this.themes.dark ? 'Светлая тема' : 'Тёмная тема';
        }
    },
    
    // Переключить тему
    toggleTheme: function() {
        const currentTheme = document.body.classList.contains('dark-theme') 
            ? this.themes.dark 
            : this.themes.light;
        
        const newTheme = currentTheme === this.themes.dark 
            ? this.themes.light 
            : this.themes.dark;
        
        this.setTheme(newTheme);
    },
    
    // Получить текущую тему
    getCurrentTheme: function() {
        return document.body.classList.contains('dark-theme') 
            ? this.themes.dark 
            : this.themes.light;
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
});