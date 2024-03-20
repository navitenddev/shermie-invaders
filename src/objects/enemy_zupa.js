import { fonts } from "../utils/fontStyle";

const ZUPA_PATHS = {
    // Triangle
    // [179.6, 388.8, 497.2, 92.0, 831.1, 439.3]
    START: new Phaser.Curves.Path(180, 389)
        .lineTo(497, 92)
        .lineTo(831, 440)
        .closePath(),
    SQUARE: new Phaser.Curves.Path(277, 135)
        .lineTo(289, 394)
        .lineTo(722, 394)
        .lineTo(728, 135)
        .closePath(),

    // [276.9, 135.1, 288.7, 394.2, 721.8, 395.9, 727.7, 104.7 ]
};

console.log(ZUPA_PATHS.START.toJSON());
console.log(ZUPA_PATHS.SQUARE.toJSON());

class EnemyZupa extends Phaser.GameObjects.PathFollower {
    scoreValue = 200;
    moneyValue = 100;
    anim_key = "zupa_idle";

    static Y_NORMAL = 300;
    static ANGLE_VEL = 550;

    hp = 40;
    shoot_cd = 50;
    last_fired = 0;
    shots_fired = 0;
    state_list = [];

    graphics;
    graphics_follower;
    ai_state;
    state_text;
    hp_text;
    t_text;

    constructor(scene, x, y) {
        super(scene, x, y)
        scene.physics.add.existing(this);
        scene.add.existing(this);
        scene.objs.enemies.special.add(this);

        this.body.setSize(64, 64)
            .setOffset(0, 0);

        this.play(this.anim_key)

        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(1, 0xffffff, 1);

        this.graphics_follower = this.scene.add.graphics();
        this.graphics_follower.lineStyle(1, 0x2e2e2e, 1);

        this.state_text = this.scene.add.text(this.x, this.y, this.ai_state, fonts.tiny);
        this.hp_text = this.scene.add.text(this.x, this.y - 16, this.hp, fonts.tiny);

        this.path1 = new Phaser.Curves.Path(50, 100).splineTo([164, 46, 274, 142, 412, 57, 522, 141, 664, 64]);
        this.path2 = new Phaser.Curves.Path(100, 200).lineTo(500, 300);
        this.path3 = new Phaser.Curves.Path(400, 400).circleTo(100);

        this.path1.draw(this.graphics, 128);
        this.path2.draw(this.graphics, 128);
        this.path3.draw(this.graphics, 128);

        this.setPath(this.path1);
        this.startFollow({
            positionOnPath: true,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            rotateToPath: true,
            verticalAdjust: true
        });

    }

    die() {
        this.destroy();
    }
}

export { EnemyZupa }