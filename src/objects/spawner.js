import { Enemy, EnemyConstDefs } from "./enemy";
import { Bullet, BulletConstDefs } from "./bullet";
import { Explosion, ExplosionConstDefs } from "./explosions";
import { Player } from "./player";
import "../factory/object_factory";

const bull_defs = BulletConstDefs;
const expl_defs = ExplosionConstDefs;
const enemy_defs = EnemyConstDefs;

class ObjectSpawner {
    // player
    // enemies, bullets
    constructor(scene, player) {
        this.scene = scene;
        this.enemies = this.scene.physics.add.group({
            runChildUpdate: true,
        });
        this.bullets = this.scene.physics.add.group({
            runChildUpdate: true,
        });
        this.explosions = this.scene.physics.add.group({
            runChildUpdate: true,
        });
        this.init_enemies();
        this.init_bullets();
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
        console.log(enemy_defs)
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
                let enemy = this.scene.add.enemy(
                    this.scene,
                    spawn_pos.x,
                    spawn_pos.y
                );
                this.enemies.add(enemy);
            }
        }
    }

    init_bullets() {
        console.log("Initializing bullets");
        for (let i = 0; i < bull_defs.max_bullets; ++i) {
            console.log(`Adding bullet #${i + 1}`);
            let bullet = this.scene.add.bullet(this.scene);
            this.bullets.add(bullet);
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
