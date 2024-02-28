import { Game } from "../scenes/Game";

const PlayerConstDefs = {
    dims: { w: 64, h: 48 },
    speed: { x: 3, y: 0 },
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

    constructor(scene, x, y) {
        super(scene, x, y, "Player");
        this.lives = 3; // player starts with 3 lives
        this.maxLives = Player.MAX_LIVES;

        this.isInvincible = false; 
        
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
        if (this.is_dead) {
            this.x += this.dead_vel.x;
            this.y += this.dead_vel.y;
            this.setRotation(this.rotation + this.dead_vel.rot);
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
     * @description When the player should die, this is called. 
     * 
     * Marks the player as dead so that phaser knows to do start the death animation.
     */
    die() {
        if (this.lives > 0 && !this.isInvincible) {
            this.lives -= 1;
            this.sounds.bank.sfx.hurt.play();
            if (this.lives === 0) {
                this.is_dead = true;
                // allow player to fly off screen
                this.setCollideWorldBounds(false);

                // if player dies on left half of screen, they should fly top right
                // if player dies on right half of screen, they should fly top left
                this.dead_vel.x =
                    (this.x < this.scene.game.config.width / 2) ? 4 : -4;
                
                return; // return so we don't reset player position, flash
            }
            // this.resetPlayerPosition(); testing
            this.flashPlayer();
            
        }
    }


    /**
     * @description Resets the player's position to the center bottom of the screen
     */
    resetPlayerPosition() {
        this.setPosition(this.scene.game.config.width / 2, this.scene.game.config.height - 96);
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
        if (this.lives < this.maxLives) {
            this.lives++;
        }
    }

    /**
     * @description Handles Player movement
     * @param {H} moving_right True if moving right, false if left
     */
    move(moving_right) {
        if (this.anims.isPlaying && this.anims.currentAnim.key === "shermie_idle")
            this.play("shermie_walk");

        if (moving_right) {
            if (this.flipX) this.flipX = false;
            this.x += this.const_defs.speed.x;
        } else {
            if (!this.flipX) this.flipX = true;
            this.x -= this.const_defs.speed.x;
        }
    }

    /**
     * @description Spawns a player bullet at the player's position if a bullet is available
     * @param {*} time The time parameter from `update()`
     */
    shoot(time) {
        let timer = this.scene.timers.player;
        if (time > timer.last_fired) {
            // get the next available bullet, if one is available.
            let bullet = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
            if (bullet !== null) {
                timer.last_fired = time + timer.shoot_cd;
                bullet.activate(this.x, this.y);
                // set the bullet to its spawn position
                this.anims.play("shermie_shoot");
                this.anims.nextAnim = "shermie_idle";
                this.sounds.bank.sfx.shoot.play();
            }
            else{
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