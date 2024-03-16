import { DialogueManager } from "../utils/dialogue_manager";
import { EventDispatcher } from "../utils/event_dispatcher";

class Dialogue extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    dialogue_mgr;

    caller_scene;

    constructor() {
        super('Dialogue');
    }

    create(data) {
        // console.log("Initialized Dialogue Scene")
        this.dialogue_mgr = new DialogueManager(this);
        this.prev_scene = data.caller_scene;

        this.emitter.emit('dialogue_start', data.dialogue_key);
        this.emitter.once('dialogue_stop', () => { this.return_to_caller_scene() });
    }

    update(time, delta) {
        this.dialogue_mgr.update(time, delta);
    }

    return_to_caller_scene() {
        // console.log(`resuming ${this.prev_scene}`)
        this.scene.stop('Dialogue')
        // console.log(`returning to caller scene`)
        this.scene.resume(this.prev_scene);
    }
}

export { Dialogue };