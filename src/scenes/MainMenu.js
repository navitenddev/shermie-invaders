import { BaseMenu } from './BaseMenu.js';
import { InitKeyDefs, CHEAT_CODE_SEQUENCE as CheatCode } from '../utils/keyboard_input';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { restart_scenes } from '../main.js';

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
        this.start_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'PLAY', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(3)
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('Game');
                });
            });

        // Controls Button
        menuY += menuSpacing;
        this.controls_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'CONTROLS', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(3)
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('HowToPlay');
            });

        // Level Select Button
        menuY += menuSpacing;
        this.level_select_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'LEVELS', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(3)
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('LevelSelect');
            });

        if (this.registry.get('debug_mode') === true) {
            // Sandbox Button
            menuY += menuSpacing;
            this.sandbox_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'SANDBOX', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
                .setOrigin(0.5)
                .setInteractive()
                .setDepth(3)
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.win.play();
                    this.cameras.main.fadeOut(200, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('Sandbox');
                    });
                });
            // Tech tips test button
            menuY += menuSpacing;
            this.disable_cheats_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'TECH TIP TEST',
                fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
                .setOrigin(0.5)
                .setInteractive()
                .setDepth(3)
                .on('pointerdown', () => {
                    this.scene.start('Tech Tip Test')
                });

            // Disable Cheats Button
            menuY += menuSpacing;
            this.disable_cheats_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'CHEATS OFF', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
                .setOrigin(0.5)
                .setInteractive()
                .setDepth(3)
                .on('pointerdown', () => {
                    this.#disable_cheats();
                });
        } else {
            menuY += menuSpacing;    // only show boss rush when cheats are disabled 
            this.boss_rush_btn = this.add.bitmapText(512, menuY, bitmapFonts.PressStart2P_Stroke, 'BOSS RUSH', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
                .setOrigin(0.5)
                .setInteractive()
                .setDepth(3)
                .on('pointerdown', () => {
                    this.scene.start('Boss Rush');
                })

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
        this.sounds.bank.sfx.click.play();
        this.scene.start('Main Menu');
    }

    #disable_cheats() {
        console.log(`Cheat codes disabled!`);
        this.registry.set('debug_mode', false);
        localStorage.removeItem('cheatCodesActivated');
        this.sounds.bank.sfx.click.play();
        this.scene.start('Main Menu');
    }
}