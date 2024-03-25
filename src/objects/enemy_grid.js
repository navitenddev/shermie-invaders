import { EnemyBulletConstDefs as bull_defs } from "./bullet"
import { EventDispatcher } from "../utils/event_dispatcher";
import { Powerups, PowerupsConstDefs } from "../objects/powerup";

/**
 * @classdesc The base class for the main enemies that form the grid.
 * @property TODO: Add details about the properties for this object
 */
class GridEnemy extends Phaser.Physics.Arcade.Sprite {
    static const_defs = {
        dims: { w: 60, h: 60 },
        scale: { w: .66, h: .66 },
        spawn_start: { x: 80, y: 140 },
        grid_gap: { x: 28, y: 12 },
    };
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
        if (Phaser.Math.Between(0,29) == 0) {
            let temp = Phaser.Math.Between(0, this.scene.objs.powers.countActive(false));
            let power = this.scene.objs.powers.getFirstNth(temp, false, false, 0, 0, "powerup");
            while(power==null && this.scene.objs.powers.countActive(false)>0){
                if(temp>Powerups.powerup_capacity){
                    temp=0;
                }
                temp++;
                power = this.scene.objs.powers.getFirstNth(temp, false, false, 0, 0, "powerup");
            }//while there is at least one inactive powerup available, finds a random inactive powerup to take
            if (power !== null) {
                let fall_speed = PowerupsConstDefs.speed.y;
                power.activate(this.x, this.y, -fall_speed);
                this.scene.powerup_stats.active_powerups++;
            }
            else{
                console.log("hey")
            }
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
}

export { GridEnemy };