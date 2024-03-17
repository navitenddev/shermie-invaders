import { fonts } from "../utils/fontStyle";


/**
 * @classdesc USB enemy implementation
 * TODO: Since we're gonna have more "special" a.k.a non-grid enemies later, we
 * should make a special enemy base class once we have a better idea of what
 * they will all share.
 */

class EnemyUSB extends Phaser.Physics.Arcade.Sprite {
    scoreValue = 500;
    moneyValue = 200;
    /**
     * @param {Phaser.Scene} scene The scene to spawn the enemy in
     * @param {boolean} spawn_right If true, USB spawns on right side. Else, left side
     */
    constructor(scene, spawn_right) {
        super(scene, 0, 0);
        this.scene = scene;
        this.anim_key = "usb";
        this.scoreValue = EnemyConstDefs.scoreValue.enemyUSB;
        this.moneyValue = EnemyConstDefs.moneyValue.enemyUSB;

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
        this.play("usb_explode")
            .on('animationcomplete', this.destroy)
    }
}


export { EnemyUSB }