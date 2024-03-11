import { EventDispatcher } from "../utils/event_dispatcher"
const dialogue_data = require('./data/dialogue.json');

const DIALOGUE_MODE = {
    SLOW: 150,
    MED: 75,
    FAST: 25,
};

class DialogueManager extends Phaser.GameObjects.Container {
    static text_delay = DIALOGUE_MODE.FAST;
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

    delay_timer = 0;
    constructor(scene, data = dialogue_data, x = 0, y = 490) {
        super(scene, x, y);
        scene.add.existing(this);
        this.border_w = 25;

        this.text_data = data;
        this.bg = scene.add.graphics()
            .fillStyle(0xb2b2b2, 1)
            .fillRoundedRect(10, 10, scene.game.config.width - this.border_w, scene.game.config.height / 3, 10);

        this.w = scene.game.config.width - this.border_w;
        this.h = scene.game.config.height / 3;
        this.start = { x: x, y: y, w: this.w, h: this.h };

        this.font = {
            fontFamily: 'Arial Black', fontSize: 60, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'left',
            wordWrap: { width: this.w - this.border_w * 2, useAdvancedWrap: true }
        }

        this.text = scene.add.text(25, 25, "", this.font);
        this.add([this.bg, this.text]);
        this.emitter.on('dialogue_start', (key) => {
            this.#activate(key)
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
        console.log(`activated dialogue with key: ${key}`)
        // console.log(this.lines)
        this.line_index = 0;
        this.char_index = 0;
        this.#load_next_line();
    }

    #deactivate() {
        console.log("Deactivating dialogue")
        this.setPosition(42069, 42069);
        // this.setPosition(400, 400);
        console.log(this);
        this.is_active = false;
        this.emitter.emit('dialogue_stop', [])
        this.emitter.off('dialogue_start');

    }

    #load_next_line() {
        if (this.line_index === this.lines.length) {
            this.#deactivate();
            return;
        }
        console.log(`Loaded line ${this.line_index}`)
        this.line = this.lines[this.line_index++];
        this.char_index = 0;
    }

    #add_next_char() {
        this.text.text += this.line[this.char_index++];
        if (this.char_index === this.line.length) {
            console.log("Line is done, waiting on player to click again")
            this.scene.input.once('pointerdown', () => {
                this.text.setText(""); // 4 hours to fix this FML
                this.#load_next_line();
            });
        }
    }
}

export { DialogueManager }