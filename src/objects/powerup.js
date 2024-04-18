const PowerupsConstDefs = {
    dims: { w: 80, h: 80 },
    speed: { x: 0, y: 2 }, // base speed (before upgrade calculations)
    offset: { x: 0, y: 0 },
    rotation_speed: 0.1,
};

/**
 * @classdesc powerups that buff the player.

 */
class Powerups extends Phaser.Physics.Arcade.Sprite {
    // the absolute max powerups that the game can ever have in the scene
    static powerup_capacity = 4;
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The scene in which the bullet exists.
     * @param {string} power - "spread" | "pierce"
     */
    constructor(scene, power) {
        super(scene, -1024, -1024, "spreadshot_icon");
        this.power = power;
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.body.onOverlap = true;
        this.speed = PowerupsConstDefs.speed.y;
        this.setActive(false)
    }

    /* It's important to add this to every subclass that extends a phaser object.
    * See: https://phaser.discourse.group/t/problem-with-preupdate-in-extend-classes/6232
    */
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    update(time, delta) {
        /* `update()` will implicitly be called every frame if it is contained in a group where `runChildUpdate = true`.
        * See:`ObjectSpawner.js`
        */
        if (this.active) {
            //this.move();
            this.check_bounds();
            this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
        }
    }

    /**
     * @public
     * @description Checks powerup is offscreen. If so, then it is deactivated.
     */
    check_bounds() {
        if (this.y < -16 ||
            this.y > this.scene.game.config.height - 90 ||
            this.x < 0 ||
            this.x > this.scene.game.config.width)
            this.setVelocity(0, 0);
    }
    /**
     * @public
     * @description Activate the powerup at (x,y) at a given speed
     * @param {number} x The x-coord in which the powerup should appear at
     * @param {number} y The y-coord in which the powerup should appear at
     * @param {number} speed The movement speed of the powerup
     */
    activate(x, y, speed, power) {
        if (!power || !["spread", "pierce"].includes(power))
            power = ["spread", "pierce"][Phaser.Math.Between(0, 1)] // choose random
        this.power = power;
        this.setTexture(`${power}shot_icon`);

        this.speed = speed;
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);
        this.setVelocity(0, 200);
    }

    /** 
     * @public
     * @description Deactivate the powerup and move it offscreen
     */
    deactivate() {
        if (this.active) this.scene.powerup_stats.active_powerups--;
        this.setPosition(-1024, -1024);
        this.setVisible(false);
        this.setActive(false);
        this.setVelocity(0, 0);
    }

}



export { PowerupsConstDefs, Powerups };