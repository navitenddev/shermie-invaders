import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';

export class PlayerWin extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Player Win');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            // do dis when fade done
            this.start_dialogue('win1')
        });

        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.sounds.bank.sfx.win.play();

        this.add.text(512, 384, 'Welcome to Shermie Depot! Time to buy some goodies!', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center',
            wordWrap: { width: this.sys.game.config.width - 50, useAdvancedWrap: true }
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start("Store")
        });
    }

    /**
     * @param {*} key Start the dialogue sequence with this key
     * @param {*} blocking If true, will stop all actions in the current scene. Until dialogue complete
     */
    start_dialogue(key, blocking = true) {
        this.scene.launch('Dialogue', { dialogue_key: key, caller_scene: 'Player Win' });
        if (blocking)
            this.scene.pause();
    }
}
