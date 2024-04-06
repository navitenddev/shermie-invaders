import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { FillBar } from '../ui/fill_bar.js';
import { start_dialogue } from './Dialogue.js';
import { init_collision_events } from '../main.js';

class BossClock extends Phaser.GameObjects.Container {
    mm = 0;
    ss = 0;
    ms = 0;
    text;
    timer;
    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.text = scene.add.bitmapText(0, 0, bitmapFonts.PressStart2P_Stroke, `00:00:000`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);
        this.timer = scene.time.addEvent({ delay: 6000000, callback: this.onClockEvent, callbackScope: this, repeat: 1 });

        this.add([this.text]);
    }

    update(time, delta) {
        let elapsed_s = this.timer.getElapsedSeconds();
        this.mm = Math.floor(elapsed_s / 60);
        this.ss = Math.floor(elapsed_s - (this.mm * 60));
        this.ms = Math.floor(this.timer.getElapsed() % 1000);
        this.text
            .setText(
                `${this.mm.toString().padStart(2, '0')}:${this.ss.toString().padStart(2, '0')}:${this.ms.toString().padStart(3, '0')}`
            );
        this.setPosition((this.scene.game.config.width / 2) - (this.text.width / 2), 25);
    }

    dump_time() {
        return {
            mm: this.mm,
            ss: this.ss,
            ms: this.ms,
        }
    }

    destroy() {
        super.destroy();
        this.timer.destroy();
    }
}

/**
 * @description The scene in which gameplay will occur.
 * @property {ObjectSpawner} objs The object spawner for this scene.
 * @property {SoundBank} sounds Plays sounds
 * @property {Object.<string, Phaser.Input.Keyboard.Key>} Key map to be used for gameplay events
 * @property {Object} timers An object that encapsulates all timing-related values for anything in the game.
 */

export class BossRush extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    PUPA_PATHS = {};
    #boss_queue = [];

    #clock;

    constructor() {
        super('Boss Rush');
    }

    preload() {
        this.load.json({
            key: "PUPA_LEMNISCATE",
            url: "assets/paths/pupa.json",
            dataKey: "LEMNISCATE",
        });
        this.load.json({
            key: "PUPA_TRIANGLE",
            url: "assets/paths/pupa.json",
            dataKey: "TRIANGLE",
        });
        this.load.json({
            key: "PUPA_SPLINE",
            url: "assets/paths/pupa.json",
            dataKey: "SPLINE1",
        });
        this.load.json({
            key: "PUPA_ILLUMINATI",
            url: "assets/paths/pupa.json",
            dataKey: "ILLUMINATI",
        });
    }

    create() {
        // create/scale BG image 
        let bg = this.add.image(0, 0, 'background').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.setScale(bg.scaleX, bg.scaleX);
        bg.y = -250;

        this.#clock = new BossClock(this);

        this.PUPA_PATHS = {
            LEMNISCATE: this.cache.json.get('PUPA_LEMNISCATE'),
            TRIANGLE: this.cache.json.get('PUPA_TRIANGLE'),
            SPLINE: this.cache.json.get('PUPA_SPLINE'),
            ILLUMINATI: this.cache.json.get('PUPA_ILLUMINATI'),
        }
        // fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
            () => {
                // start_dialogue(this.scene, "sandbox_tips", "game");
            }
        );

        this.player_vars = this.registry.get('player_vars');
        // player will have only level 1 stats and 1 life, except move speed = 2 just to be fair
        this.player_vars.lives = 1;
        this.player_vars.stats.move_speed = 2;

        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.objs.init_all(false);
        this.sounds = this.registry.get('sound_bank');

        this.keys = InitKeyDefs(this);

        // Player lives text and sprites
        this.livesText = this.add.bitmapText(16, this.sys.game.config.height - 48, bitmapFonts.PressStart2P, '3', fonts.medium.sizes[bitmapFonts.PressStart2P]);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: this.player_vars.lives - 2
        });

        this.sounds.stop_all_music();
        this.sounds.bank.music.boss_rush.play();

        init_collision_events(this);

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);
        this.keys.p.on('down', () => this.pause());
        this.keys.esc.on('down', () => this.pause());
        this.keys.x.on('down', () => {
            this.toggleDebug();
        });

        // this.reaper_btn = new IconButton(this, "reaper_icon",
        //     this.game.config.width - 20, 172,
        //     this.add.enemy_reaper,
        //     [this, 0, 0, 40]
        // );

        // this.lupa_btn = new IconButton(this, "lupa_icon",
        //     this.game.config.width - 20, 208,
        //     this.add.enemy_lupa,
        //     [this, this.game.config.width, 525]
        // );

        // this.pupa_btn = new IconButton(this, "pupa_icon",
        //     this.game.config.width - 20, 244,
        //     this.add.enemy_pupa,
        //     [this, 400, 400]
        // );

        this.#boss_queue = [
            {
                func: this.add.enemy_reaper,
                args: [this, 0, 0, 40]
            },
            {
                func: this.add.enemy_lupa,
                args: [this, this.game.config.width, 525, 40]
            },
            {
                func: this.add.enemy_pupa,
                args: [this, this.game.config.width, 525, 40]
            }
        ];
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.physics.world.drawDebug = this.debugMode;

        if (!this.debugMode) {
            this.physics.world.debugGraphic.clear();
        }
    }

    pause() {
        this.scene.pause('Boss Rush');
        this.scene.launch('PauseMenu', { prev_scene: 'Boss Rush' });
    }

    update(time, delta) {
        if (this.objs.player.update)
            this.objs.player.update(time, delta, this.keys)
        // Update lives text and sprites
        // this.livesText.setText('-');
        this.updateLives();
        this.physics.world.drawDebug = this.debugMode;

        // check if boss should spawn
        if (this.objs.enemies.special.children.entries.length === 0) {
            if (this.#boss_queue.length === 0) {
                console.log("player wins");
                // add st uff to do
            }
            const cb = this.#boss_queue.shift();
            cb.func(...cb.args);
        }

        this.#clock.update(time, delta);
    }

    check_gameover() {
        if (this.player_vars.lives <= 0) {
            // u ded noob
            this.goto_scene('Boss Rush Lose');
        }
    }

    /**
     * @description Updates the lives sprites to reflect the current number of lives
     * @param {number} lives The number of lives the player has
     */
    updateLives() {
        this.livesText.setText(this.player_vars.lives);
        this.livesSprites.clear(true, true); // Clear sprites
        for (let i = 0; i < this.player_vars.lives; i++) {
            // coordinates for the lives sprites
            let lifeConsts = { x: 84 + i * 48, y: this.sys.game.config.height - 32 };
            this.livesSprites.create(lifeConsts.x, lifeConsts.y, 'lives', 0)
        }
    }

    goto_scene(targetScene) {
        this.cameras.main.fade(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.sounds.stop_all_music();
            this.scene.start(targetScene);
        });
    }
}