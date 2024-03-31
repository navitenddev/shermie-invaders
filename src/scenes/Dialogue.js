import { EventDispatcher } from "../utils/event_dispatcher";
import { InitKeyDefs } from "../utils/keyboard_input.js";
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
const dialogue_data = require('../../public/assets/data/dialogue.json');

/**
 * @param {Phaser.Scene} scene The scene that is calling the dialogue
 * @param {string} key Start the dialogue sequence with this key
 * @param {string} dialogue_type "story" | "game" | "store"
 * @param {boolean} dialogue_type If true, will stop all actions and display the story bg
 * @param {number} font_size The size of the font to display
 */
function start_dialogue(scene, key, dialogue_type = "game", font_size = 16) {
    const emitter = EventDispatcher.getInstance();
    // scene.remove('Dialogue');
    // scene.add('Dialogue', Dialogue);
    scene.bringToTop('Dialogue');
    scene.launch('Dialogue', {
        dialogue_key: key,
        dialogue_type: dialogue_type,
        caller_scene: 'Game',
        font_size: font_size,
    });
    if (dialogue_type === "story" || dialogue_type === "store")
        scene.pause();
}

const DIALOGUE_MODE = {
    SLOW: 150,
    MED: 45,
    FAST: 25,
};

class DialogueManager extends Phaser.GameObjects.Container {
    static text_delay = DIALOGUE_MODE.MED;
    emitter = EventDispatcher.getInstance();
    text_data;
    bg;
    border_w;
    w;
    h;
    font;
    text;

    key;
    is_active = false;
    line;
    lines;
    line_index;
    char_index;

    auto_emit_flag = false;

    delay_timer = 0;
    follow_player = true;
    dialogue_type; /** @param {string} "story" | "game" | "dialogue" */

    constructor(scene, dialogue_type = "game", font_size = 16, data = dialogue_data, x = 310, y = 120) {
        super(scene, x, y);
        scene.add.existing(this);
        this.border_w = 20;

        let w = 600;
        let h = (scene.game.config.height / 5);

        this.text_data = data;

        this.w = w - this.border_w;
        this.h = h;
        this.start = { x: x, y: y, w: this.w, h: this.h };
        this.player_vars = scene.registry.get('player_vars');
        this.dialogue_type = dialogue_type;

        if (this.dialogue_type === "story" ||
            this.dialogue_type === "store")
            this.follow_player = false;

        this.text = scene.add.bitmapText(25, 25, bitmapFonts.PressStart2P, '', font_size).setMaxWidth(this.w - 10);;
        this.text.setLineSpacing(14)
            .setTint(0xFFFFFF);
        // .setTint(0x00FF00);
        this.add([this.text]);

        this.emitter.once('dialogue_start', (key) => {
            this.#activate(key)
        })

        this.emitter.once('force_dialogue_stop', () => {
            this.#deactivate();
        })

        this.setPosition(42069, 42069);
        this.is_active = false;
    }

    update(time, delta) {
        if (this.follow_player) {
            this.x = this.player_vars.x;
            this.y = this.player_vars.y;
        }
        if (this.is_active &&
            time > this.delay_timer &&
            this.line && this.char_index !== this.line.length) {

            this.delay_timer = time + DialogueManager.text_delay;
            this.#add_next_char();
        }
    }

    #activate(key) {
        this.key = key;
        this.is_active = true;
        this.setPosition(this.start.x, this.start.y);
        this.lines = this.text_data.find(({ key }) => this.key === key).lines;
        if (this.lines === undefined) {
            console.error(`Error: did not find dialogue key: ${key}`)
            this.#deactivate();
            return;
        }
        console.log(`started dialogue: "${key}"`)
        // console.log(this.lines)
        this.line_index = 0;
        this.char_index = 0;
        this.#load_next_line();
    }

    #deactivate() {
        // console.log("Deactivating dialogue")
        this.setPosition(42069, 42069);
        // this.setPosition(400, 400);
        this.is_active = false;
        this.emitter.emit('dialogue_stop', [])
        this.emitter.off('dialogue_start');

    }

    #load_next_line() {
        if (this.line_index === this.lines.length) {
            this.#deactivate();
            return;
        }
        // console.log(`Loaded line ${this.line_index}`)
        this.line = this.lines[this.line_index++];
        this.char_index = 0;
    }

    #add_next_char() {
        const currentText = this.text.text;
        const newText = currentText + this.line[this.char_index++];
        this.text.setText(newText);

        if (this.char_index === this.line.length) {
            // console.log("Line is done, waiting on player to click again")
            this.auto_emit_flag = true;

            const cont_dialogue_in = 1.5; // # continue dialogue in # of seconds
            this.scene.time.delayedCall(cont_dialogue_in * 1000, () => {
                if (this.auto_emit_flag)
                    this.scene.input.emit('pointerdown');
            }, this.scene.scene)

            this.scene.input.once('pointerdown', () => {
                this.text.setText(""); // 4 hours to fix this bug :)
                this.auto_emit_flag = false;
                this.#load_next_line();
            });
        }
    }
}

export { DialogueManager }

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
        if (data.dialogue_type === "story") {
            let bg = this.add.image(0, 0, 'story_bg')
                .setAlpha(1)
                .setOrigin(0, 0)
                .displayWidth = this.sys.game.config.width;
        }

        this.sounds = this.registry.get('sound_bank');

        this.dialogue_mgr = new DialogueManager(this, data.dialogue_type, data.font_size);

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

export { Dialogue, start_dialogue };