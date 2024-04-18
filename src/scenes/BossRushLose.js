import { EventDispatcher } from '../utils/event_dispatcher';
import { fonts } from '../utils/fontStyle.js';
import { restart_scenes } from '../main.js';
import { start_dialogue } from './Dialogue.js';
import { TextboxButton } from '../ui/textbox_button.js';
import { ListContainer } from '../ui/list_container.js';

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

        this.continue_btn = new TextboxButton(this, this.game.config.width / 2, 700, 150, 50, 'Main Menu',
            () => { // callback function
                this.emitter.emit('force_dialogue_stop');
                this.scene.start("Main Menu")
            },
            [], // callback function's arguments
            fonts.small.fontName,                    // font type
            fonts.small.size, // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091  // color of border
        );

        const br_total_attempts = parseInt(localStorage.getItem('br_total_attempts')) || 1;

        let br_loss_times = JSON.parse(localStorage.getItem('br_loss_times')) || [];
        br_loss_times.unshift("#" + br_total_attempts + ": " + time_str);
        localStorage.setItem('br_loss_times', JSON.stringify(br_loss_times));
        new ListContainer(this, 350, 200, 300, 380, br_loss_times, "Fallen Players");


        let br_win_times = JSON.parse(localStorage.getItem('br_win_times')) || [];
        br_win_times = br_win_times.map((s, i) => { return `${i + 1}. ${s}`; });
        new ListContainer(this, 675, 200, 300, 380, br_win_times, "Champions");
        // store the new hiscores list
    }
}
