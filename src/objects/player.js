import { InitKeyDefs } from "../utils/keyboard_input";
import { Game } from "../scenes/Game";
import { PlayerBulletConstDefs as player_bull_defs } from "./bullet";
import { Powerups, PowerupsConstDefs } from "../objects/powerup";
import { FillBar } from "../ui/fill_bar";

// Index of stat array is player stat level - 1
const STAT_MAP = {
    // maps to pixels traversed per update
    bullet_speed: [
        4, 6, 8.5, 10, 12.5,
        13.5, 14.5, 15, 16.5, 17
    ],
    // maps to player velocity
    move_speed: [
        200, 300, 400, 500, 600,
    ],
    // maps to cooldown time between shots
    fire_rate: [
        800, 700, 600, 500, 400,
        350, 300, 250, 200, 150
    ],
    // shield does not need to map to anything 
}

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

    static timers = {
        last_fired: 0,
    }
    powerup = {
        max: 10,
        max_ammo: 0,
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

        this.dialogue_offset = { x: -128, y: -80 };

        this.keys = InitKeyDefs(scene);

        this.shield_bar_offset = {
            x: -50,
            y: -40
        }
        this.shield_bar = new FillBar(scene,
            this.x + this.shield_bar_offset.x,
            this.y + this.shield_bar_offset.y,
            100, 10, // w h
            10 - 1,  // total
            0x00FFFF // color
        );

        this.powerup_icon_offset = {
            x: -68,
            y: -48,
        }
        this.powerup_icon = scene.add.image(
            this.x + this.powerup_icon_offset.x,
            this.y + this.powerup_icon_offset.y,
            "spreadshot",
        ).setScale(0.75);

        this.powerup_bar_offset = {
            x: -50,
            y: -55,
        };
        this.powerup_bar = new FillBar(scene,
            this.x + this.powerup_bar_offset.x,
            this.y + this.powerup_bar_offset.y,
            100, 10,
            10,
            0xfafafa,
        );
    }


    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    #update_bars() {
        this.shield_bar.setPosition(this.x + this.shield_bar_offset.x,
            this.y + this.shield_bar_offset.y);
        this.shield_bar.set_value(this.player_vars.stats.shield - 1);

        this.powerup_bar.setPosition(this.x + this.powerup_bar_offset.x,
            this.y + this.powerup_bar_offset.y);
        this.powerup_bar.set_value(this.powerup.ammo);
    }

    #update_powerup_icon() {
        this.powerup_icon.setPosition(
            this.x + this.powerup_icon_offset.x,
            this.y + this.powerup_icon_offset.y
        );
        switch (this.player_vars.power) {
            case "spread":
            case "pierce": // fall through
                this.powerup_icon
                    .setTexture(`${this.player_vars.power}shot_icon`)
                    .setVisible(true);
                break;
            default:
                this.powerup_icon.setVisible(false);
                break;
        }
    }

    updateShield() {
        // console.log(`Shields: ${this.stats.shield}`);
        this.shieldVisuals.clear();
        if (this.stats.shield > 1) {
            // Create shield circle around the player
            this.shieldVisuals.lineStyle(2, 0x00FFFF, 1);
            this.shieldVisuals.strokeCircle(this.x, this.y + 15, 40); // Adjust the radius as needed           
        }
    }

    /**
     * @description Updates the player's hitbox size based on the current shield status
     */
    updateHitbox() {
        if (this.stats.shield > 1) {
            this.setCircle(30);
            this.setOffset(Player.body_offset.x - 8, Player.body_offset.y - 12);
        } else {
            this.setSize(Player.dims.w - 16, Player.dims.h - 8);
            this.setOffset(Player.body_offset.x, Player.body_offset.y);
        }
    }

    update(time, delta, keys) {
        // Only display shield bar if we have shields
        (this.shield_bar.value) ?
            this.shield_bar.setVisible(true) :
            this.shield_bar.setVisible(false);

        // Only display powerup bar if we have powerups
        (this.powerup_bar.value) ?
            this.powerup_bar.setVisible(true) :
            this.powerup_bar.setVisible(false);

        this.#update_bars();
        this.#update_powerup_icon();

        // Update global player pos
        this.player_vars.x = this.x + this.dialogue_offset.x;
        this.player_vars.y = this.y + this.dialogue_offset.y;

        let x, y;
        if (this.scene) {
            x = this.scene.game.input.mousePointer.x.toFixed(1);
            y = this.scene.game.input.mousePointer.y.toFixed(1);
        }
        this.#mouse_pos = { x: x, y: y };
        // respawn the player
        if (this.is_dead) {
            this.x += this.dead_vel.x;
            this.y += this.dead_vel.y;
            this.setRotation(this.rotation + this.dead_vel.rot);

            if (this.player_vars.lives > 0 && !this.is_inbounds()) {
                // Timed delaycall to respawn function
                setTimeout(() => {
                    this.is_dead = false;
                    this.resetPlayer();
                    this.flashPlayer();
                }, 1200); // 1200 milliseconds delay (adjust if too high/low)
            }
            return;
        }

        this.updateShield();
        this.updateHitbox();

        if (keys.d.isDown || keys.right.isDown) {
            this.move(true);
        } else if (keys.a.isDown || keys.left.isDown) {
            this.move(false);
        } else if (
            this.anims &&
            this.anims.isPlaying &&
            this.anims.currentAnim.key !== "shermie_idle" &&
            this.anims.currentAnim.key !== "shermie_shoot"
        )
            this.play("shermie_idle");

        if (keys.space.isDown || keys.w.isDown) this.shoot(time);
        if (!keys.d.isDown && !keys.right.isDown &&
            !keys.a.isDown && !keys.left.isDown)
            this.setVelocity(0);
    }

    /**
     * @public
     * @description When the player should die, this is called. 
     * Marks the player as dead so that phaser knows to do start the death animation.
     */
    die() {
        if (this.isInvincible)
            return;
        if (this.player_vars.lives > 0 && this.stats.shield <= 1) {
            this.player_vars.lives -= 1;
            this.sounds.bank.sfx.hurt.play();
            this.is_dead = true;
            // allow player to fly off screen
            this.setCollideWorldBounds(false);

            let ang = Phaser.Math.Between(3, 10);
            this.dead_vel.x =
                (this.x < this.scene.game.config.width / 2) ? ang : -ang;
        }
        else if (this.stats.shield > 1) {
            this.stats.shield -= 1;
            this.sounds.bank.sfx.hurt.play();
            this.shieldVisuals.clear();
        }
        this.changePower("");
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
     * @description changes powerup
    */
    changePower(pow) {
        this.player_vars.power = pow;
        this.powerup.ammo = (pow) ? this.powerup.max : 0;
        if (!pow)
            this.power
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
            this.setVelocityX(STAT_MAP.move_speed[this.stats.move_speed - 1]);
        } else {
            if (!this.flipX) this.flipX = true;
            this.setVelocityX(-STAT_MAP.move_speed[this.stats.move_speed - 1]);
        }
    }

    /**
     * @description Spawns a player bullet at the player's position if a bullet is available
     * @param {number} time The time parameter from `update()`
     */
    shoot(time) {
        let timer = Player.timers;
        if (time > timer.last_fired) {
            let bullet = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
            if (bullet !== null) {
                timer.last_fired = time + STAT_MAP.fire_rate[this.stats.fire_rate - 1];
                this.player_vars.active_bullets++;
                let bullet_speed = STAT_MAP.bullet_speed[this.stats.bullet_speed - 1];

                bullet.activate(this.x, this.y, 0, bullet_speed * 100);
                if (this.anims) {
                    this.anims.play("shermie_shoot");
                    this.anims.nextAnim = "shermie_idle";
                }
                if (this.player_vars.power == "spread") {
                    let bulletr = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
                    if (bulletr !== null) {
                        this.player_vars.active_bullets++;
                        bulletr.activate(this.x, this.y, 50, bullet_speed * 100);
                        let bulletl = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
                        if (bulletl !== null) {
                            this.player_vars.active_bullets++;
                            bulletl.activate(this.x, this.y, -50, bullet_speed * 100);
                        }
                    }
                }
                if ((--this.powerup.ammo) <= 0)
                    this.changePower();
                this.sounds.bank.sfx.shoot.play();
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

}

export { Player }