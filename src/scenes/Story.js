import { Scene } from 'phaser';
import { EventDispatcher } from "../utils/event_dispatcher";
export class Story extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super({ key: 'Story' });
    }

    create() {
        this.level = this.registry.get('level');
        // Start the dialogue scene and pass the level-specific dialogue key.
        if (this.level >= 1 && this.level <= 7) {
            this.scene.launch('Dialogue', { dialogue_key: `level${this.level}`, caller_scene: 'Story' });
        } else {
            console.warn(`Level ${this.level} does not have a designated dialogue.`);
            // Transition to the game scene or handle as needed.
            this.scene.start('Game');
        }
    }

    startDialogueForLevel(dialogueKey) {
        this.dialogueManager.activateDialogue(dialogueKey); // Activate the dialogue manager

        // Transition back to the game or next scene upon dialogue completion
        this.dialogueManager.emitter.once('dialogue_complete', () => {
            console.log('Dialogue completed, transitioning to the Game scene.');
            this.scene.start('Game');
        });
    }

    setBackgroundForLevel() {
        // Set the background image based on the current level, adjusting for game scale
        const backgroundKey = `level${this.level}Background`;
        let bg = this.add.image(0, 0, backgroundKey).setOrigin(0, 0);
        bg.setScale(this.scale.width / bg.width, this.scale.height / bg.height);
    }
}
