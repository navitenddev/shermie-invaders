import { Scene } from 'phaser';
import { SoundBank } from '../sounds';

export class PlayerLose extends Scene {
    constructor() {
        super('Player Lose');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // reset global vars 
        this.global_vars = this.scene.get('Preloader');
        this.global_vars.level = 1;
        this.global_vars.player.lives = 3;
        // reset player stats to defaults
        for (let [key, value] in Object.entries(this.global_vars.player.stats))
            this.global_vars.player.stats[key] = 1;

        this.global_vars.score = 0;

        //commented out after adding NavitendBG to Game
        //this.add.image(512, 384, 'background').setAlpha(0.5);

        let bg = this.add.image(0, 0, 'losescreen').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.scaleY = bg.scaleX;
        bg.y = 0;

        this.scene.get('Preloader').sound_bank.bank.sfx.lose.play();

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
