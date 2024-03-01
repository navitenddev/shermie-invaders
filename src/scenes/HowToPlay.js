import { Scene } from 'phaser';
import { fonts } from '../utils/fontStyle.js';

export class HowToPlay extends Scene {
    constructor() {
        super('HowToPlay');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'howToPlayLogo');

        let width = this.game.config.width
        this.add.text(width / 3, 400,
            'Movement: AD/←→ \n\
Shoot: W/Space Bar \n\
Pause: P/ESC \n\
Good luck, have fun! \n\
',
            {
                ...fonts.small,
                align: 'left',
            })

        this.backButton = this.add.text(512, 600, 'Back', fonts.medium)
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