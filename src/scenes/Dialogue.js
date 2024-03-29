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
        // show story dialogue background if this is for story dialogue 
        if (data.is_story_dialogue) {
            let bg = this.add.image(0, 0, 'story_bg')
                .setAlpha(1)
                .setOrigin(0, 0)
                .displayWidth = this.sys.game.config.width;
        }

        this.sounds = this.registry.get('sound_bank');

        this.dialogue_mgr = new DialogueManager(this, data.is_story_dialogue, data.font_size);

        this.keys = InitKeyDefs(this);
        // console.log("Initialized Dialogue Scene")
        this.prev_scene = data.caller_scene;

        this.emitter.emit('dialogue_start', data.dialogue_key);
        this.emitter.once('dialogue_stop', () => { this.return_to_caller_scene() });

        this.keys.esc.on('down', () => {
            console.log('Player skipped the dialogue');
            this.emitter.emit('force_dialogue_stop');
        });
        this.keys.m.on('down', this.sounds.toggle_mute)

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