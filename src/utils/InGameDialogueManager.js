import { EventDispatcher } from "../utils/event_dispatcher";
import dialogue_data from './data/dialogue.json'; // Ensure correct path
import { fonts } from '../utils/fontStyle.js';

class InGameDialogueManager {
    constructor(scene) {
        this.scene = scene;
        this.emitter = EventDispatcher.getInstance();
        this.textData = dialogue_data;
        this.isActive = false;
        this.currentLineIndex = 0;
        this.initDialogueBox();
    }

initDialogueBox() {
    this.dialogueBox = this.scene.add.text(0, 0, '', {
        ...fonts.small,
        align: 'center'
    }).setVisible(false).setDepth(101); // Ensure it's above the character
}

    displayDialogue(key, duration = 3000) {
        const dialogueEntry = this.textData.find(entry => entry.key === key);
        if (!dialogueEntry) {
            console.error(`Dialogue key "${key}" not found.`);
            return;
        }

        this.isActive = true;
        this.currentLineIndex = 0;
        this.showLine(dialogueEntry.lines[this.currentLineIndex]);

        // Advance through dialogue lines or hide after duration
        let lineTimerDuration = duration / dialogueEntry.lines.length;
        this.scene.time.addEvent({
            delay: lineTimerDuration,
            repeat: dialogueEntry.lines.length - 1,
            callback: () => {
                this.currentLineIndex++;
                if (this.currentLineIndex < dialogueEntry.lines.length) {
                    this.showLine(dialogueEntry.lines[this.currentLineIndex]);
                } else {
                    this.hideDialogue();
                }
            }
        });
    }

    updateDialoguePosition(x, y) {
        if (this.dialogueBox && this.isActive) {
            this.dialogueBox.setPosition(x, y);
        }
    }

    showLine(line) {
        this.dialogueBox.setText(line).setVisible(true);
    }

    hideDialogue() {
        this.dialogueBox.setVisible(false);
        this.isActive = false;
    }
}

export default InGameDialogueManager;
