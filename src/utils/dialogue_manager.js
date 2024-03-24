import { EventDispatcher } from "../utils/event_dispatcher"
const dialogue_data = require('./data/dialogue.json');

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
    constructor(scene, data = dialogue_data, x = 700, y = 490) {
        super(scene, x, y);
        scene.add.existing(this);
        this.border_w = 1;

        let w = 300;
        let h = (scene.game.config.height / 5);

        this.text_data = data;
        this.bg = scene.add.graphics()
            .fillStyle(0x000000, 0.8)
            .fillRect(10, 10, w - this.border_w, h, 10)
            .lineStyle(this.border_w, 0x333833)
            .strokeRect(10, 10, w - this.border_w, h, 10);
        this.w = w - 20;
        this.h = h;
        this.start = { x: x, y: y, w: this.w, h: this.h };

        this.font = {
            fontFamily: '"Press Start 2P", system-ui', 
            fontSize: 12, 
            color: '#00ff00',
            align: 'left', 
            wordWrap: { width: this.w - this.border_w * 2, useAdvancedWrap: true },
            lineSpacing: 8, 
        }

        this.text = scene.add.text(25, 25, "", this.font);
        this.add([this.bg, this.text]);
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
        this.text.text += this.line[this.char_index++];
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