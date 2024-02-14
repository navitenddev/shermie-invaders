import { Scene } from 'phaser';
import { AnimationFactory } from "../factory/animation_factory";
import { Bullet } from "../objects/bullet";
import { Enemy } from "../objects/enemy";
import { Player } from "../objects/player";
import { ObjectSpawner } from "../objects/spawner";

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x00ff00);
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
            (bullet_obj, enemy_obj
                // bullet_body: Phaser.Physics.Arcade.Body,
                // enemy_body: Phaser.Physics.Arcade.Body
            ) => {
                bullet_obj.activate(false);
                enemy_obj.die();
            }
        );

    }

    update(time, delta) {
        this.objs.player.update(time, delta, this.keys)
        this.objs.cleanup_enemies();
        this.check_gameover();
    }

    check_gameover() {
        if (this.objs.enemies.children.entries.length === 0)
            this.scene.start("GameOver");
    }
}
