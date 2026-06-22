class Admin {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('userLoggedIn', (e) => {
            if (e.detail.isAdmin) {
                this.showAdminLink();
            }
        });

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#admin') {
                this.showAdminPanel();
            }
        });

        if (window.location.hash === '#admin') {
            this.showAdminPanel();
        }
    }

    showAdminLink() {
        const nav = document.querySelector('.nav');
        const link = document.createElement('a');
        link.href = '#admin';
        link.className = 'nav-link';
        link.textContent = 'Админ';
        link.style.color = 'var(--accent-red)';
        nav.appendChild(link);
    }

    async showAdminPanel() {
        if (!authModule.isAdmin) {
            alert('Доступ запрещён');
            window.location.hash = '';
            return;
        }

        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        document.getElementById('page-admin').style.display = 'block';

        await this.loadStats();
        await this.loadUsers();
    }

    async loadStats() {
        const usersSnapshot = await db.collection('users').get();
        const tasksSnapshot = await db.collection('tasks').get();
        
        const totalUsers = usersSnapshot.size;
        const totalTasks = tasksSnapshot.size;
        const completedTasks = tasksSnapshot.docs.filter(doc => doc.data().completed).length;
        
        document.getElementById('admin-stats').innerHTML = `
            <div class="stat-card">
                <div class="stat-value">${totalUsers}</div>
                <div class="stat-label">Пользователей</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${totalTasks}</div>
                <div class="stat-label">Всего задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${completedTasks}</div>
                <div class="stat-label">Выполнено задач</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(completedTasks / totalTasks * 100) || 0}%</div>
                <div class="stat-label">Процент выполнения</div>
            </div>
        `;
    }

    async loadUsers() {
        const snapshot = await db.collection('users').orderBy('totalXP', 'desc').get();
        
        document.getElementById('admin-users').innerHTML = snapshot.docs.map(doc => {
            const user = doc.data();
            return `
                <div class="admin-user">
                    <div class="user-info">
                        <span class="user-email">${user.email}</span>
                        <span class="user-level">Ур. ${user.level}</span>
                        <span>${user.totalXP} XP</span>
                    </div>
                    <div>
                        <button class="btn btn-danger btn-small" onclick="adminModule.banUser('${user.uid}')">Забанить</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async banUser(userId) {
        if (!confirm('Забанить пользователя?')) return;
        
        await db.collection('users').doc(userId).delete();
        
        const tasksSnapshot = await db.collection('tasks').where('userId', '==', userId).get();
        const batch = db.batch();
        tasksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        
        this.loadStats();
        this.loadUsers();
    }
}

const adminModule = new Admin();
