import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { FillBar } from '../ui/fill_bar.js';
import { start_dialogue } from './Dialogue.js';
import { init_collision_events } from '../main.js';
import Controls from "../controls/controls.js";

class BossClock extends Phaser.GameObjects.Container {
    mm = 0;
    ss = 0;
    ms = 0;
    text;
    timer;
    constructor(scene) {
        super(scene, 0, 0);
        scene.add.existing(this);

        this.text = scene.add.bitmapText(0, 0, fonts.medium.fontName, `00:00:000`, fonts.medium.size);
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
            mm: this.mm.toString().padStart(2, '0'),
            ss: this.ss.toString().padStart(2, '0'),
            ms: this.ms.toString().padStart(3, '0'),
        };
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
    #bosses_beaten = -1;

    #BOSS_HP = 1; // The HP that each boss will spawn with

    #clock;

    #end_flag = false; // ensure localStorage is only modified once

    constructor() {
        super('Boss Rush');
    }

    create() {
        // create/scale BG image 
        let bg = this.add.sprite(0, 0, 'BG7')
            .setOrigin(0, 0)
            .play('BG7-SpriteSheet'); //can remove bg7 anim if annoying

        this.#clock = new BossClock(this);

        this.PUPA_PATHS = {
            LEMNISCATE: this.cache.json.get('PUPA_LEMNISCATE'),
            TRIANGLE: this.cache.json.get('PUPA_TRIANGLE'),
            SPLINE: this.cache.json.get('PUPA_SPLINE'),
            ILLUMINATI: this.cache.json.get('PUPA_ILLUMINATI'),
        }
        // fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');
        // player will have only level 2 stats (except shield) and 1 life, 
        this.player_vars.lives = 1;
        this.player_vars.stats.move_speed = 2;
        this.player_vars.stats.fire_rate = 2;
        this.player_vars.stats.bullet_speed = 2;

        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.objs.init_all(false);
        this.sounds = this.registry.get('sound_bank');

        this.keys = InitKeyDefs(this);

        // Player lives text and sprites
        this.livesText = this.add.bitmapText(16, this.sys.game.config.height - 48, fonts.medium.fontName, '3', fonts.medium.size);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: this.player_vars.lives - 2
        });

        this.sounds.stop_all_music();
        this.sounds.bank.music.boss_rush.play();

        init_collision_events(this, "Boss Rush");

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);
        this.keys.p.on('down', () => this.pause());
        this.keys.esc.on('down', () => this.pause());
        this.keys.x.on('down', () => {
            this.toggleDebug();
        });

        this.#boss_queue = [
            {
                func: this.add.enemy_reaper,
                args: [this, 0, 0, this.#BOSS_HP]
            },
            {
                func: this.add.enemy_lupa,
                args: [this, this.game.config.width, 525, this.#BOSS_HP]
            },
            {
                func: this.add.enemy_pupa,
                args: [this, this.game.config.width, 525, this.#BOSS_HP]
            }
        ];

        let total_attempts = localStorage.getItem('br_total_attempts');
        if (total_attempts) {
            // already exists? modify the existing.
            total_attempts = parseInt(total_attempts);
            localStorage.setItem('br_total_attempts', total_attempts + 1);
        } else {
            // does not exist? create the variables
            localStorage.setItem('br_total_attempts', 1);
            localStorage.setItem('br_victories', 0);
            // create array to store best times
            localStorage.setItem('br_times', JSON.stringify([]));
        }

        this.total_bosses = this.#boss_queue.length;

        if (window.IS_MOBILE) {
            this.controls = new Controls(this);
        }
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.physics.world.drawDebug = this.debugMode;

        if (!this.debugMode) {
            this.physics.world.debugGraphic.clear();
        }
    }

    pause() {
        this.scene.pause();
        this.scene.launch('PauseMenu', { prev_scene: 'Boss Rush' });
    }

    update(time, delta) {
        if (this.objs.player.update)
            this.objs.player.update(time, delta, this.keys, this.controls);
        // Update lives text and sprites
        // this.livesText.setText('-');
        this.updateLives();
        this.physics.world.drawDebug = this.debugMode;
        this.#clock.update(time, delta);

        // check if boss should spawn
        if (this.objs.enemies.special.children.entries.length === 0) {
            if (this.#boss_queue.length === 0) {
                // transition to win scene
                if (!this.#end_flag) {
                    this.#end_flag = true; // ensure we don't try to transition again
                    let num_victories = parseInt(localStorage.getItem('br_victories'));
                    localStorage.setItem('br_victories', num_victories + 1);
                    this.goto_scene('Boss Rush Win',
                        {
                            time: this.#clock.dump_time(),
                            bosses_beaten: this.total_bosses - this.#boss_queue.length - 1
                        });
                }
            }
            const cb = this.#boss_queue.shift();
            if (cb) cb.func(...cb.args);
        }
        this.check_gameover();
    }

    check_gameover() {
        if (!this.objs.player.is_inbounds() && this.player_vars.lives <= 0) {
            this.goto_scene('Boss Rush Lose', { time: this.#clock.dump_time(), bosses_beaten: this.total_bosses - this.#boss_queue.length - 1 });
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

    goto_scene(targetScene, data) {
        this.cameras.main.fade(500, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.sounds.stop_all_music();
            this.scene.start(targetScene, data);
        });
    }
}