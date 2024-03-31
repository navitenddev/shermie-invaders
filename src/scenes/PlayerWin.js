import { Scene } from 'phaser';
import { EventDispatcher } from '../utils/event_dispatcher';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { restart_scenes } from '../main.js';
import { start_dialogue } from './Dialogue.js';

class TextButton extends Phaser.GameObjects.Container {
    /**
     * TODO: Add descriptions 
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {number} w 
     * @param {number} h 
     * @param {string} text 
     * @param {function(any): any} callback 
     * @param {Array<any>} args 
     * @param {string} font_type 
     * @param {number} font_size 
     * @param {string | number} color 
     * @param {string | number} color_hover 
     * @param {string | number} color_clicked 
     */
    constructor(scene, x, y, w, h,
        text,
        callback,
        args = [],
        font_type = bitmapFonts.PressStart2P,
        font_size = 16,
        color = 0x00FF00,            // color of button normally
        color_hover = 0x0000FF,      // color of button when mouse hovers over
        color_clicked = 0xFF0000,    // color of button when clicked
        color_border = 0xFFFFFF,
        opacity = 1,
    ) {

        super(scene, x, y);
        scene.add.existing(this);
        this.w = w;
        this.h = h;
        this.bg = this.scene.add.rectangle(0, 0, w, h, color);

        this.btn_border = scene.add.graphics();

        this.btn_border
            .lineStyle(2, color_border, 1)
            .strokeRect(-(w / 2), -(h / 2), w, h);

        this.text = this.scene.add.bitmapText(0, 0, font_type, text, font_size, 'left');
        // center text to button
        this.text.setPosition(-(this.text.width / 2), -(this.text.height / 2));

        this.bg.setInteractive()
            .on('pointerover', () => {
                this.bg.setFillStyle(color_hover, opacity);
                this.btn_border
                    .clear()
                    .lineStyle(3, color_border, 1)
                    .strokeRect(-(w / 2), -(h / 2), w, h);
            })
            .on('pointerout', () => {
                this.bg.setFillStyle(color, opacity);
                this.btn_border
                    .clear()
                    .lineStyle(2, color_border, 1)
                    .strokeRect(-(w / 2), -(h / 2), w, h);
            })
            .on('pointerdown', () => {
                console.log("CLICKED")
                this.bg.setFillStyle(color_clicked);
                (args) ? callback(...args) : callback();
            });
        this.add([this.bg, this.btn_border, this.text]);
        console.log(`(${x},${y})`)
        this.setPosition(x, y);
        console.log(this);
    }
}

export class PlayerWin extends Scene {
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Player Win');
    }

    preload() {
        this.load.json({
            key: "dialogue",
            url: "assets/data/dialogue.json",
        });
    }

    create(data) {
        this.TECHTIP_COUNT = this.cache.json.get("dialogue").num_techtips;
        console.log(`TECHTIP COUNT: ${this.TECHTIP_COUNT}`);
        restart_scenes(this.scene);

        this.cameras.main.setBackgroundColor(0x000000);
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
            // do dis when fade done
            start_dialogue(this.scene, "techtip5", "techtip");
        });

        this.emitter.removeAllListeners(); // clean up event listeners

        this.add.image(512, 384, 'background').setAlpha(0.5);
        this.sounds = this.registry.get('sound_bank');

        this.sounds.bank.sfx.win.play();

        this.add.text(512, 200, `Congratulations, you beat level ${this.registry.get("level")}!\nYou can now shop for upgrades.`, {
            fontFamily: 'Arial Black',
            fontSize: 32,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'left',
            wordWrap: {
                width: this.sys.game.config.width - 200,
                useAdvancedWrap: true
            }
        }).setOrigin(0.5);

        this.continue_btn = new TextButton(this, this.game.config.width / 2, 600, 200, 100, 'Continue',
            () => { // callback function
                this.scene.start("Store")
            },
            [], // callback function's arguments
            bitmapFonts.PressStart2P,                    // font type
            fonts.small.sizes[bitmapFonts.PressStart2P], // font size
            0x2B2D31, // color of button
            0x383A40, // color of hovered
            0xFEFEFE, // color of clicked
            0x879091// color of border
        );

        const currentScore = data.currentScore;
        this.add.bitmapText(
            16,
            16,
            bitmapFonts.PressStart2P_Stroke,
            `CURRENT SCORE:${currentScore}`,
            fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]
        );
    }
}
