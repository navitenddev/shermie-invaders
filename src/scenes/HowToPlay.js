import { Scene } from 'phaser';
import { fonts } from '../utils/fontStyle.js';

export class HowToPlay extends Scene {
    constructor() {
        super('HowToPlay');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);
        this.sounds = this.registry.get('sound_bank');
        this.add.image(512, 300, 'howToPlayLogo');

        let width = this.game.config.width
        this.add.text(width / 3, 400,
            'Movement:    A D or ← → \n\
Shoot:       W or Space \n\
Pause:       P or ESC \n\
Mute Sounds: M \n\n\
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
                this.sounds.bank.sfx.click.play();
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