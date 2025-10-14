// Управление процессом чтения
const readerManager = {
    // Текущая книга и прогресс
    currentBook: null,
    readingProgress: 0,
    
    // Настройки чтения
    settings: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        textAlign: 'justify',
        marginSize: '20px'
    },
    
    // Инициализация
    init: function() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
        this.loadBook();
    },
    
    // Загрузить настройки из localStorage
    loadSettings: function() {
        const savedSettings = utils.loadFromStorage('reader-settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    },
    
    // Сохранить настройки в localStorage
    saveSettings: function() {
        utils.saveToStorage('reader-settings', this.settings);
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Управление шрифтом
        utils.on(utils.get('fontDecrease'), 'click', () => this.changeFontSize(-1));
        utils.on(utils.get('fontIncrease'), 'click', () => this.changeFontSize(1));
        
        // Навигация по главам
        utils.on(utils.get('prevChapter'), 'click', () => this.navigateChapter(-1));
        utils.on(utils.get('nextChapter'), 'click', () => this.navigateChapter(1));
        utils.on(utils.get('continueReadingBtn'), 'click', () => this.continueReading());
        
        // Закладки и сохранение
        utils.on(utils.get('bookmarkBtn'), 'click', () => this.toggleBookmark());
        utils.on(utils.get('saveProgressBtn'), 'click', () => this.saveProgress());
        
        // Настройки чтения
        utils.on(utils.get('fontFamily'), 'change', (e) => this.updateSetting('fontFamily', e.target.value));
        utils.on(utils.get('lineHeight'), 'change', (e) => this.updateSetting('lineHeight', parseFloat(e.target.value)));
        utils.on(utils.get('textAlign'), 'change', (e) => this.updateSetting('textAlign', e.target.value));
        utils.on(utils.get('marginSize'), 'change', (e) => this.updateSetting('marginSize', e.target.value));
        
        // Открытие/закрытие панели настроек
        utils.on(utils.get('settingsToggle'), 'click', () => this.toggleSettingsPanel());
        utils.on(utils.get('closeSettings'), 'click', () => this.closeSettingsPanel());
        
        // Сохранение прогресса при прокрутке
        window.addEventListener('scroll', utils.debounce(() => {
            this.updateProgressFromScroll();
        }, 500));
    },
    
    // Загрузить книгу (заглушка)
    loadBook: function() {
        // В реальном приложении здесь будет загрузка книги с сервера
        this.currentBook = {
            id: 1,
            title: 'Преступление и наказание',
            author: 'Фёдор Достоевский',
            year: 1866,
            genre: 'Роман',
            chapters: [
                {
                    title: 'Часть первая, I',
                    content: `В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке, на улицу и медленно, как бы в нерешимости, отправился к К-ну мосту.
                    
                    Он благополучно избегнул встречи с своею хозяйкой на лестнице. Каморка его приходилась под самою кровлей высокого пятиэтажного дома и походила более на шкаф, чем на квартиру. Квартирная же хозяйка его, у которой он нанимал эту каморку с обедом и прислугой, помещалась одною лестницей ниже, в отдельной квартире, и каждый раз, при выходе на улицу, ему непременно надо было проходить мимо хозяйкиной кухни, почти всегда настежь отворенной на лестницу. И каждый раз молодой человек, проходя мимо, чувствовал какое-то болезненное и трусливое ощущение, которого стыдился и от которого морщился. Он был должен кругом хозяйке и боялся с нею встретиться.`
                }
                // Другие главы...
            ],
            currentChapter: 0
        };
        
        this.displayBook();
    },
    
    // Отобразить книгу
    displayBook: function() {
        if (!this.currentBook) return;
        
        // Обновить информацию о книге
        utils.get('bookTitle').textContent = this.currentBook.title;
        utils.get('bookAuthor').textContent = this.currentBook.author;
        utils.get('bookYear').textContent = this.currentBook.year;
        utils.get('bookGenre').textContent = this.currentBook.genre;
        
        // Отобразить текущую главу
        this.displayCurrentChapter();
    },
    
    // Отобразить текущую главу
    displayCurrentChapter: function() {
        if (!this.currentBook || !this.currentBook.chapters) return;
        
        const chapter = this.currentBook.chapters[this.currentBook.currentChapter];
        if (!chapter) return;
        
        utils.get('chapterTitle').textContent = chapter.title;
        utils.get('textContent').innerHTML = chapter.content.split('\n').map(paragraph => 
            paragraph.trim() ? `<p>${paragraph}</p>` : ''
        ).join('');
        
        // Обновить информацию о главе
        utils.get('chapterInfo').textContent = 
            `Глава ${this.currentBook.currentChapter + 1} из ${this.currentBook.chapters.length}`;
        
        // Обновить прогресс
        this.updateProgress();
    },
    
    // Навигация по главам
    navigateChapter: function(direction) {
        if (!this.currentBook) return;
        
        const newChapter = this.currentBook.currentChapter + direction;
        if (newChapter >= 0 && newChapter < this.currentBook.chapters.length) {
            this.currentBook.currentChapter = newChapter;
            this.displayCurrentChapter();
            this.saveProgress();
        }
    },
    
    // Продолжить чтение
    continueReading: function() {
        // В реальном приложении здесь будет переход к последней позиции
        this.navigateChapter(1);
    },
    
    // Изменить размер шрифта
    changeFontSize: function(change) {
        this.settings.fontSize = Math.max(12, Math.min(24, this.settings.fontSize + change));
        this.applySettings();
        this.saveSettings();
    },
    
    // Обновить настройку
    updateSetting: function(setting, value) {
        this.settings[setting] = value;
        this.applySettings();
        this.saveSettings();
    },
    
    // Применить настройки к тексту
    applySettings: function() {
        const textContent = utils.get('textContent');
        if (!textContent) return;
        
        textContent.style.fontSize = `${this.settings.fontSize}px`;
        textContent.style.fontFamily = this.settings.fontFamily;
        textContent.style.lineHeight = this.settings.lineHeight;
        textContent.style.textAlign = this.settings.textAlign;
        textContent.style.margin = this.settings.marginSize;
        
        // Обновить значения в панели настроек
        utils.get('fontFamily').value = this.settings.fontFamily;
        utils.get('lineHeight').value = this.settings.lineHeight;
        utils.get('textAlign').value = this.settings.textAlign;
        utils.get('marginSize').value = this.settings.marginSize;
    },
    
    // Переключить закладку
    toggleBookmark: function() {
        if (!this.currentBook) return;
        
        const bookmarkBtn = utils.get('bookmarkBtn');
        const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
        
        if (isBookmarked) {
            bookmarkBtn.classList.remove('bookmarked');
            bookmarkBtn.title = 'Добавить закладку';
            // Удалить закладку
        } else {
            bookmarkBtn.classList.add('bookmarked');
            bookmarkBtn.title = 'Удалить закладку';
            // Добавить закладку
        }
        
        authManager.showNotification(
            isBookmarked ? 'Закладка удалена' : 'Закладка добавлена',
            'success'
        );
    },
    
    // Сохранить прогресс
    saveProgress: function() {
        if (!this.currentBook) return;
        
        const progress = {
            bookId: this.currentBook.id,
            chapter: this.currentBook.currentChapter,
            progress: this.readingProgress,
            timestamp: new Date().toISOString()
        };
        
        utils.saveToStorage(`progress-${this.currentBook.id}`, progress);
        authManager.showNotification('Прогресс сохранен', 'success');
    },
    
    // Обновить прогресс на основе прокрутки
    updateProgressFromScroll: function() {
        const textContent = utils.get('textContent');
        if (!textContent) return;
            
        const rect = textContent.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top <= windowHeight && rect.bottom >= 0) {
            console.log('Видно')
            const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
            this.readingProgress = visibleHeight / rect.height;
            this.updateProgress();
        } else {
            console.log('Не видно')
        }
    },
    
    // Обновить отображение прогресса
    updateProgress: function() {
        const progressFill = utils.get('progressFill');
        const progressText = utils.get('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${this.readingProgress * 100}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Прочитано ${utils.formatPercent(this.readingProgress)}`;
        }
    },
    
    // Переключить панель настроек
    toggleSettingsPanel: function() {
        const settingsPanel = utils.get('settingsPanel');
        settingsPanel.classList.toggle('active');
    },
    
    // Закрыть панель настроек
    closeSettingsPanel: function() {
        const settingsPanel = utils.get('settingsPanel');
        settingsPanel.classList.remove('active');
    }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    readerManager.init();
});