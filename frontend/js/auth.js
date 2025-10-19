// Управление авторизацией пользователя
const authManager = {
    // Ключ для localStorage
    storageKey: 'reader-user',
    
    // Текущий пользователь
    currentUser: null,
    
    // Инициализация
    init: function() {
        this.loadUser();
        this.setupEventListeners();
        this.updateUI();
    },
    
    // Загрузить пользователя из localStorage
    loadUser: function() {
        this.currentUser = utils.loadFromStorage(this.storageKey);
    },
    
    // Сохранить пользователя в localStorage
    saveUser: function(user) {
        this.currentUser = user;
        utils.saveToStorage(this.storageKey, user);
        this.updateUI();
    },
    
    // Выход пользователя
    logout: function() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKey);
        this.updateUI();
        
        // Закрыть меню пользователя
        const userMenu = utils.get('userMenu');
        if (userMenu) userMenu.classList.remove('active');
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Открытие модальных окон
        utils.on(utils.get('loginBtn'), 'click', () => this.openModal('loginModal'));
        utils.on(utils.get('registerBtn'), 'click', () => this.openModal('registerModal'));
        utils.on(utils.get('mobileLoginBtn'), 'click', () => this.openModal('loginModal'));
        utils.on(utils.get('mobileRegisterBtn'), 'click', () => this.openModal('registerModal'));
        
        // Закрытие модальных окон
        utils.on(utils.get('closeLoginModal'), 'click', () => this.closeModal('loginModal'));
        utils.on(utils.get('closeRegisterModal'), 'click', () => this.closeModal('registerModal'));
        
        // Переключение между формами
        utils.on(utils.get('switchToRegister'), 'click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.openModal('registerModal');
        });
        
        utils.on(utils.get('switchToLogin'), 'click', (e) => {
            e.preventDefault();
            this.closeModal('registerModal');
            this.openModal('loginModal');
        });
        
        // Обработка форм
        utils.on(utils.get('loginForm'), 'submit', (e) => this.handleLogin(e));
        utils.on(utils.get('registerForm'), 'submit', (e) => this.handleRegister(e));
        
        // Меню пользователя
        utils.on(utils.get('userToggle'), 'click', () => this.toggleUserMenu());
        utils.on(utils.get('logoutBtn'), 'click', () => this.logout());
        
        // Закрытие модальных окон по клику вне области
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    },
    
    // Открыть модальное окно
    openModal: function(modalId) {
        const modal = utils.get(modalId);
        if (modal) {
            modal.style.display = 'block';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    },
    
    // Закрыть модальное окно
    closeModal: function(modalId) {
        const modal = utils.get(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    },
    
    // Закрыть все модальные окна
    closeAllModals: function() {
        this.closeModal('loginModal');
        this.closeModal('registerModal');
    },
    
    // Обработка входа
    handleLogin: function(e) {
        e.preventDefault();
        
        const email = utils.get('loginEmail').value;
        const password = utils.get('loginPassword').value;
        
        // Валидация
        if (!this.validateEmail(email)) {
            this.showError('loginEmailError', 'Введите корректный email');
            return;
        }
        
        if (password.length < 6) {
            this.showError('loginPasswordError', 'Пароль должен содержать не менее 6 символов');
            return;
        }
        
        // Симуляция успешного входа
        this.simulateLogin(email);
    },
    
    // Обработка регистрации
    handleRegister: function(e) {
        e.preventDefault();
        
        const username = utils.get('regUsername').value;
        const email = utils.get('regEmail').value;
        const password = utils.get('regPassword').value;
        const passwordConfirm = utils.get('regPasswordConfirm').value;
        const agreeTerms = utils.get('agreeTerms').checked;
        
        // Валидация
        if (username.length < 3) {
            this.showError('regUsernameError', 'Имя пользователя должно содержать не менее 3 символов');
            return;
        }
        
        if (!this.validateEmail(email)) {
            this.showError('regEmailError', 'Введите корректный email');
            return;
        }
        
        if (password.length < 6) {
            this.showError('regPasswordError', 'Пароль должен содержать не менее 6 символов');
            return;
        }
        
        if (password !== passwordConfirm) {
            this.showError('regPasswordConfirmError', 'Пароли не совпадают');
            return;
        }
        
        if (!agreeTerms) {
            alert('Необходимо согласиться с условиями использования');
            return;
        }
        
        // Симуляция успешной регистрации
        this.simulateRegister(username, email);
    },
    
    // Симуляция входа (заглушка)
    simulateLogin: function(email) {
        // В реальном приложении здесь будет запрос к API
        const user = {
            id: 1,
            username: email.split('@')[0],
            email: email,
            joinDate: new Date().toISOString()
        };
        
        this.saveUser(user);
        this.closeModal('loginModal');
        this.showNotification(`Добро пожаловать, ${user.username}!`, 'success');
    },
    
    // Симуляция регистрации (заглушка)
    simulateRegister: function(username, email) {
        // В реальном приложении здесь будет запрос к API
        const user = {
            id: Date.now(),
            username: username,
            email: email,
            joinDate: new Date().toISOString()
        };
        
        this.saveUser(user);
        this.closeModal('registerModal');
        this.showNotification(`Регистрация успешна! Добро пожаловать, ${username}!`, 'success');
    },
    
    // Валидация email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Показать ошибку
    showError: function(elementId, message) {
        const errorElement = utils.get(elementId);
        if (errorElement) {
            errorElement.textContent = message;
        }
    },
    
    // Очистить ошибки
    clearErrors: function() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');
    },
    
    // Переключить меню пользователя
    toggleUserMenu: function() {
        const userMenu = utils.get('userMenu');
        if (userMenu) userMenu.classList.toggle('active');
    },
    
    // Обновить UI в зависимости от статуса авторизации
    updateUI: function() {
        const authSection = document.querySelector('.auth-section');
        const userMenu = utils.get('userMenu');
        const userName = utils.get('userName');
        
        if (this.currentUser) {
            // Пользователь авторизован
            utils.hide(authSection);
            utils.show(userMenu);
            if (userName) userName.textContent = this.currentUser.username;
        } else {
            // Пользователь не авторизован
            utils.show(authSection);
            utils.hide(userMenu);
        }
    },
    
    // Показать уведомление
    showNotification: function(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = utils.create('div', {
            class: `notification notification-${type}`
        }, message);
        
        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#2ecc71' : '#3498db'};
            color: white;
            border-radius: 4px;
            z-index: 2001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем уведомление через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// Инициализация вызывается из app.js