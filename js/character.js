class Character {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        window.addEventListener('userLoggedIn', (e) => {
            this.userData = e.detail.user;
            this.updateUI();
        });
        window.addEventListener('userLoggedOut', () => {
            this.userData = null;
            this.resetUI();
        });
        window.addEventListener('xpEarned', (e) => {
            this.addXP(e.detail.amount);
        });
        document.getElementById('distribute-btn')?.addEventListener('click', () => this.showDistributeDialog());
    }

    addXP(amount) {
        if (!this.userData) return;

        this.userData.totalXP += amount;
        const newLevel = Math.floor(this.userData.totalXP / 500) + 1;
        const levelUp = newLevel > this.userData.level;

        if (levelUp) {
            this.userData.attributePoints += (newLevel - this.userData.level);
            this.userData.level = newLevel;
        }

        this.save();
        this.updateUI();

        if (levelUp) {
            alert(`Уровень ${newLevel}! Получено очко атрибута!`);
        }
    }

    showDistributeDialog() {
        if (!this.userData || this.userData.attributePoints <= 0) return;

        const choice = prompt('Какой атрибут прокачать?\n1 - СИЛА\n2 - ИНТ\n3 - ЛОВ\n4 - ВЫН');
        const map = { '1': 'strength', '2': 'intelligence', '3': 'agility', '4': 'endurance' };
        const attr = map[choice];

        if (attr && this.userData.attributePoints > 0) {
            this.userData.attributes[attr]++;
            this.userData.attributePoints--;
            this.save();
            this.updateUI();
        }
    }

    save() {
        const users = DB.getUsers();
        users[this.userData.uid] = this.userData;
        DB.saveUsers(users);
        DB.setCurrentUser(this.userData);
    }

    updateUI() {
        if (!this.userData) return;

        document.getElementById('char-level').textContent = this.userData.level;

        const maxAttr = 20;
        ['strength', 'intelligence', 'agility', 'endurance'].forEach(attr => {
            const val = this.userData.attributes[attr] || 1;
            document.getElementById(`attr-${attr}`).style.width = `${(val / maxAttr) * 100}%`;
            document.getElementById(`val-${attr}`).textContent = val;
        });

        const xpInLevel = this.userData.totalXP % 500;
        document.getElementById('xp-current').textContent = this.userData.totalXP;
        document.getElementById('xp-needed').textContent = this.userData.level * 500;
        document.getElementById('xp-fill').style.width = `${(xpInLevel / 500) * 100}%`;

        const pointsDiv = document.getElementById('attr-points');
        if (this.userData.attributePoints > 0) {
            pointsDiv.style.display = 'block';
            document.getElementById('available-points').textContent = this.userData.attributePoints;
        } else {
            pointsDiv.style.display = 'none';
        }
    }

    resetUI() {
        document.getElementById('char-level').textContent = '1';
        ['strength', 'intelligence', 'agility', 'endurance'].forEach(attr => {
            document.getElementById(`attr-${attr}`).style.width = '5%';
            document.getElementById(`val-${attr}`).textContent = '1';
        });
        document.getElementById('xp-current').textContent = '0';
        document.getElementById('xp-needed').textContent = '500';
        document.getElementById('xp-fill').style.width = '0%';
        document.getElementById('attr-points').style.display = 'none';
    }
}

const characterModule = new Character();
