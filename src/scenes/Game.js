import { Scene } from 'phaser';
import { AnimationFactory } from "../factory/animation_factory";
import { ObjectSpawner } from "../objects/spawner";

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x2e2e2e);
        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.anim_factory = new AnimationFactory(this);
        this.objs = new ObjectSpawner(this);

        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            p: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            space: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SPACE
            ),
            enter: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.ENTER
            ),
            esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        };

        const player = this.add.player(this, this.game.config.width / 2, this.game.config.height - 64);
        this.objs.player = player;

        this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);


        this.physics.add.overlap(this.objs.bullets, this.objs.enemies);

        this.physics.world.on(
            "overlap",
            (bullet_obj, enemy_obj,
                bullet_body, // : Phaser.Physics.Arcade.Body,
                enemy_body, // Phaser.Physics.Arcade.Body,
            ) => {
                bullet_obj.activate(false);
                enemy_obj.die();
                // spawn explosion
                console.log(`bullet body: (${bullet_body.x},${bullet_body.y})`)
                this.explode_at(bullet_body.x, bullet_body.y);
            }
        );

    }

    update(time, delta) {
        this.objs.player.update(time, delta, this.keys)
        this.objs.cleanup_enemies();
        let is_gameover = this.ai_enemy1(time);
        if (is_gameover)
            this.goto_gameover_screen();

        this.check_gameover();
    }

    explode_at(x, y) {
        console.log(`Exploding at (${x},${y})`)
        let explosion = this.objs.explosions.getFirstDead(false, 0, 0, "explosion");
        if (explosion !== null) {
            console.log(explosion)
            console.log("step 1")
            explosion.activate(x, y);
            console.log("step 2")
            explosion.on('animationcomplete', () => {
                explosion.deactivate();
                console.log("step 3")
            })
        }
    }

    /* TODO: If there are any performance problems, it's probably because of this function. */
    ai_enemy1(time) {
        let entries = this.objs.enemies.children.entries;
        // check if enemy is out of bounds
        for (let enemy of entries) {
            if (!enemy.is_x_inbounds()) {
                console.log("Enemy1 is changing rows!")
                for (let enemy of entries)
                    enemy.change_row(time)
                break;
            }

            if (!enemy.is_y_inbounds())
                this.goto_lose_scene();
        }
    }

    check_gameover() {
        if (this.objs.enemies.children.entries.length === 0) {
            this.goto_win_scene();
        }

    }

    goto_win_scene() {
        this.scene.start("Player Win");
    }

    goto_lose_scene() {
        this.scene.start("Player Lose");
    }
}
