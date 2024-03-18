import { EnemyBulletConstDefs as bull_defs } from "./bullet"
import { EventDispatcher } from "../utils/event_dispatcher";
import { fonts } from "../utils/fontStyle";

// Ease Helper: https://labs.phaser.io/view.html?src=src/tweens/eases/ease%20mixer.js

// Grid gap and spawn_start are not scaled factors
const EnemyConstDefs = {
    dims: { w: 80, h: 80 },
    scale: { w: .5, h: .5 },
    spawn_start: { x: 80, y: 140 },
    grid_gap: { x: 28, y: 12 },
};

/**
 * @classdesc The base class for the main enemies that form the grid.
 * @property TODO: Add details about the properties for this object
 */
class BaseGridEnemy extends Phaser.Physics.Arcade.Sprite {
    static move_gap = { x: 8, y: 10 };
    static timers = {
        last_fired: 0,
        shoot_cd: 1000,
        last_moved: 0,
        move_cd: 0,
    }
    moneyValue; // defined in subclass
    scoreValue; // defined in subclass
    /**
     * @param {Phaser.Scene} scene The scene to spawn the enemy in
     * @param {number} x x-coord of spawn pos
     * @param {number} y y-coord of spawn pos
     * @param {string} anim_key The animation key to play for this enemy
     * @param {*} const_defs A collection of constant vars
     */
    constructor(scene, x, y, anim_key, const_defs) {
        super(scene, x, y);
        this.const_defs = const_defs;
        this.anim_key = anim_key;

        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setPosition(x, y)
            .setSize(this.const_defs.dims.w, this.const_defs.dims.h)
            .setScale(this.const_defs.scale.w, this.const_defs.scale.h)
            .setOffset(0, 0)
            .play(this.anim_key);

        this.scene = scene;

        this.move_direction = 1;
        // when enemy1 reaches x_bound, it changes row and direction

        this.x_bound = {
            min: this.const_defs.dims.w / 2,
            max: scene.game.config.width - this.const_defs.dims.w / 2
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
            bullet.setPosition(this.x, this.y);
        }
    }

    /**
     * @public
     * @description Handles left/right enemy movement
     * @param {*} time Time variable passed in from update()
     */

    move_x(time) {
        this.x += (BaseGridEnemy.move_gap.x * this.move_gap_scalar * this.move_direction);
    }

    /**
     * @public 
     * @description Handles enemy downward movement
     */
    move_down() {
        this.move_direction *= -1; // flip move direction
        this.y += BaseGridEnemy.move_gap.y;
        this.x += (BaseGridEnemy.move_gap.x * this.move_direction); // move back in bounds
    }


    die() {
        this.destroy();
    }
    // return true if this enemy is overlapping an x boundary
    is_x_inbounds() {
        return (this.x >= this.x_bound.min && this.x <= this.x_bound.max);
    }

    is_y_inbounds() {
        return (this.y + this.const_defs.dims.h < this.y_bound);
    }
}

class Enemy1 extends BaseGridEnemy {
    scoreValue = 30;
    moneyValue = 25;
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_top_idle", EnemyConstDefs);
    }
}

class Enemy2 extends BaseGridEnemy {
    scoreValue = 20;
    moneyValue = 10;
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_middle_idle", EnemyConstDefs);
    }
}

class Enemy3 extends BaseGridEnemy {
    scoreValue = 10;
    moneyValue = 5;
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_bottom_idle", EnemyConstDefs);
    }
}

export { BaseGridEnemy, Enemy1, Enemy2, Enemy3, EnemyConstDefs };