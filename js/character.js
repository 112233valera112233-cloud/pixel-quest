class Character {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        window.addEventListener('userLoggedIn', (e) => {
            this.loadCharacter(e.detail.user.uid);
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

    async loadCharacter(userId) {
        const doc = await db.collection('users').doc(userId).get();
        if (doc.exists) {
            this.userData = doc.data();
            this.updateUI();
        }
    }

    async addXP(amount) {
        if (!this.userData) return;
        
        const newTotalXP = this.userData.totalXP + amount;
        const newLevel = Math.floor(newTotalXP / 500) + 1;
        const levelUp = newLevel > this.userData.level;
        
        let updates = { totalXP: newTotalXP };
        
        if (levelUp) {
            updates.level = newLevel;
            updates.attributePoints = (this.userData.attributePoints || 0) + (newLevel - this.userData.level);
        }
        
        await db.collection('users').doc(this.userData.uid).update(updates);
        
        this.userData.totalXP = newTotalXP;
        this.userData.level = newLevel;
        if (levelUp) {
            this.userData.attributePoints = (this.userData.attributePoints || 0) + (newLevel - this.userData.level);
        }
        
        this.updateUI();
        
        if (levelUp) {
            alert(`Уровень ${newLevel}! Получено очко атрибута!`);
        }
    }

    showDistributeDialog() {
        if (!this.userData || this.userData.attributePoints <= 0) return;
        
        const attr = prompt('Какой атрибут прокачать?\n1 - СИЛА\n2 - ИНТ\n3 - ЛОВ\n4 - ВЫН');
        
        const attrMap = { '1': 'strength', '2': 'intelligence', '3': 'agility', '4': 'endurance' };
        const selected = attrMap[attr];
        
        if (selected) {
            this.upgradeAttribute(selected);
        }
    }

    async upgradeAttribute(attr) {
        if (!this.userData || this.userData.attributePoints <= 0) return;
        
        const newAttributes = { ...this.userData.attributes };
        newAttributes[attr] = (newAttributes[attr] || 1) + 1;
        
        await db.collection('users').doc(this.userData.uid).update({
            attributes: newAttributes,
            attributePoints: this.userData.attributePoints - 1
        });
        
        this.userData.attributes = newAttributes;
        this.userData.attributePoints--;
        
        this.updateUI();
    }

    updateUI() {
        if (!this.userData) return;
        
        document.getElementById('char-level').textContent = this.userData.level;
        
        const maxAttr = 20;
        ['strength', 'intelligence', 'agility', 'endurance'].forEach(attr => {
            const value = this.userData.attributes[attr] || 1;
            const percent = (value / maxAttr) * 100;
            document.getElementById(`attr-${attr}`).style.width = `${percent}%`;
            document.getElementById(`val-${attr}`).textContent = value;
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
