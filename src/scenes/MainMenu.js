import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { SoundBank } from '../sounds.js';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg')
            .setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'titlelogo');
        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        // Start Button
        this.startButton = this.add.text(512, 460, 'PLAY', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.get('start').stop();
                this.sounds.bank.sfx.win.play();
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('Game');
                });
            });

        this.LevelSelectButton = this.add.text(512, 510, 'LEVELS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('LevelSelect');
            });

        this.HowToPlayButton = this.add.text(512, 560, 'CONTROLS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('HowToPlay');
            });

        this.testingButton = this.add.text(512, 610, 'TESTING', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.music.start.stop();
                this.sounds.bank.sfx.click.play();
                this.scene.start('Testing');
            });

        this.keys.m.on('down', this.sounds.toggle_mute)
    }
    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }
}