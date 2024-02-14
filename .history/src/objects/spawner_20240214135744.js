import { Enemy, EnemyConstDefs } from "../objects/enemy";
import { Bullet, BulletConstDefs } from "../objects/bullet";
import { Player } from "../objects/player";
import "../factory/object_factory";

const bull_defs = BulletConstDefs;

class ObjectHandler {
    constructor(scene, player) {
        console.log(player);
        this.player = player;
        this.enemies = this._scene.physics.add.group({
            runChildUpdate: true,
        });
        this.bullets = this._scene.physics.add.group({
            runChildUpdate: true,
        });
        this.init_enemies();
        this.init_bullets();
        this.add_overlap();
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
        let const_defs = EnemyConstDefs;
        let gc = const_defs.grid_count;
        for (let y = 0; y < gc.row; ++y) {
            for (let x = 0; x < gc.col; ++x) {
                let spawn_pos = {
                    x:
                        const_defs.spawn_start.x * const_defs.scale.w +
                        (const_defs.dims.w + const_defs.grid_gap.x) *
                        x *
                        const_defs.scale.w,
                    y:
                        const_defs.spawn_start.y * const_defs.scale.h +
                        (const_defs.dims.h + const_defs.grid_gap.y) *
                        y *
                        const_defs.scale.h,
                };
                let enemy = this._scene.add.enemy(
                    this._scene,
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
            let bullet = (this._scene.add.bullet(this._scene);
            bullet.body.onOverlap = true;
            this.bullets.add(bullet);
            bullet.activate(false);
        }
    }
}

export { ObjectHandler };
