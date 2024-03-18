import { fonts } from "../utils/fontStyle";

class EnemyLupa extends Phaser.Physics.Arcade.Sprite {
    scoreValue = 200;
    moneyValue = 100;
    static Y_NORMAL = 300;
    static ANGLE_VEL = 500;
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
    hp_text;

    target_pos = new Phaser.Math.Vector2();
    reached_target = false;
    is_dead = false;
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
        this.state_text = this.scene.add.text(this.x, this.y, this.ai_state, fonts.tiny);
        this.hp_text = this.scene.add.text(this.x, this.y - 16, this.hp, fonts.tiny);
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

        console.log(`LUPA: ${new_state}`)
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
                    this.path.draw(this.graphics);

                    // Hacky workaround that stops events from stacking. This shouldn't be needed but idk
                    this.scene.time.removeAllEvents();
                    // choose a random shoot state
                    this.scene.time.delayedCall(Phaser.Math.FloatBetween(3, 5) * 1000,
                        this.#change_state, [["SHOOT1", "SHOOT2"]], this);
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

    #update_text() {
        this.hp_text
            .setPosition(this.x, this.y - 16)
            .setText(this.hp);
        this.state_text
            .setPosition(this.x, this.y)
            .setText(this.ai_state);
    }

    update(time, delta) {
        if (this.is_dead)
            return;
        this.#update_text();

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
            this.hp_text.destroy();
            this.graphics.destroy();
            this.destroy();
            this.is_dead = true;
            return;
        }
        this.hp--;
    }
}

export { EnemyLupa }