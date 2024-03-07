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

        const centerX = scene.cameras.main.width / 2;
        const boxHeight = 30;
        const boxWidth = 30;
        const boxSpacing = 2; // The spacing between boxes
        const totalBoxesWidth = STAT_MAX * (boxWidth + boxSpacing);
        const firstBoxX = centerX - totalBoxesWidth / 2 - 15;

        // Position the buttons relative to the center
        const minusButtonX = centerX - totalBoxesWidth / 2 - 30; // 30 is an arbitrary offset for the button
        const plusButtonX = centerX + totalBoxesWidth / 2; // 10 is an arbitrary offset for the button

        // Stat Name Text positioned above the boxes
        this.statText = scene.add.text(firstBoxX, y, `${displayName}:`, fonts.small).setOrigin(0, 0);

        // Display the current upgrade cost
        this.upgradeCostText = scene.add.text(plusButtonX + 100, y + 15, '', fonts.medium).setOrigin(0.5, 0);

        // Minus Button
        this.minusButton = scene.add.text(minusButtonX, y + 25, '-', fonts.small).setOrigin(0.5, 0).setInteractive();
        this.minusButton.setScale(1.5);

        // Plus Button
        this.plusButton = scene.add.text(plusButtonX, y + 25, '+', fonts.small).setOrigin(0.5, 0).setInteractive();
        this.plusButton.setScale(1.5);

        // Stat Boxes positioned below the stat text
        this.statBoxes = [];
        const boxesStartX = centerX - totalBoxesWidth / 2;
        for (let i = 0; i < STAT_MAX; i++) {
            this.statBoxes.push(scene.add.rectangle(boxesStartX + i * (boxWidth + boxSpacing), y + 40, boxWidth, boxHeight, 0xffffff).setStrokeStyle(2, 0x000000));
        }

        this.minusButton
            .setInteractive()
            .on('pointerdown', () => {
                this.updateStat(-1);
                this.minusButton.setScale(1.2); // Makes the button look pressed
            })
            .on('pointerup', () => {
                this.minusButton.setScale(1.5); // Reverts the button to original scale
            });

        // Interactive styling for the plus button
        this.plusButton
            .setInteractive()
            .on('pointerdown', () => {
                this.updateStat(1);
                this.plusButton.setScale(1.2); // Makes the button look pressed
            })
            .on('pointerup', () => {
                this.plusButton.setScale(1.5); // Reverts the button to original scale
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

        this.updateStatDisplay();
        this.scene.updateAllSpinners(); // Ensure other spinners are also updated if necessary
    }

    updateStatDisplay() {
        if (!this.scene || !this.upgradeCostText || this.upgradeCostText.scene !== this.scene) {
            console.warn("Attempting to update stats outside of active scene");
            return;
        }

        // Define the gold color for maxed-out stats
        const permanentStats = this.scene.registry.get('playerPermanentStats') || {};
        const goldColor = '#FFD700';
        const greenColor = '#00FF00';
        const redColor = '#FF0000';

        this.statBoxes.forEach((box, index) => {
            const isPermanent = index < permanentStats[this.statKey];
            box.setFillStyle(isPermanent ? 0xFFD700 : (index < this.stats[this.statKey] ? 0x00ff00 : 0xffffff));
        });

        this.minusButton.setStyle({ color: this.stats[this.statKey] > STAT_MIN ? '#FF0000' : '#ffffff' });
        this.plusButton.setStyle({ color: this.stats[this.statKey] < STAT_MAX ? '#00ff00' : '#ffffff' });

        if (this.stats[this.statKey] === STAT_MAX) {
            this.statText.setText(`${this.displayName}: Max`);
            this.upgradeCostText.setText('Max').setFill(goldColor);
        } else {
            this.statText.setText(`${this.displayName}: ${this.stats[this.statKey]}`);
            const nextLevelCost = this.scene.getUpgradeCost(this.statKey, this.stats[this.statKey]);
            this.upgradeCostText.setText(`${nextLevelCost}`);

            // Determine if the upgrade is affordable and set the color accordingly
            const canAfford = this.scene.canAffordUpgrade(this.statKey, this.stats[this.statKey]);
            this.plusButton.setFill(canAfford ? greenColor : redColor); // Update plusButton for consistency
            this.upgradeCostText.setFill(canAfford ? greenColor : redColor);
        }

        // If the stat is maxed out, we already set the text to 'Max' and color to gold above
    }
}
export class Store extends Scene {
    constructor() {
        super('Store');
        this.menuSpinners = [];
        this.money = 6969;
        this.initialStats = {};
    }

    create() {

        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'upgradeTilemap')
            .setOrigin(0.5, 0.5);

        const startY = 250; // Starting y position for the first spinner
        const spinnerGap = 70; // Gap between each spinner to account for text and boxes

        this.initialStats = Object.assign({}, this.stats);

        const playerPermanentStats = this.registry.get('playerPermanentStats') || {};
        const playerVars = this.registry.get('player_vars');
        this.stats = playerVars && playerVars.stats ? playerVars.stats : {
            bullet_speed: 1,
            max_bullets: 1,
            fire_rate: 1,
            move_speed: 1
        };

        // Display shop name at the top
        this.add.text(this.cameras.main.width / 2, 40, "Shermie Store", fonts.large).setOrigin(0.5, 0);

        const statDefinitions = [
            { key: 'move_speed', displayName: 'Movement Speed' },
            { key: 'bullet_speed', displayName: 'Bullet Speed' },
            { key: 'fire_rate', displayName: 'Fire Rate' },
            { key: 'max_bullets', displayName: 'Max Bullets' }
        ];

        this.menuSpinners.forEach(spinner => {
            spinner.updateStatDisplay(); // This will now also check for permanent upgrades.
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
            this.menuSpinners.push(spinner); // Store the reference

            if (playerVars && playerVars[statDef.key] === this.stats[statDef.key]) {
                spinner.makePermanent();
            }

            this.menuSpinners.push(spinner);
        });



        let borderGraphics = this.add.graphics();

        // Set the line style to 2 pixels thick, white color
        borderGraphics.lineStyle(2, 0xffffff, 1);

        // Starting position and dimensions for the border
        const borderX = this.cameras.main.width / 4; // Adjust as needed
        const borderY = startY -120; // Adjust based on your startY position for MenuSpinners
        const borderWidth = 600; // Should be enough to cover the stat area width
        const borderHeight = 450; // Adjust based on the number and spacing of MenuSpinners

        // Draw a rectangle border
        borderGraphics.strokeRoundedRect(borderX, borderY, borderWidth, borderHeight, 20);

        const moneyIconX = 320; // X position for the money icon
        const moneyIconY = 190; // Y position for the money icon
        const moneyIcon = this.add.image(moneyIconX, moneyIconY, 'shermie_coin').setOrigin(0.5, 0.5);
        moneyIcon.setScale(0.12); // Adjust scale according to your need

        // Create the money text next to the money icon
        const moneyTextX = moneyIconX + moneyIcon.displayWidth / 2 + 5; // X position for the money text, adjusted to be next to the icon
        const moneyTextY = moneyIconY; // Y position for the money text
        this.moneyText = this.add.text(moneyTextX, moneyTextY, `${this.money}`, {
            font: fonts.medium, // You can use your fonts.small if it's already defined with an appropriate size
            fill: '#FFC000'
        }).setOrigin(0, 0.5);

        // START NEXT LEVEL? UPDATE STATS ON CLICK
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 50, 'Next Level?', fonts.small)
            .setOrigin(0.5, 0)
            .setInteractive()
            .on('pointerdown', () => {
                //Save current stat progression for future shops
                this.initialStats = Object.assign({}, this.stats);
                this.registry.set('playerPermanentStats', Object.assign({}, this.stats));
                // Retrieve the current player_vars, update its stats, and then save it back
                let playerVars = this.registry.get('player_vars');
                playerVars.stats = this.stats; // Update stats part of player_vars

                this.registry.set('player_vars', playerVars); // Save the updated player_vars back to the registry

                this.scene.start('Game', { playerStats: this.stats }); // Navigate to the Game scene or wherever appropriate
            });

    }

    updateAllSpinners() {
        this.menuSpinners.forEach(spinner => spinner.updateStatDisplay());
    }

    getUpgradeCost(statKey, currentLevel) {
        // Define base costs for each stat. You can make this more complex if needed.
        const baseCosts = {
            move_speed: 75,
            bullet_speed: 105,
            fire_rate: 150,
            max_bullets: 420
        };

        // For this example, the cost increases linearly. You could use other formulas.
        return baseCosts[statKey] * (currentLevel + 1);
    }

    onUpgrade(statKey, newStatValue) {
        // Logic to handle the upgrade
        if (this.canAffordUpgrade(statKey, newStatValue - 1)) {
            this.purchaseUpgrade(statKey, newStatValue - 1);
            return true; // Return true to indicate the upgrade was successful
        }
        return false; // Return false if the player cannot afford the upgrade
    }

    canAffordUpgrade(statKey, currentLevel) {
        const cost = this.getUpgradeCost(statKey, currentLevel);
        return this.money >= cost;
    }

    purchaseUpgrade(statKey, currentLevel) {
        const cost = this.getUpgradeCost(statKey, currentLevel - 1);
        this.money -= cost;
        this.moneyText.setText(`${this.money}`);
    }

    refundUpgrade(statKey, currentLevel) {
        const refundAmount = this.getRefundAmount(statKey, currentLevel + 1); // +1 because we need the cost of the level we're refunding
        this.money += refundAmount;
        this.moneyText.setText(`${this.money}`);
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
