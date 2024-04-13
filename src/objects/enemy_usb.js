import { Powerups, PowerupsConstDefs } from "../objects/powerup";

/**
 * @classdesc USB enemy implementation
 * TODO: Since we're gonna have more "special" a.k.a non-grid enemies later, we
 * should make a special enemy base class once we have a better idea of what
 * they will all share.
 */

class EnemyUSB extends Phaser.Physics.Arcade.Sprite {
    scoreValue = 500;
    moneyValue = 200;
    dead = false;
    /**
     * @param {Phaser.Scene} scene The scene to spawn the enemy in
     * @param {boolean} spawn_right If true, USB spawns on right side. Else, left side
     */
    constructor(scene, spawn_right) {
        super(scene, 0, 0);
        this.scene = scene;
        this.anim_key = "usb";
        this.hp = 1;

        scene.physics.add.existing(this);
        scene.add.existing(this);
        scene.objs.enemies.special.add(this);

        let y = 80;
        this.move = { timer: 0, cd: 150, gap: 8 };

        if (spawn_right) {
            this.setAngle(90)
                .setPosition(this.scene.game.config.width, y);
            this.move.dir = -1;
        } else {
            this.setAngle(-90)
                .setPosition(0, y);
            this.move.dir = 1;
        }

        this.setScale(1.5)
            .setOffset(0, 0)
            .play(this.anim_key);

        this.x_bound = {
            min: -32,
            max: scene.game.config.width + 32
        };
        
        this.deathEmitter = scene.add.particles(0, 0, 'flares', {
            frame: ['white'],
            color: [0xFFFF00, 0x008000, 0x0000FF, 0x4B0082, 0x8A2BE2, 0xFF0000, 0xFFA500],
            scale: { start: 0.3, end: 0, ease: 'exp.out' },
            alpha: { start: 1, end: .5, ease: 'exp.out' },
            lifespan: 4000,
            speed: { min: 150, max: 300 },
            gravityY: 900,
            blendMode: 'COLOR',
            emitting: false
        });
    }

    update(time, delta) {
        if (time > this.move.timer + this.move.cd) {
            this.move.timer = time;
            this.x += this.move.gap * this.move.dir;
        }

        if (!this.is_x_inbounds())
            this.destroy();
    }

    is_x_inbounds() {
        return (this.x >= this.x_bound.min && this.x <= this.x_bound.max);
    }

    die() {
        if (!this.dead && (!this.scene.player_vars.perm_power.includes("spread") || !this.scene.player_vars.perm_power.includes("pierce"))) {
            this.dead = true;
            let power = this.scene.objs.powers.getFirstNth(Phaser.Math.Between(0, this.scene.objs.powers.countActive(false)), false, false, 0, 0, "powerup");
            if (power !== null) {
                let fall_speed = PowerupsConstDefs.speed.y;
                power.activate(this.x, this.y, -fall_speed);
                this.scene.powerup_stats.active_powerups++;
            }
            this.play("usb_explode")
                .on('animationcomplete', () => {
                    this.deathEmitter.explode(30, this.x, this.y);
                    this.destroy();
                });
        }
    }
}


export { EnemyUSB }