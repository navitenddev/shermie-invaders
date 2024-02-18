const PlayerBulletConstDefs = {
    max_bullets: 2, // max bullets that the player can have on the screen at once
    dims: { w: 16, h: 16 },
    speed: { x: 0, y: -3.5 },
    offset: { x: 0, y: 0 },
    rotation_speed: 0.1,
};

const EnemyBulletConstDefs = {
    max_bullets: 5, // max bullets that the enemies can have on the screen at once
    dims: { w: 8, h: 16 },
    speed: { x: 0, y: +3.5 },
    offset: { x: 0, y: 0 },
};

class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "player_bullet");
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setSize(PlayerBulletConstDefs.dims.w, PlayerBulletConstDefs.dims.h);
        this.setPosition(-1024, -1024);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    create() { }

    update(time, delta) {
        if (this.active) {
            this.move();
            this.rotate();
            this.check_bounds();
            this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
        }
    }

    move() {
        this.y += PlayerBulletConstDefs.speed.y;
    }

    rotate() {
        this.setRotation(this.rotation + PlayerBulletConstDefs.rotation_speed);
    }

    check_bounds() {
        if (this.y < -16) this.activate(false);
    }

    activate(flag) {
        if (!flag) this.setPosition(-1024, -1024);
        this.setVisible(flag);
        this.setActive(flag);
    }

}

class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_bullet");
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setSize(EnemyBulletConstDefs.dims.w, EnemyBulletConstDefs.dims.h);
        this.play("bullet");
        this.setPosition(-1024, -1024);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    create() { }

    update(time, delta) {
        if (this.active) this.move();
        this.check_bounds();
        this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
    }

    move() {
        this.y += EnemyBulletConstDefs.speed.y;
    }

    // deactivates the bullet if out of bounds
    check_bounds() {
        if (this.y < -EnemyBulletConstDefs.dims.w ||
            this.y > this.scene.game.config.height + EnemyBulletConstDefs.dims.h)
            this.activate(false);
    }

    activate(flag) {
        // console.log("Activating enemy bullet: " + false)
        if (!flag) this.setPosition(-1024, -1024);
        this.setVisible(flag);
        this.setActive(flag);
    }

}

export { PlayerBullet, PlayerBulletConstDefs, EnemyBullet, EnemyBulletConstDefs };
