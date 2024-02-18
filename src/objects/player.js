import gam from "../main";
import { Game } from "../scenes/Game";

const PlayerConstDefs = {
    dims: { w: 64, h: 48 },
    speed: { x: 3, y: 0 },
    offset: {
        body: { x: 8, y: 24 },
    },
};

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "Player");

        this.const_defs = PlayerConstDefs;

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.setPosition(x, y);
        this.setSize(this.const_defs.dims.w, this.const_defs.dims.h);
        this.setOffset(
            this.const_defs.offset.body.x,
            this.const_defs.offset.body.y
        );

        this.last_fired = 0;
        this.play("shermie_idle");

        this.is_dead = false;
        this.dead_vel = {
            x: 0,
            y: -4,
        };
        this.dead_rot_vel = 0.2;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    create() { }

    update(time, delta, keys) {
        if (this.is_dead) {
            this.x += this.dead_vel.x;
            this.y += this.dead_vel.y;
            this.setRotation(this.rotation + this.dead_rot_vel);
            return;
        }

        if (keys.d.isDown) {
            this.move(true);
        } else if (keys.a.isDown) {
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

    die() {
        this.is_dead = true;
        // allow player to fly off screen
        this.setCollideWorldBounds(false);

        // if player dies on left half of screen, they should fly top right
        // if player dies on right half of screen, they should fly top left
        this.dead_vel.x =
            (this.x < this.scene.game.config.width / 2) ? 4 : -4;

    }

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

    shoot(time) {
        let timer = this.scene.timers.player;
        if (time > timer.last_fired) {
            // get the next available bullet, if one is available.
            let bullet = this.scene.objs.bullets.player.getFirstDead(false, 0, 0, "player_bullet");
            if (bullet !== null) {
                timer.last_fired = time + timer.shoot_cd;
                bullet.activate(true);

                // set the bullet to its spawn position
                bullet.setPosition(this.x, this.y);
                this.anims.play("shermie_shoot");
                this.anims.nextAnim = "shermie_idle";
                this.scene.sound_bank.play('shoot');
            }
        }
    }

    is_inbounds() {
        // console.log(this.x, this.y, this.const_defs.dims.w, this.const_defs.dims.h)
        return (this.y > -this.const_defs.dims.h &&
            this.y < this.scene.game.config.height + this.const_defs.dims.h &&
            this.x > -this.const_defs.dims.w &&
            this.x < this.scene.game.config.width + this.const_defs.dims.w);
    }
}
