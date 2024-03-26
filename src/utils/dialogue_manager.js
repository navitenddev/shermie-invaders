import { EventDispatcher } from "../utils/event_dispatcher";
const dialogue_data = require('./data/dialogue.json');
import { fonts } from '../utils/fontStyle.js';

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
    is_active = true;
    line;
    lines;
    line_index;
    char_index;

    delay_timer = 0.5;

    constructor(scene, x = 310, y = 30) {
        super(scene, x, y);
        scene.add.existing(this);
        scene.events.on('update', this.update, this);

        this.border_w = 80;
        this.w = 700;
        this.h = scene.game.config.height / 5;


        // Initialize text style
        this.font = {
            fontFamily: '"Press Start 2P", system-ui',
            fontSize: '30px', 
            color: '#000000', 
            align: 'left', 
            lineSpacing: 7,
            wordWrap: { width: this.w - (this.border_w * 2), useAdvancedWrap: true }
        };

        // Initialize text object
        this.text = scene.add.text(this.border_w, this.border_w, "", this.font).setDepth(1);
        this.add([this.text]);

        // Set text data to the imported dialogue data
        this.text_data = dialogue_data; // This line is added to fix the issue

        // Register event listeners
        this.emitter.on('dialogue_start', (key) => this.activateDialogue(key));
        this.scene.input.keyboard.on('keydown-SPACE', () => {
            console.error(`KeydownPress`);
            if (this.is_active) {
                this.advanceDialogue();
            }
        });

        // Initially not visible
        this.setVisible(true);
    }

    update(time, delta) {
        // Automatic character appending has been removed from update for simplicity
    }

    activateDialogue(key) {
        // Find the dialogue lines for the given key
        this.lines = this.text_data.find(d => d.key === key)?.lines;

        if (!this.lines) {
            console.error(`Error: did not find dialogue key: ${key}`);
            return;
        }

        // Activate dialogue
        this.is_active = true;
        this.setVisible(true);
        this.line_index = 0;
        this.char_index = 0;
        this.text.setText(this.line);
        this.loadNextLine();
    }

    deactivateDialogue() {
        // Deactivate and hide dialogue
        this.is_active = false;
        this.setVisible(false);
        this.emitter.emit('dialogue_stop');
    }

    loadNextLine() {
        if (this.line_index < this.lines.length) {
            this.line = this.lines[this.line_index];
            this.char_index = 0;
            this.isLineComplete = false;
            this.text.setText("");
            this.typeNextChar();
        } else {
            // Dialogue is complete
            this.emitter.emit('dialogue_complete');
            this.deactivateDialogue();
        }
    }

    typeNextChar() {
        if (this.char_index < this.line.length) {
            this.text.text += this.line.charAt(this.char_index);
            this.char_index++;
            this.scene.time.delayedCall(DialogueManager.text_delay, this.typeNextChar, [], this);
        } else {
            this.isLineComplete = true; // The line is now fully displayed.
        }
    }

    advanceDialogue() {
        if (this.is_active) {
            if (!this.isLineComplete) {
                // If the line is not fully displayed, immediately display it all
                this.char_index = this.line.length;
                this.text.setText(this.line);
                this.isLineComplete = true;
            } else {
                // If the line is complete, move to the next one
                this.line_index++;
                this.loadNextLine();
            }
        }
    }
    isActive() {
        return this.is_active; // Assuming is_active is a boolean flag in your class indicating active status
    }
}

export { DialogueManager };
