import { Scene } from 'phaser';
import { fonts } from '../utils/fontStyle';
import { FillBar } from '../ui/fill_bar';
import { EventDispatcher } from '../utils/event_dispatcher';
import { Game } from './Game'
import { restart_scenes } from '../main';
import { start_dialogue } from './Dialogue';
import { TextboxButton } from '../ui/textbox_button';

const STAT_MIN = 1;

// BALANCE THIS
// Change these values here to change the shop prices.
export const SHOP_PRICES = {
    move_speed: [
        150, 300, 500, 700, 1000,
    ],
    bullet_speed: [
        200, 250, 300, 350, 500,
        700, 1000, 2400, 2800, 3000,
    ],
    fire_rate: [
        200, 250, 300, 400, 500,
        1000, 1500, 2000, 2500, 3500
    ],
    shield: [
        400, 400, 400, 400, 400,
        400, 400, 400, 400, 400
    ],
    perm_spread:[5000],
    perm_pierce:[5000]
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
        const firstBoxX = centerX - totalBoxesWidth / 2 - 8;

        // Position the buttons relative to the center
        const minusButtonX = centerX - totalBoxesWidth / 2 - 30; // 30 is an arbitrary offset for the button
        const plusButtonX = centerX + totalBoxesWidth / 2 - 10 ; // 10 is an arbitrary offset for the button

        // Stat Name Text positioned above the boxes
        this.statText = scene.add.bitmapText(firstBoxX, y, fonts.small.fontName, `${displayName}:`, fonts.small .size)
            .setOrigin(0, 0)
            .setLetterSpacing(1);

        // Display the current upgrade cost
        this.upgradeCostText = scene.add.bitmapText(plusButtonX + 100, y + 15, fonts.medium.fontName, '', fonts.medium.size).setOrigin(0.5, 0);

        // Minus Button
        this.minusButton = scene.add.bitmapText(minusButtonX, y + 42 , fonts.medium.fontName, '-', fonts.medium.size).setOrigin(0.5, 0.5).setInteractive();

        // Plus Button
        this.plusButton = scene.add.bitmapText(plusButtonX, y + 42, fonts.medium.fontName, '+', fonts.medium.size).setOrigin(0.5, 0.5).setInteractive();

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
                this.minusButton.setScale(0.9);
            })
            .on('pointerup', () => {
                this.minusButton.setScale(1);
            });

        this.plusButton
            .setInteractive()
            .on('pointerdown', () => {
                this.updateStat(1);
                this.plusButton.setScale(0.9);
            })
            .on('pointerup', () => {
                this.plusButton.setScale(1);
            });

        scene.input.on('pointerup', () => {
            this.minusButton.setScale(1);
            this.plusButton.setScale(1);
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

export class Store extends Scene {
    constructor() {
        super('Store');
        this.menuSpinners = [];
        //****SET MONEY AMOUNT HERE***
        this.initialStats = {};
    }

    create() {
        this.scene.remove('Game'); // I am sorry for my sins
        let sum = SHOP_PRICES["move_speed"].reduce((partialSum, a) => partialSum + a, 0);
        sum+=SHOP_PRICES["bullet_speed"].reduce((partialSum, a) => partialSum + a, 0);
        sum+=SHOP_PRICES["fire_rate"].reduce((partialSum, a) => partialSum + a, 0);
        sum+=SHOP_PRICES["shield"].reduce((partialSum, a) => partialSum + a, 0);
        console.log("shop total: "+sum);
        this.player_vars = this.registry.get('player_vars');
        //Background
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'upgradeTilemap')
            .setOrigin(0.5, 0.5);

        const startY = 250;
        const spinnerGap = 70;

        let borderGraphics = this.add.graphics();
        const borderX = this.cameras.main.width / 5;
        const borderY = startY - 120;
        const borderWidth = 620;
        const borderHeight = 490;
        borderGraphics.fillStyle(0x2B2D31);
        borderGraphics.fillRect(borderX, borderY, borderWidth, borderHeight);
        borderGraphics.lineStyle(2, 0x808888, 1);
        borderGraphics.strokeRect(borderX, borderY, borderWidth, borderHeight);
        
        //Sets initial Character stats or replaces them with current player stats. 
        this.initialStats = Object.assign({}, this.stats);
        this.initialperm_buff = Object.assign([], this.perm_buff);

        const playerVars = this.registry.get('player_vars');
        this.stats = playerVars && playerVars.stats ? playerVars.stats : {
            bullet_speed: 1,
            fire_rate: 1,
            move_speed: 1,
            shield: 1,
        };
        this.perm_buff = playerVars && playerVars.perm_power ? playerVars.perm_power : [];

        this.add.bitmapText(this.cameras.main.width / 2, 40, fonts.large.fontName, "Shermie Store", fonts.large.size).setOrigin(0.5, 0);
        this.add.bitmapText(715, 190, fonts.medium.fontName, "Cost", fonts.medium.size).setOrigin(0.5, 0.5);

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
        this.PermPowerSpreadCost = this.add.bitmapText(274, 540, fonts.medium.fontName, SHOP_PRICES["perm_spread"][0], fonts.medium.size).setOrigin(0.5, 0).setScale(0.75).setTint(this.perm_buff.includes("spread") ? 0xFFD700:(this.canAffordUpgrade("perm_spread", 0) ? 0x00ff00 : 0xFF0000));
        this.add.image(274, 585, 'spreadshot_icon').setInteractive()
        .on('pointerdown', () => {
            if (!this.perm_buff.includes("spread") && this.canAffordUpgrade("perm_spread", 0)) {
                this.perm_buff.push("spread");
                this.purchaseUpgrade("perm_spread", 1);
                this.PermPowerSpreadCost.setText("SOLD")
            }
            else if (this.perm_buff.includes("spread") && !this.initialperm_buff.includes("spread")) {
                this.perm_buff.splice(this.perm_buff.indexOf("spread"),1);
                this.refundUpgrade("perm_spread", 0);
                this.PermPowerSpreadCost.setText(SHOP_PRICES["perm_spread"][0]);
            }
        })
        .on('pointerup', () => {
        });
        this.PermPowerPierceCost = this.add.bitmapText(750, 540, fonts.medium.fontName, SHOP_PRICES["perm_pierce"][0], fonts.medium.size).setOrigin(0.5, 0).setScale(0.75).setTint(this.perm_buff.includes("pierce") ? 0xFFD700:(this.canAffordUpgrade("perm_pierce", 0) ?  0x00ff00:0xFF0000 ));
        this.add.image(750, 585, 'pierceshot_icon').setInteractive()
        .on('pointerdown', () => {
            if (!this.perm_buff.includes("pierce") && this.canAffordUpgrade("perm_pierce", 0)) {
                this.perm_buff.push("pierce");
                this.purchaseUpgrade("perm_pierce", 1);
                this.PermPowerPierceCost.setText("SOLD");
            }
            else if (this.perm_buff.includes("pierce") && !this.initialperm_buff.includes("pierce")) {                
                this.perm_buff.splice(this.perm_buff.indexOf("pierce"),1);
                this.refundUpgrade("perm_pierce", 0);
                this.PermPowerPierceCost.setText(SHOP_PRICES["perm_pierce"][0]);
            }
        })
        .on('pointerup', () => {
        });
        //Show Shermie Bux here
        const moneyIconX = 270;
        const moneyIconY = 190;
        const moneyIcon = this.add.image(moneyIconX, moneyIconY, 'shermie_bux').setOrigin(0.5, 0.5);
        const moneyTextX = moneyIconX + moneyIcon.displayWidth / 2 + 10;
        const moneyTextY = moneyIconY + 2;
        this.moneyText = this.add.bitmapText(moneyTextX, moneyTextY, fonts.medium.fontName, `${this.player_vars.wallet}`, fonts.medium.size).setOrigin(0, 0.5);

        this.next_level_btn = new TextboxButton(this,
            this.game.config.width / 2, 700,
            180, 50,
            'Next Level',
            () => { // callback function
                this.initialStats = Object.assign({}, this.stats);
                this.registry.set('playerPermanentStats', Object.assign({}, this.stats));
                let playerVars = this.registry.get('player_vars');
                playerVars.stats = this.stats;
                playerVars.perm_power =this.perm_buff;
                this.registry.set('player_vars', playerVars);
                this.registry.set('level', this.registry.get('level') + 1);
                restart_scenes(this.scene);
                this.scene.start('Game', { playerStats: this.stats });
            }, []
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
        this.PermPowerPierceCost.setTint(this.perm_buff.includes("pierce") ? 0xFFD700:(this.canAffordUpgrade("perm_pierce", 0) ?  0x00ff00: 0xFF0000));
        this.PermPowerSpreadCost.setTint(this.perm_buff.includes("spread") ? 0xFFD700:(this.canAffordUpgrade("perm_spread", 0) ? 0x00ff00  : 0xFF0000));
    }

    refundUpgrade(statKey, currentLevel) {
        const refundAmount = this.getRefundAmount(statKey, currentLevel + 1);
        this.player_vars.wallet += refundAmount;
        this.moneyText.setText(`${this.player_vars.wallet}`);
        this.PermPowerPierceCost.setTint(this.perm_buff.includes("pierce") ? 0xFFD700:(this.canAffordUpgrade("perm_pierce", 0) ?  0x00ff00: 0xFF0000));
        this.PermPowerSpreadCost.setTint(this.perm_buff.includes("spread") ? 0xFFD700:(this.canAffordUpgrade("perm_spread", 0) ? 0x00ff00  : 0xFF0000));
    }

    getRefundAmount(statKey, level) {
        // Assuming refund is full price of last upgrade (you can adjust the formula)
        return this.getUpgradeCost(statKey, level - 1);
    }

}
