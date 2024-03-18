import { fonts } from "../utils/fontStyle";

class EnemyPupa extends Phaser.Physics.Arcade.Sprite {
    scoreValue = 200;
    moneyValue = 100;
    static Y_NORMAL = 300;
    static ANGLE_VEL = 550;
    hp = 40;
    shoot_cd = 50;
    last_fired = 0;
    shots_fired = 0;

    state_list = ["ROAMING", "ROAMING1", "ILLUM_START"];
    follower = { t: 0, vec: new Phaser.Math.Vector2() };
    path = new Phaser.Curves.Path();
    graphics;
    ai_state;
    state_text;
    hp_text;
    t_text;

    is_dead = false;
    target_pos;
    constructor(scene, x, y) {
        super(scene, x, y);
        scene.physics.add.existing(this);
        scene.add.existing(this);
        scene.objs.enemies.special.add(this);
        this.anim_key = "pupa_idle";
        this.setSize(64, 64)
            .setOffset(0, 0)
            .play(this.anim_key);

        this.graphics = this.scene.add.graphics();
        this.graphics.lineStyle(1, 0xffffff, 1);

        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.graphics_follower = this.scene.add.graphics();

        this.path = new Phaser.Curves.Path();
        console.log("PUPA_PATHS");
        console.log(this.scene.PUPA_PATHS);

        this.state_text = this.scene.add.text(this.x, this.y, this.ai_state, fonts.tiny);
        this.hp_text = this.scene.add.text(this.x, this.y - 16, this.hp, fonts.tiny);
        this.t_text = this.scene.add.text(this.follower.vec.x, this.follower.vec.y - 32, this.follower.t.toFixed(2), fonts.tiny);
        this.#change_state("ROAMING"); // do the sweep
    }

    #clear_path() {
        this.graphics.clear();
        this.follower = { t: 0, vec: new Phaser.Math.Vector2() };
        this.path = new Phaser.Curves.Path(this.x, this.y);
        if (this.tween)
            this.tween.remove();
    }

    #dist_from_target_pos() {
        if (!this.target_pos) console.error(`Tried to calculate distance from undefined point.`)
        return Phaser.Math.Distance.BetweenPoints(this, this.target_pos);
    }

    /**
     * @description State changes will require set up, which this function
     * handles. If no state is provided, a random state will be chosen from this.state_list
     * @param {string | Array<string>} states A single state key or list of state keys to randomly choose from
     */
    #change_state(states) {
        if (this.is_dead)
            return;
        this.graphics.clear();

        let new_state;
        // no state defined? pick random from all states in state_list
        if (states === undefined)
            new_state = this.state_list[Phaser.Math.Between(0, this.state_list.length - 1)];
        // states parameter is an array? choose a random state from input array.
        else if (Array.isArray(states))
            new_state = states[Phaser.Math.Between(0, states.length - 1)];
        // states was a single state? choose that single state.
        else
            new_state = states;

        console.log(`PUPA: ${new_state}`)
        this.ai_state = new_state;

        switch (this.ai_state) {
            case "ROAMING":
                {
                    this.#clear_path();
                    this.setAngle(90)
                        .setAngularVelocity(0);

                    this.path = new Phaser.Curves.Path(this.scene.PUPA_PATHS.LEMNISCATE);
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        // ease: 'Linear',
                        ease: 'Sine.easeInOut',
                        duration: 4000,
                        yoyo: false,
                        repeat: -1,
                        // persist: false,
                    });
                    const delay_secs = Phaser.Math.FloatBetween(1.5, 3.2);
                    this.scene.time.delayedCall(delay_secs * 1000,
                        this.#change_state, ["ILLUM_START"], this);
                }
                break;
            case "ROAMING1": // roaming with spline path
                {
                    this.#clear_path();
                    this.setAngle(90)
                        .setAngularVelocity(0);
                    this.path = new Phaser.Curves.Path(this.scene.PUPA_PATHS.SPLINE);
                    this.tween = this.scene.tweens.add({
                        targets: this.follower,
                        t: 1,
                        // ease: 'Linear',
                        ease: 'Sine.easeInOut',
                        duration: 2000,
                        yoyo: false,
                        repeat: -1,
                        // persist: false,
                    });
                    const delay_secs = Phaser.Math.FloatBetween(1.5, 3.2);
                    this.scene.time.delayedCall(delay_secs * 1000,
                        this.#change_state, ["ILLUM_START"], this);
                }
                break;
            case "ILLUM_START": // pick random point in ILLUM triangle to start at
                {
                    this.#clear_path();

                    this.setAngle(90)
                        .setAngularVelocity(EnemyPupa.ANGLE_VEL);
                    this.path = new Phaser.Curves.Path(this.scene.PUPA_PATHS.ILLUMINATI);
                    console.log("ILLUMINATI PATH")
                    console.log(this.path)

                    // choose random point in illuminati path to start
                    this.illum_count = 0; // when we finish visiting all 3 points in triangle, stop
                    this.illum_idx = Phaser.Math.Between(0, 2);
                    this.illum_t = this.scene.PUPA_PATHS.ILLUMINATI.t_vals[this.illum_idx];
                    console.log(`illum_t: ${this.illum_t}`);

                    this.target_pos = this.path.getPoint(this.illum_t);
                    // console.log(`target_pos: (${this.target_pos.x},${this.target_pos.y})`)
                    this.scene.physics.moveTo(this, this.target_pos.x, this.target_pos.y, 350)
                }
            case "ILLUM_NEXT": // pick next point in ILLUM triangle and traverse while shooting
                {
                    this.tween.resume();
                    this.illum_count++;
                    this.illum_idx = (this.illum_idx + 1) % 3;
                    this.illum_t = this.scene.PUPA_PATHS.ILLUMINATI.t_vals[this.illum_idx];
                    console.log(`illum_t: ${this.illum_t}`);

                    this.target_pos = this.path.getPoint(this.illum_t);
                    this.scene.physics.moveTo(this, this.target_pos.x, this.target_pos.y, 350);
                }
            case "ILLUM_PAUSE": // pause movement, shoot
                {
                    this.tween.pause();
                    this.shots_fired = 0;
                    // if on left-side, rot cw. If on right, rot ccw
                    (this.x < this.scene.game.config.width / 2) ?
                        this.setAngularVelocity(-EnemyPupa.ANGLE_VEL) :
                        this.setAngularVelocity(EnemyPupa.ANGLE_VEL);
                }
                break;
            default:
                console.error(`Invalid Enemy state: ${this.ai_state}`);
                break;
        }

        this.path.draw(this.graphics);
    }

    update(time, delta) {
        this.#update_text();
        this.graphics_follower.clear()
            .fillStyle(0xff0000, 1)
            .fillCircle(this.follower.vec.x, this.follower.vec.y, 12);

        this.path.getPoint(this.follower.t, this.follower.vec);

        switch (this.ai_state) {
            case "ROAMING":
                this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 400);
                break;
            case "ROAMING1":
                this.scene.physics.moveTo(this, this.follower.vec.x, this.follower.vec.y, 500);
                break;
            // IL_START -> IL_SHOOT -> IL_NEXT -> IL_SHOOT -> IL_NEXT -> IL_SHOOT -> ROAMING 
            case "ILLUM_NEXT":
                this.#shoot(time);
            case "ILLUM_START": // FALL THROUGH
                {
                    // console.log(`dist from target_pos, ${this.#dist_from_target_pos()}`);
                    if (this.#dist_from_target_pos() < 5) {
                        this.tween.remove();
                        this.setVelocity(0, 0).setAngle(0);
                        this.#change_state("ILLUM_PAUSE");
                    }
                }
                break;
            case "ILLUM_PAUSE":
                {
                    this.#shoot(time);
                    if (this.shots_fired >= 25) {
                        (this.illum_count < 3) ?
                            this.#change_state("ILLUM_NEXT") :
                            this.#change_state(["ROAMING", "ROAMING1"]);
                    }
                }
                break;
            default:
                console.error(`Invalid update state: ${this.ai_state}`);
                break;
        }
    }

    #update_text() {
        this.state_text
            .setPosition(this.x, this.y)
            .setText(this.ai_state);
        this.hp_text
            .setPosition(this.x, this.y - 16)
            .setText(this.hp);
        this.t_text.setPosition(this.follower.vec.x, this.follower.vec.y - 32)
            .setText(this.follower.t.toFixed(2));
    }

    #shoot(time) {
        if (time > this.last_fired) {
            this.last_fired = time + this.shoot_cd;
            this.shots_fired++;
            let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");
            let angle = this.angle + 90;
            const V = 600, // enemy bullet velocity
                vx = V * Math.cos(angle * Math.PI / 180), // x vel given angle
                vy = V * Math.sin(angle * Math.PI / 180); // y vel given angle

            if (bullet)
                bullet.activate(this.x, this.y, vx, vy);
        }
    }
}

export { EnemyPupa }