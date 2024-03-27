import { Scene } from 'phaser';
import { InitKeyDefs, CHEAT_CODE_SEQUENCE as CheatCode } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { Game as game_scene } from './Game';
import { Dialogue as dialogue_scene } from './Dialogue.js';
import { PauseMenu as pause_scene } from './PauseMenu.js';
import { StatsMenu as stats_scene } from './StatsMenu.js';

export class MainMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('MainMenu');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg')
            .setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'titlelogo')
            .setScale(0.5, 0.5);
        this.sounds = this.registry.get('sound_bank');

        this.emitter.removeAllListeners(); // clean up event listeners

        // reset global vars 
        this.player_vars = this.registry.get('player_vars');
        this.player_vars.score = 0;
        this.player_vars.lives = 3;

        /* I am sorry for doing this */
        this.scene.remove('Game');
        this.scene.add('Game', game_scene);
        this.scene.bringToTop('Game');

        this.scene.remove('Dialogue');
        this.scene.add('Dialogue', dialogue_scene);
        this.scene.bringToTop('Dialogue');

        this.scene.remove('PauseMenu');
        this.scene.add('PauseMenu', pause_scene);
        this.scene.bringToTop('PauseMenu');

        this.scene.remove('StatsMenu');
        this.scene.add('StatsMenu', stats_scene);
        this.scene.bringToTop('StatsMenu');

        // reset level back to 1
        this.registry.set('level', 1);

        // reset player stats to defaults
        for (let [key, value] of Object.entries(this.player_vars.stats))
            this.player_vars.stats[key] = 1;
        this.player_vars.active_bullets = 0;
        this.player_vars.wallet = 0;
        this.player_vars.power = "";

        this.keys = InitKeyDefs(this);

        // check if cheat codes are already activated
        if (localStorage.getItem('cheatCodesActivated') === 'true') {
            this.registry.set('debug_mode', true);
        }

        const menuSpacing = 50; // spacing between menu items
        let menuY = 530; // starting Y position for menu items

        // Start Button
        this.start_btn = this.add.text(512, menuY, 'PLAY', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.win.play();
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('Game');
                });
            });

        // Controls Button
        menuY += menuSpacing;
        this.controls_btn = this.add.text(512, menuY, 'CONTROLS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('HowToPlay');
            });

        // Level Select Button
        menuY += menuSpacing;
        this.level_select_btn = this.add.text(512, menuY, 'LEVELS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('LevelSelect');
            });

        if (this.registry.get('debug_mode') === true) {
            // Sandbox Button
            menuY += menuSpacing;
            this.sandbox_btn = this.add.text(512, menuY, 'SANDBOX', fonts.medium)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.win.play();
                    this.cameras.main.fadeOut(200, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('Sandbox');
                    });
                });

            // Disable Cheats Button
            menuY += menuSpacing;
            this.disable_cheats_btn = this.add.text(512, menuY, 'EXIT', fonts.medium)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.#disable_cheats();
                });
        }

        this.keys.m.on('down', this.sounds.toggle_mute)
        this.input.keyboard.createCombo(CheatCode, { resetOnWrongKey: true });
        this.input.keyboard.on('keycombomatch', () => {
            this.#activate_cheats();
        });
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.tilePositionY += 1;
            this.animatedBg.tilePositionX += 1;
        }
    }

    #activate_cheats() {
        console.log(`Cheat codes activated!`);
        this.registry.set('debug_mode', true);
        localStorage.setItem('cheatCodesActivated', 'true'); // store cheat code activation in localStorage
        this.sounds.bank.sfx.click.play();
        this.scene.start('MainMenu');
    }

    #disable_cheats() {
        console.log(`Cheat codes disabled!`);
        this.registry.set('debug_mode', false);
        localStorage.removeItem('cheatCodesActivated');
        this.sounds.bank.sfx.click.play();
        this.scene.start('MainMenu');
    }
}