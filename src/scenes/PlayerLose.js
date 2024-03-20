import { Scene } from 'phaser';
import { SoundBank } from '../sounds';
import { EventDispatcher } from '../utils/event_dispatcher';

export class PlayerLose extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Player Lose');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            // do dis when fade done
            this.start_dialogue('lose1')
        });
        this.emitter.removeAllListeners();

        this.sounds = this.registry.get('sound_bank');

        // Moved code below to main menu since losing returns to main menu and resets everything
        // reset global vars 
        // this.player_vars = this.registry.get('player_vars');
        // this.registry.set({ 'score': 0 });
        // this.player_vars.lives = 3;
        // this.player_vars.wallet = 0; // bye bye shermie bux
        // // reset player stats to defaults
        // for (let [key, value] of Object.entries(this.player_vars.stats))
        //     this.player_vars.stats[key] = 1;
        // this.player_vars.active_bullets = 0;

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


    /**
     * @param {*} key Start the dialogue sequence with this key
     * @param {*} blocking If true, will stop all actions in the current scene. Until dialogue complete
     */
    start_dialogue(key, blocking = true) {
        this.scene.launch('Dialogue', { dialogue_key: key, caller_scene: 'Player Lose' });
        if (blocking)
            this.scene.pause();
    }
}
