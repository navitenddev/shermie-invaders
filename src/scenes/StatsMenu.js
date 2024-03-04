import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';

const STAT_MIN = 1, STAT_MAX = 10;
/**
 * @description A UI component which has a - + around some text to change a numerical value
 * Note: If we end up creating components that we wish to reuse, we should
 * create a ui_components.js file in utils.  
 */
class MenuSpinner {
    /**
     * @constructor
     * @param {Phaser.Scene} scene Scene to add spinner to
     * @param {number} x top-left x coordinate of spinner component
     * @param {number} y top-left y coordinate of spinner component
     * @param {number} w width of spinner component
     * @param {string} text Text of the spinner
     * @param {Object<string, number>} obj object containing the value being modified
     * @param {string} key They key of the object to modify
     */
    constructor(scene, x, y, w, text, obj, key) {
        // - button
        this.minus = scene.add.text(x, y, '-', fonts.small)
            .setInteractive()
            .on('pointerdown', function () {
                obj[key] = Math.max(obj[key] - 1, STAT_MIN);
                this.setStyle({ color: '#ff0000' });
            })
            .on('pointerup', function () {
                this.setStyle(fonts.small);
                console.log(`Modified ${text} to ${obj[key]}`);
            });
        // + button
        scene.add.text(x + w, y, '+', fonts.small)
            .setInteractive()
            .on('pointerdown', function () {
                obj[key] = Math.min(obj[key] + 1, STAT_MAX);
                this.setStyle({ color: '#ff0000' });
            })
            .on('pointerup', function () {
                this.setStyle(fonts.small);
                console.log(`Modified ${text} to ${obj[key]}`);
            });

        scene.add.text(x + 50, y, text, fonts.small);
    }
}

export class StatsMenu extends Scene {
    constructor() {
        super('StatsMenu');
    }

    create() {
        this.player_vars = this.registry.get('player_vars');
        const boxWidth = 610;
        const boxHeight = 320;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

        this.backButton = this.add.text(boxX + 260, boxY + 250, 'Back', fonts.small)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop('StatsMenu');
                this.scene.start('PauseMenu');
            });

        let x = boxX + 145,
            y = boxY + 50,
            w = 300,
            y_gap = 50;

        // if/when we add new stats, create a new spinner for it by defining it
        // here
        const spinner_defs = [
            // [key, name_to_display]
            ['move_speed', 'Move Speed'],
            ['bullet_speed', 'Bullet Speed'],
            ['fire_rate', 'Fire Rate'],
            ['max_bullets', 'Maximum Bullets'],
        ]

        let i = 0;
        for (let sd of spinner_defs)
            new MenuSpinner(this, x, y + (y_gap * i++), w,
                sd[1], this.player_vars.stats, sd[0]);
    }
}