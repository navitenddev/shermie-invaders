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

// A test callback function to demonstrate how IconButton is used.
function test_cb(arg1, arg2) {
    console.log(`test_cb operational, my args are "${arg1}" and "${arg2}"!`);
}

/**
 * @classdesc Eventually, we will be adding temporary powerups to the player (or
 * maybe permament? but we'll see). Instead of stats being upgraded, it will be
 * other things like a Nuke, Spreadshot, Pentrating shot, etc. These won't be
 * associated with a numberical value for Shermie, so I'm creating another
 * button component that will address this in the future.
 */
class IconButton {
    /**
     * 
     * @param {Phaser.scene} scene The scene to add the button into
     * @param {string} icon The asset key of the image defined in Preloader.js
     * @param {number} x top-left x-coordinate of the button
     * @param {number} y top-right y-coordinate of the button
     * @callback cb Callback function that is used when button is clicked
     * @param {Array<any>} args A variadic number of arguments to pass into cb when it's called
     */
    constructor(scene, icon, x, y, cb, args = []) {
        console.log(icon)
        scene.add.image(x, y, icon)
            .setOrigin(0.5)
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


        // Note: This is a quick example on how the IconButton should be used. Feel free to uncomment it and play around with it first if you need to add a new powerup to the game.
        // new IconButton(this, 'placeholder', 300, 500, test_cb, ["mooo", "meow"]);
    }
}