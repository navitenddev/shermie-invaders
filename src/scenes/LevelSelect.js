import { Scene } from 'phaser';
import { fontStyle } from '../utils/fontStyle.js';

export class LevelSelect extends Scene {
    constructor() {
        super('LevelSelect');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'levelSelectlogo');
        
        let spacing = 400;
        for (var i = 1; i <= 5; i++){
            this.add.text(512, spacing, 'Level ' + i, fontStyle)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.scene.start('Game');  // Will change this to respective levels in the future
                });
            spacing += 50;
        }
                
        spacing += 20;
        this.backButton = this.add.text(512, spacing, 'Back', fontStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('MainMenu');  
            });
    }

    update(){
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }
}
