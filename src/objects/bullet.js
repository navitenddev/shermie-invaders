const PlayerBulletConstDefs = {
    dims: { w: 14, h: 32 },
    speed: { x: 0, y: 7 }, // base speed (before upgrade calculations)
    offset: { x: 0, y: 0 },
    rotation_speed: 0.1,
};

const EnemyBulletConstDefs = {
    max_bullets: 50, // max bullets that the enemies can have on the screen at once
    dims: { w: 4, h: 24 },
    speed: { x: 0, y: +3.5 },
    offset: { x: 0, y: 0 },
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
class PlayerBullet extends Phaser.Physics.Arcade.Sprite {
    // the absolute max bullets a player can ever shoot at once
    static bullet_capacity = 10;

    /**
     * @constructor
     * @param {Phaser.Scene} scene - The scene in which the bullet exists.
     * @param {number} x - The x-coord of the bullet's initial position.
     * @param {number} y - The y-coord of the bullet's initial position.
     */
    constructor(scene) {
        super(scene, -1024, -1024, "player_bullet");
        scene.physics.add.existing(this);
        scene.add.existing(this);
        //this.setScale(.25); 
        this.health=3;
        this.play('cottonBullet')
            .setSize(PlayerBulletConstDefs.dims.w, PlayerBulletConstDefs.dims.h)
            .setScale(0.75)
            .setVisible(false)
            .setActive(false)


        this.player_vars = scene.registry.get('player_vars');
        this.body.onOverlap = true;
        this.speedy = PlayerBulletConstDefs.speed.y;
        this.speedx= PlayerBulletConstDefs.speed.x;
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
            this.check_bounds();
            this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
        }
    }
    /**
     * @private
     * @description The bullet movement per `update()`
     */
    move() {
        this.y -= this.speedy;
        if(this.player_vars.power=="spread")this.x -= this.speedx;
    }

    hurt_bullet(){
        this.health--;
        if(this.health==0) {
            this.health=3
            this.deactivate();
        }
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
    activate(x, y, vx=0, vy=500) {
        this.setVelocity(vx, -vy)
            .setPosition(x, y)
            .setAngle(Math.atan2(-vy, vx)* (180 / Math.PI)+90)
            .setVisible(true)
            .setActive(true);
    }

    /** 
     * @public
     * @description Deactivate the bullet and move it offscreen
     */
    deactivate() {
        if (this.active) this.player_vars.active_bullets--;
        this.setPosition(-1024, -1024);
        this.setVisible(false);
        this.setActive(false);
        this.setVelocity(0, 0);
    }

}

/** 
 * @classdesc A bullet that the enemy shoots.
 * 
 * Note: Reusable objects (like bullets and explosions) are not constantly created and destroyed. Reusable objects are first initialized as invisble, inactive, and offscreen when the game begins. 
 * 
 * When they are needed, the caller will first find if any of said object is available (aka, inactive). If so, that object is teleported to where it should appear and activated.
 * 
 * Then, they are automatically set to inactive and invisible again when they are no longer needed.
 * 
 * This way we don't have to waste resources on constantly creating and destroying objects.
 */
class EnemyBullet extends Phaser.Physics.Arcade.Sprite {
    /**
     * @constructor
     * @param {Phaser.Scene} scene - The scene in which the bullet exists.
     * @param {number} x - The x-coord of the bullet's initial position.
     * @param {number} y - The y-coord of the bullet's initial position.
     */
    constructor(scene) {
        super(scene, -1024, -1024, "enemy_bullet");
        this.scene.physics.add.existing(this);
        
        this.scene.add.existing(this);
        this.play("bullet")
            .setSize(EnemyBulletConstDefs.dims.w, EnemyBulletConstDefs.dims.h)
            .setVisible(false)
            .setActive(false)
            .setAngle(90);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
    }

    update(time, delta) {
        // if (this.active) this.move();
        this.check_bounds();
        this.debugBodyColor = this.body?.touching.none ? 0x0099ff : 0xff9900;
    }
    /**
     * @private
     * @description The bullet movement per `update()`
     */
    move() {
        this.y += EnemyBulletConstDefs.speed.y;
    }

    /**
     * @public
     * @description deactivates the bullet if it's out of bounds
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
     * @description Activate the bullet at (x,y)
     * @param {number} x The x-coord in which the bullet should appear at
     * @param {number} y The y-coord in which the bullet should appear at
     * @param {number} vx The velocity in the x-direction
     * @param {number} vy The velocity in the y-direction
     */
    activate(x, y, vx = 0, vy = 300) {
        this.setVelocity(vx, vy)
            .setPosition(x, y)
            .setAngle(Math.atan2(vy, vx) * (180 / Math.PI))
            .setVisible(true)
            .setActive(true);
    }

    /** 
     * @public
     * @description Deactivate the bullet and move it offscreen
     */
    deactivate() {
        this.setPosition(-1024, -1024)
            .setVelocity(0, 0)
            .setVisible(false)
            .setActive(false);
    }

}

export { PlayerBullet, PlayerBulletConstDefs, EnemyBullet, EnemyBulletConstDefs };