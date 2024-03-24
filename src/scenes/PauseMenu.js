import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';

export class PauseMenu extends Scene {
    emitter = EventDispatcher.getInstance();
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

        const menuSpacing = 60;
        let menuY = boxY + 60;

        this.resumeButton = this.add.text(0, 0, 'Resume', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.unpause();
            })
            .setPosition(boxX + boxWidth / 2, menuY);

        menuY += menuSpacing;
        this.quitButton = this.add.text(0, 0, 'Quit', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.emitter.removeAllListeners(); // Clean up loose event listeners
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.sounds.bank.music.bg.stop();
                this.sounds.bank.music.ff7_fighting.stop();
                this.sounds.bank.sfx.click.play();
                this.sounds.bank.music.start.play();
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.stop('PauseMenu');
                    this.scene.stop(this.prev_scene);
                    this.scene.start('MainMenu');
                });
            })
            .setPosition(boxX + boxWidth / 2, menuY);

        if (this.registry.get('debug_mode') === true) {
            menuY += menuSpacing;
            this.cheatsButton = this.add.text(0, 0, 'Cheats', fonts.medium)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.click.play();
                    this.scene.stop('PauseMenu');
                    this.scene.start('StatsMenu');
                })
                .setPosition(boxX + boxWidth / 2, menuY);
        }

        this.keys.p.on('down', () => this.unpause());
        this.keys.esc.on('down', () => this.unpause());
        this.keys.m.on('down', () => this.sounds.toggle_mute());
    }

    unpause() {
        this.scene.stop('PauseMenu');
        this.scene.resume(this.prev_scene);
    }
}