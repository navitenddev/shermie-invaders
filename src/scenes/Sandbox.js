import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import ScoreManager from '../utils/ScoreManager.js';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher.js';

/**
 * @classdesc UI to select levels for grid ai
 * This is just a spinner, bu
 */

class LevelSelector extends Phaser.GameObjects.Container {
    constructor(scene, x, y, lvl_text_obj) {
        super(scene, x, y);

        scene.add.existing(this);
        this.btn_down5 = scene.add.text(x, y, '-5', fonts.small)
            .setInteractive()
            .on('pointerup', function () {
                scene.registry.set({ 'level': Math.max(1, scene.registry.get('level') - 5) });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
            });

        this.btn_down1 = scene.add.text(x + 40, y, '-1', fonts.small)
            .setInteractive()
            .on('pointerup', function () {
                scene.registry.set({ 'level': Math.max(1, scene.registry.get('level') - 1) });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
            });

        this.btn_up1 = scene.add.text(x + 80, y, '+1', fonts.small)
            .setInteractive()
            .on('pointerup', function () {
                scene.registry.set({ 'level': scene.registry.get('level') + 1 });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
            });

        this.btn_up5 = scene.add.text(x + 120, y, '+5', fonts.small)
            .setInteractive()
            .on('pointerup', function () {
                scene.registry.set({ 'level': scene.registry.get('level') + 5 });
                lvl_text_obj.setText(`LEVEL:${scene.registry.get('level')}`)
            });
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
     * @example new IconButton(this, 'placeholder', 300, 500, test_cb, ["mooo", "meow"]);
     */
    constructor(scene, icon, x, y, cb, args = []) {
        super(scene, x, y);
        scene.add.existing(this);

        this.icon = icon;
        this.image = scene.add.image(0, 0, icon)
            .setInteractive()
            .on('pointerdown', () => {
                // do visual indicator that button was clicked
            })
            .on('pointerup', () => {
                // call the callback with the given arguments
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

    #coord_list = [];
    #mouse_pos = { x: 0, y: 0 };

    constructor() {
        super('Sandbox');
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
    }

    create() {

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
                this.start_dialogue("sandbox_tips", false);
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

        // Note: this.level is pass by value!
        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.text(this.sys.game.config.width / 3, 16, `LEVEL:${this.level}`, fonts.medium);

        this.player_vars = this.registry.get('player_vars');
        this.player_stats = this.player_vars.stats;

        // this.objs.player = this.add.player(this, this.sys.game.config.width / 2, this.game.config.height - 96);

        // Player lives text and sprites
        this.livesText = this.add.text(16, this.sys.game.config.height - 48, '---', fonts.medium);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: 2
        });

        this.livesSprites.create(84, this.sys.game.config.height - 32, 'lives', 0);

        this.sounds.bank.music.ff7_fighting.play();

        this.init_collision_events();

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);
        this.keys.p.on('down', () => this.pause());
        this.keys.esc.on('down', () => this.pause());

        this.mouse_pos_text = this.add.text(800, 50, `(0,0)`, fonts.small);
        this.legend_text = this.add.text(this.game.config.width - 64, 300, "Click to Spawn", fonts.small);
        this.legend_text.setAngle(-90);

        this.lvl_select = new LevelSelector(this, this.game.config.width / 2.8, 48, this.level_text);
        // LHS buttons
        this.grid_btn = new IconButton(this, "enemy_icon", 20, 136,
            () => {
                console.log(this.objs.enemies)
                if (this.objs.enemies.grid.children.entries.length === 0)
                    this.objs.init_enemy_grid()
            }
        );

        // RHS buttons
        this.usb_btn = new IconButton(this, "usb_icon",
            this.game.config.width - 20, 100,
            () => {
                (Phaser.Math.Between(0, 1) === 0) ?
                    this.add.enemy_usb(this, true) :
                    this.add.enemy_usb(this, false);
            }
        )

        this.reaper_btn = new IconButton(this, "reaper_icon",
            this.game.config.width - 20, 136,
            this.add.enemy_reaper,
            [this, 0, 0, 40]
        );

        this.lupa_btn = new IconButton(this, "lupa_icon",
            this.game.config.width - 20, 172,
            this.add.enemy_lupa,
            [this, this.game.config.width, 525]
        );

        this.pupa_btn = new IconButton(this, "pupa_icon",
            this.game.config.width - 20, 208,
            this.add.enemy_pupa,
            [this, 400, 400]
        );

        this.coord_graphics = this.add.graphics();

        // Event to kill all enemies
        this.emitter.on('kill_all_enemies', this.#kill_all_enemies, this);

        this.keys.g.on('down', () => {
            this.#add_coord();
        });
        this.keys.c.on('down', () => {
            this.#clear_coord_list();
        });
        this.keys.v.on('down', () => {
            this.#print_coord_list();
        });

        this.emitter.once('player_lose', this.goto_scene, 'Player Lose')
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
    }

    goto_scene(targetScene) {
        this.scoreManager.updateHighScore();

        this.cameras.main.fade(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.sounds.bank.music.bg.stop();
            this.sounds.bank.music.ff7_fighting.stop();
            this.scene.start(targetScene);
        });
    }

    /**
     * @description Initializes all collision and overlap events. This function
     * should be called after objects are initialized.
     */
    init_collision_events() {
        this.physics.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);

        // player bullet hits grid enemy
        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies.grid, (player_bullet, enemy) => {
            this.objs.explode_at(enemy.x, enemy.y);
            if (this.player_vars.power == "pierce") player_bullet.hurt_bullet();
            else player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
            this.scoreManager.addMoney(enemy.moneyValue);
        });

        // player bullet hits special enemy
        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies.special, (player_bullet, enemy) => {
            this.objs.explode_at(enemy.x, enemy.y);
            player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
        });

        let currShield = this.player_stats.shield;
        // enemy bullet hits player
        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.player, (player, enemy_bullet) => {
            if (!player.is_dead) {
                enemy_bullet.deactivate();
                if (player.stats.shield > 1) {
                    player.shieldParticles.explode(10, player.x, this.sys.game.config.height - 135);
                    player.stats.shield--;
                    if (player.stats.shield < currShield) {
                        this.start_dialogue('shermie_shieldgone', false);
                        currShield = player.stats.shield;
                    }
                    player.updateHitbox();
                } else {
                    this.objs.explode_at(player.x, player.y);
                    player.die();
                    this.player_vars.lives = 3; // disable lives in sandbox mode
                    if (this.player_vars.lives === 0)
                        this.start_dialogue('shermie_dead', false);
                    else
                        this.start_dialogue('shermie_hurt', false);
                }
            }
        });

        // player collides with powerup 
        this.physics.add.overlap(this.objs.powers, this.objs.player, (player, powerup) => {
            player.changePower(powerup.buff);
            powerup.deactivate();
        });

        // enemy bullet collides with player bullet
        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.bullets.player, (enemy_bullet, player_bullet) => {
            if (player_bullet.active && enemy_bullet.active) {
                this.objs.explode_at(player_bullet.x, player_bullet.y);
                player_bullet.deactivate();
                enemy_bullet.deactivate();
            }
        });

        // when grid enemy hits barrier, it eats it
        this.physics.add.overlap(this.objs.enemies.grid, this.objs.barrier_chunks, (enemy, barr_chunk) => {
            // console.log(barr_chunk);
            barr_chunk.parent.update_flame_size();
            barr_chunk.destroy(); // OM NOM NOM
        });

        // when special enemy hits barrier, it eats it
        this.physics.add.overlap(this.objs.enemies.special, this.objs.barrier_chunks, (enemy, barr_chunk) => {
            barr_chunk.parent.update_flame_size();
            console.log(barr_chunk);
            // barr_chunk.destroy(); // OM NOM NOM
        });


        // player bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.player, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            Barrier.explode_at_bullet_hit(this, bullet, barr_chunk, 25);
        });

        // enemy bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.enemy, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            Barrier.explode_at_bullet_hit(this, bullet, barr_chunk, 25);
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
        this.#mouse_pos = { x: x, y: y };
        this.mouse_pos_text.setText(`(${x},${y})`);
    }

    #kill_all_enemies() {
        // Loop through all enemies and destroy them
        this.objs.enemies.grid.children.each(enemy => {
            enemy.die();
            this.scoreManager.addMoney(enemy.moneyValue);
            this.scoreManager.addScore(enemy.scoreValue);
        });

        this.objs.enemies.special.children.each(enemy => {
            this.scoreManager.addMoney(enemy.moneyValue * enemy.hp);
            this.scoreManager.addScore(enemy.scoreValue * enemy.hp);
            enemy.hp = 1;
            enemy.die();
        });
    }

    /**
     * @param {*} key Start the dialogue sequence with this key
     * @param {*} blocking If true, will stop all actions in the current scene
     * until dialogue completes
     */
    start_dialogue(key, blocking = true) {
        this.emitter.emit('force_dialogue_stop'); // never have more than one dialogue manager at once
        this.scene.launch('Dialogue', { dialogue_key: key, caller_scene: 'Sandbox' });
        if (blocking)
            this.scene.pause();
    }
}