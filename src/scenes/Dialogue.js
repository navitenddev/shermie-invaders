import { DialogueManager } from "../utils/dialogue_manager";
import { EventDispatcher } from "../utils/event_dispatcher";
import { InitKeyDefs } from "../keyboard_input";

class Dialogue extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    dialogue_mgr;
    prev_scene;
    keys;

    constructor() {
        super('Dialogue');
    }

    create(data) {
        this.background = this.add.image(0, 0, 'Dialogue').setOrigin(0, 0);
        this.background.setDisplaySize(this.cameras.main.width, this.cameras.main.height); 
        this.background.setDepth(-1);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.keys = InitKeyDefs(this);
        this.dialogue_mgr = new DialogueManager(this);
        this.prev_scene = data.caller_scene;

        this.emitter.emit('dialogue_start', data.dialogue_key);

        // Handle escape key press to skip dialogue and end the scene
        this.keys.esc.on('down', () => {
            this.emitter.emit('force_dialogue_stop');
            this.transitionToGame();
        });

        // Transition to the game scene when dialogue naturally completes
        this.emitter.once('dialogue_complete', this.transitionToGame, this);
    }

    transitionToGame() {
        // Start fade-out effect over 1000 milliseconds
        this.cameras.main.fadeOut(1000, 0, 0, 0);

        // Set up a callback for when the fade-out is complete
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (camera) => {
            // Transition to the Game scene
            this.scene.start('Game');
        });
    }
}

export { Dialogue };
