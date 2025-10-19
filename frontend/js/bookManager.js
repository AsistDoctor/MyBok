const bookManager = {
    // Все книги
    allBooks: [],
    
    // Инициализация
    init: function() {
        console.log('📚 Менеджер книг инициализирован');
        return this.loadBooks();
    },
    
    // Загрузка списка книг
    loadBooks: async function() {
        try {
            // Пробуем загрузить с API
            let response = await fetch('/api/books');
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success) {
                    this.allBooks = apiData.data;
                    console.log(`✅ Загружено ${this.allBooks.length} книг с API`);
                    return this.allBooks;
                }
            }
            
            // Fallback - загружаем из локального файла
            console.log('📁 API недоступно, загружаем из локального файла');
            response = await fetch('./books/data/books.json');
            
            if (!response.ok) {
                throw new Error('Не удалось загрузить книги');
            }
            
            this.allBooks = await response.json();
            console.log(`✅ Загружено ${this.allBooks.length} книг из файла`);
            return this.allBooks;
        } catch (error) {
            console.error('❌ Ошибка загрузки книг:', error);
            this.allBooks = [];
            return [];
        }
    },
    
    // Получить все книги
    getAllBooks: function() {
        return this.allBooks;
    },
    
    // Найти книгу по ID
    getBookById: function(id) {
        return this.allBooks.find(book => book.id === parseInt(id));
    },
    
    // Загрузить текст книги
    loadBookContent: async function(bookId) {
        try {
            const book = this.getBookById(bookId);
            if (!book) {
                throw new Error('Книга не найдена');
            }
            
            // Пробуем загрузить с API
            let response = await fetch(`/api/books/${bookId}/content`);
            
            if (response.ok) {
                const apiData = await response.json();
                if (apiData.success) {
                    console.log(`✅ Загружен контент книги "${apiData.data.title}" с API`);
                    return {
                        ...apiData.data,
                        chapters: this.parseChapters(apiData.data.content)
                    };
                }
            }
            
            // Fallback - загружаем из локального файла
            console.log('📁 API недоступно, загружаем из локального файла');
            response = await fetch(`./books/${book.file}`);
            
            if (!response.ok) {
                throw new Error('Не удалось загрузить текст книги');
            }
            
            const text = await response.text();
            
            return {
                ...book,
                content: text,
                chapters: this.parseChapters(text)
            };
        } catch (error) {
            console.error('❌ Ошибка загрузки текста книги:', error);
            return null;
        }
    },
    
    // Разбить текст на главы
    parseChapters: function(text) {
        const chapters = [];
        const lines = text.split('\n');
        let currentChapter = null;
        
        lines.forEach((line, index) => {
            // Ищем заголовки глав (Глава 1, Chapter 1, ЧАСТЬ ПЕРВАЯ и т.д.)
            const isChapter = line.match(/^(Глава|Chapter|ЧАСТЬ|CHAPTER|PART)\s+\d+/i) || 
                             line.match(/^(Глава|Chapter)\s+[IVXLCDM]+/i) ||
                             (line.trim().length > 0 && 
                              line.trim().length < 100 && 
                              !line.match(/[a-z]/) && 
                              line.match(/[А-Я]/));
            
            if (isChapter && line.trim().length > 0) {
                if (currentChapter) {
                    // Сохраняем предыдущую главу
                    currentChapter.content = currentChapter.lines.join('\n');
                    chapters.push(currentChapter);
                }
                // Начинаем новую главу
                currentChapter = {
                    title: line.trim(),
                    number: chapters.length + 1,
                    lines: [],
                    startLine: index
                };
            } else if (currentChapter) {
                currentChapter.lines.push(line);
            }
        });
        
        // Добавляем последнюю главу
        if (currentChapter) {
            currentChapter.content = currentChapter.lines.join('\n');
            chapters.push(currentChapter);
        }
        
        // Если глав не найдено, создаем одну главу со всем текстом
        if (chapters.length === 0) {
            chapters.push({
                title: 'Полный текст',
                number: 1,
                content: text,
                lines: lines
            });
        }
        
        return chapters;
    },
    
    // Поиск книг
    searchBooks: function(query) {
        if (!query) return this.allBooks;
        
        const lowerQuery = query.toLowerCase();
        return this.allBooks.filter(book => 
            book.title.toLowerCase().includes(lowerQuery) ||
            book.author.toLowerCase().includes(lowerQuery) ||
            book.genre.toLowerCase().includes(lowerQuery)
        );
    },
    
    // Получить книги по жанру
    getBooksByGenre: function(genre) {
        return this.allBooks.filter(book => 
            book.genre.toLowerCase() === genre.toLowerCase()
        );
    }
};