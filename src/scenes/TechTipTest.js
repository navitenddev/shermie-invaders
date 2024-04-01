import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { restart_scenes } from '../main.js';
import { start_dialogue } from './Dialogue.js';
import { TextButton } from '../ui/text_button.js';

export class TechTipTest extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Tech Tip Test');
    }

    create(data) {
        this.num_tips = this.cache.json.get("dialogue").techtips.quantity;
        restart_scenes(this.scene);

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.sounds.bank.sfx.win.play();

        this.add.text(512, 50,
            "Click on the buttons to show their tips.", {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'left',
            wordWrap: {
                width: this.sys.game.config.width - 200,
                useAdvancedWrap: true
            }
        }).setOrigin(0.5);

        const start_x = this.game.config.width / 3.25, start_y = 100,
            x_gap = 10, y_gap = 10,
            num_cols = 10,
            btn_w = 35, btn_h = 35;

        for (let i = 1; i <= this.num_tips; i++) {
            const row = Math.floor((i - 1) / num_cols);
            const col = (i - 1) % num_cols;

            const btn_x = start_x + col * (btn_w + x_gap);
            const btn_y = start_y + row * (btn_h + y_gap);

            new TextButton(
                this,
                btn_x, btn_y,
                btn_w, btn_h,
                i.toString(),
                () => { start_dialogue(this.scene, `techtip${i}`, "techtip"); }
            );
        }


        this.back_btn = new TextButton(this, this.game.config.width / 2, 600, 150, 50, 'Back',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("MainMenu");
            },
            [], // callback function's arguments
            bitmapFonts.PressStart2P,                    // font type
            fonts.small.sizes[bitmapFonts.PressStart2P], // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091  // color of border
        );
    }
}
