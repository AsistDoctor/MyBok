const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Слушаем все интерфейсы для сетевого доступа

// CORS настройки для доступа с других устройств
const corsOptions = {
    origin: function (origin, callback) {
        // Разрешаем запросы без origin (мобильные приложения, Postman и т.д.)
        if (!origin) return callback(null, true);
        
        // Разрешаем все localhost и локальные IP
        if (origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.includes('192.168.') || 
            origin.includes('10.0.') ||
            origin.includes('172.')) {
            return callback(null, true);
        }
        
        // Для продакшена можно добавить конкретные домены
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Статические файлы (frontend)
const frontendPath = path.join(__dirname, '../frontend');
console.log('📁 Путь к frontend:', frontendPath);

app.use(express.static(frontendPath, {
    // Добавляем заголовки для мобильных устройств
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.get('User-Agent')?.substring(0, 50) || 'Unknown'}`);
    next();
});

// API Routes
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');

app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);

// Главная страница - отдаем frontend
app.get('/', (req, res) => {
    try {
        const indexPath = path.join(__dirname, '../frontend/index.html');
        console.log(`Отправляем index.html: ${indexPath}`);
        
        // Проверяем, существует ли файл
        if (!fs.existsSync(indexPath)) {
            console.error('❌ index.html не найден:', indexPath);
            return res.status(404).send('index.html не найден');
        }
        
        res.sendFile(indexPath);
    } catch (error) {
        console.error('❌ Ошибка при отправке index.html:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// API информация
app.get('/api', (req, res) => {
    res.json({
        message: 'Добро пожаловать в API Читалки!',
        version: '1.0.0',
        endpoints: {
            books: '/api/books',
            users: '/api/users'
        },
        author: 'Ростислав Лукьянчук',
        description: 'Backend для приложения чтения книг онлайн'
    });
});

// 404 для API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint не найден',
        path: req.path,
        method: req.method
    });
});

// Все остальные запросы - отдаем frontend (для SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err.stack);
    res.status(500).json({
        error: 'Внутренняя ошибка сервера',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
    });
});

// Функция для получения локального IP
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Пропускаем внутренние (localhost) и не IPv4 адреса
            if (net.family === 'IPv4' && !net.internal) {
                results.push({
                    interface: name,
                    address: net.address
                });
            }
        }
    }
    
    // Приоритет: обычная Wi-Fi сеть (192.168.x.x)
    const wifiIP = results.find(ip => ip.address.startsWith('192.168.'));
    if (wifiIP) return wifiIP.address;
    
    // Если нет Wi-Fi, берем первый доступный
    return results[0]?.address || 'localhost';
}

// Запуск сервера
app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    
    console.log('🚀 Сервер Читалки запущен!');
    console.log('📍 Доступные адреса:');
    console.log(`   Локально: http://localhost:${PORT}`);
    console.log(`   В сети:   http://${localIP}:${PORT}`);
    console.log('🔧 API endpoints:');
    console.log(`   Локально: http://localhost:${PORT}/api`);
    console.log(`   В сети:   http://${localIP}:${PORT}/api`);
    console.log(`👨‍💻 Разработчик: Ростислав Лукьянчук`);
    console.log('---');
    console.log('💡 Для доступа с других устройств используйте сетевой адрес');
    console.log('🔒 Убедитесь, что брандмауэр разрешает подключения на порт', PORT);
});

module.exports = app;