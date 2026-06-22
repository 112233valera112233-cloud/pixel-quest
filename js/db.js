const DB = {
    getUsers() {
        return JSON.parse(localStorage.getItem('pq_users') || '{}');
    },
    saveUsers(users) {
        localStorage.setItem('pq_users', JSON.stringify(users));
    },
    getTasks() {
        return JSON.parse(localStorage.getItem('pq_tasks') || '[]');
    },
    saveTasks(tasks) {
        localStorage.setItem('pq_tasks', JSON.stringify(tasks));
    },
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('pq_currentUser') || 'null');
    },
    setCurrentUser(user) {
        localStorage.setItem('pq_currentUser', JSON.stringify(user));
    },
    clearCurrentUser() {
        localStorage.removeItem('pq_currentUser');
    }
};
