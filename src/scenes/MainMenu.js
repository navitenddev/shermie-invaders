import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { SoundBank } from '../sounds.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg')
            .setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'titlelogo');
        this.keys = InitKeyDefs(this);

        // Start Button
        this.startButton = this.add.text(512, 460, 'PLAY', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('Game');
                });
            });

        this.LevelSelectButton = this.add.text(512, 510, 'LEVELS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('LevelSelect');
            });

        this.HowToPlayButton = this.add.text(512, 560, 'CONTROLS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('HowToPlay');
            });


    }
    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }
}