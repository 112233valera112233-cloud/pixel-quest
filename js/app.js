class App {
    constructor() {
        this.currentPage = 'tasks';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupPageHash();
    }

    setupNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) this.navigateTo(page);
            });
        });
    }

    setupPageHash() {
        const hash = window.location.hash.slice(1);
        if (hash) this.navigateTo(hash);
    }

    navigateTo(page) {
        if (page === 'admin') return;
        
        document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        const pageEl = document.getElementById(`page-${page}`);
        if (pageEl) {
            pageEl.style.display = 'block';
            this.currentPage = page;
        }
        
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
