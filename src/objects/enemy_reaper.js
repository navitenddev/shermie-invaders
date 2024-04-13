import { fonts } from "../utils/fontStyle";
import { FillBar } from "../ui/fill_bar";

class EnemyReaper extends Phaser.Physics.Arcade.Sprite {
    scoreValue; // defined by constructor
    moneyValue; // defined by constructor
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
    state_text;
    hp;
    hp_bar;
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
    constructor(scene, x, y, hp = 100, shoot_cd = 500, should_clone = true, score_value = 100, money_value = 10) {
        super(scene, x, y);
        this.hp = hp;
        console.log(`Reaper initialized with ${this.hp} hp`);
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
        this.state_text = this.scene.add.bitmapText(-42069, -42069, fonts.tiny.fontName, this.ai_state, fonts.tiny.size);

        this.hp_bar_offset = {
            x: -50,
            y: -(this.height / 1.8),
        };
        this.hp_bar = new FillBar(scene,
            x + this.hp_bar_offset.x, y + this.hp_bar_offset.y,
            100, 10,
            this.hp
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
        if (this.scene.debugMode)
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

    #update_text() {
        if (this.scene.debugMode)
            this.state_text.setPosition(this.x, this.y)
                .setText(this.ai_state);
        else
            this.state_text.setPosition(-42069, -42069);
    }

    #update_bar() {
        this.hp_bar.setPosition(this.x + this.hp_bar_offset.x, this.y + this.hp_bar_offset.y);
        this.hp_bar.set_value(this.hp);
    }

    update(time, delta) {
        this.#update_text();
        this.#update_bar();

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
            this.state_text.destroy();
            this.hp_bar.destroy();
            this.graphics.destroy();
            this.deathEmitter.explode(50, this.x, this.y);
            this.#clear_path();
            this.destroy();
        }
        this.hp--;
    }

    #shoot() {
        // if condition
        let bullet = this.scene.objs.bullets.enemy.getFirstDead(false, 0, 0, "enemy_bullet");
        if (bullet !== null) {
            bullet.activate(this.x, this.y, 0, 600);
            this.anims.play("reaper_shoot");
            this.anims.nextAnim = "reaper_idle";
        }
    }
}

export { EnemyReaper }