import { DialogueManager } from "../utils/dialogue_manager";
import { EventDispatcher } from "../utils/event_dispatcher";
import { InitKeyDefs } from "../keyboard_input";

class Dialogue extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    dialogue_mgr;

    caller_scene;
    keys;
    constructor() {
        super('Dialogue');
    }

    create(data) {
        this.keys = InitKeyDefs(this);
        // console.log("Initialized Dialogue Scene")
        this.dialogue_mgr = new DialogueManager(this);
        this.prev_scene = data.caller_scene;

        this.emitter.emit('dialogue_start', data.dialogue_key);
        this.emitter.once('dialogue_stop', () => { this.return_to_caller_scene() });


        this.keys.esc.on('down', () => {
            console.log('Player skipped the dialogue');
            this.emitter.emit('force_dialogue_stop');
        });
    }

    update(time, delta) {
        this.dialogue_mgr.update(time, delta);
    }

    return_to_caller_scene() {
        // console.log(`returning to caller scene`)
        this.scene.stop('Dialogue')
        // console.log(`resuming ${this.prev_scene}`)
        this.scene.resume(this.prev_scene);
    }
}

export { Dialogue };