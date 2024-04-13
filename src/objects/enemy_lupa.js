import { fonts } from "../utils/fontStyle";
import { FillBar } from "../ui/fill_bar";

/* I am the second boss */
class EnemyLupa extends Phaser.Physics.Arcade.Sprite {
    scoreValue = 200;
    moneyValue = 12;
    static Y_NORMAL = 300;
    static ANGLE_VEL = 400;
    static BULLET_VEL = 400;
    hp = 40;
    shoot_cd = 85;
    last_fired = 0;
    shots_fired = 0;

    // though BARRIER_SWEEP is a state, we only want to use it in the beginning, so don't add it here
    state_list = ["ROAMING", "SHOOT1", "SHOOT2"];
    follower = { t: 0, vec: new Phaser.Math.Vector2() };
    path = new Phaser.Curves.Path();
    graphics;
    ai_state;
    state_text;

    target_pos = new Phaser.Math.Vector2();
    reached_target = false;
    is_dead = false;

    #event_queue = [];
    constructor(scene, x, y, hp = 40) {
        super(scene, x, y);
        console.log(`Initializing lupa with ${hp} hp`)
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
        this.state_text = this.scene.add.bitmapText(this.x, this.y, fonts.tiny.fontName, this.ai_state, fonts.tiny.size);

        this.hp = hp;
        this.hp_bar_offset = {
            x: -47,
            y: -(this.height / 1.8),
        };
        this.hp_bar = new FillBar(scene,
            x + this.hp_bar_offset.x, y + this.hp_bar_offset.y,
            100, 10,
            hp
        );

        this.deathEmitter = scene.add.particles(0, 0, 'flares', {
            frame: ['white'],
            color: [0xFFFF00, 0x008000, 0x0000FF, 0x4B0082, 0x8A2BE2, 0xFF0000, 0xFFA500],
            scale: { start: 0.3, end: 0, ease: 'exp.out' },
            alpha: { start: 1, end: .5, ease: 'exp.out' },
            lifespan: 4000,
            speed: { min: 150, max: 300 },
            gravityY: 900,
            blendMode: 'COLOR',
            emitting: false
        });
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
     * handles. If no state is provided, a random state will be chosen from this.state_list
     * @param {Array<string>} states list of states to randomly choose from
     */
    #change_state(states) {
        if (this.is_dead)
            return;
        this.graphics.clear();
        let player = this.scene.objs.player;

        let new_state;
        if (states === undefined) {
            new_state = this.state_list[Phaser.Math.Between(0, this.state_list.length - 1)];
        } else if (Array.isArray(states)) {
            new_state = states[Phaser.Math.Between(0, states.length - 1)];
        } else {
            new_state = states;
        }

        console.log(`LUPA: ${new_state}`);
        this.reached_target = false;
        this.ai_state = new_state;
        this.#clear_path(); // the path should be cleared for every state transition
        this.scene.time.clearPendingEvents();
        switch (this.ai_state) {
            case "BARRIER_SWEEP": // Lupa will only barrier sweep in the beginning, then will only use other states after
                {
                    const target = new Phaser.Math.Vector2(58, 530);
                    this.scene.physics.moveTo(this, target.x, target.y, 300);
                    this.target_pos = target;
                    // this.path.lineTo(RIGHT);
                    this.path.lineTo(target);
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        ease: 'Linear',
                        // ease: 'Cubic.inOut',
                        duration: 4000,
                        yoyo: false,
                    })
                    break;
                }
            case "ROAM_CENTER": // return back to center
                {
                    this.target_pos = new Phaser.Math.Vector2(this.scene.game.config.width / 2, EnemyLupa.Y_NORMAL);
                    this.scene.physics.moveTo(this, this.target_pos.x, this.target_pos.y, 300);
                }
            case "ROAMING":
                {
                    this.setAngle(0)
                        .setAngularVelocity(0);

                    // if on right side
                    this.path.circleTo(100, true, 360);
                    this.path.circleTo(100, false, 180);

                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        ease: 'Linear',
                        duration: 2000,
                        yoyo: true,
                        repeat: -1
                    });
                    if (this.scene.debugMode)
                        this.path.draw(this.graphics);

                    // clear event queue (if there are events)
                    this.scene.time.removeEvent(this.#event_queue);
                    // push the delayed call to the event queue
                    this.#event_queue.push(
                        this.scene.time.delayedCall(Phaser.Math.FloatBetween(3, 5) * 1000, this.#change_state, [["SHOOT1", "SHOOT2"]], this)
                    );

                    break;
                }
            case "SHOOT1": // Go to left or right side, then shoot inplace
                {
                    this.shots_fired = 0;
                    let x;

                    const LEFT = new Phaser.Math.Vector2(50, EnemyLupa.Y_NORMAL),
                        RIGHT = new Phaser.Math.Vector2(900, EnemyLupa.Y_NORMAL);
                    // if on left-side, go right. If on right, go left
                    if (this.x < this.scene.game.config.width / 2) {
                        x = LEFT.x;
                        this.setAngularVelocity(-EnemyLupa.ANGLE_VEL);
                    } else {
                        x = RIGHT.x;
                        this.setAngularVelocity(EnemyLupa.ANGLE_VEL);
                    }

                    this.target_pos = new Phaser.Math.Vector2(x, EnemyLupa.Y_NORMAL);

                    this.scene.physics.moveTo(this, this.target_pos.x, this.target_pos.y, 200);
                    break;
                }
            case "SHOOT2": // Go to a side, then shoot while traversing to the opposite side
                {
                    const LEFT = new Phaser.Math.Vector2(50, EnemyLupa.Y_NORMAL),
                        RIGHT = new Phaser.Math.Vector2(950, EnemyLupa.Y_NORMAL);

                    let target = (this.x > this.scene.game.config.width / 2) ? LEFT : RIGHT;
                    let x;
                    if (this.x < this.scene.game.config.width / 2) {
                        x = LEFT.x;
                        this.setAngularVelocity(-EnemyLupa.ANGLE_VEL);
                    } else {
                        x = RIGHT.x;
                        this.setAngularVelocity(EnemyLupa.ANGLE_VEL);
                    }
                    this.target_pos = target;
                    this.scene.physics.moveTo(this, this.target_pos.x, this.target_pos.y, 200);
                    break;
                }
            case "SHOOT_INPLACE":
                {
                    this.shots_fired = 0;
                    if (player.x < this.scene.game.config.width / 2) {
                        this.setAngularVelocity(EnemyLupa.ANGLE_VEL);
                    } else {
                        this.setAngularVelocity(-EnemyLupa.ANGLE_VEL);
                    }
                }
                break;
            default:
                console.error(`Invalid Enemy state: ${this.ai_state}`);
                break;
        }
        if (this.scene.debugMode)
            this.path.draw(this.graphics);
    }

    #shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");

        let angle = this.angle + 90;
        const V = EnemyLupa.BULLET_VEL,
            vx = V * Math.cos(angle * Math.PI / 180),
            vy = V * Math.sin(angle * Math.PI / 180);

        if (bullet !== null) {
            bullet.activate(this.x, this.y, vx, vy);
        }
    }

    #update_text() {
        if (this.scene.debugMode) {
            this.state_text
                .setPosition(this.x, this.y)
                .setText(this.ai_state);
        } else {
            this.state_text
                .setPosition(-42069, -42069);
        }
    }

    #update_bar() {
        this.hp_bar.setPosition(this.x + this.hp_bar_offset.x, this.y + this.hp_bar_offset.y);
        this.hp_bar.set_value(this.hp);
    }


    update(time, delta) {
        if (this.is_dead)
            return;
        this.#update_text();
        this.#update_bar();

        // console.log(this.follower.t);
        let player = this.scene.objs.player;
        let dist = Phaser.Math.Distance.BetweenPoints({ x: this.x, y: this.y }, this.target_pos); // dist from target

        this.path.getPoint(this.follower.t, this.follower.vec);

        switch (this.ai_state) {
            case "ROAMING":
                this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 500);
                break;

            case "ROAM_CENTER": // return back to center
                {
                    if (dist <= 10) {
                        this.setVelocity(0, 0);
                        this.#clear_path();
                        this.#change_state("SHOOT_INPLACE");
                    }
                    this.scene.physics.moveTo(this, this.target_pos.x, this.target_pos.y, 450);

                }
                break;
            case "BARRIER_SWEEP":
                // this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 400);
                if (dist <= 10)
                    this.#change_state("ROAM_CENTER");
                break;
            case "SHOOT1": // shoot while moving to either left or right side. Stop shooting at destination
                {
                    if (dist <= 10) {
                        this.setVelocity(0, 0);
                        this.#clear_path();
                    }
                    // this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, EnemyLupa.Y_NORMAL);
                    if (time > this.last_fired) {
                        this.last_fired = time + this.shoot_cd;
                        this.#shoot();
                        this.shots_fired++;
                        if (this.shots_fired >= 25)
                            this.#change_state("ROAM_CENTER");
                    }
                }
                break;
            case "SHOOT2":
                {
                    if (time > this.last_fired) {
                        this.last_fired = time + this.shoot_cd;
                        this.#shoot();
                        this.shots_fired++;
                    }
                    if (dist <= 10) {
                        this.setVelocity(0, 0);
                        this.#clear_path();
                        this.#change_state("ROAM_CENTER");
                    }
                }
                break;
            case "SHOOT_INPLACE":
                {
                    this.setVelocity(0, 0);
                    this.#clear_path();
                    if (this.shots_fired >= 25) {
                        this.#change_state("ROAMING");
                    }

                    if (time > this.last_fired) {
                        this.last_fired = time + this.shoot_cd;
                        this.#shoot();
                        this.shots_fired++;
                    }
                }
                break;
            default:
                {
                    console.error(`Invalid state ${this.ai_state}`);
                }
                break;
        }
    }


    die() {
        if (this.hp <= 1) {
            this.state_text.destroy();
            this.hp_bar.destroy();
            this.graphics.destroy();
            this.deathEmitter.explode(50, this.x, this.y);
            this.destroy();
            this.is_dead = true;
            return;
        }
        this.hp--;
    }
}

export { EnemyLupa }