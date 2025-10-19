const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Путь к данным пользователей (в реальном проекте используйте базу данных)
const USERS_DATA_PATH = path.join(__dirname, '../data/users.json');
const PROGRESS_DATA_PATH = path.join(__dirname, '../data/progress.json');

// Создаем папку data если её нет
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Инициализируем файлы данных если их нет
if (!fs.existsSync(USERS_DATA_PATH)) {
    fs.writeFileSync(USERS_DATA_PATH, JSON.stringify([], null, 2));
}

if (!fs.existsSync(PROGRESS_DATA_PATH)) {
    fs.writeFileSync(PROGRESS_DATA_PATH, JSON.stringify([], null, 2));
}

// Утилита для чтения данных
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Ошибка чтения файла ${filePath}:`, error);
        return [];
    }
}

// Утилита для записи данных
function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Ошибка записи файла ${filePath}:`, error);
        return false;
    }
}

// Регистрация пользователя
router.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Все поля обязательны для заполнения'
            });
        }
        
        const users = readJsonFile(USERS_DATA_PATH);
        
        // Проверяем, существует ли пользователь
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Пользователь с таким email или именем уже существует'
            });
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // В реальном проекте хешируйте пароль!
            joinDate: new Date().toISOString(),
            lastLogin: null
        };
        
        users.push(newUser);
        
        if (writeJsonFile(USERS_DATA_PATH, users)) {
            // Не возвращаем пароль в ответе
            const { password: _, ...userResponse } = newUser;
            res.status(201).json({
                success: true,
                message: 'Пользователь успешно зарегистрирован',
                data: userResponse
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Ошибка при сохранении пользователя'
            });
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// Авторизация пользователя
router.post('/login', (req, res) => {
    try {
        const { login, password } = req.body;
        
        if (!login || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email/логин и пароль обязательны'
            });
        }
        
        const users = readJsonFile(USERS_DATA_PATH);
        
        // Ищем пользователя по email или username
        const user = users.find(u => 
            u.email === login || u.username === login
        );
        
        if (!user || user.password !== password) {
            return res.status(401).json({
                success: false,
                error: 'Неверный логин или пароль'
            });
        }
        
        // Обновляем время последнего входа
        user.lastLogin = new Date().toISOString();
        writeJsonFile(USERS_DATA_PATH, users);
        
        // Не возвращаем пароль в ответе
        const { password: _, ...userResponse } = user;
        res.json({
            success: true,
            message: 'Успешная авторизация',
            data: userResponse
        });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// Сохранить прогресс чтения
router.post('/progress', (req, res) => {
    try {
        const { userId, bookId, progress, currentPage, timestamp } = req.body;
        
        if (!userId || !bookId || progress === undefined) {
            return res.status(400).json({
                success: false,
                error: 'userId, bookId и progress обязательны'
            });
        }
        
        const progressData = readJsonFile(PROGRESS_DATA_PATH);
        
        // Ищем существующий прогресс
        const existingIndex = progressData.findIndex(p => 
            p.userId === userId && p.bookId === bookId
        );
        
        const progressEntry = {
            userId,
            bookId,
            progress,
            currentPage: currentPage || 0,
            timestamp: timestamp || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (existingIndex >= 0) {
            // Обновляем существующий прогресс
            progressData[existingIndex] = progressEntry;
        } else {
            // Добавляем новый прогресс
            progressData.push(progressEntry);
        }
        
        if (writeJsonFile(PROGRESS_DATA_PATH, progressData)) {
            res.json({
                success: true,
                message: 'Прогресс сохранен',
                data: progressEntry
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Ошибка при сохранении прогресса'
            });
        }
    } catch (error) {
        console.error('Ошибка сохранения прогресса:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// Получить прогресс пользователя
router.get('/:userId/progress', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const progressData = readJsonFile(PROGRESS_DATA_PATH);
        
        const userProgress = progressData.filter(p => p.userId === userId);
        
        res.json({
            success: true,
            count: userProgress.length,
            data: userProgress
        });
    } catch (error) {
        console.error('Ошибка получения прогресса:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при получении прогресса'
        });
    }
});

module.exports = router;