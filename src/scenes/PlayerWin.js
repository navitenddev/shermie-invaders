import { Scene } from 'phaser';

export class PlayerWin extends Scene {
    constructor() {
        super('Player Win');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.scene.get('Preloader').sound_bank.bank.sfx.win.play();

        this.add.text(512, 384, 'You win, click anywhere on the screen to continue to the next level.', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            wordWrap: { width: this.sys.game.config.width - 50, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            // this.scene.start('MainMenu');
            this.scene.start("Game")
        });
    }
}
