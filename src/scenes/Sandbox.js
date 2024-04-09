import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import ScoreManager from '../utils/ScoreManager.js';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { FillBar } from '../ui/fill_bar.js';
import { start_dialogue } from './Dialogue.js';
import { init_collision_events } from '../main.js';
import { TextButton } from '../ui/text_button.js';
import { TextboxButton } from '../ui/textbox_button.js';

class LevelSelector extends Phaser.GameObjects.Container {
    emitter = EventDispatcher.getInstance();
    constructor(scene, x, y, lvl_text_obj) {
        super(scene, x, y);
        scene.add.existing(this);

        const emitter = this.emitter;

        this.btn_down5 = new TextButton(scene, x + 10, y + 10,
            "-5",
            () => {
                scene.registry.set({ 'level': Math.max(1, scene.registry.get('level') - 5) });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
                emitter.emit('kill_all_enemies', false);
                scene.objs.init_enemy_grid();
            }, [],
            bitmapFonts.PressStart2P_Stroke,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );

        this.btn_down1 = new TextButton(scene, x + 50, y + 10,
            "-1",
            () => {
                this.scene.registry.set({ 'level': Math.max(1, scene.registry.get('level') - 1) });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
                emitter.emit('kill_all_enemies', false);
                scene.objs.init_enemy_grid();
            }, [],
            bitmapFonts.PressStart2P_Stroke,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );

        this.btn_up1 = new TextButton(scene, x + 90, y + 10,
            "+1",
            () => {
                this.scene.registry.set({ 'level': scene.registry.get('level') + 1 });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
                emitter.emit('kill_all_enemies', false);
                scene.objs.init_enemy_grid();
            }, [],
            bitmapFonts.PressStart2P_Stroke,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );

        this.btn_up5 = new TextButton(scene, x + 130, y + 10,
            "+5",
            () => {
                scene.registry.set({ 'level': scene.registry.get('level') + 5 });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`);
                emitter.emit('kill_all_enemies', false);
                scene.objs.init_enemy_grid();
            }, [],
            bitmapFonts.PressStart2P_Stroke,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );
    }

}

/**
 * @classdesc A button with an icon as its surface that calls cb with args when
 * clicked.
 */
class IconButton extends Phaser.GameObjects.Container {
    /**
     * @param {Phaser.scene} scene The scene to add the button into
     * @param {string} icon The asset key of the image defined in Preloader.js
     * @param {number} x top-left x-coordinate of the button
     * @param {number} y top-right y-coordinate of the button
     * @callback cb Callback function that is used when button is clicked
     * @param {Array<any>} args A variadic number of arguments to pass into cb when it's called
     * @example 
     * new IconButton(scene, 'placeholder', 300, 500, 
     *      () => {
     *         console.log(`The cow goes "${arg1}" and the cat goes "${arg2}"!`);
     *      }, 
     *      ["mooo", "meow"]
     * );
     */
    constructor(scene, icon, x, y, cb, args = []) {
        super(scene, x, y);
        scene.add.existing(this);

        this.icon = icon;
        this.image = scene.add.image(0, 0, icon)
            .setInteractive()
            .on('pointerover', () => {
                scene.sounds.bank.sfx.hover.play();
                this.image.setTint(0x123123);
            })
            .on('pointerout', () => {
                this.image.clearTint();
            })
            .on('pointerup', () => {
                this.image.clearTint();
            })
            .on('pointerdown', () => {
                this.image.setTint(0x000000);
                cb(...args);
            });
        this.width = this.image.width;
        this.height = this.image.height;

        this.rect = scene.add.rectangle(0, 0, this.width, this.height, 0xfefefe);

        this.add([this.rect, this.image]);
    }
};

/**
 * @description The scene in which gameplay will occur.
 * @property {ObjectSpawner} objs The object spawner for this scene.
 * @property {SoundBank} sounds Plays sounds
 * @property {Object.<string, Phaser.Input.Keyboard.Key>} Key map to be used for gameplay events
 * @property {Object} timers An object that encapsulates all timing-related values for anything in the game.
 */

export class Sandbox extends Scene {
    emitter = EventDispatcher.getInstance();
    PUPA_PATHS = {};
    sandbox_mode = true;
    #coord_list = [];

    constructor() {
        super('Sandbox');
        this.kill_all_enemies = this.kill_all_enemies.bind(this);
        this.debugMode = false;
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

        this.registry.set({ 'sandbox_mode': true });

        // create/scale BG image 
        let bg = this.add.image(0, 0, 'background').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.setScale(bg.scaleX, bg.scaleX);
        bg.y = -250;

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
                start_dialogue(this.scene, "sandbox_tips", "game");
            }
        );

        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.objs.init_all(false);
        this.sounds = this.registry.get('sound_bank');

        this.keys = InitKeyDefs(this);

        // Score and high score
        this.scoreManager = new ScoreManager(this);

        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.bitmapText(this.sys.game.config.width * (2.9 / 4), 16, bitmapFonts.PressStart2P_Stroke, `LEVEL:${this.level}`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);

        this.player_vars = this.registry.get('player_vars');
        this.player_stats = this.player_vars.stats;

        // Player lives text and sprites
        this.livesText = this.add.bitmapText(16, this.sys.game.config.height - 48, bitmapFonts.PressStart2P_Stroke, '---', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: 2
        });
        this.livesSprites.create(84, this.sys.game.config.height - 32, 'lives', 0);
        this.sounds.stop_all_music();
        this.sounds.bank.music.sandbox.play();

        init_collision_events(this, "Sandbox");

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);
        this.keys.p.on('down', () => this.pause());
        this.keys.esc.on('down', () => this.pause());
        this.keys.x.on('down', () => {
            this.toggleDebug();
        });

        this.mouse_pos_text = this.add.bitmapText(750, 75, bitmapFonts.PressStart2P_Stroke, `(0,0)`, fonts.small.sizes[bitmapFonts.PressStart2P]);
        this.legend_text = this.add.bitmapText(this.game.config.width - 64, 300, bitmapFonts.PressStart2P_Stroke, "Click to Spawn", fonts.small.sizes[bitmapFonts.PressStart2P]);
        this.legend_text.setAngle(-90);

        this.lvl_select = new LevelSelector(this, this.game.config.width * (3 / 4), 48, this.level_text, this.kill_all_enemies);

        this.grid_btn = new IconButton(this, "enemy_icon",
            this.game.config.width - 20, 100,
            () => {
                if (this.objs.enemies.grid.children.entries.length === 0)
                    this.objs.init_enemy_grid()
            }
        );

        // RHS buttons
        this.usb_btn = new IconButton(this, "usb_icon",
            this.game.config.width - 20, 136,
            () => {
                (Phaser.Math.Between(0, 1) === 0) ?
                    this.add.enemy_usb(this, true) :
                    this.add.enemy_usb(this, false);
            }
        )

        this.reaper_btn = new IconButton(this, "reaper_icon",
            this.game.config.width - 20, 172,
            this.add.enemy_reaper,
            [this, 0, 0, 40]
        );

        this.lupa_btn = new IconButton(this, "lupa_icon",
            this.game.config.width - 20, 208,
            this.add.enemy_lupa,
            [this, this.game.config.width, 525]
        );

        this.pupa_btn = new IconButton(this, "pupa_icon",
            this.game.config.width - 20, 244,
            this.add.enemy_pupa,
            [this, 400, 400]
        );

        this.firewall_btn = new IconButton(this, "firewall_icon",
            this.game.config.width - 20, 280,
            () => {
                for (let chunk of this.objs.barrier_chunks.children.entries)
                    chunk.parent.update_flame_size(true);
                this.objs.barrier_chunks.clear(true, true);
                this.objs.init_barriers()
            },
            []
        );

        this.nuke_btn = new IconButton(this, "nuke_icon",
            this.game.config.width - 20, 316,
            this.kill_all_enemies,
            []
        );

        this.coord_graphics = this.add.graphics();

        this.keys.g.on('down', () => {
            this.#add_coord();
        });
        this.keys.c.on('down', () => {
            this.#clear_coord_list();
        });
        this.keys.v.on('down', () => {
            this.#print_coord_list();
        });


        this.emitter.on('player_lose', this.kill_all_enemies, this);
        this.emitter.on('kill_all_enemies', this.kill_all_enemies, this);
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.physics.world.drawDebug = this.debugMode;

        if (!this.debugMode) {
            this.physics.world.debugGraphic.clear();
        }
    }

    pause() {
        this.scene.pause('Sandbox');
        this.scene.launch('PauseMenu', { prev_scene: 'Sandbox' });
    }

    update(time, delta) {
        if (this.objs.player.update)
            this.objs.player.update(time, delta, this.keys)
        // Update lives text and sprites
        this.livesText.setText('-');
        this.update_mouse_pos_text();

        this.objs.ai_grid_enemies(time);

        this.physics.world.drawDebug = this.debugMode;

    }

    goto_scene(targetScene) {
        this.cameras.main.fade(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.sounds.stop_all_music();
            this.scene.start(targetScene);
        });
    }


    #add_coord() {
        const x = this.game.input.mousePointer.x;
        const y = this.game.input.mousePointer.y;
        const vec = { x: x, y: y };
        this.#coord_list.push(vec);
        console.log("Added coordinate to list")
        console.log(this.#coord_list);
        this.coord_graphics
            .fillStyle(0xFF0000, 1)
            .fillCircle(x, y, 6);
    }

    #clear_coord_list() {
        this.#coord_list = [];
        console.log("Cleared all coordinates from the list")
        this.coord_graphics.clear();
    }

    #print_coord_list() {
        let out = "[";
        for (const vec of this.#coord_list) {
            console.log(vec);
            out += `${vec.x}, ${vec.y}, `;
        }
        console.log(out + "]");
    }

    update_mouse_pos_text() {
        let x = this.game.input.mousePointer.x.toFixed(1);
        let y = this.game.input.mousePointer.y.toFixed(1);
        this.mouse_pos_text.setText(`(${x},${y})`);
    }

    /**
     * 
     * @param {boolean} add_rewards Add money and score if true
     */
    kill_all_enemies(add_rewards = true) {
        // Loop through all enemies and destroy them
        if (this.objs) {
            this.objs.enemies.grid.children.each(enemy => {
                enemy.die();
                console.log(`add rewards: ${add_rewards}`)
                if (add_rewards) {
                    this.scoreManager.addMoney(enemy.moneyValue);
                    this.scoreManager.addScore(enemy.scoreValue);
                }
            }, this);

            this.objs.enemies.special.children.each(enemy => {
                console.log(`add rewards: ${add_rewards}`)
                if (add_rewards) {
                    this.scoreManager.addMoney(enemy.moneyValue * enemy.hp);
                    this.scoreManager.addScore(enemy.scoreValue * enemy.hp);
                }
                enemy.hp = 1;
                enemy.die();
            }, this);
        }
    }

}