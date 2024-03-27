import { Scene } from 'phaser';
import { fonts } from '../utils/fontStyle.js';

/**
 * @classdesc A button that, when clicked, brings the player to that level.
 * This feature will probably be limited to testing only. There is no purpose in letting a player choose a different level in a game that has infinite levels.
 * Or, maybe we can leave it in and let the player pick higher levels incase the earlier ones are boring.
 */
class LevelButton {
    /**
     * 
     * @param {Phaser.Scene} scene The scene to put the button in
     * @param {number} x x-coordinate of topleft position of the button
     * @param {number} y y-coordinate of topleft position of the button
     * @param {number} level The level that the button will bring the player to
     */
    constructor(scene, x, y, level) {
        this.scene = scene;
        console.log(level);
        this.scene.add.text(x, y, level, fonts.small)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.registry.set({ level: level });
                this.scene.scene.start('Game');
            });
    }
}

export class LevelSelect extends Scene {
    constructor() {
        super('LevelSelect');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
        this.animatedBg.setOrigin(0.5, 0.5);
        this.sounds = this.registry.get('sound_bank');
        this.add.image(this.game.config.width / 2, 35, 'levelSelectlogo');
        
        const scale = { x: 50, y: 50 };
        const offset = { x: this.game.config.width / 10, y: 75 };
        let level = 1;
        
        // get max level reached from localStorage
        const maxLevelReached = localStorage.getItem('maxLevelReached') || 1;
        
        // check if cheat mode is enabled
        const cheatModeEnabled = this.registry.get('debug_mode') === true;
        
        for (let y = 1; y <= 10; y++) {
            for (let x = 1; x <= 15; x++) {
                if (cheatModeEnabled || level <= maxLevelReached) {
                    new LevelButton(this, offset.x + x * scale.x, offset.y + y * scale.y, level);
                }
                level++;
            }
        }
        
        this.backButton = this.add.text(this.game.config.width / 2, this.game.config.height - 100, 'Back', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('MainMenu');
            });
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }
}
