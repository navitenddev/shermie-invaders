import { Enemy, EnemyConstDefs as enemy_defs } from "./enemy";
import { PlayerBullet, PlayerBulletConstDefs as player_bull_defs, EnemyBullet, EnemyBulletConstDefs as enemy_bull_defs } from "./bullet";
import { Explosion, ExplosionConstDefs as expl_defs } from "./explosions";
import { Player } from "./player";
import "../factory/object_factory";

class ObjectSpawner {
    // player
    // enemies, bullets
    constructor(scene, player) {
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
        this.init_enemies();
        this.init_player_bullets();
        this.init_enemy_bullets();
        this.init_explosions();
    }

    cleanup_enemies() {
        let entries = this.enemies.children.entries;
        // check each enemy
        for (let i = entries.length - 1; i >= 0; --i) {
            let entry = entries[i];
            // if enemy dead, remove it
            if (entry && entry.dead) entries.splice(i, 1);
        }
    }

    init_enemies() {
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
                        spawn_pos.y
                    );
                } else if (y == 1 || y == 2) {
                    enemy = this.scene.add.enemy_l1_middle(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y
                    );
                } else { 
                    enemy = this.scene.add.enemy_l1_bottom(
                        this.scene,
                        spawn_pos.x,
                        spawn_pos.y
                    );
                }
                this.enemies.add(enemy);
            }
        }
    }

        init_player_bullets() {
        console.log("Initializing player bullets");
        for (let i = 0; i < player_bull_defs.max_bullets; ++i) {
            console.log(`Adding bullet #${i + 1}`);
            let bullet = this.scene.add.player_bullet(this.scene);
            this.bullets.player.add(bullet);
        }
    }

    init_enemy_bullets() {
        console.log("Initializing enemy bullets");
        for (let i = 0; i < enemy_bull_defs.max_bullets; ++i) {
            console.log(`Adding bullet #${i + 1}`);
            let bullet = this.scene.add.enemy_bullet(this.scene);
            this.bullets.enemy.add(bullet);
        }
    }

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
