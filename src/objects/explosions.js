const ExplosionConstDefs = {
    max_explosions: 10,
}
class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, "explosion");

        // scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setSize(32, 32);
        console.log(this)
        // this.play("bullet");
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    create() {
        console.log("Created explosion")
    }

    // animate explosion at coords (x,y)
    activate(x, y) {
        console.log(`Activating explosion at (${x},${y})`)
        this.setPosition(x, y);
        this.play("cottonball_explode");
        this.setVisible(true);
        this.setActive(true);
    }

    deactivate() {
        this.setPosition(-64, -64);
        this.setVisible(false);
        this.setActive(false);
    }

    update(time, delta) {
        this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
    }

    move() {
        this.y += BulletConstDefs.speed.y;
    }

    rotate() {
        this.setRotation(this.rotation + BulletConstDefs.rotation_speed);
    }
}

export { Explosion, ExplosionConstDefs };
