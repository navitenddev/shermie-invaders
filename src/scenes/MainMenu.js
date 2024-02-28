import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fontStyle } from '../utils/fontStyle.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // this.add.image(512, 384, 'animatedbg');
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'titlelogo');
        this.keys = InitKeyDefs(this);

        // Start Button
        this.startButton = this.add.text(512, 460, 'PLAY', fontStyle)
            .setOrigin(0.5)
            .setInteractive();

        this.LevelSelectButton = this.add.text(512, 510, 'LEVELS', fontStyle)
            .setOrigin(0.5)
            .setInteractive();

        this.HowToPlayButton = this.add.text(512, 560, 'CONTROLS', fontStyle)
            .setOrigin(0.5)
            .setInteractive();

        this.startButton.on('pointerdown', () => {
            this.scene.start('Game'); 
        });

        this.LevelSelectButton.on('pointerdown', () => {
            this.scene.start('LevelSelect'); 
        });

        this.HowToPlayButton.on('pointerdown', () => {
            this.scene.start('HowToPlay'); 
        });
    }
    update(){
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }
}