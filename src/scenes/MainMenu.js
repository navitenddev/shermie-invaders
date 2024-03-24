import { Scene } from 'phaser';
import { InitKeyDefs, CHEAT_CODE_SEQUENCE as CheatCode } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';

export class MainMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('MainMenu');
    }

    create() {
        this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg')
            .setOrigin(0.5, 0.5);

        this.add.image(512, 300, 'titlelogo');
        this.sounds = this.registry.get('sound_bank');

        this.emitter.removeAllListeners(); // clean up event listeners

        // reset global vars 
        this.player_vars = this.registry.get('player_vars');
        this.player_vars.score = 0;
        this.player_vars.lives = 3;

        // reset level back to 1
        this.registry.set('level', 1);

        // reset player stats to defaults
        for (let [key, value] of Object.entries(this.player_vars.stats))
            this.player_vars.stats[key] = 1;
        this.player_vars.active_bullets = 0;
        this.player_vars.wallet = 0;

        this.keys = InitKeyDefs(this);

        // check if cheat codes are already activated
        if (localStorage.getItem('cheatCodesActivated') === 'true') {
            this.registry.set('debug_mode', true);
        }

        // Start Button
        this.start_btn = this.add.text(512, 460, 'PLAY', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sound.get('start').stop();
                this.sounds.bank.sfx.win.play();
                this.cameras.main.fadeOut(200, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('Game');
                });
            });

        this.controls_btn = this.add.text(512, 510, 'CONTROLS', fonts.medium)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('HowToPlay');
            });

        if (this.registry.get('debug_mode') === true) {
            this.level_select_btn = this.add.text(512, 560, 'LEVELS', fonts.medium)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sounds.bank.sfx.click.play();
                    this.scene.start('LevelSelect');
                });

            this.sandbox_btn = this.add.text(512, 610, 'SANDBOX', fonts.medium)
                .setOrigin(0.5)
                .setInteractive()
                .on('pointerdown', () => {
                    this.sound.get('start').stop();
                    this.sounds.bank.sfx.win.play();
                    this.cameras.main.fadeOut(200, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('Sandbox');
                    });
                });
                
      // Disable Cheats Button
      this.disable_cheats_btn = this.add.text(512, 660, 'EXIT', fonts.medium)
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