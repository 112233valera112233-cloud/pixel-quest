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

    async loadTasks() {
        if (!this.currentUserId) return;
        
        const snapshot = await db.collection('tasks')
            .where('userId', '==', this.currentUserId)
            .orderBy('createdAt', 'desc')
            .get();
        
        this.tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.render();
    }

    showTaskModal(task = null) {
        const modal = document.getElementById('task-modal');
        const title = document.getElementById('task-modal-title');
        const idField = document.getElementById('task-id');
        const titleField = document.getElementById('task-title');
        const descField = document.getElementById('task-description');
        const diffField = document.getElementById('task-difficulty');
        
        if (task) {
            title.textContent = 'Редактировать задачу';
            idField.value = task.id;
            titleField.value = task.title;
            descField.value = task.description || '';
            diffField.value = task.difficulty;
        } else {
            title.textContent = 'Новая задача';
            idField.value = '';
            titleField.value = '';
            descField.value = '';
            diffField.value = 'easy';
        }
        
        modal.style.display = 'flex';
    }

    async saveTask() {
        const id = document.getElementById('task-id').value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const difficulty = document.getElementById('task-difficulty').value;
        
        const xpMap = { easy: 50, medium: 150, hard: 300 };
        const taskData = {
            userId: this.currentUserId,
            title,
            description,
            difficulty,
            xpReward: xpMap[difficulty],
            completed: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        if (id) {
            await db.collection('tasks').doc(id).update(taskData);
        } else {
            await db.collection('tasks').add(taskData);
        }
        
        document.getElementById('task-modal').style.display = 'none';
        this.loadTasks();
    }

    async completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || task.completed) return;
        
        await db.collection('tasks').doc(taskId).update({
            completed: true,
            completedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        window.dispatchEvent(new CustomEvent('xpEarned', { 
            detail: { amount: task.xpReward } 
        }));
        
        this.loadTasks();
    }

    async deleteTask(taskId) {
        if (!confirm('Удалить задачу?')) return;
        
        await db.collection('tasks').doc(taskId).delete();
        this.loadTasks();
    }

    render() {
        const list = document.getElementById('tasks-list');
        if (!list) return;
        
        if (this.tasks.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">Нет задач. Добавьте первую!</p>';
            return;
        }
        
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
                    ${this.getDifficultyLabel(task.difficulty)} • +${task.xpReward} XP
                    ${task.completed ? ' • ✓ ВЫПОЛНЕНО' : ''}
                </div>
            </div>
        `).join('');
    }

    getDifficultyLabel(difficulty) {
        const labels = { easy: 'Лёгкая', medium: 'Средняя', hard: 'Сложная' };
        return labels[difficulty] || difficulty;
    }
}

const tasksModule = new Tasks();
