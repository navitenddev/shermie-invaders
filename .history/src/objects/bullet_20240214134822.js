const BulletConstDefs = {
    max_bullets: 3, // max bullets that the player can have on the screen at once
    dims: { w: 8, h: 16 },
    speed: { x: 0, y: -3.5 },
    offset: { x: 0, y: 0 },
};

class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y: number) {
        super(_scene, x, y, "Enemy");

        _scene.physics.add.existing(this);
        _scene.add.existing(this);
        this.setSize(BulletConstDefs.dims.w, BulletConstDefs.dims.h);
        this.play("bullet");
    }

    preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);
    }

    create() { }

    update(time: number, delta: number) {
        if (this.active) this._move();
        this._check_bounds();
        this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
    }

    private _move() {
        this.y += BulletConstDefs.speed.y;
    }

    private _check_bounds() {
        if (this.y < -16) this.activate(false);
    }

    activate(flag: boolean) {
        if (!flag) {
            this.setPosition(-64, -64);
        }
        this.setVisible(flag);
        this.setActive(flag);
    }
}

export { Bullet, BulletConstDefs };
