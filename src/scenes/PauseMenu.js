import { Scene } from 'phaser';
import { InitKeyDefs } from '../utils/keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { TextButton } from '../ui/text_button.js';

export class PauseMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('PauseMenu');
    }

    create(data) {
        this.prev_scene = data.prev_scene;

        const menuItems = [
            { text: 'Resume', callback: () => this.unpause() },
            { text: 'Mute', callback: () => this.toggleMute() }, 
            { text: 'Quit', callback: () => this.quitGame() },
        ];

        if (this.registry.get('debug_mode') === true) {
            menuItems.splice(2, 0, {
                text: 'Cheats',
                callback: () => {
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
            new TextButton(this, boxX + boxWidth / 2, menuY, item.text,
                () => { item.callback(); }
            );
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
        this.sounds.bank.music.start.play();
        this.cameras.main.fadeOut(200, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.stop('PauseMenu');
            this.scene.stop(this.prev_scene);
            this.scene.start('Main Menu');
        });
    }

    toggleMute() {
        const isMuted = this.sounds.toggle_mute();
        localStorage.setItem('mute', isMuted ? 'true' : 'false');
    }
}