const ExplosionConstDefs = {
    max_explosions: 10,
}

/**
 * @classdesc An object that encapsulates the explosion animation.
 * 
 * Note: Reusable objects (like bullets and explosions) are not constantly created and destroyed. Reusable objects are first initialized as invisble, inactive, and offscreen when the game begins. 
 * 
 * When they are needed, the caller will first find if any of said object is available (aka, inactive). If so, that object is teleported to where it should appear and activated.
 * 
 * Then, they are automatically set to inactive and invisible again when they are no longer needed.
 * 
 * This way we don't have to waste resources on constantly creating and destroying objects.
 */
class Explosion extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, "explosion");

        // scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setVisible(false);
        this.setActive(false);
        this.setSize(32, 32);
        this.setPosition(-1024, -1024);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    create() {
        console.log("Created explosion")
    }

    // animate explosion at coords (x,y)
    activate(x, y) {
        // console.log(`Activating explosion at (${x},${y})`)
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
