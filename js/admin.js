class Admin {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#admin') this.showAdminPanel();
        });
        if (window.location.hash === '#admin') this.showAdminPanel();
    }

    showAdminPanel() {
        if (!authModule.currentUser || authModule.currentUser.uid !== 'admin') {
            alert('Доступ запрещён. Войдите как "admin"');
            window.location.hash = '';
            return;
        }

        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        document.getElementById('page-admin').style.display = 'block';
        this.loadStats();
    }

    loadStats() {
        const users = DB.getUsers();
        const tasks = DB.getTasks();
        const userList = Object.values(users);
        const completed = tasks.filter(t => t.completed).length;

        document.getElementById('admin-stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${userList.length}</div>
                <div class="stat-label">Пользователей</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${tasks.length}</div>
                <div class="stat-label">Всего задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${completed}</div>
                <div class="stat-label">Выполнено задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${tasks.length ? Math.round(completed / tasks.length * 100) : 0}%</div>
                <div class="stat-label">Процент выполнения</div>
            </div>
        `;

        document.getElementById('admin-users').innerHTML = userList.map(user => `
            <div class="admin-user">
                <div class="user-info">
                    <span class="user-email">${user.displayName}</span>
                    <span class="user-level">Ур. ${user.level}</span>
                    <span>${user.totalXP} XP</span>
                </div>
                <div>
                    <button class="btn btn-danger btn-small" onclick="adminModule.banUser('${user.uid}')">Удалить</button>
                </div>
            </div>
        `).join('');
    }

    banUser(uid) {
        if (!confirm('Удалить пользователя и его задачи?')) return;
        const users = DB.getUsers();
        delete users[uid];
        DB.saveUsers(users);
        let tasks = DB.getTasks().filter(t => t.userId !== uid);
        DB.saveTasks(tasks);
        this.loadStats();
    }
}

const adminModule = new Admin();
