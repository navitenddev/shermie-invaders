import { bitmapFonts, fonts } from "../utils/fontStyle";

export class TextButton extends Phaser.GameObjects.Container {
    #active = true;
    /**
    * @classdesc A button that contains text.  
    * Text elements will automatically center in the button. However, it is up to
    * the user to ensure that the text actually fits within the button.
    * 
    * The button uses Discord's color scheme by default.
    * 
    * @param {Phaser.Scene} scene 
    * @param {number} x The button's x position
    * @param {number} y The button's y position
    * @param {string} text The text to display on the button
    * @param {function(any): any} callback The function that is called when the button is clicked
    * @param {Array<any>} args An array of arguments to be passed to the callback function
    * @param {string} font_type The type of the font.
    * @param {number} font_size The size of the font text.
    * @param {string | number} color The color of the text.
    * @param {string | number} color_hover The color of the text when mouse hovers over it.
    * @param {string | number} color_clicked The color of the text when clicked.
    * @example // This example has all parameters specified
    * const continue_btn = new TextButton(this, this.game.config.width / 2, 
    * 100, 'Continue',
    * () => { 
    *    this.scene.start("Store") // parameters can be passed here too
    * },
    *     [], // callback function's arguments
    *     bitmapFonts.PressStart2P,                    // font type
    *     fonts.small.sizes[bitmapFonts.PressStart2P], // font size
    *     0x2B2D31, // color of text 
    *     0x383A40, // color of text when hovered
    *     0xFEFEFE, // color of text when clicked
    * );
    * @example // This example will produce the same result as above.
    * const continue_btn = new TextButton(this, this.game.config.width / 2, 
    * 100, 'Continue',
    * () => { 
    *    this.scene.start("Store")
    * }, []
    * );
    */
    constructor(scene,
        x, y,
        text,
        callback,
        args = [],
        font_type = bitmapFonts.PressStart2P_Stroke,
        font_size = fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke],
        color = 0xF3F3F3,
        color_hover = 0x929292,
        color_clicked = 0x373737,
    ) {

        super(scene, x, y);
        scene.add.existing(this);
        const sounds = scene.registry.get('sound_bank');

        this.text = this.scene.add.bitmapText(0, 0, font_type, text, font_size, 'left');
        // center text to button
        this.text.setPosition(-(this.text.width / 2), -(this.text.height / 2))
            .setInteractive()
            .on('pointerover', () => {
                this.text.setTint(color_hover);
            })
            .on('pointerout', () => {
                this.text.setTint(color);
            })
            .on('pointerup', () => {
                this.text.setTint(color);
            })
            .on('pointerdown', () => {
                if (this.isActive()) {
                    this.text.setTint(color_clicked);
                    sounds.bank.sfx.click.play();
                    (args) ? callback(...args) : callback();
                }
            });
        this.add([this.text]);
        this.setPosition(x, y);
    }

    isActive() {
        return this.#active;
    }

    enable() {
        this.#active = true;
    }

    disable() {
        this.#active = false;
    }
}