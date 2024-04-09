import { BaseMenu } from './BaseMenu.js';
import { InitKeyDefs, CHEAT_CODE_SEQUENCE as CheatCode } from '../utils/keyboard_input';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { restart_scenes } from '../main.js';
import { TextButton } from '../ui/text_button.js';

export class MainMenu extends BaseMenu {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Main Menu');
    }

    preload() {
        this.load.json({
            key: "dialogue",
            url: "assets/data/dialogue.json"
        })
    }

    create() {
        super.create();
        this.sounds.stop_all_music();
        this.sounds.bank.music.start.play();

        this.add.image(512, 250, 'titlelogo')
            .setScale(0.5, 0.5)
            .setDepth(3);

        this.registry.set({ 'sandbox_mode': false });

        this.emitter.removeAllListeners(); // clean up event listeners

        // reset global vars 
        this.player_vars = this.registry.get('player_vars');
        this.player_vars.score = 0;
        this.player_vars.lives = 3;

        /* I am sorry for doing this */

        restart_scenes(this.scene);

        // reset level back to 1
        this.registry.set('level', 1);

        // reset player stats to defaults
        for (let [key, value] of Object.entries(this.player_vars.stats))
            this.player_vars.stats[key] = 1;
        this.player_vars.active_bullets = 0;
        this.player_vars.wallet = 0;
        this.player_vars.power = "";

        // check if cheat codes are already activated
        if (localStorage.getItem('cheatCodesActivated') === 'true') {
            this.registry.set('debug_mode', true);
        }

        // check if mute is set in localStorage
        const mute = localStorage.getItem('mute');
        if (mute !== null) {
            this.game.sound.mute = mute === 'false';
        }

        const menuSpacing = 50; // spacing between menu items
        let menuY = 480; // starting Y position for menu items

        // Start Button
<<<<<<< HEAD
        this.start_btn = this.add.text(512, menuY, 'PLAY', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.win.play();
=======
        this.start_btn = new TextButton(this, 512, menuY, "PLAY",
            () => {
                console.log('Pressed');
>>>>>>> main
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('Game');
                });
                this.start_btn.disable(); // disallow spamming
            },
        ).setDepth(3);

        // Controls Button
        menuY += menuSpacing;
        this.controls_btn = new TextButton(this, 512, menuY, "CONTROLS",
            () => {
                console.log('Pressed');
                this.scene.start('HowToPlay');
            }
        ).setDepth(3);
        // Level Select Button
        menuY += menuSpacing;
        this.level_select_btn = new TextButton(this, 512, menuY, "LEVEL SELECT",
            () => {
                this.scene.start('LevelSelect');
            }
        ).setDepth(3);

        if (this.registry.get('debug_mode') === true) {
            // Sandbox Button
            menuY += menuSpacing;
<<<<<<< HEAD
            this.sandbox_btn = this.add.text(512, menuY, 'SANDBOX', fonts.medium)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.win.play();
=======
            this.sandbox_btn = new TextButton(this, 512, menuY,
                "SANDBOX",
                () => {
>>>>>>> main
                    this.cameras.main.fadeOut(200, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('Sandbox');
                    });
                    this.sandbox_btn.disable(); // prevent spam
                }
            ).setDepth(3);
            // Tech tips test button
            menuY += menuSpacing;
            this.tech_tips_btn = new TextButton(this, 512, menuY,
                'TECH TIPS',
                () => {
                    this.scene.start('Tech Tip Test')
                }
            ).setDepth(3);
            // Disable Cheats Button
            menuY += menuSpacing;
            this.disable_cheats_btn = new TextButton(this, 512, menuY,
                'DISABLE CHEATS',
                () => {
                    this.#disable_cheats();
                }
            ).setDepth(3);
        } else {
            // all menu items here are shown when cheats are off
            menuY += menuSpacing;
            this.boss_rush_btn = new TextButton(this, 512, menuY,
                "BOSS RUSH",
                () => {
                    this.cameras.main.fadeOut(200, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('Boss Rush');
                    });
                    this.boss_rush_btn.disable();
                }
            ).setDepth(3);

        }

        this.keys.m.on('down', this.sounds.toggle_mute);
        this.input.keyboard.createCombo(CheatCode, { resetOnWrongKey: true });
        this.input.keyboard.on('keycombomatch', () => {
            this.#activate_cheats();
        });

    }

    #activate_cheats() {
        console.log(`Cheat codes activated!`);
        this.registry.set('debug_mode', true);
        localStorage.setItem('cheatCodesActivated', 'true'); // store cheat code activation in localStorage
        this.scene.start('Main Menu');
    }

    #disable_cheats() {
        console.log(`Cheat codes disabled!`);
        this.registry.set('debug_mode', false);
        localStorage.removeItem('cheatCodesActivated');
        this.scene.start('Main Menu');
    }
}