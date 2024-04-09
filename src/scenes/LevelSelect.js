import { BaseMenu } from './BaseMenu.js';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { TextboxButton } from '../ui/textbox_button.js';


export class LevelSelect extends BaseMenu {
    constructor() {
        super('LevelSelect');
    }

    create() {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.shop.play();
        super.create();

        this.add.bitmapText(this.game.config.width / 3, 35, bitmapFonts.PressStart2P_Stroke, 'LEVEL SELECT', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]).setDepth(3);

        const scale = { x: 50, y: 50 };
        const gap = { x: 5, y: 5 };
        const offset = { x: 65, y: 57.5 };
        let level = 1;

        // get max level reached from localStorage
        const maxLevelReached = localStorage.getItem('maxLevelReached') || 1;

        // check if cheat mode is enabled
        const cheatModeEnabled = this.registry.get('debug_mode') === true;

        this.keys.m.on('down', this.sounds.toggle_mute);

        for (let y = 1; y <= 10; y++) {
            for (let x = 1; x <= 15; x++) {
                if (cheatModeEnabled || level <= maxLevelReached) {
                    if (level % 7) {
                        new TextboxButton(this,
                            offset.x + x * scale.x + x * gap.x,
                            offset.y + y * scale.y + y * gap.y,
                            40, 40,
                            level.toString(),
                            (scene, level) => {
                                scene.registry.set({ level: level });
                                scene.scene.start('Game');
                            },
                            [this, level++],
                            bitmapFonts.PressStart2P,
                            12)
                            .setDepth(3);
                    } else {
                        new TextboxButton(this,
                            offset.x + x * scale.x + x * gap.x,
                            offset.y + y * scale.y + y * gap.y,
                            40, 40,
                            level.toString(),
                            (scene, level) => {
                                scene.registry.set({ level: level });
                                scene.scene.start('Game');
                            },
                            [this, level++],
                            bitmapFonts.PressStart2P,
                            12,
                            0xc80420,
                            0x820114)
                            .setDepth(3);

                    }
                }
            }
        }

        this.setupBackButton();
    }
}
