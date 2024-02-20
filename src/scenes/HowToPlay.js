import { Scene } from 'phaser';

export class HowToPlay extends Scene {
    constructor() {
        super('HowToPlay');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'howToPlayLogo');

        this.add.text(512, 460, 'Use WASD to move Shermie and space bar to shoot! Have fun!', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            wordWrap: {
                width: 600 
            }
        })
        .setOrigin(0.5);

        this.backButton = this.add.text(512, 600, 'Back', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        })
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
