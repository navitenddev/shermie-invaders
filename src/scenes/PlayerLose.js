import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { fonts } from '../utils/fontStyle.js';
import { start_dialogue } from './Dialogue.js';
import { restart_scenes } from '../main.js';
import { TextboxButton } from '../ui/textbox_button.js';
import { ListContainer } from '../ui/list_container.js';

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
        const { score } = this.player_vars;
        let game_hiscores = JSON.parse(localStorage.getItem('game_hiscores')) || [];
        const games_played = parseInt(localStorage.getItem('games_played')) || 1;

        // only save score if we started level 1, or started with no money
        if (this.registry.get('valid_hiscore')) {
            game_hiscores.push(`#${games_played} ${score}`);
        }
        game_hiscores.sort((og_a, og_b) => {
            const a = parseInt(og_a.split(' ')[1]);
            const b = parseInt(og_b.split(' ')[1]);
            if (a > b)
                return -1;
            else if (a < b)
                return 1;
            else
                return 0;
        });

        localStorage.setItem('game_hiscores', JSON.stringify(game_hiscores));

        game_hiscores = game_hiscores.map((s, i) => { return `${i + 1} ${s}`; });
        new ListContainer(this, 325, 200, 350, 350, game_hiscores, "Hiscores", 8);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, `techtip${rand_idx}`, "techtip");
        });

        this.emitter.removeAllListeners();

        // const titleText = this.add.bitmapText(
        //     this.game.config.width / 2,
        //     100,
        //     fonts.large.fontName,
        //     'GAME OVER',
        //     fonts.large.size
        // );
        // titleText.setOrigin(0.5);

        // this.final_score = this.add.bitmapText(
        //     this.game.config.width / 2,
        //     titleText.y + titleText.height + 50,
        //     fonts.medium.fontName,
        //     `FINAL SCORE: ${score}`,
        //     fonts.medium.size
        // );
        // this.final_score.setOrigin(0.5);

        /**
         * This REALLY should be made into a phaser container.
         * Josh, do not push this. Make it good
         */
        // const stats_x = 700, stats_y = 150,
        //     stats_w = 290, stats_h = 150;
        // const { shots_fired, shots_hit } = this.player_vars.game_stats;
        // const hitMissRatio = shots_hit / (shots_fired || 1);

        // const statsSpacing = 35;

        // const shotsFiredText = this.add.bitmapText(
        //     -(stats_w / 2),
        //     0,
        //     fonts.small.fontName,
        //     `SHOTS FIRED: ${shots_fired}`,
        //     fonts.small.size
        // );
        // shotsFiredText
        //     .setTint(0xade6ff);
        // const hitsText = this.add.bitmapText(
        //     -(stats_w / 2),
        //     1 * statsSpacing,
        //     fonts.small.fontName,
        //     `HITS: ${shots_hit}`,
        //     fonts.small.size
        // );
        // const hitMissRatioText = this.add.bitmapText(
        //     -(stats_w / 2),
        //     statsSpacing * 2,
        //     fonts.small.fontName,
        //     `HIT-MISS RATIO: ${(hitMissRatio * 100).toFixed(0)}%`,
        //     fonts.small.size
        // );
        // hitMissRatioText.setTint(0xe0de2c);

        // const stats_bg = this.add.rectangle(0, 0, stats_w, stats_h, 0x2B2D31);
        // const stats_border = this.add.graphics();

        // stats_border.lineStyle(2, 0x879091, 1)
        //     .strokeRect(-(stats_w / 2), -(stats_h / 2), stats_w, stats_h);

        // // please make this its own object
        // const stats_container = this.add.container(
        //     stats_x, stats_y,
        //     [stats_bg, stats_border, shotsFiredText, hitsText, hitMissRatioText]
        // );

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