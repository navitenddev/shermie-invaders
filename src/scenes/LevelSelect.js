import { BaseMenu } from './BaseMenu.js';
import { fonts } from '../utils/fontStyle.js';
import { TextboxButton } from '../ui/textbox_button.js';

/**
 * @classdesc Asks the user if they wish to start the level with money or not
 * If we end up needing another yes/no dialog window, this class should be
 * repurposed. I don't think we will, so I will just make this specifically for
 * this purpose.
 */
class StartWithMoneyDialog extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.Scene} scene The scene to create the dialog in
     * @param {number} x x-position of dialog window
     * @param {number} y y-position of dialog window
     * @param {number} level The level to start on
     * @param {number} border_sz The x distance that buttons and text will be from the border
     */
    constructor(scene, x, y, w, h, level, border_sz = 25) {
        super(scene, x, y);
        scene.add.existing(this);
        const BG_COLOR = 0x2B2D31;
        const BG_BORDER = 0x879091;

        let player_vars = scene.registry.get('player_vars');

        // we don't need any interactivity with bg, however, adding this here
        // will block pointer events from registering if there exists another
        // button below the bg.
        this.bg = scene.add.rectangle(0, 0, w, h, BG_COLOR)
            .setInteractive();
        this.bg_border = scene.add.graphics();
        this.bg_border
            .lineStyle(2, BG_BORDER, 1)
            .strokeRect(-(w / 2), -(h / 2), w, h);

        this.text = scene.add.bitmapText(border_sz, border_sz,
            fonts.small.fontName,
            `Do you wish to start level ${level} with money?\n\nPlease note that you will be ineligible to submit a hiscore if you start this level with money!`,
            fonts.small.size)
            .setMaxWidth(w - border_sz)
            .setLineSpacing(5);


        const BTN_W = (w / 3) - border_sz;
        const BTN_H = 35;
        const X_OFFSET = -(w / 2) + (BTN_W / 2.5);

        this.yes_btn = new TextboxButton(scene,
            X_OFFSET + 1 * border_sz, 150,
            BTN_W, BTN_H,
            "Yes",
            () => {
                // edge case, level 1 always starts with no money and in the game scene
                if (level === 1) {
                    // allow hiscore to be saved if we pick level 1
                    scene.registry.set('valid_hiscore', true);
                    scene.registry.set({ level: level });
                    scene.scene.start('Game');
                } else {
                    // set level to level-1
                    scene.registry.set({ level: level - 1 });
                    // give player money based on the level
                    player_vars.wallet = (level - 1) * 300;
                    // go to store scene
                    scene.scene.start('Store');
                }
            }
        );
        this.no_btn = new TextboxButton(scene,
            X_OFFSET + BTN_W + 2 * border_sz, 150,
            BTN_W, BTN_H,
            "No",
            () => {
                // allow hiscore to be saved (no money advantage)
                scene.registry.set('valid_hiscore', true);
                // increment games played
                const games_played = parseInt(localStorage.getItem('games_played')) || 0;
                localStorage.setItem('games_played', games_played + 1);
                // start with no money
                scene.registry.set({ level: level });
                scene.scene.start('Game');
            }
        );
        this.cancel_btn = new TextboxButton(scene,
            X_OFFSET + 2 * BTN_W + 3 * border_sz, 150,
            BTN_W, BTN_H,
            "Cancel",
            () => {
                // do cancel
                this.destroy();
            }
        );

        this.add([this.bg, this.bg_border, this.text, this.yes_btn, this.no_btn, this.cancel_btn]);
        this.text.setPosition(-(this.text.width / 2), -(this.text.height / 2));
        this.setPosition(x, y);
    }
}

export class LevelSelect extends BaseMenu {
    constructor() {
        super('LevelSelect');
    }

    create() {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.shop.play();
        super.create();

        this.add.bitmapText(this.game.config.width / 3, 35, fonts.medium.fontName, 'LEVEL SELECT', fonts.medium.size).setDepth(3);

        const scale = { x: 50, y: 50 };
        const gap = { x: 5, y: 5 };
        const offset = { x: 65, y: 57.5 };
        let level = 1;

        // get max level reached from localStorage
        const maxLevelReached = localStorage.getItem('maxLevelReached') || 1;

        // check if cheat mode is enabled
        const cheatModeEnabled = this.registry.get('debug_mode') === true;

        this.keys.m.on('down', this.sounds.toggle_mute);

        const DIALOG_W = 400;
        const DIALOG_H = 350;

        var color, color_hover;
        for (let y = 1; y <= 10; y++) {
            for (let x = 1; x <= 15; x++) {
                if (cheatModeEnabled || level <= maxLevelReached) {
                    if (level % 7) {
                        color = 0x2B2D31;
                        color_hover = 0x383A40;
                    } else {
                        color = 0xc80420;
                        color_hover = 0x820114;
                    }
                    new TextboxButton(this,
                        offset.x + x * scale.x + x * gap.x,
                        offset.y + y * scale.y + y * gap.y,
                        40, 40,
                        level.toString(),
                        (scene, level) => {
                            // level 1 will not give the player money anyway, so just start it
                            if (level === 1) {
                                // starting at level 1 will mean that this score is valid, provided that cheats are disabled (this is checked in GameLose.js)
                                scene.registry.set('valid_hiscore', true);
                                scene.registry.set({ level: level });
                                // increment games played
                                const games_played = parseInt(localStorage.getItem('games_played')) || 0;
                                localStorage.setItem('games_played', games_played + 1);
                                scene.scene.start('Game');
                            }
                            new StartWithMoneyDialog(scene,
                                (scene.game.config.width / 2), 300,
                                DIALOG_W, DIALOG_H, level)
                                .setDepth(3);
                        },
                        [this, level++],
                        fonts.tiny.fontName,
                        fonts.tiny.size,
                        color,
                        color_hover)
                        .setDepth(3);
                }
            }
        }

        this.setupBackButton();
    }
}
