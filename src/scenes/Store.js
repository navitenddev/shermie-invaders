import { Scene } from 'phaser';
import { fonts } from '../utils/fontStyle.js';

const STAT_MIN = 1, STAT_MAX = 10;
class MenuSpinner {
    constructor(scene, y, statKey, stats, onUpgrade, displayName) {
        this.displayName = displayName;
        this.scene = scene;
        this.statKey = statKey;
        this.stats = stats;
        this.onUpgrade = onUpgrade;

        const centerX = scene.cameras.main.width / 2.25;
        const boxHeight = 30;
        const boxWidth = 30;
        const boxSpacing = 2;
        const totalBoxesWidth = STAT_MAX * (boxWidth + boxSpacing);
        const firstBoxX = centerX - totalBoxesWidth / 2 - 15;

        // Position the buttons relative to the center
        const minusButtonX = centerX - totalBoxesWidth / 2 - 30; // 30 is an arbitrary offset for the button
        const plusButtonX = centerX + totalBoxesWidth / 2; // 10 is an arbitrary offset for the button

        // Stat Name Text positioned above the boxes
        this.statText = scene.add.text(firstBoxX, y - 5, `${displayName}:`, fonts.small).setOrigin(0, 0);
        this.statText.setScale(1.2);

        // Display the current upgrade cost
        this.upgradeCostText = scene.add.text(plusButtonX + 100, y + 15, '', fonts.medium).setOrigin(0.5, 0);

        // Minus Button
        this.minusButton = scene.add.text(minusButtonX, y + 25, '-', fonts.small).setOrigin(0.5, 0).setInteractive();
        this.minusButton.setScale(1.5);

        // Plus Button
        this.plusButton = scene.add.text(plusButtonX, y + 25, '+', fonts.small).setOrigin(0.5, 0).setInteractive();
        this.plusButton.setScale(1.5);

        // Stat Boxes below the stat text
        this.statBoxes = [];
        const boxesStartX = centerX - totalBoxesWidth / 2;
        for (let i = 0; i < STAT_MAX; i++) {
            this.statBoxes.push(scene.add.rectangle(boxesStartX + i * (boxWidth + boxSpacing), y + 40, boxWidth, boxHeight, 0xffffff).setStrokeStyle(2, 0x000000));
        }

        //Interactive minus and plus buttons
        this.minusButton
            .setInteractive()
            .on('pointerdown', () => {
                this.updateStat(-1);
                this.minusButton.setScale(1.2);
            })
            .on('pointerup', () => {
                this.minusButton.setScale(1.5);
            });

        this.plusButton
            .setInteractive()
            .on('pointerdown', () => {
                this.updateStat(1);
                this.plusButton.setScale(1.2);
            })
            .on('pointerup', () => {
                this.plusButton.setScale(1.5);
            });

        // Initial display update
        this.updateStatDisplay();
    }

    updateStat(change) {
        const newStatValue = Phaser.Math.Clamp(this.stats[this.statKey] + change, STAT_MIN, STAT_MAX);
        const initialStatValue = this.scene.initialStats[this.statKey] || STAT_MIN;
        // Handle increase
        if (change > 0 && newStatValue > this.stats[this.statKey] && this.scene.canAffordUpgrade(this.statKey, this.stats[this.statKey])) {
            this.stats[this.statKey] = newStatValue;
            this.scene.purchaseUpgrade(this.statKey, this.stats[this.statKey]);
        }
        // Handle decrease (Sell back) only if above initial or minimum value
        else if (change < 0 && this.stats[this.statKey] > initialStatValue) {
            this.stats[this.statKey] = newStatValue;
            this.scene.refundUpgrade(this.statKey, this.stats[this.statKey]);
        }
        console.log(`Modified ${this.displayName} to ${this.stats[this.statKey]}`);

        this.updateStatDisplay();
        this.scene.updateAllSpinners(); // Ensure other spinners are also updated if necessary
    }

    updateStatDisplay() {
        if (!this.scene || !this.upgradeCostText || this.upgradeCostText.scene !== this.scene) {
            console.warn("Catching warning on Update stat Display");
            return;
        }

        const permanentStats = this.scene.registry.get('playerPermanentStats') || {};
        const isMaxedOut = this.stats[this.statKey] === STAT_MAX;
        const canAfford = this.scene.canAffordUpgrade(this.statKey, this.stats[this.statKey]);
        const nextLevelCost = isMaxedOut ? 'Max' : this.scene.getUpgradeCost(this.statKey, this.stats[this.statKey]);
        // Determine if downgrading is possible based on whether the current stat level is greater than the permanent stat level.
        const canDowngrade = this.stats[this.statKey] > (permanentStats[this.statKey] || STAT_MIN);

        this.statBoxes.forEach((box, index) => {
            const isPermanent = index < permanentStats[this.statKey];
            box.setFillStyle(isPermanent ? 0xFFD700 : (index < this.stats[this.statKey] ? 0x00ff00 : 0xffffff));
        });

        // Update styles based on conditions
        this.minusButton.setStyle({
            color: canDowngrade ? '#FF0000' : '#ffffff'
        });
        this.plusButton.setFill(canAfford && !isMaxedOut ? '#00ff00' : '#ffffff');
        this.upgradeCostText.setText(nextLevelCost).setFill(isMaxedOut ? '#FFD700' : (canAfford ? '#00ff00' : '#FF0000'));
        this.statText.setText(`${this.displayName}: ${isMaxedOut ? 'Max' : this.stats[this.statKey]}`);
    }

}
export class Store extends Scene {
    constructor() {
        super('Store');
        this.menuSpinners = [];
        //****SET MONEY AMOUNT HERE***
        this.initialStats = {};
    }

    create() {
        this.player_vars = this.registry.get('player_vars')
        //Background
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'upgradeTilemap')
            .setOrigin(0.5, 0.5);

        const startY = 250;
        const spinnerGap = 70;

        let borderGraphics = this.add.graphics();
        borderGraphics.lineStyle(2, 0xffffff, 1);
        const borderX = this.cameras.main.width / 5;
        const borderY = startY - 120;
        const borderWidth = 620;
        const borderHeight = 450;
        borderGraphics.fillStyle(0x808080, .9);
        borderGraphics.fillRoundedRect(borderX, borderY, borderWidth, borderHeight, 20);

        //Sets initial Character stats or replaces them with current player stats. 
        this.initialStats = Object.assign({}, this.stats);
        const playerVars = this.registry.get('player_vars');
        this.stats = playerVars && playerVars.stats ? playerVars.stats : {
            bullet_speed: 1,
            max_bullets: 1,
            fire_rate: 1,
            move_speed: 1
        };

        this.add.text(this.cameras.main.width / 2, 40, "Shermie Store", fonts.large).setOrigin(0.5, 0);
        this.add.text(715, 190, "Cost", fonts.medium).setOrigin(0.5, 0.5);

        //Link Player stat key to display name
        const statDefinitions = [
            { key: 'move_speed', displayName: 'Movement Speed' },
            { key: 'bullet_speed', displayName: 'Bullet Speed' },
            { key: 'fire_rate', displayName: 'Fire Rate' },
            { key: 'max_bullets', displayName: 'Max Bullets' }
        ];

        //Update and initialize new spinners 
        this.menuSpinners.forEach(spinner => {
            spinner.updateStatDisplay();
        });

        statDefinitions.forEach((statDef, index) => {
            const spinner = new MenuSpinner(
                this,
                startY + index * spinnerGap,
                statDef.key,
                this.stats,
                this.onUpgrade.bind(this),
                statDef.displayName
            );
            this.menuSpinners.push(spinner);
            if (playerVars && playerVars[statDef.key] === this.stats[statDef.key]) {
                spinner.makePermanent();
            }
        });

        //Show Shermie Bux here
        const moneyIconX = 270;
        const moneyIconY = 190;
        const moneyIcon = this.add.image(moneyIconX, moneyIconY, 'shermie_coin').setOrigin(0.5, 0.5).setScale(0.12);
        const moneyTextX = moneyIconX + moneyIcon.displayWidth / 2 + 5;
        const moneyTextY = moneyIconY;
        this.moneyText = this.add.text(moneyTextX, moneyTextY, `${this.player_vars.wallet}`, fonts.medium).setOrigin(0, 0.5);

        //Next level button
        let nextLevelButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 100, 'Next Level?', {
            ...fonts.small,
            padding: { left: 15, right: 15, top: 10, bottom: 10 },
            backgroundColor: '#FFD700',
            borderRadius: 10,
        })
            .setInteractive()
            .setFontSize(24)
            .setOrigin(0.5, 0);

        let nextLevelButtonBorder = this.add.graphics();
        nextLevelButtonBorder.lineStyle(2, 0xFFFF00, 1);
        let buttonRect = nextLevelButton.getBounds();

        nextLevelButtonBorder.strokeRoundedRect(buttonRect.x - 5, buttonRect.y - 5, buttonRect.width + 10, buttonRect.height + 10, 10);

        nextLevelButton.on('pointerover', () => {
            nextLevelButton.setStyle({ fill: '#FFEA00' });
            nextLevelButtonBorder.clear().lineStyle(3, 0xFFEA00, 1);
            nextLevelButtonBorder.strokeRoundedRect(buttonRect.x - 5, buttonRect.y - 5, buttonRect.width + 10, buttonRect.height + 10, 10);
        })
            .on('pointerout', () => {
                nextLevelButton.setStyle({ fill: '#FFFFFF' });
                nextLevelButtonBorder.clear().lineStyle(2, 0xFFFF00, 1);
                nextLevelButtonBorder.strokeRoundedRect(buttonRect.x - 5, buttonRect.y - 5, buttonRect.width + 10, buttonRect.height + 10, 10);
            })
            .on('pointerdown', () => {
                this.initialStats = Object.assign({}, this.stats);
                this.registry.set('playerPermanentStats', Object.assign({}, this.stats));
                let playerVars = this.registry.get('player_vars');
                playerVars.stats = this.stats;
                this.registry.set('player_vars', playerVars);
                this.scene.start('Game', { playerStats: this.stats });
            });
    }

    updateAllSpinners() {
        this.menuSpinners.forEach(spinner => spinner.updateStatDisplay());
    }

    getUpgradeCost(statKey, currentLevel) {
        // Define base costs for each stat
        const baseCosts = {
            move_speed: 75,
            bullet_speed: 105,
            fire_rate: 150,
            max_bullets: 420
        };

        // cost increases linearly. 
        return baseCosts[statKey] * (currentLevel + 1);
    }

    onUpgrade(statKey, newStatValue) {
        if (this.canAffordUpgrade(statKey, newStatValue - 1)) {
            this.purchaseUpgrade(statKey, newStatValue - 1);
            return true; // Return true to indicate the upgrade was successful
        }
        return false;
    }

    canAffordUpgrade(statKey, currentLevel) {
        const cost = this.getUpgradeCost(statKey, currentLevel);
        return this.player_vars.wallet >= cost;
    }

    purchaseUpgrade(statKey, currentLevel) {
        const cost = this.getUpgradeCost(statKey, currentLevel - 1);
        this.player_vars.wallet -= cost;
        this.moneyText.setText(`${this.player_vars.wallet}`);
    }

    refundUpgrade(statKey, currentLevel) {
        const refundAmount = this.getRefundAmount(statKey, currentLevel + 1);
        this.player_vars.wallet += refundAmount;
        this.moneyText.setText(`${this.player_vars.wallet}`);
    }

    getRefundAmount(statKey, level) {
        // Assuming refund is full price of last upgrade (you can adjust the formula)
        return this.getUpgradeCost(statKey, level - 1);
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY -= 2;
            this.animatedBg.tilePositionX -= 2;
        }
    }
}
