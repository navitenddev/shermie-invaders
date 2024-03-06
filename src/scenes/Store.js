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
        const plusButtonX = centerX + totalBoxesWidth / 2 ; // 10 is an arbitrary offset for the button

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
        if (newStatValue > this.stats[this.statKey] && this.scene.canAffordUpgrade(this.statKey, this.stats[this.statKey])) {
            this.stats[this.statKey] = newStatValue;
            this.scene.purchaseUpgrade(this.statKey, this.stats[this.statKey]);
            this.updateStatDisplay();
        }
        this.scene.updateAllSpinners();
    }

    updateStatDisplay() {
        // Use this.displayName to access the displayName within the class
        this.statBoxes.forEach((box, index) => {
            box.setFillStyle(index < this.stats[this.statKey] ? 0x00ff00 : 0xffffff);
        });

        // Update buttons based on current stat value
        this.minusButton.setStyle({ color: this.stats[this.statKey] > STAT_MIN ? '#FF0000' : '#ffffff' });
        this.plusButton.setStyle({ color: this.stats[this.statKey] < STAT_MAX ? '#00ff00' : '#ffffff' });

        // If the stat is maxed out, show 'Max'
        if (this.stats[this.statKey] === STAT_MAX) {
            this.statText.setText(`${this.displayName}: Max`);
        } else {
            this.statText.setText(`${this.displayName}: ${this.stats[this.statKey]}`);
        }

        const canAfford = this.scene.canAffordUpgrade(this.statKey, this.stats[this.statKey]);
        this.plusButton.setFill(canAfford ? '#00ff00' : '#ffffff'); // Green if can afford, white if not
        this.plusButton.setInteractive(canAfford);

        // Display the upgrade cost
        if (this.stats[this.statKey] < STAT_MAX) {
            const nextLevelCost = this.scene.getUpgradeCost(this.statKey, this.stats[this.statKey]);
            this.upgradeCostText.setText(nextLevelCost);
        } else {
            this.upgradeCostText.setText('Max');
        }

    }
}

export class Store extends Scene {
    constructor() {
        super('Store');
        this.menuSpinners = [];
        this.money = 6969;
    }

    create() {

        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'upgradeTilemap')
            .setOrigin(0.5, 0.5);

        const startY = 250; // Starting y position for the first spinner
        const spinnerGap = 70; // Gap between each spinner to account for text and boxes

        const savedStats = this.registry.get('playerStats') || {
            move_speed: 1, // default values if stats have not been saved yet
            bullet_speed: 1,
            fire_rate: 1,
            max_bullets: 1
        };

        this.stats = {
            move_speed: 1,
            bullet_speed: 1,
            fire_rate: 1,
            max_bullets: 1
        };

        // Display shop name at the top
        this.add.text(this.cameras.main.width / 2, 40, "Shermie Store", fonts.large).setOrigin(0.5, 0);

        const statDefinitions = [
            { key: 'move_speed', displayName: 'Movement Speed' },
            { key: 'bullet_speed', displayName: 'Bullet Speed' },
            { key: 'fire_rate', displayName: 'Fire Rate' },
            { key: 'max_bullets', displayName: 'Max Bullets' }
        ];

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
                // Save the updated stats to the registry before changing the scene
                this.registry.set('player_vars', {
                    ...this.registry.get('player_vars'), // Spread existing player_vars to maintain other properties
                    stats: this.stats // Update stats with the new values
                });
                this.scene.start('Game');
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

    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY -= 2;
            this.animatedBg.tilePositionX -= 2;
        }
    }
}
