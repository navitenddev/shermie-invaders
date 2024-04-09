import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { restart_scenes } from '../main.js';
import { start_dialogue } from './Dialogue.js';
import { TextButton } from '../ui/text_button.js';

export class PlayerWin extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Player Win');
    }

    create() {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.shop.play();
        const num_tips = this.cache.json.get("dialogue").techtips.quantity;
        const rand_idx = Phaser.Math.Between(1, num_tips);
        restart_scenes(this.scene);

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');
        const score = this.player_vars.score;

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, `techtip${rand_idx}`, "techtip", "Player Win");
        });

        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.sounds.bank.sfx.win.play();

        this.add.text(512, 200, `Congratulations, you beat level ${this.registry.get("level")}!\nYou can now shop for upgrades.`, {
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

        this.continue_btn = new TextButton(this, this.game.config.width / 2, 600, 150, 50, 'Continue',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Store")
            },
            [], // callback function's arguments
            bitmapFonts.PressStart2P,                    // font type
            fonts.small.sizes[bitmapFonts.PressStart2P], // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091  // color of border
        );

        this.add.bitmapText(
            16,
            16,
            bitmapFonts.PressStart2P_Stroke,
            `CURRENT SCORE:${score}`,
            fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]
        );
    }
}
