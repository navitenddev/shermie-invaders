import { Scene } from 'phaser';
import { SoundBank } from '../sounds';

export class PlayerLose extends Scene {
    constructor() {
        super('Player Lose');
    }

    create() {
        this.cameras.main.setBackgroundColor(0xff0000);

        //commented out after adding NavitendBG to Game
        //this.add.image(512, 384, 'background').setAlpha(0.5);

        let bg = this.add.image(0, 0, 'losescreen').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.scaleY = bg.scaleX;
        bg.y = 0;

        this.scene.get('Preloader').sound_bank.bank.sfx.lose.play();

        //Lose background contains "Try again" Text

        //this.add.text(512, 384, 'You Lose', {
        //   fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
        //   stroke: '#000000', strokeThickness: 8,
        //    align: 'center'
        //}).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
