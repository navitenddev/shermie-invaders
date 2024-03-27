import { GridEnemy } from "./enemy_grid";
import { PlayerBullet, EnemyBulletConstDefs as enemy_bull_defs } from "./bullet";
import { Powerups, PowerupsConstDefs as power_defs } from "./powerup";
import { EventDispatcher } from "../utils/event_dispatcher";
import { Explosion, ExplosionConstDefs as expl_defs } from "./explosions";
import { Player } from "./player";
import { Barrier } from "./barrier";
import "../factory/object_factory";

const BARRIER_COLOR = {
    fill: 0xda4723,
    border: 0xffffff,
}

const enemy_defs = GridEnemy.const_defs;

/**
 * @classdesc An object that encapsulates all Phaser Groups. It initializes and spawns them to the game world when it is constructed.
 * @property {Phaser.Physics.Arcade.Group} barrier_chunks - Phaser group of barrier chunk objects
 * @property {Phaser.Physics.Arcade.Group} enemies - Phaser Group of all enemies
 * @property {Phaser.Physics.Arcade.Group} bullets.player - Phaser Group player's bullets
 * @property {Phaser.Physics.Arcade.Group} bullets.enemy - Phaser Group of enemy bullets
 * @property {Phaser.Physics.Arcade.Group} explosions - Phaser group of explosion objects
 */

class ObjectSpawner {
    emitter = EventDispatcher.getInstance();
    static GRID_COUNT = { row: 5, col: 12 }; // The # rows/cols of enemies

    constructor(scene) {
        this.scene = scene;
        this.enemies = {
            grid: this.scene.physics.add.group({
                runChildUpdate: true,
            }),
            special: this.scene.physics.add.group({
                runChildUpdate: true,
            }),
        }

        this.powers = this.scene.physics.add.group({
            runChildUpdate: true,
        });

        this.bullets = {
            player: this.scene.physics.add.group({
                runChildUpdate: true
            }),
            enemy: this.scene.physics.add.group({
                runChildUpdate: true
            }),
        }
        this.explosions = this.scene.physics.add.group({
            runChildUpdate: true,
        });

        this.barrier_chunks = this.scene.physics.add.staticGroup({
            runChildUpdate: true,
        });

        // For Josh: PLEASE MAKE THIS NEATER

        // grid_anims should be 3xN (3 for top mid bot)
        // Define the different grid enemy animation keys here. 
        // Note: since every animation has _idle appended, I am omitting that 
        // here and handling that below to make typing less tedious
        this.grid_anims = [
            ["enemy3", "enemy2", "enemy1"],
            ["enemy4", "enemy5", "enemy6"],
            ["enemy7", "enemy8", "enemy9"],
            ["enemy10", "enemy11", "enemy12"],
            ["enemy13", "enemy14", "enemy15"],
            ["enemy16", "enemy17", "enemy18"],
            ["enemy19", "enemy20", "enemy21"],
        ]
        // anim keys for this level
        const ANIM_KEYS_LVL = this.grid_anims[(this.scene.registry.get('level') - 1) % this.grid_anims.length];

        this.anim_keys = {
            top: `${ANIM_KEYS_LVL[0]}_idle`,
            mid: `${ANIM_KEYS_LVL[1]}_idle`,
            bot: `${ANIM_KEYS_LVL[2]}_idle`,
        }

        this.score_vals = {
            top: 30,
            mid: 20,
            bot: 10,
        }

        this.money_vals = {
            top: 25,
            mid: 10,
            bot: 5,
        }
    }

    /**
     * @private
     * @description initializes all level objects
     * @param with_grid Should the scene be initialized with the grid enemies?
     */

    init_all(with_grid = true) {
        this.init_barriers();
        this.init_player();
        this.init_player_bullets();
        this.init_enemy_bullets();
        this.init_explosions();
        if (with_grid)
            this.init_enemy_grid();
        this.init_powerups();
    }

    init_player() {
        this.player = this.scene.add.player(this.scene, this.scene.game.config.width / 2, this.scene.game.config.height - 96);
        return this.player;
    }

    /**
     * @private
     * @description initializes all barriers and their chunks into the game scene. Should only be called at the start of the level.
     */

    init_barriers() {
        const n = { rows: 15, cols: 22 },
            c = { w: 5, h: 5 },  // individual chunk dims
            y = 500;

        const w = n.cols * c.w,
            x_start = 125,
            x_gap = w;

        for (let i = 0; i < 4; i++) {
            this.barrier_chunks.addMultiple(
                new Barrier(this.scene,
                    x_start + i * (w + x_gap), y,
                    c.w, c.h,
                    n.cols, n.rows,
                    BARRIER_COLOR.fill)
                    .chunks
            );
        }
    }

    /**
     * @description initializes the grid of the enemies. Should only be called at the start of the level.  
     */
    init_enemy_grid() {
        console.log('init_enemy_grid()')
        console.log(`LEVEL: ${this.scene.registry.get('level')}`)
        const ANIM_KEYS_LVL = this.grid_anims[(this.scene.registry.get('level') - 1) % this.grid_anims.length];
        this.anim_keys = {
            top: `${ANIM_KEYS_LVL[0]}_idle`,
            mid: `${ANIM_KEYS_LVL[1]}_idle`,
            bot: `${ANIM_KEYS_LVL[2]}_idle`,
        }

        let gc = ObjectSpawner.GRID_COUNT;
        for (let y = 0; y < gc.row; ++y) {
            for (let x = 0; x < gc.col; ++x) {
                let spawn_pos = {
                    x:
                        enemy_defs.spawn_start.x +
                        (enemy_defs.grid_gap.x * x) +
                        (enemy_defs.dims.w * x * enemy_defs.scale.w),
                    y:
                        enemy_defs.spawn_start.y +
                        (enemy_defs.grid_gap.y * y) +
                        (enemy_defs.dims.h * y * enemy_defs.scale.h),
                };
                let enemy;

                // spawn enemy based on row
                if (y == 0) {
                    enemy = this.scene.add.grid_enemy(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y,
                        this.anim_keys.top,
                        this.score_vals.top,
                        this.money_vals.top,
                    );
                } else if (y == 1 || y == 2) {
                    enemy = this.scene.add.grid_enemy(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y,
                        this.anim_keys.mid,
                        this.score_vals.mid,
                        this.money_vals.mid,
                    );
                } else {
                    enemy = this.scene.add.grid_enemy(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y,
                        this.anim_keys.bot,
                        this.score_vals.bot,
                        this.money_vals.bot,
                    );
                }
                this.enemies.grid.add(enemy);
            }
        }
    }

    /**
     * @private
     * @description Initializes all of the player's bullets. Should only be called at the start of the level.
     */
    init_player_bullets() {
        console.log("Initializing player bullets");
        for (let i = 0; i < PlayerBullet.bullet_capacity * 3; ++i) {
            // console.log(`Adding bullet #${i + 1}`);
            let bullet = this.scene.add.player_bullet(this.scene);
            this.bullets.player.add(bullet);
        }
    }

    init_powerups() {
        console.log("Initializing powerups");
        for (let i = 0; i < Powerups.powerup_capacity; ++i) {
            // console.log(`Adding bullet #${i + 1}`);
            let power = this.scene.add.powerup(this.scene);
            this.powers.add(power);
        }
    }

    /**
     * @private
     * @description Initializes all of the enemies' bullets. Should only be called at the start of the level.
     */
    init_enemy_bullets() {
        console.log("Initializing enemy bullets");
        for (let i = 0; i < enemy_bull_defs.max_bullets; ++i) {
            // console.log(`Adding bullet #${i + 1}`);
            let bullet = this.scene.add.enemy_bullet(this.scene);
            this.bullets.enemy.add(bullet);
        }
    }

    /**
     * @private
     * @description Initializes all of the enemies' bullets. Should only be called at the start of the level.
     */
    init_explosions() {
        console.log("Initializing explosions");
        for (let i = 0; i < expl_defs.max_explosions; ++i) {
            // console.log(`Added explosion #${i + 1}`)
            let explosion = this.scene.add.explosion(this.scene);
            this.explosions.add(explosion);
        }
    }

    /**
     * @public
     * @description Activate explosion animation at (x,y)
     * @param {number} x The x-coord to explode at 
     * @param {number} y The y-coord to explode at
     */
    explode_at(x, y) {
        // console.log(`Exploding at (${x},${y})`)
        let explosion = this.explosions.getFirstDead(false, 0, 0, "explosion");
        if (explosion !== null) {
            explosion.activate(x, y);
            explosion.on('animationcomplete', () => {
                explosion.deactivate();
            })
            this.scene.sounds.bank.sfx.explosion[Phaser.Math.Between(0, 2)].play();
        }
    }

    /**
     * @description Randomly spawns the USB enemy either on the left or right side
     */
    spawn_usb_enemy() {
        console.log("Spawning enemy USB");
        let rng = Phaser.Math.Between(0, 1);
        if (rng)
            this.scene.add.enemy_usb(this.scene, true);
        else
            this.scene.add.enemy_usb(this.scene, false);
    }

    /**
     * @public
     * Handles all logic for grid-based enemies
     */
    ai_grid_enemies(time) {
        let enemies = this.enemies.grid.children.entries;
        GridEnemy.timers.shoot_cd = Math.max(100, 1000 - (this.scene.registry.get('level') * 10));
        GridEnemy.timers.move_cd = (enemies.length * 10) - (this.scene.registry.get('level') * 2);
        // Move all enemies down if we hit the x boundaries
        for (let enemy of enemies) {
            if (!enemy.is_x_inbounds()) {
                console.log("Enemy1 is changing rows!")
                for (let enemy of enemies)
                    enemy.move_down()
                break;
            }
            if (!enemy.is_y_inbounds())
                this.emitter.emit('player_lose', 'Player Lose')
        }

        // Move left or right if it's time to do so
        if (time > GridEnemy.timers.last_moved) {
            GridEnemy.timers.last_moved = time + GridEnemy.timers.move_cd;
            for (let enemy of enemies)
                enemy.move_x();
        }

        /* Right now, there are two grid enemy shooting types:
         * 1) Closest enemy shoots at the player (Euclidean distance)
         * 2) Random enemy shoots
         */

        // handle enemy shooting ai
        let player = this.player;

        if (time > GridEnemy.timers.last_fired) {
            // Roll the dice
            let shoot_mode = Phaser.Math.Between(0, 1);

            if (enemies && enemies.length) {
                GridEnemy.timers.last_fired = time + GridEnemy.timers.shoot_cd;
                switch (shoot_mode) {
                    case 0: // closest enemy shoots at player (Euclidean distance)
                        {
                            let closest = {
                                enemy: null,
                                dist: Number.MAX_SAFE_INTEGER
                            };

                            // Find the enemy closest to the player
                            for (let enemy of enemies) {
                                let dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
                                if (dist < closest.dist)
                                    closest = { enemy: enemy, dist: dist };
                            }
                            if (closest.enemy) closest.enemy.shoot();
                            break;
                        }
                    case 1: // Completely random enemy shoots
                        {
                            // choose a random enemy
                            let rand_index = Phaser.Math.Between(0, enemies.length - 1);
                            enemies[rand_index].shoot(time);
                            break;
                        }

                    default:
                        console.error(`Error: Invalid grid enemy shoot mode!`);
                        break;
                }
            }
        }
    }
}

export { ObjectSpawner };
