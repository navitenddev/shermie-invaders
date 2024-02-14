const EnemyConstDefs = {
    dims: { w: 16, h: 16 },
    scale: { w: 3, h: 3 },
    spawn_start: { x: 36, y: 20 },
    grid_gap: { x: 4, y: 4 },
    grid_count: { row: 6, col: 14 },
};

class Enemy extends Phaser.Physics.Arcade.Sprite {
    // dead: boolean
    constructor(scene, x, y) {
        super(_scene, x, y, "Enemy");
        _scene.physics.add.existing(this);
        _scene.add.existing(this);
        this.play("enemy_idle");
        this.setPosition(x, y);
        this.setSize(EnemyConstDefs.dims.w, EnemyConstDefs.dims.h);
        this.setScale(EnemyConstDefs.scale.w, EnemyConstDefs.scale.h);
        this.dead = false;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }
    update(time, delta) { }
    shoot() { }
    move(moving_right: boolean) { }
    die() {
        this.setActive(false);
        this.setVisible(false);
        this.setPosition(-32, -32);
        this.dead = true;
    }
}

export { Enemy, EnemyConstDefs };
