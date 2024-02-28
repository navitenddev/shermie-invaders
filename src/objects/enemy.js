import { EnemyBulletConstDefs as bull_defs } from "./bullet"

// Grid gap and spawn_start are not scaled factors
const EnemyConstDefs = {
    dims: { w: 80, h: 80 },
    scale: { w: .75, h: .75 },
    spawn_start: { x: 80, y: 100 },
    grid_gap: { x: 10, y: 12 },
    grid_count: { row: 5, col: 11 },
    move_gap: { x: 8, y: 10 },
    scoreValue: {
        enemy1: 30,
        enemy2: 20,
        enemy3: 10,
    },
};

/**
 * @classdesc The base class for the main enemies that form the grid.
 * @property TODO: Add details about the properties for this object
 */
class BaseGridEnemy extends Phaser.Physics.Arcade.Sprite {
    /**
     * 
     * @param {*} scene The scene to spawn the enemy in
     * @param {*} x x-coord of spawn pos
     * @param {*} y y-coord of spawn pos
     * @param {*} anim_key The animation key to play for this enemy
     * @param {*} const_defs A collection of constant vars
     */
    constructor(scene, x, y, anim_key, const_defs) {
        super(scene, x, y);
        this.const_defs = const_defs;
        this.anim_key = anim_key;

        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setPosition(x, y);
        this.setSize(this.const_defs.dims.w, this.const_defs.dims.h);
        this.setScale(this.const_defs.scale.w, this.const_defs.scale.h);
        this.setOffset(0, 0);
        this.play(this.anim_key);

        this.scene = scene;

        this.is_dead = false;
        this.move_direction = 1;
        // when enemy1 reaches x_bound, it changes row and direction

        this.x_bound = {
            min: this.const_defs.dims.w,
            max: scene.game.config.width
        };
        // when enemy reaches y_bound, it's gameover
        this.y_bound = scene.game.config.height - this.const_defs.dims.h;

        this.x_shoot_bound = 200; // distance from the player.x where the enemy will shoot

        this.move_gap_scalar = 1; // changes depending on enemies remaining
    }

    update(time, delta) {
    }

    /**
     * @description Activates and moves an enemy bullet object to the enemy position
     */
    shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");
        if (bullet !== null) {
            bullet.activate(true);
            // set the bullet to its spawn position
            bullet.setPosition(this.x, this.y);
        }
    }

    /**
     * @public
     * @description Handles left/right enemy movement
     * @param {*} time Time variable passed in from update()
     */

    move_x(time) {
        this.x += (this.const_defs.move_gap.x * this.move_gap_scalar * this.move_direction);
    }

    /**
     * @public 
     * @description Handles enemy downward movement
     */
    move_down() {
        this.move_direction *= -1; // flip move direction
        this.y += this.const_defs.move_gap.y;
        this.x += (this.const_defs.move_gap.x * this.move_direction); // move back in bounds
    }


    die() {
        this.destroy();
    }
    // return true if this enemy is overlapping an x boundary
    is_x_inbounds() {
        return (this.x >= this.x_bound.min && this.x <= this.x_bound.max - this.const_defs.dims.w);
    }

    is_y_inbounds() {
        return (this.y + this.const_defs.dims.h < this.y_bound);
    }
}

class Enemy1 extends BaseGridEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_top_idle", EnemyConstDefs);
        this.scoreValue = EnemyConstDefs.scoreValue.enemy1;
    }
}

class Enemy2 extends BaseGridEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_middle_idle", EnemyConstDefs);
        this.scoreValue = EnemyConstDefs.scoreValue.enemy2;
    }
}

class Enemy3 extends BaseGridEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_bottom_idle", EnemyConstDefs);
        this.scoreValue = EnemyConstDefs.scoreValue.enemy3;
    }
}

export { Enemy1, Enemy2, Enemy3, EnemyConstDefs };
