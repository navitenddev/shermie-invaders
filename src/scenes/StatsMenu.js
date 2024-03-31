import { Scene } from 'phaser';
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { SHOP_PRICES } from './Store.js';

const STAT_MIN = 1;
/**
 * @description A UI component which has a - + around some text to change a numerical value
 * Note: If we end up creating components that we wish to reuse, we should
 * create a ui_components.js file in utils.  
 */
class MenuSpinner {
    text_value; // text object that displays the value of the current stat
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
        let text_value = scene.add.bitmapText(x + w - 40, y, bitmapFonts.PressStart2P_Stroke, obj[key], fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]);

        // MIN button
        scene.add.bitmapText(x - 60, y, bitmapFonts.PressStart2P_Stroke, 'MIN', fonts.small.sizes[bitmapFonts.PressStart2P_Stroke])
            .setInteractive()
            .on('pointerdown', function () {
                if (key === 'lives') // LOL
                    obj[key] = Phaser.Math.Clamp(0, 1, 10);
                else
                    obj[key] = Phaser.Math.Clamp(0, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
                this.setTint(0xff0000);
            })
            .on('pointerup', function () {
                this.setTint(0xffffff);
            })
            .on('pointerout', function () {
                this.setTint(0xffffff);
            });

        // - button
        scene.add.bitmapText(x, y, bitmapFonts.PressStart2P_Stroke, '-', fonts.small.sizes[bitmapFonts.PressStart2P_Stroke])
            .setInteractive()
            .on('pointerdown', function () {
                if (key == 'lives') // LOL
                    obj[key] = Phaser.Math.Clamp(obj[key] - 1, 1, 10);
                else
                    obj[key] = Phaser.Math.Clamp(obj[key] - 1, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
                this.setTint(0xff0000);
            })
            .on('pointerup', function () {
                this.setTint(0xffffff);
            })
            .on('pointerout', function () {
                this.setTint(0xffffff);
            });



        // + button
        scene.add.bitmapText(x + w, y, bitmapFonts.PressStart2P_Stroke, '+', fonts.small.sizes[bitmapFonts.PressStart2P_Stroke])
            .setInteractive()
            .on('pointerdown', function () {
                if (key === 'lives') // LOL
                    obj[key] = Phaser.Math.Clamp(obj[key] + 1, 1, 10);
                else
                    obj[key] = Phaser.Math.Clamp(obj[key] + 1, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
                this.setTint(0xff0000);
            })
            .on('pointerup', function () {
                this.setTint(0xffffff);
            })
            .on('pointerout', function () {
                this.setTint(0xffffff);
            });

        // MAX button
        scene.add.bitmapText(x + w + 30, y, bitmapFonts.PressStart2P_Stroke, 'MAX', fonts.small.sizes[bitmapFonts.PressStart2P_Stroke])
            .setInteractive()
            .on('pointerdown', function () {
                if (key === 'lives') // LOL
                    obj[key] = Phaser.Math.Clamp(100, 1, 10);
                else
                    obj[key] = Phaser.Math.Clamp(100, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
                this.setTint(0xff0000);
            })
            .on('pointerup', function () {
                this.setTint(0xffffff);
            })
            .on('pointerout', function () {
                this.setTint(0xffffff);
            });

        scene.add.bitmapText(x + 50, y, bitmapFonts.PressStart2P_Stroke, text, fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]);
    }
}

/** 
 * @description A test callback function to demonstrate how IconButton is used.
 */
function test_cb(arg1, arg2) {
    console.log(`test_cb operational, my args are "${arg1}" and "${arg2}"!`);
}

/**
 * @classdesc A button with an icon as its surface that calls cb with args when
 * clicked.
 */
class IconButton extends Phaser.GameObjects.Image {
    /**
     * @param {Phaser.scene} scene The scene to add the button into
     * @param {string} icon The asset key of the image defined in Preloader.js
     * @param {number} x top-left x-coordinate of the button
     * @param {number} y top-right y-coordinate of the button
     * @callback cb Callback function that is used when button is clicked
     * @param {Array<any>} args A variadic number of arguments to pass into cb when it's called
     * @example new IconButton(this, 'placeholder', 300, 500, test_cb, ["mooo", "meow"]);
     */
    constructor(scene, icon, x, y, cb, args = []) {
        console.log(icon)
        super(scene, x, y, icon);
        scene.add.existing(this);
        this.setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                // do visual indicator that button was clicked
            })
            .on('pointerup', () => {
                // call the callback with the given arguments
                cb(...args);
            })
    }
};


export class StatsMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('StatsMenu');
    }

    create() {
        this.player_vars = this.registry.get('player_vars');

        const menuSpacing = 60;
        const boxWidth = 610;

        // if/when we add new stats, create a new spinner for it by defining it
        // here. Note, this will only work in the for loop if the variable we
        // are working with is in this.player_vars.stats
        const spinner_defs = [
            // [key, name_to_display]
            ['move_speed', 'Move Speed'],
            ['bullet_speed', 'Bullet Speed'],
            ['fire_rate', 'Fire Rate'],
            ['shield', 'Shield']
        ];

        const boxHeight = (spinner_defs.length + 3) * menuSpacing + 20;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        this.keys.p.on('down', () => this.go_back());
        this.keys.esc.on('down', () => this.go_back());
        this.keys.m.on('down', () => this.sounds.toggle_mute());

        let x = boxX + 145;
        let y = boxY + 40;
        let w = 300;

        // the player lives are not in stats, so we need to make this menu
        // spinner manually.
        new MenuSpinner(this, x, y, w, 'Lives', this.player_vars, 'lives');
        y += menuSpacing;

        for (let sd of spinner_defs) {
            new MenuSpinner(this, x, y, w, sd[1], this.player_vars.stats, sd[0]);
            y += menuSpacing;
        }

        this.levelSkipButton = this.add.bitmapText(0, 0, bitmapFonts.PressStart2P_Stroke, 'KILL ALL ENEMIES', fonts.small.sizes[bitmapFonts.PressStart2P])
            .setInteractive()
            .on('pointerdown', () => {
                this.emitter.emit('kill_all_enemies');
            })
            .setOrigin(0.5)
            .setPosition(boxX + boxWidth / 2, y)
            .setTint(0xffffff)
            .on('pointerover', () => {
                buttonBackground.clear().fillStyle(0xFFFFFF, 1).fillRect(0, 0, buttonWidth, buttonHeight);
            })
            .on('pointerout', () => {
                buttonBackground.clear().fillStyle(0xff0000, 1).fillRect(0, 0, buttonWidth, buttonHeight);
            });

        // red background for the button
        const buttonWidth = this.levelSkipButton.width + 40;
        const buttonHeight = this.levelSkipButton.height + 20;
        const buttonX = boxX + (boxWidth - buttonWidth) / 2;
        const buttonY = y - buttonHeight / 2;

        const buttonBackground = this.add.graphics({ x: buttonX, y: buttonY });
        buttonBackground.fillStyle(0xff0000, 1);
        buttonBackground.fillRect(0, 0, buttonWidth, buttonHeight);
        buttonBackground.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains)
            .on('pointerdown', () => {
                this.emitter.emit('kill_all_enemies');
            })
            .on('pointerover', () => {
                buttonBackground.clear().fillStyle(0xFFFFFF, 1).fillRect(0, 0, buttonWidth, buttonHeight);
            })
            .on('pointerout', () => {
                buttonBackground.clear().fillStyle(0xff0000, 1).fillRect(0, 0, buttonWidth, buttonHeight);
            });

        this.levelSkipButton.setDepth(1);
        this.levelSkipButton.setPosition(buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

        y += menuSpacing;
        const backButtonX = boxX + boxWidth / 2;
        this.backButton = this.add.bitmapText(backButtonX, y, bitmapFonts.PressStart2P_Stroke, 'Back', fonts.small.sizes[bitmapFonts.PressStart2P])
            .setOrigin(0.5, 0)
            .setInteractive()
            .on('pointerdown', () => { this.sounds.bank.sfx.click.play(); this.go_back(); });

        // Note: This is a quick example on how the IconButton should be used. Feel free to uncomment it and play around with it first if you need to add a new powerup to the game.
        // new IconButton(this, 'placeholder', 300, 500, test_cb, ["mooo", "meow"]);
    }

    go_back() {
        this.scene.stop('StatsMenu');
        this.scene.start('PauseMenu');
    }
}