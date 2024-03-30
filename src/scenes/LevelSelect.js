import { BaseMenu } from './BaseMenu.js';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';

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
        this.scene.add.bitmapText(x, y, bitmapFonts.PressStart2P, level, fonts.small.sizes[bitmapFonts.PressStart2P])
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(3)
            .on('pointerdown', () => {
                this.scene.registry.set({ level: level });
                this.scene.scene.start('Game');
            });
    }
}

export class LevelSelect extends BaseMenu {
    constructor() {
        super('LevelSelect');
    }

    create() {
        super.create();

        this.add.image(this.game.config.width / 2, 35, 'levelSelectlogo')
            .setDepth(3);
        
        const scale = { x: 50, y: 50 };
        const offset = { x: this.game.config.width / 10, y: 75 };
        let level = 1;
        
        // get max level reached from localStorage
        const maxLevelReached = localStorage.getItem('maxLevelReached') || 1;
        
        // check if cheat mode is enabled
        const cheatModeEnabled = this.registry.get('debug_mode') === true;

        this.keys.m.on('down', this.sounds.toggle_mute);

        for (let y = 1; y <= 10; y++) {
            for (let x = 1; x <= 15; x++) {
                if (cheatModeEnabled || level <= maxLevelReached) {
                    new LevelButton(this, offset.x + x * scale.x, offset.y + y * scale.y, level);
                }
                level++;
            }
        }
        
        this.setupBackButton();
    }
}
