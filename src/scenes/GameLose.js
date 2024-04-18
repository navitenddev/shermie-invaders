import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { fonts } from '../utils/fontStyle.js';
import { start_dialogue } from './Dialogue.js';
import { restart_scenes } from '../main.js';
import { TextboxButton } from '../ui/textbox_button.js';
import { ListContainer } from '../ui/list_container.js';
import { StatsContainer } from '../ui/stats_container.js';


export class GameLose extends Scene {
    emitter = EventDispatcher.getInstance();

    constructor() {
        super('Game Lose');
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

        var score_invalidated = true;
        // only save score if we started level 1, or started with no money
        if (this.registry.get('debug_mode') === false &&
            this.registry.get('valid_hiscore') === true) {
            game_hiscores.push(`#${games_played} ${score}`);
            score_invalidated = false;
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

        const text_gameover = this.add.bitmapText(
            0, 0,
            fonts.medium.fontName,
            "GAME OVER",
            fonts.medium.size,
            'center'
        );

        text_gameover.setPosition(
            (this.game.config.width / 2) - (text_gameover.width / 2),
            10
        );

        const text_score = this.add.bitmapText(
            0, 0,
            fonts.middle.fontName,
            `FINAL SCORE: ${score}`,
            fonts.middle.size,
            'center'
        );

        text_score.setPosition(
            (this.game.config.width / 2) - (text_score.width / 2),
            50
        );

        if (score_invalidated)
            text_score.setTint(0x940018);

        localStorage.setItem('game_hiscores', JSON.stringify(game_hiscores));

        game_hiscores = game_hiscores.map((s, i) => { return `${i + 1}. ${s}`; });
        new ListContainer(this, 325, 240, 350, 325, game_hiscores, "Hiscores", 8);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            if (score_invalidated) {
                start_dialogue(this.scene, 'score_invalidated', "menu");
                this.emitter.once('dialogue_stop', () => {
                    start_dialogue(this.scene, `techtip${rand_idx}`, "techtip");
                });
            } else {
                start_dialogue(this.scene, `techtip${rand_idx}`, "techtip");
            }
        });

        this.emitter.removeAllListeners();

        new StatsContainer(this, 700, 240, 250, 325);

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