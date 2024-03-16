import { EnemyBulletConstDefs as bull_defs } from "./bullet"
import { EventDispatcher } from "../utils/event_dispatcher";

// Ease Helper: https://labs.phaser.io/view.html?src=src/tweens/eases/ease%20mixer.js

// Grid gap and spawn_start are not scaled factors
const EnemyConstDefs = {
    dims: { w: 80, h: 80 },
    scale: { w: .5, h: .5 },
    spawn_start: { x: 80, y: 140 },
    grid_gap: { x: 28, y: 12 },
    scoreValue: {
        enemy1: 30,
        enemy2: 20,
        enemy3: 10,
        enemyUSB: 100,
    },
    moneyValue: {
        enemy1: 25,
        enemy2: 10,
        enemy3: 5,
        enemyUSB: 50,
    }
};
/* TODO: We might wanna fix the hierarchy of enemy classes. Something like:
 *
 *           BaseEnemy
 *         /          \
 *   BaseGridEnemy   BaseSpecialEnemy
 *     / | \            / | \
 *    e  t  c          e  t  c
 * 
 *  We don't really have to though, just might get messy later.
 */

/**
 * @classdesc The base class for the main enemies that form the grid.
 * @property TODO: Add details about the properties for this object
 */
class BaseGridEnemy extends Phaser.Physics.Arcade.Sprite {
    static move_gap = { x: 8, y: 10 };
    static timers = {
        last_fired: 0,
        shoot_cd: 1000,
        last_moved: 0,
        move_cd: 0,
    }
    /**
     * @param {Phaser.Scene} scene The scene to spawn the enemy in
     * @param {number} x x-coord of spawn pos
     * @param {number} y y-coord of spawn pos
     * @param {string} anim_key The animation key to play for this enemy
     * @param {*} const_defs A collection of constant vars
     */
    constructor(scene, x, y, anim_key, const_defs) {
        super(scene, x, y);
        this.const_defs = const_defs;
        this.anim_key = anim_key;

        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.setPosition(x, y)
            .setSize(this.const_defs.dims.w, this.const_defs.dims.h)
            .setScale(this.const_defs.scale.w, this.const_defs.scale.h)
            .setOffset(0, 0)
            .play(this.anim_key);

        this.scene = scene;

        this.move_direction = 1;
        // when enemy1 reaches x_bound, it changes row and direction

        this.x_bound = {
            min: this.const_defs.dims.w / 2,
            max: scene.game.config.width - this.const_defs.dims.w / 2
        };
        // when enemy reaches y_bound, it's gameover
        this.y_bound = scene.game.config.height - this.const_defs.dims.h;

        this.x_shoot_bound = 200; // distance from the player.x where the enemy will shoot

        this.move_gap_scalar = 1; // changes depending on enemies remaining
    }

    update(time, delta) {
    }

    /**
     * @description Activates and moves an enemy bullet object to the enemy position
     */
    shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");
        if (bullet !== null) {
            bullet.activate(true);
            bullet.setPosition(this.x, this.y);
        }
    }

    /**
     * @public
     * @description Handles left/right enemy movement
     * @param {*} time Time variable passed in from update()
     */

    move_x(time) {
        this.x += (BaseGridEnemy.move_gap.x * this.move_gap_scalar * this.move_direction);
    }

    /**
     * @public 
     * @description Handles enemy downward movement
     */
    move_down() {
        this.move_direction *= -1; // flip move direction
        this.y += BaseGridEnemy.move_gap.y;
        this.x += (BaseGridEnemy.move_gap.x * this.move_direction); // move back in bounds
    }


    die() {
        this.destroy();
    }
    // return true if this enemy is overlapping an x boundary
    is_x_inbounds() {
        return (this.x >= this.x_bound.min && this.x <= this.x_bound.max);
    }

    is_y_inbounds() {
        return (this.y + this.const_defs.dims.h < this.y_bound);
    }
}

class Enemy1 extends BaseGridEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_top_idle", EnemyConstDefs);
        this.scoreValue = EnemyConstDefs.scoreValue.enemy1;
        this.moneyValue = EnemyConstDefs.moneyValue.enemy1;
    }
}

class Enemy2 extends BaseGridEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_middle_idle", EnemyConstDefs);
        this.scoreValue = EnemyConstDefs.scoreValue.enemy2;
        this.moneyValue = EnemyConstDefs.moneyValue.enemy2;
    }
}

class Enemy3 extends BaseGridEnemy {
    constructor(scene, x, y) {
        super(scene, x, y, "enemy_l1_bottom_idle", EnemyConstDefs);
        this.scoreValue = EnemyConstDefs.scoreValue.enemy3;
        this.moneyValue = EnemyConstDefs.moneyValue.enemy3;
    }
}

/**
 * @classdesc USB enemy implementation
 * TODO: Since we're gonna have more "special" a.k.a non-grid enemies later, we
 * should make a special enemy base class once we have a better idea of what
 * they will all share.
 */

class EnemyUSB extends Phaser.Physics.Arcade.Sprite {
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

    drop_loot() {
        /* To be implemented */
    }
}
class EnemyReaper extends Phaser.Physics.Arcade.Sprite {
    static Y_NORMAL = 300;
    static CLONE_DELAY = { min: 10, max: 25 }; // time in seconds before Reaper clones itself
    ai_state = "CHASING";
    path;
    shots_fired = 0;
    shoot_cd;
    last_fired = 0;
    tween;
    // TODO: For now, ROAMING state is unused. If we want to make the boss easier, add it back into the state_list.
    state_list = ["CHASING", "SHOOT1", "SHOOT2", "SHOOT3"];
    // state_list = ["CHASING", "SHOOT1", "SHOOT2", "SHOOT3", "ROAMING"];
    hp;
    /**
     * 
     * @param {Phaser.Scene} scene   The scene to spawn the Reaper in
     * @param {number} x             x-position to spawn at
     * @param {number} y             y-position to spawn at
     * @param {number} hp            total HP of Reaper 
     * @param {number} shoot_cd      Fire rate of Reaper
     * @param {boolean} should_clone If true, will clone itself.
     * @param {number} score_value   The number of points yielded per hit
     * @param {number} money_value   The number of Shermie Bux dropped per hit
     */
    constructor(scene, x, y, hp = 40, shoot_cd = 500, should_clone = true, score_value = 100, money_value = 10) {
        super(scene, x, y);
        this.hp = hp;
        this.shoot_cd = shoot_cd;
        this.anim_key = "reaper_idle";
        this.scoreValue = score_value;
        this.moneyValue = money_value;
        this.play(this.anim_key);

        scene.physics.add.existing(this);
        scene.add.existing(this);
        scene.objs.enemies.special.add(this);


        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(1, 0xffffff, 1);
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.path = new Phaser.Curves.Path();

        if (should_clone) {
            let clone_delay = Phaser.Math.Between(EnemyReaper.CLONE_DELAY.min, EnemyReaper.CLONE_DELAY.max);
            this.scene.time.delayedCall(clone_delay * 1000, this.#clone_self, [], this);
        }
        this.scene = scene;
        console.log(`Spawned Reaper with ${this.hp} HP, Cloning: ${should_clone}`)
    }

    #clear_path() {
        this.graphics.clear();
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.path = new Phaser.Curves.Path();
        if (this.tween)
            this.tween.remove();
    }

    /**
     * @description State changes will require set up, which this function
     * handles. If no state is provided, a random state will be chosen
     * @param {string} new_state The state to change to
     */
    #change_state(new_state) {
        if (new_state === undefined) {
            new_state = this.state_list[Phaser.Math.Between(0, this.state_list.length - 1)];
        }
        console.log(`REAPER: ${new_state}`)
        this.ai_state = new_state;
        this.#clear_path(); // the path should be cleared for every state transition

        switch (new_state) {
            case "CHASING":
                break;
            case "ROAMING":
                {
                    this.path.moveTo(new Phaser.Math.Vector2(Phaser.Math.Between(0, 100), EnemyReaper.Y_NORMAL));
                    this.path.moveTo(new Phaser.Math.Vector2(Phaser.Math.Between(800, 900), EnemyReaper.Y_NORMAL));
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        // ease: 'Linear',
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        yoyo: true,
                        repeat: -1
                    })
                    this.scene.time.delayedCall(Phaser.Math.Between(2, 5) * 1000,
                        this.#change_state, [], this)
                }
            case "SHOOT1": // elliptic shooting pattern
                {
                    this.path.add(
                        new Phaser.Curves.Ellipse(this.x, this.y, 200, 120)
                    );
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        // ease: 'Linear',
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        yoyo: true,
                        repeat: -1
                    })
                    break;
                }
            case "SHOOT2": // quadratic bezier curve shooting pattern
                {
                    const LEFT = new Phaser.Math.Vector2(50, EnemyReaper.Y_NORMAL),
                        RIGHT = new Phaser.Math.Vector2(900, EnemyReaper.Y_NORMAL);

                    const MULT = (Phaser.Math.Between(0, 1) === 0) ? 1 : -1;
                    // move to either left or right side of screen
                    let rng = Phaser.Math.Between(0, 1);
                    if (rng === 0) {
                        this.path.moveTo(LEFT.x, LEFT.y);
                        this.path.quadraticBezierTo(RIGHT.x, RIGHT.y, this.scene.game.config.width / 2, MULT * 400);
                    } else {
                        this.path.moveTo(RIGHT.x, RIGHT.y);
                        this.path.quadraticBezierTo(LEFT.x, LEFT.y, this.scene.game.config.width / 2, MULT * 400);
                    }

                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        yoyo: true,
                        repeat: -1
                    })
                    break;
                }
            case "SHOOT3": // lemniscate shooting pattern
                {
                    const MID = new Phaser.Math.Vector2(this.scene.game.config.width / 2, EnemyReaper.Y_NORMAL);
                    const OFFSET = Phaser.Math.Between(-100, 100);
                    this.path = new Phaser.Curves.Path(400, 300);
                    this.path.moveTo(MID.x + OFFSET, MID.y);
                    this.path.circleTo(100, false, 360);
                    this.path.circleTo(100, true, 180);
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        ease: 'Linear',
                        duration: 2000,
                        repeat: -1,
                        yoyo: true,
                    })
                    break;
                }
        }
        this.path.draw(this.graphics);
    }

    #clone_self() { // clones thyself
        console.log("OMG, REAPER CLONED ITSELF");
        if (this.scene) {
            let clone_delay = Phaser.Math.Between(EnemyReaper.CLONE_DELAY.min, EnemyReaper.CLONE_DELAY.max);
            this.scene.add.enemy_reaper(this.scene, this.x, this.y,
                1,    // clones will have 1 hp
                1000, // clones should have a slow fire rate
                false,// clones should not clone themselves
                50,  // clones should only yield a few points
                5,    // clones should only yield a little bit of money
            );
            this.scene.time.delayedCall(clone_delay * 1000, this.#clone_self, [], this);
        }
    }

    update(time, delta) {
        let player = this.scene.objs.player;

        if (this.anims &&
            this.anims.isPlaying &&
            this.anims.currentAnim.key !== "reaper_idle" &&
            this.anims.currentAnim.key !== "reaper_shoot")
            this.play("reaper_idle");

        this.path.getPoint(this.follower.t, this.follower.vec);

        switch (this.ai_state) {
            case "CHASING":
                this.scene.physics.moveTo(this, player.x, 200, 400);
                let delta_x = Math.abs(this.x - player.x);
                // https://github.com/phaserjs/examples/blob/master/public/src/paths/circle%20path.js
                if (delta_x <= 10) {
                    this.#change_state();
                }
                break;
            case "ROAMING":
                this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 300);
                break;
            case "SHOOT1":
            case "SHOOT2": // fall through
            case "SHOOT3": // fall through
                this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 400);
                if (this.shots_fired >= 10) {
                    this.shots_fired = 0;
                    this.#change_state("CHASING");
                    break;
                }

                if (time > this.last_fired) {
                    this.last_fired = time + this.shoot_cd;
                    this.#shoot();
                    this.shots_fired++;
                }
                break;
            default:
                console.error("BRUV, YOU SHOULD NOT BE SEEING THIS");
                break;
        }
    }

    die() {
        if (this.hp <= 1) {
            this.graphics.clear();
            this.#clear_path();
            this.destroy();
        }
        this.hp--;
    }

    #shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");
        if (bullet !== null) {
            bullet.activate(this.x, this.y);
            this.anims.play("reaper_shoot");
            this.anims.nextAnim = "reaper_idle";
        }
    }
}

class EnemyLupa extends Phaser.Physics.Arcade.Sprite {
    static Y_NORMAL = 300;
    static ANGLE_VEL = 500;
    hp = 40;
    shoot_cd = 50;
    last_fired = 0;

    // though BARRIER_SWEEP is a state, we only want to use it in the beginning, so don't add it here
    state_list = ["ROAMING", "SHOOT1"]
    follower = { t: 0, vec: new Phaser.Math.Vector2() };
    path = new Phaser.Curves.Path();
    graphics;
    ai_state;

    target_pos = new Phaser.Math.Vector2();
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        scene.objs.enemies.special.add(this);
        this.anim_key = "lupa_idle";
        this.setSize(64, 64)
            .setOffset(0, 0)
            .setAngularVelocity(EnemyLupa.ANGLE_VEL)
            .play(this.anim_key);

        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(1, 0xffffff, 1);

        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.path = new Phaser.Curves.Path();

        this.#change_state("BARRIER_SWEEP"); // do the sweep
    }

    #clear_path() {
        this.graphics.clear();
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.path = new Phaser.Curves.Path(this.x, this.y);
        if (this.tween)
            this.tween.remove();
    }

    /**
     * @description State changes will require set up, which this function
     * handles. If no state is provided, a random state will be chosen
     * @param {string} new_state The state to change to
     */
    #change_state(new_state) {
        let player = this.scene.objs.player;

        if (new_state === undefined) {
            new_state = this.state_list[Phaser.Math.Between(0, this.state_list.length - 1)];
        }
        console.log(`LUPA: ${new_state}`)
        this.ai_state = new_state;
        this.#clear_path(); // the path should be cleared for every state transition
        switch (this.ai_state) {
            case "BARRIER_SWEEP": // Lupa will only barrier sweep in the beginning, then will only use other states after
                {
                    const LEFT = new Phaser.Math.Vector2(58, 530),
                        RIGHT = new Phaser.Math.Vector2(900, 530);
                    this.path.lineTo(RIGHT);
                    this.path.lineTo(LEFT);
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        ease: 'Linear',
                        // ease: 'Cubic.inOut',
                        duration: 4000,
                        yoyo: false,
                    })
                    // Tween events: https://newdocs.phaser.io/docs/3.80.0/Phaser.Tweens.Events.TWEEN_COMPLETE
                    this.tween.on('complete', () => {
                        this.#change_state();
                    });
                    break;
                }
            case "ROAMING":
                {
                    this.setAngle(0)
                        .setAngularVelocity(0);
                    // this.scene.time.delayedCall(Phaser.Math.Between(3, 6),
                    //     this.#change_state, [], this);
                    const LEFT = new Phaser.Math.Vector2(58, EnemyLupa.Y_NORMAL),
                        RIGHT = new Phaser.Math.Vector2(900, EnemyLupa.Y_NORMAL);

                    let target = (Phaser.Math.Between(0, 1)) ? LEFT : RIGHT;

                    this.scene.physics.moveTo(this, target.x, target.y, 300);
                    this.target_pos = target;
                    this.scene.time.delayedCall(3 * 1000, this.#change_state, [], this);
                    break;
                }
            case "SHOOT1":
                {
                    this.setAngularVelocity(400);
                    const x_dest = [
                        100, // left
                        this.scene.game.config.width / 2, // mids
                        850 // right
                    ];

                    // pick a random x
                    let x = x_dest[Phaser.Math.Between(0, x_dest.length - 1)]
                    this.scene.physics.moveTo(this, x, EnemyLupa.Y_NORMAL, 200);
                    this.scene.time.delayedCall(3 * 1000, this.#change_state, ["ROAMING"], this);
                    break;
                }
            default:
                console.error(`Invalid Enemy state: ${this.ai_state}`);
                break;
        }
        this.path.draw(this.graphics);
    }

    #shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");

        let angle = this.angle + 90;
        const V = 600,
            vx = V * Math.cos(angle * Math.PI / 180),
            vy = V * Math.sin(angle * Math.PI / 180);

        if (bullet !== null) {
            bullet.activate(this.x, this.y, vx, vy);
        }
    }

    update(time, delta) {
        let player = this.scene.objs.player;

        this.graphics.clear();
        this.path.getPoint(this.follower.t, this.follower.vec);

        switch (this.ai_state) {
            case "ROAMING":
                // this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, EnemyLupa.Y_NORMAL);
                let dist = Phaser.Math.Distance.BetweenPoints({ x: this.x, y: this.y }, this.target_pos);
                // console.log(`dist: ${dist}`);
                if (dist <= 10) {
                    this.setVelocity(0, 0);
                    this.#clear_path();
                    this.#change_state("SHOOT1");
                    // this.#change_state();
                }
                break;
            case "BARRIER_SWEEP":
                this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 400);
                break;
            case "SHOOT1":
                {
                    // this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, EnemyLupa.Y_NORMAL);
                    if (time > this.last_fired) {
                        this.last_fired = time + this.shoot_cd;
                        this.#shoot();
                    }
                }
                break;
            default:
                console.error(`Invalid state ${this.ai_state}`);
                break;
        }
    }


    die() {
        if (this.hp <= 1) {
            this.destroy();
            return;
        }

        this.hp--;
    }
}

export { BaseGridEnemy, Enemy1, Enemy2, Enemy3, EnemyUSB, EnemyReaper, EnemyLupa, EnemyConstDefs };
