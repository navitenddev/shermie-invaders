import { Scene } from 'phaser';
import { SoundBank } from '../sounds';

export class PlayerLose extends Scene {
    constructor() {
        super('Player Lose');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.sounds = this.registry.get('sound_bank');
        // reset global vars 
        this.player_vars = this.registry.get('player_vars');
        this.registry.set({ 'score': 0 });
        this.player_vars.lives = 3;
        // reset player stats to defaults
        for (let [key, value] of Object.entries(this.player_vars.stats))
            this.player_vars.stats[key] = 1;
        this.player_vars.active_bullets = 0;

        let bg = this.add.image(0, 0, 'losescreen').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.scaleY = bg.scaleX;
        bg.y = 0;

        this.sounds.bank.sfx.lose.play();

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
