const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Путь к данным книг
const BOOKS_DATA_PATH = path.join(__dirname, '../../frontend/books/data/books.json');
const BOOKS_CONTENT_PATH = path.join(__dirname, '../../frontend/books/content');

// Получить все книги
router.get('/', (req, res) => {
    try {
        const booksData = fs.readFileSync(BOOKS_DATA_PATH, 'utf8');
        const books = JSON.parse(booksData);
        
        res.json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        console.error('Ошибка загрузки книг:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось загрузить список книг'
        });
    }
});

// Получить книгу по ID
router.get('/:id', (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const booksData = fs.readFileSync(BOOKS_DATA_PATH, 'utf8');
        const books = JSON.parse(booksData);
        
        const book = books.find(b => b.id === bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Книга не найдена'
            });
        }
        
        res.json({
            success: true,
            data: book
        });
    } catch (error) {
        console.error('Ошибка загрузки книги:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось загрузить книгу'
        });
    }
});

// Получить содержимое книги
router.get('/:id/content', (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const booksData = fs.readFileSync(BOOKS_DATA_PATH, 'utf8');
        const books = JSON.parse(booksData);
        
        const book = books.find(b => b.id === bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Книга не найдена'
            });
        }
        
        const contentPath = path.join(BOOKS_CONTENT_PATH, book.file.replace('content/', ''));
        
        if (!fs.existsSync(contentPath)) {
            return res.status(404).json({
                success: false,
                error: 'Файл книги не найден'
            });
        }
        
        const content = fs.readFileSync(contentPath, 'utf8');
        
        res.json({
            success: true,
            data: {
                ...book,
                content: content,
                contentLength: content.length
            }
        });
    } catch (error) {
        console.error('Ошибка загрузки содержимого книги:', error);
        res.status(500).json({
            success: false,
            error: 'Не удалось загрузить содержимое книги'
        });
    }
});

// Поиск книг
router.get('/search/:query', (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const booksData = fs.readFileSync(BOOKS_DATA_PATH, 'utf8');
        const books = JSON.parse(booksData);
        
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query) ||
            book.genre.toLowerCase().includes(query)
        );
        
        res.json({
            success: true,
            query: req.params.query,
            count: filteredBooks.length,
            data: filteredBooks
        });
    } catch (error) {
        console.error('Ошибка поиска книг:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при поиске книг'
        });
    }
});

module.exports = router;