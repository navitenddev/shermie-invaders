import { Scene } from 'phaser';
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { TextboxButton } from '../ui/textbox_button.js';
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
        let text_value = scene.add.bitmapText(x + w - 40, y, fonts.small.fontName, obj[key], fonts.small.size);
        // MIN button
        new TextboxButton(scene, x - 45, y + 10,
            55, 25,
            'MIN',
            () => {
                (key === 'lives') ?
                    obj[key] = Phaser.Math.Clamp(0, 1, 10) :
                    obj[key] = Phaser.Math.Clamp(0, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
            }, [],
            fonts.tiny.fontName,
            fonts.tiny.size,
        );

        // - button
        new TextboxButton(scene, x + 15, y + 10,
            25, 25,
            '-',
            () => {
                (key == 'lives') ?
                    obj[key] = Phaser.Math.Clamp(obj[key] - 1, 1, 10) :
                    obj[key] = Phaser.Math.Clamp(obj[key] - 1, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
            }, [],
            fonts.tiny.fontName,                    // font type
            fonts.tiny.size, // font size
        );

        // + button
        new TextboxButton(scene, x + w + 5, y + 10,
            25, 25,
            '+',
            () => {
                (key === 'lives') ?
                    obj[key] = Phaser.Math.Clamp(obj[key] + 1, 1, 10) :
                    obj[key] = Phaser.Math.Clamp(obj[key] + 1, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
            }, [],
            fonts.tiny.fontName,                   // font type
            fonts.tiny.size, // font size
        );

        // max button
        new TextboxButton(scene, x + w + 65, y + 10,
            55, 25,
            'MAX',
            () => {
                (key === 'lives') ?
                    obj[key] = Phaser.Math.Clamp(100, 1, 10) :
                    obj[key] = Phaser.Math.Clamp(100, 1, SHOP_PRICES[key].length);
                text_value.setText(obj[key]);
            }, [],
            fonts.tiny.fontName,                    // font type
            fonts.tiny.size, // font size
        );

        scene.add.bitmapText(x + 50, y, fonts.small.fontName, text, fonts.small.size);
    }
}


export class CheatMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Cheat Menu');
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

        const ls = { w: 350, h: 50 }; // level_skip_btn dimensions

        this.level_skip_btn = new TextboxButton(this,
            this.game.config.width / 2, this.game.config.height / 1.525,
            ls.w, ls.h,
            'Kill All Enemies',
            () => {
                this.emitter.emit('kill_all_enemies');
                // transition should not occur in sandbox
                if (!this.registry.get('sandbox_mode')
                    // it shouldnt happen on boss levels either
                    && this.registry.get('level') % 7)
                    this.scene.start('Game Win')
            },
            [], // callback function's arguments
            fonts.small.fontName,                    // font type
            fonts.small.size, // font size
            0xFF0000, // color of button
            0xB02A07, // color of hovered
            0xFFFFFF, // color of clicked
            0x879091, // color of border
            1         // opacity value 0 through 1
        );

        y += menuSpacing;

        this.back_btn = new TextboxButton(this,
            boxX + boxWidth / 2, y,
            100, 50,
            'Back',
            () => { this.go_back(); }
        );
    }

    go_back() {
        this.scene.stop('Cheat Menu');
        this.scene.start('Pause Menu');
    }
}