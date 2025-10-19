# Backend для приложения "Читалка"

Backend сервер для веб-приложения чтения книг онлайн.

## Разработчик
**Ростислав Лукьянчук** - главный разработчик проекта

## Технологии
- Node.js
- Express.js
- CORS
- Body-parser

## Установка и запуск

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Запуск в режиме разработки
```bash
npm run dev
```

### 3. Запуск в продакшене
```bash
npm start
```

## API Endpoints

### Книги
- `GET /api/books` - получить все книги
- `GET /api/books/:id` - получить книгу по ID
- `GET /api/books/:id/content` - получить содержимое книги
- `GET /api/books/search/:query` - поиск книг

### Пользователи
- `POST /api/users/register` - регистрация пользователя
- `POST /api/users/login` - авторизация пользователя
- `POST /api/users/progress` - сохранить прогресс чтения
- `GET /api/users/:userId/progress` - получить прогресс пользователя

### Общие
- `GET /api` - информация об API
- `GET /` - главная страница (frontend)

## Структура проекта
```
backend/
├── config/
│   └── config.js          # Конфигурация
├── routes/
│   ├── books.js           # Роуты для книг
│   └── users.js           # Роуты для пользователей
├── data/                  # Данные (создается автоматически)
│   ├── users.json         # Пользователи
│   └── progress.json      # Прогресс чтения
├── package.json
├── server.js              # Основной сервер
└── README.md

```

## Примеры запросов

### Получить все книги
```bash
curl http://localhost:3000/api/books
```

### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'
```

### Авторизация
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"login":"test@example.com","password":"123456"}'
```

## Особенности
- Автоматическая раздача статических файлов frontend'а
- CORS настроен для работы с frontend'ом
- Логирование всех запросов
- Обработка ошибок
- JSON API с понятными ответами

## Безопасность
⚠️ **Внимание**: В текущей версии пароли хранятся в открытом виде. 
Для продакшена обязательно добавьте:
- Хеширование паролей (bcrypt)
- JWT токены для авторизации
- Валидацию входных данных
- Rate limiting
- HTTPS

## Разработка
Для разработки используется nodemon для автоматической перезагрузки сервера при изменении файлов.

```bash
npm run dev
```

Сервер будет доступен по адресу: http://localhost:3000