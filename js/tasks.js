class Tasks {
    constructor() {
        this.tasks = [];
        this.currentUserId = null;
        this.init();
    }

    init() {
        window.addEventListener('userLoggedIn', (e) => {
            this.currentUserId = e.detail.user.uid;
            this.loadTasks();
        });
        window.addEventListener('userLoggedOut', () => {
            this.currentUserId = null;
            this.tasks = [];
            this.render();
        });
        document.getElementById('add-task-btn')?.addEventListener('click', () => this.showTaskModal());
        document.getElementById('task-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        document.querySelector('#task-modal .close')?.addEventListener('click', () => {
            document.getElementById('task-modal').style.display = 'none';
        });
    }

    loadTasks() {
        if (!this.currentUserId) return;
        const allTasks = DB.getTasks();
        this.tasks = allTasks.filter(t => t.userId === this.currentUserId);
        this.render();
    }

    showTaskModal(task = null) {
        if (!this.currentUserId) {
            alert('Войдите, чтобы добавить задачу');
            return;
        }
        const modal = document.getElementById('task-modal');
        document.getElementById('task-modal-title').textContent = task ? 'Редактировать задачу' : 'Новая задача';
        document.getElementById('task-id').value = task ? task.id : '';
        document.getElementById('task-title').value = task ? task.title : '';
        document.getElementById('task-description').value = task ? (task.description || '') : '';
        document.getElementById('task-difficulty').value = task ? task.difficulty : 'easy';
        modal.style.display = 'flex';
    }

    saveTask() {
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const difficulty = document.getElementById('task-difficulty').value;
        const xpMap = { easy: 50, medium: 150, hard: 300 };

        const allTasks = DB.getTasks();

        if (id) {
            const idx = allTasks.findIndex(t => t.id === id);
            if (idx !== -1) {
                allTasks[idx].title = title;
                allTasks[idx].description = description;
                allTasks[idx].difficulty = difficulty;
                allTasks[idx].xpReward = xpMap[difficulty];
            }
        } else {
            allTasks.push({
                id: Date.now().toString(),
                userId: this.currentUserId,
                title,
                description,
                difficulty,
                xpReward: xpMap[difficulty],
                completed: false,
                createdAt: new Date().toISOString()
            });
        }

        DB.saveTasks(allTasks);
        document.getElementById('task-modal').style.display = 'none';
        this.loadTasks();
    }

    completeTask(taskId) {
        const allTasks = DB.getTasks();
        const task = allTasks.find(t => t.id === taskId);
        if (!task || task.completed) return;

        task.completed = true;
        task.completedAt = new Date().toISOString();
        DB.saveTasks(allTasks);

        window.dispatchEvent(new CustomEvent('xpEarned', { detail: { amount: task.xpReward } }));
        this.loadTasks();
    }

    deleteTask(taskId) {
        if (!confirm('Удалить задачу?')) return;
        let allTasks = DB.getTasks();
        allTasks = allTasks.filter(t => t.id !== taskId);
        DB.saveTasks(allTasks);
        this.loadTasks();
    }

    render() {
        const list = document.getElementById('tasks-list');
        if (!list) return;

        if (this.tasks.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">Нет задач. Добавьте первую!</p>';
            return;
        }

        const diffLabels = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Сложная' };

        list.innerHTML = this.tasks.map(task => `
            <div class="task-item ${task.difficulty} ${task.completed ? 'completed' : ''}">
                <div class="task-header">
                    <span class="task-title">${task.title}</span>
                    <div class="task-actions">
                        ${!task.completed ? `<button onclick="tasksModule.completeTask('${task.id}')" title="Выполнено">✓</button>` : ''}
                        <button onclick="tasksModule.showTaskModal(${JSON.stringify(task).replace(/"/g, '&quot;')})" title="Редактировать">✏</button>
                        <button onclick="tasksModule.deleteTask('${task.id}')" title="Удалить">✕</button>
                    </div>
                </div>
                <div class="task-meta">
                    ${diffLabels[task.difficulty]} • +${task.xpReward} XP
                    ${task.completed ? ' • ✓ ВЫПОЛНЕНО' : ''}
                </div>
            </div>
        `).join('');
    }
}

const tasksModule = new Tasks();
