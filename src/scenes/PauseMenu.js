import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';

export class PauseMenu extends Scene {
    constructor() {
        super('PauseMenu');
    }

    create() {
        const boxWidth = 300;
        const boxHeight = 200;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.9); 
        graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);
        
        this.resumeButton = this.add.text(boxX + 20, boxY + 20, 'Resume', fonts.medium)
            .setInteractive();

        this.cheatsButton = this.add.text(boxX + 20, boxY + 70, 'Cheats!', fonts.medium)
            .setInteractive();

        this.quitButton = this.add.text(boxX + 20, boxY + 120, 'Quit', fonts.medium)
            .setInteractive();

        this.resumeButton.on('pointerdown', () => {
            this.scene.stop('PauseMenu');
            this.scene.resume('Game');
        });

        this.cheatsButton.on('pointerdown', () => {
            this.scene.stop('PauseMenu');
            this.scene.start('StatsMenu')
        })

        this.quitButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(200, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.stop('PauseMenu');
                this.scene.stop('Game');
                this.scene.start('MainMenu');
            });
        });

    }

}