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

        this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }
}
