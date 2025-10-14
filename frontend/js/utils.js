// Утилиты для работы с DOM
const utils = {
    // Получить элемент по ID
    get: (id) => document.getElementById(id),
    
    // Создать элемент с атрибутами
    create: (tag, attributes = {}, text = '') => {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach(key => {
            element.setAttribute(key, attributes[key]);
        });
        if (text) element.textContent = text;
        return element;
    },
    
    // Показать элемент
    show: (element) => {
        if (element) element.classList.remove('hidden');
    },
    
    // Скрыть элемент
    hide: (element) => {
        if (element) element.classList.add('hidden');
    },
    
    // Переключить видимость элемента
    toggle: (element) => {
        if (element) element.classList.toggle('hidden');
    },
    
    // Добавить обработчик события
    on: (element, event, handler) => {
        if (element) element.addEventListener(event, handler);
    },
    
    // Удалить обработчик события
    off: (element, event, handler) => {
        if (element) element.removeEventListener(event, handler);
    },
    
    // Сохранить данные в localStorage
    saveToStorage: (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
            return false;
        }
    },
    
    // Загрузить данные из localStorage
    loadFromStorage: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Ошибка загрузки из localStorage:', e);
            return null;
        }
    },
    
    // Форматирование процентов
    formatPercent: (value) => {
        return `${Math.round(value * 100)}%`;
    },
    
    // Форматирование времени чтения
    formatReadingTime: (minutes) => {
        if (minutes < 60) {
            return `${minutes} мин`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours} ч ${mins} мин` : `${hours} ч`;
        }
    },
    
    // Дебаунс для оптимизации
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}