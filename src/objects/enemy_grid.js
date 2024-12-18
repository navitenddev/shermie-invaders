import { EnemyBulletConstDefs as bull_defs } from "./bullet"
import { EventDispatcher } from "../utils/event_dispatcher";
import { Powerups, PowerupsConstDefs } from "../objects/powerup";

/**
 * @classdesc The base class for the main enemies that form the grid.
 * @property TODO: Add details about the properties for this object
 */
class GridEnemy extends Phaser.Physics.Arcade.Sprite {
    static const_defs = {
        dims: { w: 39, h: 39 },
        scale: { w: 1, h: 1 },
        spawn_start: { x: 80, y: 140 },
        grid_gap: { x: 28, y: 12 },
    };
    static destructionEmitter = null;
    static move_gap = { x: 8, y: 10 };
    static timers = {
        last_fired: 0,
        shoot_cd: 0, // set in ai_grid_enemies()
        last_moved: 0,
        move_cd: 0, // set in ai_grid_enemies()
    };
    scoreValue; // defined in args
    moneyValue; // defined in args
    /**
     * @param {Phaser.Scene} scene The scene to spawn the enemy in
     * @param {number} x x-coord of spawn pos
     * @param {number} y y-coord of spawn pos
     * @param {string} anim_key The animation key to play for this enemy
     * @param {number} score_val Amount of score rewarded for kill
     * @param {number} money_val Amount of money rewarded for kill
     */
    constructor(scene, x, y, anim_key = "placeholder", score_val = 0, money_val = 0) {
        super(scene, x, y);
        this.anim_key = anim_key;
        this.scoreValue = score_val;
        this.moneyValue = money_val;

        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setPosition(x, y)
            .setSize(GridEnemy.const_defs.dims.w, GridEnemy.const_defs.dims.h)
            .setScale(GridEnemy.const_defs.scale.w, GridEnemy.const_defs.scale.h)
            .setOffset(0, 0)
            .play(this.anim_key);

        this.scene = scene;

        this.move_direction = 1;
        // when enemy1 reaches x_bound, it changes row and direction

        this.x_bound = {
            min: GridEnemy.const_defs.dims.w / 2,
            max: scene.game.config.width - GridEnemy.const_defs.dims.w / 2
        };
        // when enemy reaches y_bound, it's gameover
        this.y_bound = scene.game.config.height - GridEnemy.const_defs.dims.h;

        this.x_shoot_bound = 250; // distance from the player.x where the enemy will shoot

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
            let vy = Phaser.Math.Clamp(300 + (this.scene.registry.get('level') * 10), 1, 900);
            bullet.activate(this.x, this.y, 0, vy);
        }
    }


    /**
     * @public
     * @description Handles left/right enemy movement
     * @param {*} time Time variable passed in from update()
     */

    move_x(time) {
        this.x += (GridEnemy.move_gap.x * this.move_gap_scalar * this.move_direction);
    }

    /**
     * @public 
     * @description Handles enemy downward movement
     */
    move_down() {
        this.move_direction *= -1; // flip move direction
        this.y += GridEnemy.move_gap.y;
        this.x += (GridEnemy.move_gap.x * this.move_direction); // move back in bounds
    }


    die() {
        if (Phaser.Math.Between(0, 29) == 0 && (!this.scene.player_vars.perm_power.includes("spread") || !this.scene.player_vars.perm_power.includes("pierce"))) {
            let power = this.scene.objs.powers.getFirstDead(false, 0, 0, "powerup");
            if (power) {
                power.activate(this.x, this.y, -PowerupsConstDefs.speed.y);
                this.scene.powerup_stats.active_powerups++;
            }
        }

        if (GridEnemy.destructionEmitter !== null) {
            GridEnemy.destructionEmitter.explode(20, this.x, this.y);
        }

        this.destroy();
    }
    // return true if this enemy is overlapping an x boundary
    is_x_inbounds() {
        return (this.x >= this.x_bound.min && this.x <= this.x_bound.max);
    }

    is_y_inbounds() {
        return (this.y + GridEnemy.const_defs.dims.h < this.y_bound);
    }

    static initDestructionEmitter(scene) {
        GridEnemy.destructionEmitter = scene.add.particles(0, 0, 'flares', {
            frame: ['white'],
            color: [0x39FF14],
            scale: { start: 0.3, end: 0, ease: 'exp.out' },
            alpha: { start: 1, end: .5, ease: 'exp.out' },
            lifespan: 500,
            speed: { min: 150, max: 350 },
            gravityY: 2000,
            blendMode: 'COLOR',
            emitting: false
        });
    }

}

export { GridEnemy };