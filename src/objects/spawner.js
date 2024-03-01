import { Enemy, EnemyConstDefs as enemy_defs } from "./enemy";
import { PlayerBullet, PlayerBulletConstDefs as player_bull_defs, EnemyBullet, EnemyBulletConstDefs as enemy_bull_defs } from "./bullet";
import { Explosion, ExplosionConstDefs as expl_defs } from "./explosions";
import { Player } from "./player";
import { Barrier } from "./barrier";
import "../factory/object_factory";
/**
 * @classdesc An object that encapsulates all Phaser Groups. It initializes and spawns them to the game world when it is constructed.
 * @property {Phaser.Physics.Arcade.Group} barrier_chunks - Phaser group of barrier chunk objects
 * @property {Phaser.Physics.Arcade.Group} enemies - Phaser Group of all enemies
 * @property {Phaser.Physics.Arcade.Group} bullets.player - Phaser Group player's bullets
 * @property {Phaser.Physics.Arcade.Group} bullets.enemy - Phaser Group of enemy bullets
 * @property {Phaser.Physics.Arcade.Group} explosions - Phaser group of explosion objects
 */

class ObjectSpawner {
    constructor(scene) {
        this.scene = scene;
        this.enemies = this.scene.physics.add.group({
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

        this.level = this.scene.scene.get('Preloader').level;

        this.init_all();
    }

    /**
     * @private
     * @description initializes all level objects
     */

    init_all() {
        this.init_barriers();
        this.init_player_bullets();
        this.init_enemy_bullets();
        this.init_explosions();
        this.init_enemy_grid();
    }

    /**
     * @private
     * @description initializes all barriers and their chunks into the game scene. Should only be called at the start of the level.
     */

    init_barriers() {
        let left = new Barrier(this.scene, 100, 500, 5, 5, 40, 20, 0x2e2e2e);
        let mid = new Barrier(this.scene, 410, 500, 5, 5, 40, 20, 0x2e2e2e);
        let right = new Barrier(this.scene, 720, 500, 5, 5, 40, 20, 0x2e2e2e);

        this.barrier_chunks.addMultiple(left.chunks)
        this.barrier_chunks.addMultiple(mid.chunks)
        this.barrier_chunks.addMultiple(right.chunks)
    }

    /**
     * @private
     * @description initializes the grid of the enemies. Should only be called at the start of the level.
     */
    init_enemy_grid() {
        let gc = enemy_defs.grid_count;
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
                this.enemies.add(enemy);
            }
        }
    }

    /**
     * @private
     * @description Initializes all of the player's bullets. Should only be called at the start of the level.
     */
    init_player_bullets() {
        console.log("Initializing player bullets");
        for (let i = 0; i < player_bull_defs.max_bullets; ++i) {
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
}

export { ObjectSpawner };
