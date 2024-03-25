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
        this.background.setDisplaySize(this.cameras.main.width, this.cameras.main.height); // Adjust the size to fit the screen
        this.background.setDepth(-1);

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
        // Stop the Dialogue scene
        this.scene.stop('Dialogue');

        // Transition to the Game scene or previous scene as needed
        // Adjust this logic according to your game's needs
        this.scene.start('Game');
    }
}

export { Dialogue };
