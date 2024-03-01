import { Scene } from 'phaser';
import { fonts } from '../utils/fontStyle.js';

/**
 * @classdesc A button that, when clicked, brings the player to that level.
 * This feature will probably be limited to testing only. There is no purpose in letting a player choose a different level in a game that has infinite levels.
 */
class LevelButton {
    /**
     * 
     * @param {*} scene The scene to put the button in
     * @param {*} x x-coordinate of topleft position of the button
     * @param {*} y y-coordinate of topleft position of the button
     * @param {*} level The level that the button will bring the player to
     */
    constructor(scene, x, y, level) {
        this.scene = scene;
        this.level = level;
        this.global_vars = this.scene.scene.get('Preloader');
        this.scene.add.text(x, y, this.level, fonts.small)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.global_vars.level = this.level;
                this.scene.scene.start('Game');
            });
    }
}

export class LevelSelect extends Scene {
    constructor() {
        super('LevelSelect');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);

        this.add.image(this.game.config.width / 2, 35, 'levelSelectlogo');

        const scale = { x: 50, y: 50 };
        const offset = { x: this.game.config.width / 4.5, y: 75 };
        let level = 1;
        for (let y = 1; y <= 10; y++)
            for (let x = 1; x <= 10; x++)
                new LevelButton(this, offset.x + x * scale.x, offset.y + y * scale.y, level++);

        this.backButton = this.add.text(this.game.config.width / 2, this.game.config.height - 100, 'Back', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }
}
