class Auth {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }

    init() {
        auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.isAdmin = user && user.email === 'admin@pixelquest.ru';
            this.updateUI();
            
            if (user) {
                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user, isAdmin: this.isAdmin } }));
            } else {
                window.dispatchEvent(new CustomEvent('userLoggedOut'));
            }
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const authModal = document.getElementById('auth-modal');
        const loginForm = document.getElementById('login-form');
        const switchToRegister = document.getElementById('switch-to-register');
        const closeModal = document.querySelector('.close');

        loginBtn?.addEventListener('click', () => this.showModal('login'));
        registerBtn?.addEventListener('click', () => this.showModal('register'));
        logoutBtn?.addEventListener('click', () => this.logout());
        
        loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        switchToRegister?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('register');
        });

        closeModal?.addEventListener('click', () => {
            authModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === authModal) {
                authModal.style.display = 'none';
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
                    <input type="email" id="login-email" placeholder="Email" required>
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
                    <input type="email" id="register-email" placeholder="Email" required>
                    <input type="password" id="register-password" placeholder="Пароль (мин. 6 символов)" required>
                    <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
                </form>
                <p class="switch-auth">Уже есть аккаунт? <a href="#" id="switch-to-login">Войти</a></p>
            `;
            
            document.getElementById('register-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
            
            document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('login');
            });
        }
        
        modal.style.display = 'flex';
        this.setupEventListeners();
    }

    async login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            document.getElementById('auth-modal').style.display = 'none';
        } catch (error) {
            alert('Ошибка входа: ' + error.message);
        }
    }

    async register() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName: name });
            
            await db.collection('users').doc(userCredential.user.uid).set({
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                level: 1,
                totalXP: 0,
                attributes: {
                    strength: 1,
                    intelligence: 1,
                    agility: 1,
                    endurance: 1
                },
                attributePoints: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            document.getElementById('auth-modal').style.display = 'none';
        } catch (error) {
            alert('Ошибка регистрации: ' + error.message);
        }
    }

    async logout() {
        await auth.signOut();
    }

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (this.currentUser) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }
}

const authModule = new Auth();
