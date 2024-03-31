import { bitmapFonts, fonts } from "../utils/fontStyle";
/**
 * @classdesc A button that contains text.  
 * Text elements will automatically center in the button. However, it is up to
 * the user to ensure that the text actually fits within the button.
 * 
 * The button uses Discord's color scheme by default.
 * @example // This example has all parameters specified
 * const continue_btn = new TextButton(this, this.game.config.width / 2, 600, 200, 100, 'Continue',
 * () => { 
 *    this.scene.start("Store")
 * },
 *     [], // callback function's arguments
 *     bitmapFonts.PressStart2P,                    // font type
 *     fonts.small.sizes[bitmapFonts.PressStart2P], // font size
 *     0x2B2D31, // color of button
 *     0x383A40, // color of hovered
 *     0xFEFEFE, // color of clicked
 *     0x879091, // color of border
 *     1         // opacity value 0 through 1
 * );
 * @example // This example will produce the same result as above.
 * const continue_btn = new TextButton(this, this.game.config.width / 2, 600, 200, 100, 'Continue',
 * () => { 
 *    this.scene.start("Store")
 * }, []
 * );
 */
export class TextButton extends Phaser.GameObjects.Container {
    /**
     * TODO: Add descriptions 
     * @param {Phaser.Scene} scene 
     * @param {number} x The button's x position
     * @param {number} y The button's y position
     * @param {number} w The width of the button
     * @param {number} h The height of the button
     * @param {string} text The text to display on the button
     * @param {function(any): any} callback The function that is called when the button is clicked
     * @param {Array<any>} args An array of arguments to be passed to the callback function
     * @param {string} font_type The type of the font.
     * @param {number} font_size The size of the font text.
     * @param {string | number} color The color of the button.
     * @param {string | number} color_hover The color of the button when mouse hovers over it.
     * @param {string | number} color_clicked The color of the button background when clicked.
     * @param {number} opacity How opaque the button background is. Should be a value between 0 and 1.
     */
    constructor(scene,
        x, y,
        w, h,
        text,
        callback,
        args = [],
        font_type = bitmapFonts.PressStart2P,
        font_size = 16,
        color = 0x2B2D31,
        color_hover = 0x383A40,
        color_clicked = 0xFEFEFE,
        color_border = 0x879091,
        opacity = 1,
    ) {

        super(scene, x, y);
        scene.add.existing(this);
        const sounds = scene.registry.get('sound_bank');
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
                this.bg.setFillStyle(color_clicked);
                sounds.bank.sfx.click.play();
                (args) ? callback(...args) : callback();
            });
        this.add([this.bg, this.btn_border, this.text]);
        this.setPosition(x, y);
    }
}