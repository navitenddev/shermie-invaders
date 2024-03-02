import { Game } from "../scenes/Game";
import { PlayerBulletConstDefs as player_bull_defs } from "./bullet";

const PlayerConstDefs = {
    dims: { w: 64, h: 48 },
    speed: { x: 2, y: 0 }, // base movespeed
    offset: {
        body: { x: 16, y: 36 },
    },
};

/**
 * @classdesc
 * @property {Object} An object that contains all constant vars for the player
 * @property {SoundBank} sounds For playing sounds
 * @property {boolean} is_dead True if the player is dead
 * @property {Object.<string, number>} dead_vel Variables that are used in the player's death animation
 * 
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    /**
     * 
     * @param {*} scene The scene to add the player to
     * @param {*} x x-coord of player spawn pos
     * @param {*} y y-coord of player spawn pos
     */
    static MAX_LIVES = 5; // maximum number of lives the player can have

    static base_stats = {
        move_speed: 3,
        bullet_speed: 3,
    }

    constructor(scene, x, y) {
        super(scene, x, y, "Player");

        this.isInvincible = false;
        this.global_vars = this.scene.scene.get('Preloader');
        this.stats = this.global_vars.player.stats;

        this.const_defs = PlayerConstDefs;
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setCollideWorldBounds(true);
        this.setSize(this.const_defs.dims.w - 16, this.const_defs.dims.h - 8);
        this.setOffset(
            this.const_defs.offset.body.x,
            this.const_defs.offset.body.y
        );
        this.play("shermie_idle");
        this.resetPlayer();

        this.sounds = scene.scene.get('Preloader').sound_bank;
        this.is_dead = false;
        this.dead_vel = {
            x: 0,
            y: -4,
            rot: 0.2, // rotation velocity
        };
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    update(time, delta, keys) {
        // respawn the player

        if (this.is_dead) {
            this.x += this.dead_vel.x;
            this.y += this.dead_vel.y;
            this.setRotation(this.rotation + this.dead_vel.rot);

            if (this.global_vars.player.lives > 0 && !this.is_inbounds()) {
                this.is_dead = false;
                this.resetPlayer();
                this.flashPlayer();
            }
            return;
        }

        if (keys.d.isDown || keys.right.isDown) {
            this.move(true);
        } else if (keys.a.isDown || keys.left.isDown) {
            this.move(false);
        }
        else if (
            this.anims.isPlaying &&
            this.anims.currentAnim.key !== "shermie_idle" &&
            this.anims.currentAnim.key !== "shermie_shoot"
        )
            this.play("shermie_idle");

        if (keys.space.isDown || keys.w.isDown) this.shoot(time);

    }

    /**
     * @public
     * @description When the player should die, this is called. 
     * 
     * Marks the player as dead so that phaser knows to do start the death animation.
     */
    die() {
        if (this.global_vars.player.lives > 0 && !this.isInvincible) {
            this.global_vars.player.lives -= 1;
            this.sounds.bank.sfx.hurt.play();
            this.is_dead = true;
            // allow player to fly off screen
            this.setCollideWorldBounds(false);

            let ang = Phaser.Math.Between(3, 10);
            this.dead_vel.x =
                (this.x < this.scene.game.config.width / 2) ? ang : -ang;
        }
    }


    /**
     * @description Resets the player's position to the center bottom of the screen
     */
    resetPlayer() {
        this.setCollideWorldBounds(true);
        this.setRotation(0);
        this.setPosition(this.scene.game.config.width / 2.5, this.scene.game.config.height - 96);
    }

    /**
     * @description Flashes the player to indicate that they've been hit
     */
    flashPlayer() {
        this.isInvincible = true;
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.5, to: 1 }, // toggle between semi-transparent and visible
            ease: 'Linear',
            duration: 100,
            repeat: 9,
            yoyo: true,
            onComplete: () => {
                this.setAlpha(1); // make sure the player is fully visible after flashing
                this.isInvincible = false; // player is no longer invincible
            }
        });
    }


    /**
     * @description Adds a life to the player's life count
    */
    addLife() {
        this.global_vars.player.lives++;
    }

    /**
     * @description Handles Player movement
     * @param {boolean} moving_right True if moving right, false if left
     */
    move(moving_right) {
        if (this.anims.isPlaying && this.anims.currentAnim.key === "shermie_idle")
            this.play("shermie_walk");

        if (moving_right) {
            if (this.flipX) this.flipX = false;
            this.x += this.const_defs.speed.x + (this.stats.move_speed - 1) / 2;
        } else {
            if (!this.flipX) this.flipX = true;
            this.x -= this.const_defs.speed.x + (this.stats.move_speed - 1) / 2;
        }
    }

    /**
     * @description Spawns a player bullet at the player's position if a bullet is available
     * @param {number} time The time parameter from `update()`
     */
    shoot(time) {
        let timer = this.scene.timers.player;
        if (time > timer.last_fired) {
            // get the next available bullet, if one is available.
            let bullet = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
            if (bullet !== null) {
                timer.last_fired = time + timer.shoot_cd;
                let bullet_speed = player_bull_defs.speed.y + (this.stats.bullet_speed - 1);
                console.log(`bullet speed: ${bullet_speed}`)
                bullet.activate(this.x, this.y, bullet_speed);
                // set the bullet to its spawn position
                this.anims.play("shermie_shoot");
                this.anims.nextAnim = "shermie_idle";
                this.sounds.bank.sfx.shoot.play();
            }
            else {
                this.sounds.bank.sfx.reload.play();
            }
        }
    }

    /**
     * @public
     * @description This function's purpose is to check if the player is offscreen for when we are yeeting Shermie from existence.
     * @returns {boolean} True if the player is still on the screen.
     */
    is_inbounds() {
        return (this.y > -this.const_defs.dims.h &&
            this.y < this.scene.game.config.height + this.const_defs.dims.h &&
            this.x > -this.const_defs.dims.w &&
            this.x < this.scene.game.config.width + this.const_defs.dims.w);
    }
}

export { Player, PlayerConstDefs }