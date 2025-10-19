// Управление библиотекой книг
const libraryManager = {
    // Все книги и отфильтрованные
    allBooks: [],
    filteredBooks: [],

    // Инициализация
    init: function () {
        this.setupEventListeners();
        this.loadAndDisplayBooks();
        console.log('📚 LibraryManager инициализирован');
    },

    // Настройка обработчиков событий
    setupEventListeners: function () {
        // Поиск
        const searchInput = utils.get('searchInput');
        if (searchInput) {
            utils.on(searchInput, 'input', utils.debounce((e) => {
                this.filterBooks();
            }, 300));
        }

        // Фильтр по жанру
        const genreFilter = utils.get('genreFilter');
        if (genreFilter) {
            utils.on(genreFilter, 'change', () => {
                this.filterBooks();
            });
        }

        // Обработка кликов по навигации
        const libraryLink = document.querySelector('a[href="#library"]');
        if (libraryLink) {
            utils.on(libraryLink, 'click', (e) => {
                e.preventDefault();
                this.showLibrary();
            });
        }
    },

    // Загрузить и отобразить книги
    loadAndDisplayBooks: async function () {
        this.showLoading(true);

        try {
            this.allBooks = await bookManager.loadBooks();
            this.filteredBooks = [...this.allBooks];
            this.displayBooks();
        } catch (error) {
            console.error('❌ Ошибка загрузки библиотеки:', error);
            this.showError('Не удалось загрузить библиотеку книг');
        } finally {
            this.showLoading(false);
        }
    },

    // Показать/скрыть загрузку
    showLoading: function (show) {
        const loading = utils.get('libraryLoading');
        if (loading) {
            loading.style.display = show ? 'block' : 'none';
        }
    },

    // Фильтрация книг
    filterBooks: function () {
        const searchQuery = utils.get('searchInput')?.value.toLowerCase() || '';
        const selectedGenre = utils.get('genreFilter')?.value || '';

        this.filteredBooks = this.allBooks.filter(book => {
            const matchesSearch = !searchQuery ||
                book.title.toLowerCase().includes(searchQuery) ||
                book.author.toLowerCase().includes(searchQuery);

            const matchesGenre = !selectedGenre || book.genre === selectedGenre;

            return matchesSearch && matchesGenre;
        });

        this.displayBooks();
    },

    // Отобразить книги
    displayBooks: function () {
        const booksGrid = utils.get('booksGrid');
        if (!booksGrid) return;

        if (this.filteredBooks.length === 0) {
            booksGrid.innerHTML = `
                <div class="no-books">
                    <h3>Книги не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            `;
            return;
        }

        booksGrid.innerHTML = this.filteredBooks.map(book => this.createBookCard(book)).join('');

        // Добавляем обработчики для кнопок
        this.attachBookEventListeners();
    },

    // Создать карточку книги
    createBookCard: function (book) {
        const description = book.description || 'Описание отсутствует';
        const shortDescription = description.length > 120 ?
            description.substring(0, 120) + '...' : description;

        return `
            <div class="book-card" data-book-id="${book.id}">
                <div class="book-cover">
                    <div class="book-cover-placeholder">📖</div>
                </div>
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <div class="book-author">${book.author}</div>
                    <div class="book-meta">
                        <span class="book-genre">${book.genre}</span>
                        <span class="book-year">${book.year}</span>
                    </div>
                    <div class="book-description">${shortDescription}</div>
                    <div class="book-actions">
                        <button class="btn-read" data-book-id="${book.id}">
                            📖 Читать
                        </button>
                        <button class="btn-info" data-book-id="${book.id}" title="Подробнее">
                            ℹ️
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Добавить обработчики для кнопок книг
    attachBookEventListeners: function () {
        // Кнопки "Читать"
        document.querySelectorAll('.btn-read').forEach(btn => {
            utils.on(btn, 'click', (e) => {
                e.stopPropagation();
                const bookId = parseInt(btn.dataset.bookId);
                this.startReading(bookId);
            });
        });

        // Кнопки "Подробнее"
        document.querySelectorAll('.btn-info').forEach(btn => {
            utils.on(btn, 'click', (e) => {
                e.stopPropagation();
                const bookId = parseInt(btn.dataset.bookId);
                this.showBookInfo(bookId);
            });
        });

        // Клик по карточке книги
        document.querySelectorAll('.book-card').forEach(card => {
            utils.on(card, 'click', () => {
                const bookId = parseInt(card.dataset.bookId);
                this.startReading(bookId);
            });
        });
    },

    // Начать чтение книги
    startReading: function (bookId) {
        console.log(`📖 Начинаем чтение книги ID: ${bookId}`);

        // Скрываем библиотеку и показываем читалку
        this.hideLibrary();

        // Загружаем книгу в читалку
        readerManager.loadBook(bookId);

        authManager.showNotification('Загружаем книгу...', 'info');
    },

    // Показать информацию о книге
    showBookInfo: function (bookId) {
        const book = this.allBooks.find(b => b.id === bookId);
        if (!book) return;

        const info = `
            📖 ${book.title}
            ✍️ ${book.author}
            📅 ${book.year}
            📚 ${book.genre}
            📄 ${book.chapters} глав
            
            ${book.description || 'Описание отсутствует'}
        `;

        alert(info); // Временно используем alert, потом можно сделать красивое модальное окно
    },

    // Показать библиотеку
    showLibrary: function () {
        const librarySection = utils.get('librarySection');
        const readingSection = utils.get('readingSection');

        if (librarySection) librarySection.style.display = 'block';
        if (readingSection) readingSection.style.display = 'none';

        // Обновляем навигацию
        this.updateNavigation('library');

        window.scrollTo(0, 0);
    },

    // Скрыть библиотеку
    hideLibrary: function () {
        const librarySection = utils.get('librarySection');
        const readingSection = utils.get('readingSection');

        if (librarySection) librarySection.style.display = 'none';
        if (readingSection) readingSection.style.display = 'block';

        // Обновляем навигацию
        this.updateNavigation('reading');
    },

    // Обновить активную навигацию
    updateNavigation: function (section) {
        // Убираем активный класс со всех ссылок
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Добавляем активный класс нужной ссылке
        const activeLink = document.querySelector(`a[href="#${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    },

    // Показать ошибку
    showError: function (message) {
        const booksGrid = utils.get('booksGrid');
        if (booksGrid) {
            booksGrid.innerHTML = `
                <div class="no-books">
                    <h3>❌ Ошибка</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
};

// Инициализация вызывается из app.js