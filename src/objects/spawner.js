import { EnemyConstDefs as enemy_defs } from "./enemy";
import { PlayerBullet, EnemyBulletConstDefs as enemy_bull_defs } from "./bullet";
import { Explosion, ExplosionConstDefs as expl_defs } from "./explosions";
import { Player } from "./player";
import { Barrier } from "./barrier";
import "../factory/object_factory";

const BARRIER_COLOR = {
    fill: 0xda4723,
    border: 0xffffff,
}

/**
 * @classdesc An object that encapsulates all Phaser Groups. It initializes and spawns them to the game world when it is constructed.
 * @property {Phaser.Physics.Arcade.Group} barrier_chunks - Phaser group of barrier chunk objects
 * @property {Phaser.Physics.Arcade.Group} enemies - Phaser Group of all enemies
 * @property {Phaser.Physics.Arcade.Group} bullets.player - Phaser Group player's bullets
 * @property {Phaser.Physics.Arcade.Group} bullets.enemy - Phaser Group of enemy bullets
 * @property {Phaser.Physics.Arcade.Group} explosions - Phaser group of explosion objects
 */

class ObjectSpawner {
    static GRID_COUNT = { row: 5, col: 13 }; // The # rows/cols of enemies

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

        this.level = this.scene.scene.get('Preloader').level;

        // spawn enemy usb in 15-60 seconds
        let secs = Phaser.Math.Between(15, 60);
        console.log(`Spawning enemy USB in ${secs}s`)
        // spawn usb in secs seconds
        this.scene.time.delayedCall(secs * 1000, this.spawn_usb_enemy, [], this.scene.scene)
    }

    /**
     * @private
     * @description initializes all level objects
     */

    init_all() {
        this.init_barriers();
        this.init_player();
        this.init_player_bullets();
        this.init_enemy_bullets();
        this.init_explosions();
        this.init_enemy_grid();
    }

    init_all_without_grid() {
        this.init_barriers();
        this.init_player();
        this.init_player_bullets();
        this.init_enemy_bullets();
        this.init_explosions();
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
     * @private
     * @description initializes the grid of the enemies. Should only be called at the start of the level.  */
    init_enemy_grid() {
        let gc = ObjectSpawner.GRID_COUNT;
        console.log(gc);
        console.log(enemy_defs);
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
                    enemy = this.scene.add.enemy_l1_top(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y,
                        this.level
                    );
                } else if (y == 1 || y == 2) {
                    enemy = this.scene.add.enemy_l1_middle(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y,
                        this.level
                    );
                } else {
                    enemy = this.scene.add.enemy_l1_bottom(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y,
                        this.level
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
        for (let i = 0; i < PlayerBullet.bullet_capacity; ++i) {
            console.log(`Adding bullet #${i + 1}`);
            let bullet = this.scene.add.player_bullet(this.scene);
            this.bullets.player.add(bullet);
        }
    }

    /**
     * @private
     * @description Initializes all of the enemies' bullets. Should only be called at the start of the level.
     */
    init_enemy_bullets() {
        console.log("Initializing enemy bullets");
        for (let i = 0; i < enemy_bull_defs.max_bullets; ++i) {
            console.log(`Adding bullet #${i + 1}`);
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
            console.log(`Added explosion #${i + 1}`)
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
}

export { ObjectSpawner };
