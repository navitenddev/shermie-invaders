import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { restart_scenes } from '../main.js';
import { start_dialogue } from './Dialogue.js';
import { TextButton } from '../ui/text_button.js';

export class BossRushLose extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Boss Rush Lose');
    }

    create(data) {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.shop.play();

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');

        const first_lines = [
            "Were you even trying?",
            "Nice try, but not good enough.",
            "So close, yet so far."
        ];

        const time_str = `${data.time.mm}:${data.time.ss}:${data.time.ms}`;

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, [`${first_lines[data.bosses_beaten]}\nYou managed to survive for ${time_str} and beat ${data.bosses_beaten}/3 bosses.`], "menu", 20);
        });

        restart_scenes(this.scene);

        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.sounds.bank.sfx.win.play();

        this.continue_btn = new TextButton(this, this.game.config.width / 2, 600, 150, 50, 'Main Menu',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu")
            },
            [], // callback function's arguments
            bitmapFonts.PressStart2P,                    // font type
            fonts.small.sizes[bitmapFonts.PressStart2P], // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091  // color of border
        );
    }
}
