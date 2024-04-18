import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { fonts } from '../utils/fontStyle.js';
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
        this.sounds.bank.sfx.lose.play();
        const num_tips = this.cache.json.get("dialogue").techtips.quantity;
        const rand_idx = Phaser.Math.Between(1, num_tips);
        restart_scenes(this.scene);

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');
        const score = this.player_vars.score;

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, `techtip${rand_idx}`, "techtip");
        });

        this.emitter.removeAllListeners();

        const titleText = this.add.bitmapText(
            this.game.config.width / 2,
            100,
            fonts.large.fontName,
            'GAME OVER',
            fonts.large.size
        );
        titleText.setOrigin(0.5);

        this.final_score = this.add.bitmapText(
            this.game.config.width / 2,
            titleText.y + titleText.height + 50,
            fonts.medium.fontName,
            `FINAL SCORE: ${score}`,
            fonts.medium.size
        );
        this.final_score.setOrigin(0.5);

        const { shots_fired, shots_hit } = this.player_vars.game_stats;
        const hitMissRatio = shots_hit / (shots_fired || 1);

        const statsX = this.game.config.width / 2;
        const statsY = this.final_score.y + this.final_score.height + 350;
        const statsSpacing = 35;

        const shotsFiredText = this.add.bitmapText(
            statsX,
            statsY,
            fonts.small.fontName,
            `SHOTS FIRED: ${shots_fired}`,
            fonts.small.size
        );
        shotsFiredText.setOrigin(0.5)
            .setTint(0xade6ff);

        const hitsText = this.add.bitmapText(
            statsX,
            statsY + statsSpacing,
            fonts.small.fontName,
            `HITS: ${shots_hit}`,
            fonts.small.size
        );
        hitsText.setOrigin(0.5)

        const hitMissRatioText = this.add.bitmapText(
            statsX,
            statsY + statsSpacing * 2,
            fonts.small.fontName,
            `HIT-MISS RATIO: ${(hitMissRatio * 100).toFixed(0)}%`,
            fonts.small.size
        );
        hitMissRatioText.setOrigin(0.5)
            .setTint(0xe0de2c);

        this.continue_btn = new TextboxButton(
            this,
            this.game.config.width / 2,
            700,
            200,
            50,
            'Continue',
            () => {
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu");
            },
            [],
            fonts.small.fontName,
            fonts.small.size,
            0x2B2D31,
            0x383A40,
            0xFEFEFE,
            0x879091
        );
    }
}