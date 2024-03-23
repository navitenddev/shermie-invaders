import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { SHOP_PRICES } from './Store.js';

const STAT_MIN = 1;
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
                if (key === 'lives') // LOL
                    obj[key] = Math.min(obj[key] + 1, 10);
                else
                    obj[key] = Math.min(obj[key] + 1, SHOP_PRICES[key].length);
                this.setStyle({ color: '#ff0000' });
            })
            .on('pointerup', function () {
                this.setStyle(fonts.small);
                console.log(`Modified ${text} to ${obj[key]}`);
            });

        scene.add.text(x + 50, y, text, fonts.small);
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
        const boxWidth = 610;
        const boxHeight = 340;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        this.keys.p.on('down', () => this.go_back());
        this.keys.esc.on('down', () => this.go_back());
        this.keys.m.on('down', () => this.sounds.toggle_mute())

        let x = boxX + 145,
            y = boxY + 50,
            w = 300,
            y_gap = 50;

        // the player lives are not in stats, so we need to make this menu
        // spinner manually.
        new MenuSpinner(this, x, y, w, 'Lives', this.player_vars, 'lives');
        // if/when we add new stats, create a new spinner for it by defining it
        // here. Note, this will only work in the for loop if the variable we
        // are working with is in this.player_vars.stats
        const spinner_defs = [
            // [key, name_to_display]
            ['move_speed', 'Move Speed'],
            ['bullet_speed', 'Bullet Speed'],
            ['fire_rate', 'Fire Rate'],
            ['shield', 'Shield']
        ]

        let i = 1;
        for (let sd of spinner_defs)
            new MenuSpinner(this, x, y + (y_gap * i++), w,
                sd[1], this.player_vars.stats, sd[0]);

        this.levelSkipButton = this.add.text(x, y + (y_gap * i), 'KILL ALL ENEMIES', fonts.small)
            .setInteractive()
            .on('pointerdown', () => {
                this.emitter.emit('kill_all_enemies');
            })
            .setStyle({ fill: '#ff0000' });

        i++;

        this.backButton = this.add.text(boxX + 260, y + (y_gap * i), 'Back', fonts.small)
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