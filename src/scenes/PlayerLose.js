import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { start_dialogue } from './Dialogue.js';
import { restart_scenes } from '../main.js';
import { TextButton } from '../ui/text_button.js';

export class PlayerLose extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Player Lose');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        const num_tips = this.cache.json.get("dialogue").techtips.quantity;
        const rand_idx = Phaser.Math.Between(1, num_tips);
        restart_scenes(this.scene);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, `techtip${rand_idx}`, "techtip");
        });

        this.sounds = this.registry.get('sound_bank');
        this.sounds.bank.sfx.lose.play();
        this.emitter.removeAllListeners();

        this.player_vars = this.registry.get('player_vars');
        const score = this.player_vars.score;

        let bg = this.add.image(0, 0, 'losescreen').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.scaleY = bg.scaleX;
        bg.y = 0;

        this.continue_btn = new TextButton(this, this.game.config.width / 2, 600, 150, 50, 'Continue',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu")
            },
            [], // callback function's arguments
            bitmapFonts.PressStart2P,                    // font type
            fonts.small.sizes[bitmapFonts.PressStart2P], // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091// color of border
        );

        this.final_score = this.add.bitmapText(
            0,
            0,
            bitmapFonts.PressStart2P_Stroke,
            `FINAL SCORE:${score}`,
            fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]
        );
        this.final_score.setPosition((this.game.config.width / 2) - (this.final_score.width / 2), this.game.config.height / 3.35);
        this.game.config.width / 2.5,
            this.game.config.height / 4,

            this.input.once('pointerdown', () => {
                this.scene.start('MainMenu');
            });
    }
}