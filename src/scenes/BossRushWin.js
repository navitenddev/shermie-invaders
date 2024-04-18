import { EventDispatcher } from '../utils/event_dispatcher';
import { fonts } from '../utils/fontStyle.js';
import { restart_scenes } from '../main.js';
import { start_dialogue } from './Dialogue.js';
import { TextboxButton } from '../ui/textbox_button.js';
import { ListContainer } from '../ui/list_container.js';

export class BossRushWin extends Phaser.Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Boss Rush Win');
    }

    create(data) {
        this.sounds = this.registry.get('sound_bank');
        this.sounds.stop_all_music();
        this.sounds.bank.music.champion.play();

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.player_vars = this.registry.get('player_vars');

        restart_scenes(this.scene);


        const br_total_attempts = parseInt(localStorage.getItem('br_total_attempts')) || 1;
        const time_str = `${data.time.mm}:${data.time.ss}:${data.time.ms}`;

        let br_win_times = JSON.parse(localStorage.getItem('br_win_times')) || [];
        br_win_times.push(`#${br_total_attempts} ${time_str}`);
        // sort br_win_times (fastest -> slowest)
        br_win_times.sort((og_a, og_b) => {
            // remove #NUM
            const a = og_a.split(' ')[1]; // ooga
            const b = og_b.split(' ')[1]; // booga
            // split times by delim
            const aa = a.split(':').map(Number);
            const bb = b.split(':').map(Number);
            // convert times to ms
            const ams = aa[0] * 60000 + aa[1] * 1000 + aa[2];
            const bms = bb[0] * 60000 + bb[1] * 1000 + bb[2];
            if (ams < bms)
                return -1;
            else if (ams > bms)
                return 1;
            else
                return 0;
        });

        // store the new hiscores list
        localStorage.setItem('br_win_times', JSON.stringify(br_win_times));

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            start_dialogue(this.scene, [`Congratulations, you've beaten the hardest challenge in the game and it only took you ${time_str}! You are the champion! Type navitend in the main menu to activate cheats!`], "menu", 18);
        });


        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

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

        let br_loss_times = JSON.parse(localStorage.getItem('br_loss_times')) || [];
        new ListContainer(this, 325, 200, 350, 380, br_loss_times, "Fallen Players");

        br_win_times = br_win_times.map((s, i) => { return `${i + 1}. ${s}`; });
        new ListContainer(this, 700, 200, 350, 380, br_win_times, "Champions");
    }
}
