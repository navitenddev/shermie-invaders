import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // this.add.image(512, 384, 'animatedbg');
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'titlelogo');

        // Start Button
        this.startButton = this.add.text(512, 460, 'Start!', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
        .setOrigin(0.5)
        .setInteractive();

        this.LevelSelectButton = this.add.text(512, 510, 'Level Select', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
        .setOrigin(0.5)
        .setInteractive();

        this.HowToPlayButton = this.add.text(512, 560, 'How to play', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
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
