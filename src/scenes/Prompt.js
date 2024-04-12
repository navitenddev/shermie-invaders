import { Scene } from 'phaser';
import { InitKeyDefs } from '../utils/keyboard_input.js';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';

export class Prompt extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('PauseMenu');
    }

    create(data,menuItems, prompt_text) {
        this.prev_scene = data.prev_scene;

        menuItems.splice(0, 0, { // insert at index 1
            text: 'Back',
            callback: () => {
                this.unpause();
            },
        });

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
        const menu = this.add.bitmapText(0, 0, fonts.medium.fontName, prompt_text , fonts.medium.size)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.click.play();
                    item.callback();
                })
                .setPosition(boxX + boxWidth / 2, boxY+40);
        let menuY = boxY + 80;
        menuItems.forEach((item) => {
            const menuItem = this.add.bitmapText(0, 0, fonts.medium.fontName, item.text, fonts.medium.size)
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
        this.sounds.stop_all_music();
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