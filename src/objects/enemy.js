import { EnemyBulletConstDefs as bull_defs } from "./bullet"

// grid gap and spawn_start are not scaled factors
const EnemyConstDefs = {
    dims: { w: 80, h: 80 },
    scale: { w: .6, h: .6 },
    spawn_start: { x: 80, y: 130 },
    grid_gap: { x: 10, y: 12 },
    grid_count: { row: 5, col: 11 },
    move_gap: { x: 4, y: 20 },
};

class Enemy1 extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "Enemy");
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.play("enemy2_idle");
        this.setPosition(x, y);
        this.setSize(EnemyConstDefs.dims.w, EnemyConstDefs.dims.h);
        this.setScale(EnemyConstDefs.scale.w, EnemyConstDefs.scale.h);

        /* modify move_frame_delay to tweak the difficulty */
        this.move_frame_delay = 200;

        this.const_defs = EnemyConstDefs;
        this.dead = false;
        this.move_direction = 1;
        this.last_move = 0;
        // when enemy1 reaches x_bound, it changes row and direction
        this.x_bound = {
            min: this.const_defs.dims.w,
            max: this.scene.game.config.width - this.const_defs.dims.w,
        }
        // when enemy reaches y_bound, it's gameover
        this.y_bound = this.scene.game.config.height - this.const_defs.dims.h;

        this.x_shoot_bound = 200;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
    update(time, delta) {
        this.move_x(time, delta);
    }
    shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");
        if (bullet !== null) {
            bullet.activate(true);
            // set the bullet to its spawn position
            bullet.setPosition(this.x, this.y);
        }
    }

    move_x(time) {
        if (time > this.last_move) {
            this.last_move = time + this.move_frame_delay;
            this.x += (this.const_defs.move_gap.x * this.move_direction);
        }
    }

    change_row(time) {
        this.move_direction *= -1;
        this.y += this.const_defs.move_gap.y;
        this.x += (this.const_defs.move_gap.x * this.move_direction);
    }


    die() {
        this.setActive(false);
        this.setVisible(false);
        this.setPosition(-32, -32);
        this.dead = true;
    }
    // return true if this enemy is overlapping an x boundary
    is_x_inbounds() {
        return (this.x > this.x_bound.min && this.x < this.x_bound.max);
    }

    is_y_inbounds() {
        return (this.y < this.y_bound);
    }
}

export { Enemy1, EnemyConstDefs };
