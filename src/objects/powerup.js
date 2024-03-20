const PowerupsConstDefs = {
    dims: { w: 80, h: 80 },
    speed: { x: 0, y: 3.5 }, // base speed (before upgrade calculations)
    offset: { x: 0, y: 0 },
    rotation_speed: 0.1,
};

/**
 * @classdesc A bullet that the player shoots.
 * 
 * Note: Reusable objects (like bullets and explosions) are not constantly created and destroyed. Reusable objects are first initialized as invisble, inactive, and offscreen when the game begins. 
 * 
 * When they are needed, the caller will first find if any of said object is available (aka, inactive). If so, that object is teleported to where it should appear and activated.
 * 
 * Then, they are automatically set to inactive and invisible again when they are no longer needed.
 * 
 * This way we don't have to waste resources on constantly creating and destroying objects.
 */
class Powerups extends Phaser.Physics.Arcade.Sprite {
    // the absolute max bullets a player can ever shoot at once
    static powerup_capacity = 4;
    static buff =""
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The scene in which the bullet exists.
     * @param {number} x - The x-coord of the bullet's initial position.
     * @param {number} y - The y-coord of the bullet's initial position.
     */
    constructor(scene, pow) {
        this.buff=pow
        super(scene, -1024, -1024, "powerup");
        scene.physics.add.existing(this);
        scene.add.existing(this);
        //this.setScale(.25); 
        /*
        this.play('powerup')
            .setSize(PowerupsConstDefs.dims.w, PowerupsConstDefs.dims.h)
            .setScale(0.75)
            .setVisible(false)
            .setActive(false);
        */
        this.body.onOverlap = true;
        this.speed = PowerupsConstDefs.speed.y;
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
            this.move();
            this.check_bounds();
            this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
        }
    }
    /**
     * @private
     * @description The bullet movement per `update()`
     */
    move() {
        this.y -= this.speed;
    }

    /**
     * @public
     * @description Checks if the bullet is offscreen. If so, then the bullet is deactivated.
     */
    check_bounds() {
        if (this.y < -16 ||
            this.y > this.scene.game.config.height ||
            this.x < 0 ||
            this.x > this.scene.game.config.width)
            this.deactivate();
    }

    /**
     * @public
     * @description Activate the bullet at (x,y) at a given speed
     * @param {number} x The x-coord in which the bullet should appear at
     * @param {number} y The y-coord in which the bullet should appear at
     * @param {number} speed The movement speed of the bullet
     */
    activate(x, y, speed) {
        this.speed = speed;
        this.setPosition(x, y);
        this.setVisible(true);
        this.setActive(true);
    }

    /** 
     * @public
     * @description Deactivate the bullet and move it offscreen
     */
    deactivate() {
        console.log(this.buff);
        if (this.active) this.scene.powerup_stats.active_powerups--;
        this.setPosition(-1024, -1024);
        this.setVisible(false);
        this.setActive(false);
        this.setVelocity(0, 0);
    }

}



export { PowerupsConstDefs, Powerups};