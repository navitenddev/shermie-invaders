import { Scene } from 'phaser';
import { InitKeyDefs } from '../utils/keyboard_input';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';

export class PauseMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('PauseMenu');
    }

    create(data) {
        this.prev_scene = data.prev_scene;

        const menuItems = [
            { text: 'Resume', callback: () => this.unpause() },
            { text: 'Quit', callback: () => this.quitGame() },
        ];

        if (this.registry.get('debug_mode') === true) { // add cheats menu item
            menuItems.splice(1, 0, { // insert at index 1
                text: 'Cheats',
                callback: () => {
                    this.sounds.bank.sfx.click.play();
                    this.scene.stop('PauseMenu');
                    this.scene.start('StatsMenu');
                },
            });
        }

        const menuSpacing = 60;
        const boxWidth = 300;
        const boxHeight = menuItems.length * menuSpacing + 20;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.8);
        graphics.fillRect(boxX, boxY, boxWidth, boxHeight);
        graphics.lineStyle(1, 0x333833);
        graphics.strokeRect(boxX, boxY, boxWidth, boxHeight);

        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        let menuY = boxY + 40;
        menuItems.forEach((item) => {
            const menuItem = this.add.bitmapText(0, 0, bitmapFonts.PressStart2P_Stroke, item.text, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.click.play();
                    item.callback();
                })
                .setPosition(boxX + boxWidth / 2, menuY);

            menuY += menuSpacing;
        });

        this.keys.p.on('down', () => this.unpause());
        this.keys.esc.on('down', () => this.unpause());
        this.keys.m.on('down', () => this.sounds.toggle_mute());
    }

    unpause() {
        this.scene.stop('PauseMenu');
        this.scene.resume(this.prev_scene);
    }

    quitGame() {
        this.emitter.removeAllListeners();
        this.sounds.bank.music.ff7_fighting.stop();
        this.sounds.bank.music.bg.stop();
        this.sounds.bank.sfx.click.play();
        this.sounds.bank.music.start.play();
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('PauseMenu');
            this.scene.stop(this.prev_scene);
            this.scene.start('Main Menu');
        });
    }
}