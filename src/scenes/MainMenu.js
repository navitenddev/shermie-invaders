import { Scene } from 'phaser';
import { InitKeyDefs, CHEAT_CODE_SEQUENCE as CheatCode } from '../utils/keyboard_input';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import { Game as game_scene } from './Game';
import { Dialogue as dialogue_scene } from './Dialogue.js';
import { PauseMenu as pause_scene } from './PauseMenu.js';
import { StatsMenu as stats_scene } from './StatsMenu.js';
import { restart_scenes } from '../main.js';

export class MainMenu extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.json({
            key: "dialogue",
            url: "assets/data/dialogue.json"
        })
    }

    create() {
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000)
            .setOrigin(0, 0)
            .setDepth(0);

        this.animatedBg = this.add.group();

        const numSprites = 50; // in the background
        this.spriteWidth = 60;
        this.spriteHeight = 60;
    
        for (let i = 0; i < numSprites; i++) {
            const randomX = Phaser.Math.Between(0, this.game.config.width);
            const randomY = Phaser.Math.Between(0, this.game.config.height);
            const randomFrame = Phaser.Math.Between(1, 18);
    
            const sprite = this.add.sprite(randomX, randomY, `enemy${randomFrame}`)
                .setOrigin(0.5, 0.5)
                .setScale(.5)
                .play(`enemy${randomFrame}_idle`); 
    
            this.animatedBg.add(sprite);
        }

        
        // semi-transparent gray overlay
        const overlayColor = 0x000000; 
        const overlayAlpha = 0.6;
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, overlayColor, overlayAlpha)
            .setOrigin(0, 0)
            .setDepth(2); 


        this.add.image(512, 250, 'titlelogo')
            .setScale(0.5, 0.5)
            .setDepth(3);

        this.sounds = this.registry.get('sound_bank');

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

        this.keys = InitKeyDefs(this);

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
                this.sounds.bank.sfx.win.play();
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
        }

        this.keys.m.on('down', this.sounds.toggle_mute)
        this.input.keyboard.createCombo(CheatCode, { resetOnWrongKey: true });
        this.input.keyboard.on('keycombomatch', () => {
            this.#activate_cheats();
        });
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.children.iterate((sprite) => {
                sprite.y += 1; // Adjust the speed as needed
                if (sprite.y > this.game.config.height) {
                    sprite.y = -this.spriteHeight;
                    sprite.setTexture(`enemy${Phaser.Math.Between(1, 22)}`); // Change the sprite texture randomly
                }
            });
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