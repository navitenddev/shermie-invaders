import { fonts } from "../utils/fontStyle";

class ListContainer extends Phaser.GameObjects.Container {
    static MARGINS = 10;
    constructor(scene,
        x, y,
        w, h,
        list,
        title = "",
        bg_color = 0x2B2D31,
        border_color = 0x879091
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        this.bg = this.scene.add.rectangle(0, 0, w, h, bg_color);
        this.border = this.scene.add.graphics();
        this.border
            .lineStyle(2, border_color, 1)
            .strokeRect(-(w / 2), -(h / 2), w, h);
        this.text = this.scene.add.bitmapText(0, 0,
            fonts.small.fontName, "", fonts.small.size, 'left');

        let output = "";
        list.forEach((item, index) => {
            output += (index + 1) + ". " + item + "\n\n";
        });
        this.title = this.scene.add.bitmapText(0, 0, fonts.small.fontName, title, fonts.small.size, 'Center');
        this.title.setPosition(-(this.title.width / 2), -(w / 2) + ListContainer.MARGINS);
        this.text
            .setText(output)
            .setPosition(-(this.text.width / 2), -(this.text.height / 2));
        this.add([this.bg, this.border, this.title, this.text]);
    }
}

export { ListContainer }