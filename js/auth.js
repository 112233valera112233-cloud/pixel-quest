class Auth {
    constructor() {
        this.currentUser = DB.getCurrentUser();
        this.isAdmin = false;
        this.init();
    }

    init() {
        this.updateUI();
        if (this.currentUser) {
            window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: this.currentUser, isAdmin: this.isAdmin } }));
        }

        document.getElementById('login-btn')?.addEventListener('click', () => this.showModal('login'));
        document.getElementById('register-btn')?.addEventListener('click', () => this.showModal('register'));
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
        document.querySelector('#auth-modal .close')?.addEventListener('click', () => {
            document.getElementById('auth-modal').style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target.id === 'auth-modal') {
                document.getElementById('auth-modal').style.display = 'none';
            }
        });
    }

    showModal(type) {
        const modal = document.getElementById('auth-modal');
        const container = document.getElementById('auth-form-container');

        if (type === 'login') {
            container.innerHTML = `
                <h2>Вход</h2>
                <form id="login-form">
                    <input type="text" id="login-email" placeholder="Имя" required>
                    <input type="password" id="login-password" placeholder="Пароль" required>
                    <button type="submit" class="btn btn-primary">Войти</button>
                </form>
                <p class="switch-auth">Нет аккаунта? <a href="#" id="switch-to-register">Зарегистрироваться</a></p>
            `;
        } else {
            container.innerHTML = `
                <h2>Регистрация</h2>
                <form id="register-form">
                    <input type="text" id="register-name" placeholder="Имя" required>
                    <input type="password" id="register-password" placeholder="Пароль (мин. 4 символа)" required>
                    <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
                </form>
                <p class="switch-auth">Уже есть аккаунт? <a href="#" id="switch-to-login">Войти</a></p>
            `;
        }

        modal.style.display = 'flex';

        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });
        document.getElementById('register-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });
        document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('register');
        });
        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('login');
        });
    }

    login() {
        const name = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const users = DB.getUsers();
        const user = users[name];

        if (!user || user.password !== password) {
            alert('Неверное имя или пароль');
            return;
        }

        this.currentUser = user;
        DB.setCurrentUser(user);
        document.getElementById('auth-modal').style.display = 'none';
        this.updateUI();
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user, isAdmin: this.isAdmin } }));
    }

    register() {
        const name = document.getElementById('register-name').value.trim();
        const password = document.getElementById('register-password').value;

        if (password.length < 4) {
            alert('Пароль минимум 4 символа');
            return;
        }

        const users = DB.getUsers();
        if (users[name]) {
            alert('Пользователь уже существует');
            return;
        }

        const user = {
            uid: name,
            displayName: name,
            password: password,
            level: 1,
            totalXP: 0,
            attributes: { strength: 1, intelligence: 1, agility: 1, endurance: 1 },
            attributePoints: 0
        };

        users[name] = user;
        DB.saveUsers(users);

        this.currentUser = user;
        DB.setCurrentUser(user);
        document.getElementById('auth-modal').style.display = 'none';
        this.updateUI();
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user, isAdmin: this.isAdmin } }));
    }

    logout() {
        this.currentUser = null;
        DB.clearCurrentUser();
        this.updateUI();
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
    }

    updateUI() {
        document.getElementById('login-btn').style.display = this.currentUser ? 'none' : 'block';
        document.getElementById('register-btn').style.display = this.currentUser ? 'none' : 'block';
        document.getElementById('logout-btn').style.display = this.currentUser ? 'block' : 'none';
    }
}

const authModule = new Auth();
