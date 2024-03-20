import { InitKeyDefs } from "../keyboard_input";
import { Game } from "../scenes/Game";
import { PlayerBulletConstDefs as player_bull_defs } from "./bullet";

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
     * @param {Phaser.Scene} scene The scene to add the player to
     * @param {number} x x-coord of player spawn pos
     * @param {number} y y-coord of player spawn pos
     */
    static dims = { w: 64, h: 48 };
    static body_offset = { x: 16, y: 36 };
    static base_stats = {
        move_speed: 3,
        bullet_speed: 3,
    }

    static timers = {
        base_shoot_cd: 800,
        last_fired: 0,
    }

    #coord_list = [];
    #mouse_pos;
    constructor(scene, x, y) {
        super(scene, x, y, "Player");

        this.isInvincible = false;
        this.player_vars = scene.registry.get('player_vars');
        this.stats = this.player_vars.stats;

        scene.physics.add.existing(this);
        scene.add.existing(this);

        // Add shield graphics
        this.shieldVisuals = scene.add.graphics();
        this.updateShield();
        this.initShieldParticles();
        this.updateHitbox();

        this.setCollideWorldBounds(true)
            .setSize(Player.dims.w - 16, Player.dims.h - 8)
            .setOffset(Player.body_offset.x, Player.body_offset.y)
            .play("shermie_idle");

        this.resetPlayer();

        this.sounds = scene.registry.get('sound_bank');
        this.is_dead = false;
        this.dead_vel = {
            x: 0,
            y: -4,
            rot: 0.2, // rotation velocity
        };

        this.keys = InitKeyDefs(scene);
    }


    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    update(time, delta, keys) {
        let x = this.scene.game.input.mousePointer.x.toFixed(1);
        let y = this.scene.game.input.mousePointer.y.toFixed(1);
        this.#mouse_pos = { x: x, y: y };
        // respawn the player
        if (this.is_dead) {
            this.x += this.dead_vel.x;
            this.y += this.dead_vel.y;
            this.setRotation(this.rotation + this.dead_vel.rot);

            if (this.player_vars.lives > 0 && !this.is_inbounds()) {
                this.is_dead = false;
                this.resetPlayer();
                this.flashPlayer();
            }
            return;
        }
        ;

        this.updateShield();
        this.updateHitbox();

        if (keys.d.isDown || keys.right.isDown) {
            this.move(true);
        } else if (keys.a.isDown || keys.left.isDown) {
            this.move(false);
        }
        else if (
            this.anims &&
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
     * Marks the player as dead so that phaser knows to do start the death animation.
     */
    die() {
        if (this.player_vars.lives > 0 && !this.isInvincible && this.stats.shield <= 1) {
            this.player_vars.lives -= 1;
            this.sounds.bank.sfx.hurt.play();
            this.is_dead = true;
            // allow player to fly off screen
            this.setCollideWorldBounds(false);

            let ang = Phaser.Math.Between(3, 10);
            this.dead_vel.x =
                (this.x < this.scene.game.config.width / 2) ? ang : -ang;
        }
        else if (this.stats.shield > 1 && !this.isInvincible) {
            this.stats.shield -= 1;
            this.sounds.bank.sfx.hurt.play();
            this.shieldVisuals.clear();
        }
    }

    updateShield() {
        // console.log(`Shields: ${this.stats.shield}`);
        this.shieldVisuals.clear();
        if (this.stats.shield > 1) {
            // Create shield circle around the player
            this.shieldVisuals.lineStyle(2, 0x00FFFF, 1);
            this.shieldVisuals.strokeCircle(this.x, this.y, 40); // Adjust the radius as needed           
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
        this.player_vars.lives++;
    }

    /**
     * @description Handles Player movement
     * @param {boolean} moving_right True if moving right, false if left
     */
    move(moving_right) {
        if (this.anims &&
            this.anims.isPlaying &&
            this.anims.currentAnim.key === "shermie_idle")
            this.play("shermie_walk");

        if (moving_right) {
            if (this.flipX) this.flipX = false;
            this.x += Player.base_stats.move_speed + (this.stats.move_speed - 1) / 2;
        } else {
            if (!this.flipX) this.flipX = true;
            this.x -= Player.base_stats.move_speed + (this.stats.move_speed - 1) / 2;
        }
    }

    /**
     * @description Spawns a player bullet at the player's position if a bullet is available
     * @param {number} time The time parameter from `update()`
     */
    shoot(time) {
        let timer = Player.timers;
        let bullet_cap = 10;
        if (this.player_vars.active_bullets < bullet_cap &&
            time > timer.last_fired) {
            // get the next available bullet, if one is available.
            let bullet = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
            if (bullet !== null) {
                timer.last_fired = time + timer.base_shoot_cd - (this.stats.fire_rate * 50);
                this.player_vars.active_bullets++;
                let bullet_speed = player_bull_defs.speed.y + (this.stats.bullet_speed - 1);

                bullet.activate(this.x, this.y, bullet_speed);
                if (this.anims) {
                    this.anims.play("shermie_shoot");
                    this.anims.nextAnim = "shermie_idle";
                }
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
        return (this.y > -Player.dims.h &&
            this.y < this.scene.game.config.height + Player.dims.h &&
            this.x > -Player.dims.w &&
            this.x < this.scene.game.config.width + Player.dims.w);
    }

    /**
     * @description Initializes the shield particles
     * @returns {void}
     */
    initShieldParticles() {
        console.log("Initializing shield particles");
        this.shieldParticles = this.scene.add.particles(0, 0, 'flares', {
            frame: ['white'],
            color: [0x00FFFF, 0x0080FF, 0x004080],
            scale: { start: 0.3, end: 0, ease: 'exp.out' },
            alpha: { start: 1, end: 0, ease: 'exp.out' },
            lifespan: 500,
            speed: { min: 150, max: 350 },
            gravityY: 1500,
            blendMode: 'ADD',
            emitting: false
        });
    }

    /**
     * @description Updates the player's hitbox size based on the current shield status
     * @returns {void}
     */
    updateHitbox() {
        if (this.stats.shield > 1) {
            this.setCircle(40);
            this.setOffset(Player.body_offset.x - 16, Player.body_offset.y - 36);
        } else {
            this.setSize(Player.dims.w - 16, Player.dims.h - 8);
            this.setOffset(Player.body_offset.x, Player.body_offset.y);
        }
    }
}

export { Player }