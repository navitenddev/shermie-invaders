import { Scene } from 'phaser';

export class PlayerWin extends Scene {
    constructor() {
        super('Player Win');
    }

    create() {
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.shootsfx = this.sound.add('win',{ volume: 0.1, loop: false });
        this.shootsfx.play();
        this.add.text(512, 384, 'You Win', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
