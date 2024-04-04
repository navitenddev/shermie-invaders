import { BaseMenu } from './BaseMenu.js';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { TextButton } from '../ui/text_button.js';
import { start_dialogue} from './Dialogue.js';
import ScoreManager from '../utils/ScoreManager';
import { restart_scenes } from '../main.js';
import { EventDispatcher } from '../utils/event_dispatcher';

export class LevelSelect extends BaseMenu {
    constructor() {
        super('LevelSelect');
    }

    create() {
        super.create();

        this.add.image(this.game.config.width / 2, 35, 'levelSelectlogo')
            .setDepth(3);

        const scale = { x: 50, y: 50 };
        const gap = { x: 5, y: 5 };
        const offset = { x: 65, y: 57.5 };
        let level = 1;

        // get max level reached from localStorage
        const maxLevelReached = localStorage.getItem('maxLevelReached') || 1;

        // check if cheat mode is enabled
        const cheatModeEnabled = this.registry.get('debug_mode') === true;

        this.keys.m.on('down', this.sounds.toggle_mute);
        this.scoreManager = new ScoreManager(this);
        for (let y = 1; y <= 10; y++) {
            for (let x = 1; x <= 15; x++) {
                if (cheatModeEnabled || level <= maxLevelReached) {
                    new TextButton(this,
                        offset.x + x * scale.x + x * gap.x,
                        offset.y + y * scale.y + y * gap.y,
                        40, 40,
                        level.toString(),
                        (scene, level) => {
                            restart_scenes(this.scene);
                            start_dialogue(this.scene, `AskMoney`, "techtip");
                            let emitter = EventDispatcher.getInstance();
                            console.log(level);
                            new TextButton(this,
                                300, 600,
                                100, 40,
                                "back",
                                (scene, level) => {
                                    emitter.emit('force_dialogue_stop');
                                    scene.scene.start('LevelSelect');
                                },
                                [this, level],
                                bitmapFonts.PressStart2P,
                                12)
                                .setDepth(3);
                            new TextButton(this,
                                500,600,
                                100, 40,
                                "Poor",
                                (scene, level) => {
                                    emitter.emit('force_dialogue_stop');
                                    scene.registry.set({ level: level });
                                    scene.scene.start('Game');
                                },
                                [this, level],
                                bitmapFonts.PressStart2P,
                                12)
                                .setDepth(3);
                            new TextButton(this,
                                700,600,
                                100, 40,
                                "Money",
                                (scene, level) => {
                                    emitter.emit('force_dialogue_stop');
                                    this.scoreManager.addMoney(660*(level-1));
                                    scene.registry.set({ level: level-1 });
                                    scene.scene.start('Store');
                                },
                                [this, level],
                                bitmapFonts.PressStart2P,
                                12)
                                .setDepth(3);
                        },
                        [this, level++],
                        bitmapFonts.PressStart2P,
                        12)
                        .setDepth(3);
                }
            }
        }

        this.setupBackButton();
    }
}
