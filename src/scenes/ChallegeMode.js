import { ObjectSpawner } from "../objects/spawner.js";
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { start_dialogue } from './Dialogue.js';
import { init_collision_events } from '../main.js';
import { restart_scenes } from "../main.js";
import { TextboxButton } from "../ui/textbox_button.js";
import { ListContainer } from "../ui/list_container.js";
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

class ChallengeMode extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    PUPA_PATHS = {};
    #boss_queue = [];

    #BOSS_HP = 40; // The HP that each boss will spawn with

    #clock;

    #end_flag = false; // ensure localStorage is only modified once

    constructor() {
        super('Challenge Mode');
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

        init_collision_events(this, "Challenge Mode");

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

        let total_attempts = parseInt(localStorage.getItem('cm_total_attempts')) || 0;
        localStorage.setItem('cm_total_attempts', total_attempts + 1);

        this.total_bosses = this.#boss_queue.length;

        this.pauseSprite = this.add.sprite(32, 32, 'pause')
            .setOrigin(0.5)
            .setScale(1.5)
            .setAlpha(0.75)
            .setInteractive()
            .on('pointerdown', () => {
                this.pause();
            })
            .setVisible(false);

        if (window.IS_MOBILE) {
            this.controls = new Controls(this);
            this.pauseSprite.setVisible(true);
        }
    }

    toggleDebug() {
        // only allow debug visuals if debug mode is turned oon
        if (this.registry.get('debug_mode') === true) {
            this.debugMode = !this.debugMode;
            this.physics.world.drawDebug = this.debugMode;

            if (!this.debugMode) {
                this.physics.world.debugGraphic.clear();
            }
        }
    }

    pause() {
        this.scene.pause();
        this.scene.launch('Pause Menu', { prev_scene: 'Challenge Mode' });
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
                    this.goto_scene('Challenge Mode Win',
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
        if (!this.objs.player.is_inbounds()
            && this.player_vars.lives <= 0 &&
            !this.#end_flag) {
            this.#end_flag = true;
            this.goto_scene('Challenge Mode Lose', { time: this.#clock.dump_time(), bosses_beaten: this.total_bosses - this.#boss_queue.length - 1 });
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

class ChallengeModeWin extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Challenge Mode Win');
    }

    create(data) {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.champion.play();

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');

        restart_scenes(this.scene);


        const cm_total_attempts = parseInt(localStorage.getItem('cm_total_attempts')) || 1;
        const time_str = `${data.time.mm}:${data.time.ss}:${data.time.ms}`;

        let cm_win_times = JSON.parse(localStorage.getItem('cm_win_times')) || [];
        cm_win_times.push(`#${cm_total_attempts} ${time_str}`);
        // sort cm_win_times (fastest -> slowest)
        cm_win_times.sort((og_a, og_b) => {
            // remove #NUM
            const a = og_a.split(' ')[1]; // ooga
            const b = og_b.split(' ')[1]; // booga
            // split times by delim
            const aa = a.split(':').map(Number);
            const bb = b.split(':').map(Number);
            // convert times to ms
            const ams = aa[0] * 60000 + aa[1] * 1000 + aa[2];
            const bms = bb[0] * 60000 + bb[1] * 1000 + bb[2];
            if (ams < bms)
                return -1;
            else if (ams > bms)
                return 1;
            else
                return 0;
        });

        // store the new hiscores list
        localStorage.setItem('cm_win_times', JSON.stringify(cm_win_times));

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, [`Congratulations, you've beaten the hardest challenge in the game and it only took you ${time_str}! You are the champion! Type navitend in the main menu to activate cheats!`], "menu", 18);
        });


        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.continue_btn = new TextboxButton(this, this.game.config.width / 2, 700, 150, 50, 'Main Menu',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu")
            },
            [], // callback function's arguments
            fonts.small.fontName,                    // font type
            fonts.small.size, // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091  // color of border
        );

        let cm_loss_times = JSON.parse(localStorage.getItem('cm_loss_times')) || [];
        new ListContainer(this, 325, 200, 350, 380, cm_loss_times, "Fallen Players");

        cm_win_times = cm_win_times.map((s, i) => { return `${i + 1}. ${s}`; });
        new ListContainer(this, 700, 200, 350, 380, cm_win_times, "Champions");
    }
}

class ChallengeModeLose extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Challenge Mode Lose');
    }

    create(data) {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.shop.play();

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');

        const first_lines = [
            "Were you even trying?",
            "Nice try, but not good enough.",
            "So close, yet so far."
        ];

        const time_str = `${data.time.mm}:${data.time.ss}:${data.time.ms}`;

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, [`${first_lines[data.bosses_beaten]}\nYou managed to survive for ${time_str} and beat ${data.bosses_beaten}/3 bosses.`], "menu", 20);
        });

        restart_scenes(this.scene);

        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.sounds.bank.sfx.win.play();

        this.continue_btn = new TextboxButton(this, this.game.config.width / 2, 700, 150, 50, 'Main Menu',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu")
            },
            [], // callback function's arguments
            fonts.small.fontName,                    // font type
            fonts.small.size, // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091  // color of border
        );

        const cm_total_attempts = parseInt(localStorage.getItem('cm_total_attempts')) || 1;

        let cm_loss_times = JSON.parse(localStorage.getItem('cm_loss_times')) || [];
        cm_loss_times.unshift(`#${cm_total_attempts} ${time_str} ${data.bosses_beaten}/3`);
        localStorage.setItem('cm_loss_times', JSON.stringify(cm_loss_times));
        new ListContainer(this, 325, 200, 350, 380, cm_loss_times, "Fallen Players");


        let cm_win_times = JSON.parse(localStorage.getItem('cm_win_times')) || [];
        if (cm_win_times.length === 0)
            cm_win_times = ["No Champions"];
        else
            cm_win_times = cm_win_times.map((s, i) => { return `${i + 1}. ${s}`; });
        new ListContainer(this, 700, 200, 350, 380, cm_win_times, "Champions");
        // store the new hiscores list
    }
}

export { ChallengeMode, ChallengeModeLose, ChallengeModeWin };