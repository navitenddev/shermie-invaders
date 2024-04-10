import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { start_dialogue } from './Dialogue.js';
import { restart_scenes } from '../main.js';
import { TextboxButton } from '../ui/textbox_button.js';

export class PlayerLose extends Scene {
    emitter = EventDispatcher.getInstance();

    constructor() {
        super('Player Lose');
    }

    create() {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();

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

        this.continue_btn = new TextboxButton(this, this.game.config.width / 2, 600, 150, 50, 'Continue',
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
        // let bg = this.add.image(0, 0, 'losescreen').setAlpha(0.85);
        // bg.setOrigin(0, 0);
        // bg.displayWidth = this.sys.game.config.width;
        // bg.scaleY = bg.scaleX;
        // bg.y = 0;

        const titleText = this.add.bitmapText(
            this.game.config.width / 2,
            100,
            bitmapFonts.PressStart2P_Stroke,
            'GAME OVER',
            fonts.large.sizes[bitmapFonts.PressStart2P_Stroke]
        );
        titleText.setOrigin(0.5);

        this.final_score = this.add.bitmapText(
            this.game.config.width / 2,
            titleText.y + titleText.height + 50,
            bitmapFonts.PressStart2P_Stroke,
            `FINAL SCORE: ${score}`,
            fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]
        );
        this.final_score.setOrigin(0.5);

        const { totalShotsFired, totalHits } = this.player_vars;
        const hitMissRatio = totalHits / (totalShotsFired || 1);

        const statsX = this.game.config.width / 2;
        const statsY = this.final_score.y + this.final_score.height + 350;
        const statsSpacing = 35;

        const shotsFiredText = this.add.bitmapText(
            statsX,
            statsY,
            bitmapFonts.PressStart2P_Stroke,
            `SHOTS FIRED: ${totalShotsFired}`,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );
        shotsFiredText.setOrigin(0.5);

        const hitsText = this.add.bitmapText(
            statsX,
            statsY + statsSpacing,
            bitmapFonts.PressStart2P_Stroke,
            `HITS: ${totalHits}`,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );
        hitsText.setOrigin(0.5);

        const hitMissRatioText = this.add.bitmapText(
            statsX,
            statsY + statsSpacing * 2,
            bitmapFonts.PressStart2P_Stroke,
            `HIT/MISS RATIO: ${hitMissRatio.toFixed(2)}`,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );
        hitMissRatioText.setOrigin(0.5);

        this.continue_btn = new TextButton(
            this,
            this.game.config.width / 2,
            statsY + statsSpacing * 4,
            200,
            50,
            'Continue',
            () => {
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu");
            },
            [],
            bitmapFonts.PressStart2P,
            fonts.small.sizes[bitmapFonts.PressStart2P],
            0x2B2D31,
            0x383A40,
            0xFEFEFE,
            0x879091
        );
    }
}