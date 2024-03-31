import { Scene } from 'phaser';
import { bitmapFonts, fonts } from '../utils/fontStyle';
import { FillBar } from '../ui/fill_bar';
import { EventDispatcher } from '../utils/event_dispatcher';
import { Game } from './Game'
import { restart_scenes } from '../main';
import { start_dialogue } from './Dialogue';

const STAT_MIN = 1;

// BALANCE THIS
// Change these values here to change the shop prices.
export const SHOP_PRICES = {
    move_speed: [
        150, 200, 250, 300, 350,
    ],
    bullet_speed: [
        100, 150, 200, 250, 300,
        350, 500, 600, 750, 1000,
    ],
    fire_rate: [
        100, 150, 200, 300, 400,
        500, 600, 850, 1000, 1250
    ],
    shield: [
        300, 300, 300, 300, 300,
        300, 300, 300, 300, 300
    ]
};

class MenuSpinner {
    emitter = EventDispatcher.getInstance();
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
        const totalBoxesWidth = 10 * (boxWidth + boxSpacing);
        const firstBoxX = centerX - totalBoxesWidth / 2 - 15;

        // Position the buttons relative to the center
        const minusButtonX = centerX - totalBoxesWidth / 2 - 30; // 30 is an arbitrary offset for the button
        const plusButtonX = centerX + totalBoxesWidth / 2; // 10 is an arbitrary offset for the button

        // Stat Name Text positioned above the boxes
        this.statText = scene.add.bitmapText(firstBoxX, y - 5, bitmapFonts.PressStart2P_Stroke, `${displayName}:`, fonts.small.sizes[bitmapFonts.PressStart2P]).setOrigin(0, 0);
        this.statText.setScale(1.2);

        // Display the current upgrade cost
        this.upgradeCostText = scene.add.bitmapText(plusButtonX + 100, y + 15, bitmapFonts.PressStart2P_Stroke, '', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]).setOrigin(0.5, 0);

        // Minus Button
        this.minusButton = scene.add.bitmapText(minusButtonX, y + 25, bitmapFonts.PressStart2P_Stroke, '-', fonts.small.sizes[bitmapFonts.PressStart2P]).setOrigin(0.5, 0).setInteractive();
        this.minusButton.setScale(1.5);

        // Plus Button
        this.plusButton = scene.add.bitmapText(plusButtonX, y + 25, bitmapFonts.PressStart2P_Stroke, '+', fonts.small.sizes[bitmapFonts.PressStart2P]).setOrigin(0.5, 0).setInteractive();
        this.plusButton.setScale(1.5);

        // Stat Boxes below the stat text
        const boxesStartX = centerX - totalBoxesWidth;
        this.fill_bar = new FillBar(scene,
            boxesStartX + (boxWidth * 5), y + 25,
            boxWidth * 10, boxHeight,
            SHOP_PRICES[this.statKey].length
        );

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
        const newStatValue = Phaser.Math.Clamp(this.stats[this.statKey] + change, STAT_MIN, SHOP_PRICES[this.statKey].length);
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

        const permanentStats = this.scene.registry.get('player_vars') || {};
        const isMaxedOut = this.stats[this.statKey] === SHOP_PRICES[this.statKey].length;
        const canAfford = this.scene.canAffordUpgrade(this.statKey, this.stats[this.statKey]);
        const nextLevelCost = isMaxedOut ? 'Max' : this.scene.getUpgradeCost(this.statKey, this.stats[this.statKey]);
        const canDowngrade = this.stats[this.statKey] > (permanentStats[this.statKey] || STAT_MIN);

        this.fill_bar.set_value(this.stats[this.statKey]);

        // Update styles based on conditions
        this.minusButton.setTint(canDowngrade ? 0xFF0000 : 0xffffff);
        this.plusButton.setTint(canAfford && !isMaxedOut ? 0x00ff00 : 0xffffff);
        this.upgradeCostText.setText(nextLevelCost).setTint(isMaxedOut ? 0xFFD700 : (canAfford ? 0x00ff00 : 0xFF0000));
        this.statText.setText(`${this.displayName}: ${isMaxedOut ? 'Max' : this.stats[this.statKey]}`);
    }
}

class MenuButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, cb, args) {
        super(scene, x, y);
        scene.add.existing(this);

        this.border_w = 4;

        // Create the background rectangle
        this.background = scene.add.rectangle(0, 0, 0, 0, 0xFFD700);
        this.background.setOrigin(0, 0);

        this.text = scene.add.bitmapText(0, 0, bitmapFonts.PressStart2P_Stroke, text, fonts.small.sizes[bitmapFonts.PressStart2P_Stroke])
            // .setInteractive()
            .setFontSize(24)
            .setOrigin(0.5, 0.5); // Set the origin to the center of the text

        // Update the background size based on the text dimensions
        const textWidth = this.text.width + 30;
        const textHeight = this.text.height + 20;
        this.background
            .setSize(textWidth, textHeight)
            .setInteractive()

        // Position the text at the center of the background rectangle
        this.text.setPosition(textWidth / 2, textHeight / 2);

        this.btn_border = scene.add.graphics();
        this.btn_border.lineStyle(2, 0xFFFF00, 1)
            .strokeRect(0, 0, textWidth, textHeight);

        this.background
            .on('pointerover', () => {
                this.background.setFillStyle(0xFFEA00);
                this.btn_border
                    .clear()
                    .lineStyle(3, 0xFFEA00, 1)
                    .strokeRect(0, 0, textWidth, textHeight);
            })
            .on('pointerout', () => {
                this.background.setFillStyle(0xFFD700);
                this.btn_border
                    .clear()
                    .lineStyle(2, 0xFFFF00, 1)
                    .strokeRect(0, 0, textWidth, textHeight);
            })
            .on('pointerdown', () => {
                (args) ? cb(...args) : cb(args);
            });

        this.setInteractive(Phaser.Geom.Rectangle(x, y, textWidth, textHeight),
            () => {
                console.log("Yo!");
                (args) ? cb(...args) : cb(args);
            });

        this.add([this.background, this.text, this.btn_border]);
    }
}

export class Store extends Scene {
    TECHTIP_COUNT; // number of techtips defined in the JSON.
    constructor() {
        super('Store');
        this.menuSpinners = [];
        //****SET MONEY AMOUNT HERE***
        this.initialStats = {};
    }

    preload() {
        this.load.json({
            key: "techtips",
            url: "assets/data/dialogue.json",
            dataKey: "techtips",
        });
    }

    create() {
        this.techtips = this.cache.json.get("techtips");
        console.log(this.techtips);
        this.TECHTIP_COUNT = this.techtips.num_techtips;
        console.log(`TECHTIP COUNT: ${this.TECHTIP_COUNT}`);
        this.scene.remove('Game'); // I am sorry for my sins

        this.player_vars = this.registry.get('player_vars');
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
            fire_rate: 1,
            move_speed: 1,
            shield: 1,
        };

        this.add.bitmapText(this.cameras.main.width / 2, 40, bitmapFonts.PressStart2P_Stroke, "Shermie Store", fonts.large.sizes[bitmapFonts.PressStart2P]).setOrigin(0.5, 0);
        this.add.bitmapText(715, 190, bitmapFonts.PressStart2P_Stroke, "Cost", fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]).setOrigin(0.5, 0.5);

        //Link Player stat key to display name
        const statDefinitions = [
            { key: 'move_speed', displayName: 'Movement Speed' },
            { key: 'bullet_speed', displayName: 'Bullet Speed' },
            { key: 'fire_rate', displayName: 'Fire Rate' },
            { key: 'shield', displayName: 'Shield' },
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
        const moneyIcon = this.add.image(moneyIconX, moneyIconY, 'shermie_bux').setOrigin(0.5, 0.5).setScale(0.25);
        const moneyTextX = moneyIconX + moneyIcon.displayWidth / 2 + 5;
        const moneyTextY = moneyIconY;
        this.moneyText = this.add.bitmapText(moneyTextX, moneyTextY, bitmapFonts.PressStart2P_Stroke, `${this.player_vars.wallet}`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]).setOrigin(0, 0.5);

        new MenuButton(this,
            this.game.config.width / 2.8, this.game.config.height - 100,
            'Next Level',
            () => {
                this.initialStats = Object.assign({}, this.stats);
                this.registry.set('playerPermanentStats', Object.assign({}, this.stats));
                let playerVars = this.registry.get('player_vars');
                playerVars.stats = this.stats;
                this.registry.set('player_vars', playerVars);
                restart_scenes(this.scene);
                this.scene.start('Game', { playerStats: this.stats });
            }
        );
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY -= 2;
            this.animatedBg.tilePositionX -= 2;
        }
    }

    updateAllSpinners() {
        this.menuSpinners.forEach(spinner => spinner.updateStatDisplay());
    }

    getUpgradeCost(statKey, currentLevel) {
        return SHOP_PRICES[statKey][currentLevel];
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

}
