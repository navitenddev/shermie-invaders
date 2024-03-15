import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';

export class PauseMenu extends Scene {
    constructor() {
        super('PauseMenu');
    }

    create(data) {
        this.prev_scene = data.prev_scene;
        const boxWidth = 300;
        const boxHeight = 240;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

        this.sounds = this.registry.get('sound_bank');

        this.keys = InitKeyDefs(this);

        this.resumeButton = this.add.text(boxX + 20, boxY + 20, 'Resume', fonts.medium)
            .setInteractive()
            .on('pointerdown', () => { this.sounds.bank.sfx.click.play(); this.unpause(); });

        this.cheatsButton = this.add.text(boxX + 20, boxY + 70, 'Cheats!', fonts.medium)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.stop('PauseMenu');
                this.scene.start('StatsMenu')
            })

        this.storeButton = this.add.text(boxX + 20, boxY + 120, 'Store', fonts.medium)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop('PauseMenu');
                this.scene.stop(this.prev_scene);
                this.scene.start('Store')
            })

        this.quitButton = this.add.text(boxX + 20, boxY + 170, 'Quit', fonts.medium)
            .setInteractive()
            .on('pointerdown', () => {
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.sounds.bank.music.bg.stop();
                this.sounds.bank.sfx.click.play();
                this.sounds.bank.music.start.play();
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.stop('PauseMenu');
                    this.scene.stop(this.prev_scene);
                    this.scene.start('MainMenu');
                });
            });

        this.keys.p.on('down', () => this.unpause());
        this.keys.esc.on('down', () => this.unpause());

        this.keys.m.on('down', () => this.sounds.toggle_mute());
    }
    unpause() {
        this.scene.stop('PauseMenu');
        this.scene.resume(this.prev_scene);
    }
}