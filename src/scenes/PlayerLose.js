import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';

export class PlayerLose extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Player Lose');
    }

    create(data) {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            // do dis when fade done
            this.start_dialogue('lose1');
        });

        this.emitter.removeAllListeners();
        this.sounds = this.registry.get('sound_bank');

        let bg = this.add.image(0, 0, 'losescreen').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.scaleY = bg.scaleX;
        bg.y = 0;

        this.sounds.bank.sfx.lose.play();

        const finalScore = data.currentScore;
        this.add.bitmapText(
            16,
            16,
            bitmapFonts.PressStart2P_Stroke,
            `FINAL SCORE:${finalScore}`,
            fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
        );

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }

    start_dialogue(key, blocking = true) {
        this.scene.launch('Dialogue', { dialogue_key: key, caller_scene: 'Player Lose' });
        if (blocking) this.scene.pause();
    }
}