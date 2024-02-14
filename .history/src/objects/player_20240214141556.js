const PlayerConstDefs = {
    dims: { w: 32, h: 32 },
    speed: { x: 3, y: 0 },
    offset: {
        body: { x: 64, y: 68 },
        // The necromancer's staff changes position when flipping the sprite, so we need to define different bullet spawns for left/right. We probably won't need this anymore after we have our actual assets.
        bullet: {
            left: { x: -15, y: -15 },
            right: { x: 15, y: -15 },
        },
    },
    shoot_delay: 150,
};

export class Player extends Phaser.Physics.Arcade.Sprite {
    // game: Phaser.Game;
    // last_fired: number;
    // const_defs: any;

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
        this.play("shermie_walk");
        // this.play("player_idle");
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    create() { }

    update(time, delta, keys) {
        if (keys.d.isDown) {
            this.move(true);
        } else if (keys.a.isDown) {
            this.move(false);
        } else if (
            this.anims.isPlaying &&
            this.anims.currentAnim.key !== "player_idle" &&
            this.anims.currentAnim.key !== "player_shoot"
        )
            this.play("player_idle");

        if (keys.space.isDown || keys.w.isDown) this._shoot(time);
    }

    move(moving_right) {
        if (this.anims.isPlaying && this.anims.currentAnim.key === "player_idle")
            this.play("player_walk");

        if (moving_right) {
            if (this.flipX) this.flipX = false;
            this.x += this.const_defs.speed.x;
        } else {
            if (!this.flipX) this.flipX = true;
            this.x -= this.const_defs.speed.x;
        }
    }

    shoot(time) {
        if (time > this.last_fired) {
            // get the next available bullet, if one is available.
            let bullet = this.scene.objs.bullets.getFirstDead(false, 0, 0, "bullet");
            if (bullet !== null) {
                this.last_fired = time + this.const_defs.shoot_delay;
                bullet.activate(true);

                let bullet_start_pos = { x: 0, y: 0 };

                // get the proper bullet spawn position
                if (!this.flipX)
                    bullet_start_pos = {
                        x: this.x + this.const_defs.offset.bullet.right.x,
                        y: this.y + this.const_defs.offset.bullet.right.y,
                    };
                else
                    bullet_start_pos = {
                        x: this.x + this.const_defs.offset.bullet.left.x,
                        y: this.y + this.const_defs.offset.bullet.left.y,
                    };
                // set the bullet to its spawn position
                bullet.setPosition(bullet_start_pos.x, bullet_start_pos.y);
                this.anims.play("player_shoot");
                this.anims.nextAnim = "player_idle";
            }
        }
    }
}
