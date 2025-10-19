// Управление процессом чтения
const readerManager = {
    // Текущая книга и прогресс
    currentBook: null,
    readingProgress: 0,
    // currentChapterIndex: 0,
    
    // Настройки чтения
    settings: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.6,
        textAlign: 'justify',
        marginSize: '20px',
        charsPerPage: 2000,    // Среднее для А4
        currentPage: 0,
        totalPages: 0
    },
    
    // Инициализация
    init: function() {
        this.loadSettings();
        this.setupEventListeners();
        this.applySettings();
        console.log('📖 ReaderManager готов к работе');
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
        
        // Навигация по страницам
        const prevBtn = utils.get('prevChapter');
        const nextBtn = utils.get('nextChapter');
        
        if (prevBtn && !prevBtn.hasAttribute('data-listener-added')) {
            utils.on(prevBtn, 'click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('🔼 Кнопка "Назад" нажата');
                this.navigateChapter(-1);
            });
            prevBtn.setAttribute('data-listener-added', 'true');
        }

        if (nextBtn && !nextBtn.hasAttribute('data-listener-added')) {
            utils.on(nextBtn, 'click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                console.log('🔽 Кнопка "Вперед" нажата');
                this.navigateChapter(1);
            });
            nextBtn.setAttribute('data-listener-added', 'true');
        }
        
        // Закладки и сохранение
        utils.on(utils.get('bookmarkBtn'), 'click', () => this.toggleBookmark());
        utils.on(utils.get('saveProgressBtn'), 'click', () => this.saveProgress());
        utils.on(utils.get('backToLibraryBtn'), 'click', () => this.backToLibrary());
        
        // Настройки чтения
        utils.on(utils.get('fontFamily'), 'change', (e) => this.updateSetting('fontFamily', e.target.value));
        utils.on(utils.get('lineHeight'), 'change', (e) => this.updateSetting('lineHeight', parseFloat(e.target.value)));
        utils.on(utils.get('textAlign'), 'change', (e) => this.updateSetting('textAlign', e.target.value));
        utils.on(utils.get('marginSize'), 'change', (e) => this.updateSetting('marginSize', e.target.value));
        
        // Открытие/закрытие панели настроек
        utils.on(utils.get('settingsToggle'), 'click', () => this.toggleSettingsPanel());
        utils.on(utils.get('closeSettings'), 'click', () => this.closeSettingsPanel());
    },
    
loadBook: async function(bookId) {
    try {
        console.log(`📖 Загружаем книгу ID: ${bookId}`);
        const bookData = await bookManager.loadBookContent(bookId);
        
        if (bookData) {
            this.currentBook = bookData;
            // Разбиваем на страницы
            this.currentBook.pages = this.splitIntoPages(bookData.content);
            this.settings.currentPage = 0;
            
            this.displayBook();
            this.applySettings();
            this.showReaderUI();
            
            console.log(`✅ Загружена книга: "${bookData.title}" (${this.currentBook.pages.length} страниц)`);
            authManager.showNotification(`Загружена книга: ${bookData.title}`, 'success');
        }
    } catch (error) {
        console.error('❌ Ошибка загрузки книги:', error);
        authManager.showNotification('Ошибка загрузки книги', 'error');
    }
},
    
    showReaderUI: function() {
        const librarySection = document.getElementById('librarySection');
        const readerSection = document.getElementById('readerSection');
        
        if (librarySection) librarySection.style.display = 'none';
        if (readerSection) readerSection.style.display = 'block';
        
        window.scrollTo(0, 0);
    },

   displayCurrentChapter: function() {
        if (!this.currentBook || !this.currentBook.chapters) return;
        
        const chapter = this.currentBook.chapters[this.currentBook.currentChapter];
        if (!chapter) return;
        
        utils.get('chapterTitle').textContent = chapter.title;
        utils.get('textContent').innerHTML = this.formatChapterContent(chapter.content);
        utils.get('chapterInfo').textContent = 
            `Глава ${this.currentBook.currentChapter + 1} из ${this.currentBook.chapters.length}`;
        
        this.updateProgress();
    },

    // Отобразить текущую страницу и инфо
    displayCurrentPage: function() {

        console.log('🎯 displayCurrentPage вызвана');
        // if (!this.currentBook) {
        //     console.log('❌ Нет currentBook');
        //     return;
        // }
        
        // if (!this.currentBook.pages) {
        //     console.log('❌ Нет pages в currentBook');
        //     return;
        // }
        
        const page = this.currentBook.pages[this.settings.currentPage];
        // if (!page) {
        //     console.log('❌ Страница не найдена:', this.settings.currentPage);
        //     return;
        // }
        console.log('📖 Отображаем страницу:', page.number);
        
        
        // Обновляем интерфейс
        const chapterTitle = utils.get('chapterTitle');
        const textContent = utils.get('textContent');
        const chapterInfo = utils.get('chapterInfo');
        
        if (chapterTitle) {
            chapterTitle.textContent = `Страница ${page.number}`;
        }
        
        if (textContent) {
            textContent.innerHTML = this.formatPageContent(page.content);
        }
        
        if (chapterInfo) {
            chapterInfo.textContent = `Страница ${page.number} из ${this.currentBook.pages.length}`;
        }
        
        // this.updateProgress();
    },

// Форматирование содержимого страницы
formatPageContent: function(content) {
    if (!content) return '<p>Содержание страницы отсутствует</p>';
    
    // Разбиваем на абзацы по пустым строкам
    const paragraphs = content.split(/\n\s*\n/);
    
    return paragraphs.map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return '';
        
        // Очищаем от лишних переносов внутри абзаца
        const cleanText = trimmed.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ');
        
        return `<p>${cleanText}</p>`;
    }).join('');
},
    
  formatChapterContent: function(content) {
    if (!content) return '<p>Содержание главы отсутствует</p>';
    
    // Разбиваем на абзацы по пустым строкам (двойной перенос)
    const paragraphs = content.split(/\n\s*\n/);
    
    return paragraphs.map(paragraph => {
        const trimmed = paragraph.trim();
        if (!trimmed) return '';
        
        // Очищаем paragraph от лишних переносов внутри
        const cleanText = trimmed.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(' ');
        
        // Определяем заголовки
        const isHeading = cleanText.length < 100 && 
                        !cleanText.match(/[a-zа-я]/) && 
                        cleanText.match(/[А-ЯA-Z]/);
        
        if (isHeading) {
            return `<h3 class="chapter-subtitle">${cleanText}</h3>`;
        }
        
        return `<p>${cleanText}</p>`;
    }).join('');
},
//     // Отобразить информацию о книге
// displayBook: function() {
//     if (!this.currentBook) return;
    
//     // Обновить информацию о книге
//     utils.get('bookTitle').textContent = this.currentBook.title;
//     utils.get('bookAuthor').textContent = this.currentBook.author;
    
//     // Если есть дополнительные поля
//     if (utils.get('bookYear')) {
//         utils.get('bookYear').textContent = this.currentBook.year || '';
//     }
//     if (utils.get('bookGenre')) {
//         utils.get('bookGenre').textContent = this.currentBook.genre || '';
//     }
    
//     // Отобразить весь текст книги
//     this.displayBookContent();
// },

    displayBook: function() {
        if (!this.currentBook) return;
        
        // Обновить информацию о книге
        const bookTitle = utils.get('bookTitle');
        const bookAuthor = utils.get('bookAuthor');
        const bookYear = utils.get('bookYear');
        const bookGenre = utils.get('bookGenre');
        
        if (bookTitle) bookTitle.textContent = this.currentBook.title;
        if (bookAuthor) bookAuthor.textContent = this.currentBook.author;
        if (bookYear) bookYear.textContent = this.currentBook.year || '';
        if (bookGenre) bookGenre.textContent = this.currentBook.genre || '';
        
        // Отобразить первую страницу
        this.displayCurrentPage();
    },
    
    // Разбить книгу на страницы
splitIntoPages: function(content) {
    if (!content) return [];
    
    const pages = [];
    const charsPerPage = this.settings.charsPerPage;
    let currentPosition = 0;
    
    while (currentPosition < content.length) {
        // Берем кусок текста для страницы
        let pageEnd = currentPosition + charsPerPage;
        
        // Если не конец книги, ищем удобное место для разрыва
        if (pageEnd < content.length) {
            // Ищем конец абзаца или предложения
            const nextParagraph = content.indexOf('\n\n', currentPosition);
            const nextSentence = content.search(/[.!?]\s+[А-ЯA-Z]/, currentPosition);
            
            if (nextParagraph > currentPosition && nextParagraph < pageEnd + 500) {
                pageEnd = nextParagraph + 2; // +2 для \n\n
            } else if (nextSentence > currentPosition && nextSentence < pageEnd + 200) {
                pageEnd = nextSentence + 2; // +2 для точки и пробела
            } else {
                // Ищем последний пробел в пределах страницы
                const lastSpace = content.lastIndexOf(' ', pageEnd);
                if (lastSpace > currentPosition) {
                    pageEnd = lastSpace;
                }
            }
        } else {
            pageEnd = content.length;
        }
        
        const pageContent = content.substring(currentPosition, pageEnd).trim();
        if (pageContent) {
            pages.push({
                number: pages.length + 1,
                content: pageContent,
                startPos: currentPosition,
                endPos: pageEnd
            });
        }
        
        currentPosition = pageEnd;
    }
    
    this.settings.totalPages = pages.length;
    return pages;
},

    // Форматирование всего текста книги
    formatBookContent: function(content) {
        if (!content) return '<p>Содержание книги отсутствует</p>';
        
        // Разбиваем на абзацы по пустым строкам
        const paragraphs = content.split(/\n\s*\n/);
        
        return paragraphs.map(paragraph => {
            const trimmed = paragraph.trim();
            if (!trimmed) return '';
            
            // Очищаем от лишних переносов внутри абзаца
            const cleanText = trimmed.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join(' ');
            
            return `<p>${cleanText}</p>`;
        }).join('');
    },
    
    // // Навигация по главам
    // navigateChapter: function(direction) {
    //     if (!this.currentBook) return;
        
    //     const newChapter = this.currentBook.currentChapter + direction;
    //     if (newChapter >= 0 && newChapter < this.currentBook.chapters.length) {
    //         this.currentBook.currentChapter = newChapter;
    //         this.displayCurrentChapter();
    //         this.saveProgress();
    //         this.updateProgress();
    //     }
    // },

    // Навигация по страницам
    navigateChapter: function(direction) {
        if (!this.currentBook || !this.currentBook.pages) return;
        
        const newPage = this.settings.currentPage + direction;
        if (newPage >= 0 && newPage < this.currentBook.pages.length) {
            this.settings.currentPage = newPage;
            this.displayCurrentPage(); // отображаем новую страницу
            this.updateProgress(); // обновляем индикатор прогресса
            this.saveProgress(); // сохраняем положение
            this.saveSettings(); // сохраняем настройки
        }
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
    
    // Обновить значения в панели настроек (если элементы существуют)
    const fontFamilySelect = utils.get('fontFamily');
    const lineHeightSelect = utils.get('lineHeight');
    const textAlignSelect = utils.get('textAlign');
    const marginSizeSelect = utils.get('marginSize');
    
    if (fontFamilySelect) fontFamilySelect.value = this.settings.fontFamily;
    if (lineHeightSelect) lineHeightSelect.value = this.settings.lineHeight;
    if (textAlignSelect) textAlignSelect.value = this.settings.textAlign;
    if (marginSizeSelect) marginSizeSelect.value = this.settings.marginSize;
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
            progress: this.readingProgress,
            currentPage: this.settings.currentPage,
            timestamp: new Date().toISOString()
        };
        
        utils.saveToStorage(`progress-${this.currentBook.id}`, progress);
    },
    

    
    // Обновить отображение прогресса
    updateProgress: function() {
        if (!this.currentBook || !this.currentBook.pages) return;
        
        // Прогресс = текущая страница / всего страниц
        this.readingProgress = this.currentBook.pages.length > 0 ? 
            this.settings.currentPage / this.currentBook.pages.length : 0;
        
        const progressFill = utils.get('progressFill');
        const progressText = utils.get('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${this.readingProgress * 100}%`;
        }
        
        if (progressText) {
            progressText.textContent = `Прогресс: ${Math.round(this.readingProgress * 100)}% (${this.settings.currentPage + 1}/${this.currentBook.pages.length} стр.)`;
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
    },
    
    // Вернуться к библиотеке
    backToLibrary: function() {
        // Сохраняем прогресс перед выходом
        this.saveProgress();
        
        // Показываем библиотеку
        if (typeof libraryManager !== 'undefined') {
            libraryManager.showLibrary();
        }
        
        authManager.showNotification('Прогресс сохранен', 'success');
    }
};

// Инициализация вызывается из app.js