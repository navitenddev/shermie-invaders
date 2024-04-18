import { fonts } from "../utils/fontStyle";
import { EventDispatcher } from "../utils/event_dispatcher";

class ListContainer extends Phaser.GameObjects.Container {
    emitter = EventDispatcher.getInstance();
    static MARGINS = 10;
    static MAX_LINES_DISPLAYED = 10;
    #scroll_y = 0;
    constructor(scene,
        x, y,
        w, h,
        entries,
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
        this.display_text = this.scene.add.bitmapText(0, 0,
            fonts.small.fontName, "", fonts.small.size, 'left');

        this.title = this.scene.add.bitmapText(0, 0, fonts.small.fontName, title, fonts.small.size, 'Center');
        this.title.setPosition(-(this.title.width / 2), -(w / 2) + ListContainer.MARGINS);
        this.display_text
            .setPosition(-(this.display_text.width / 2), -(this.display_text.height / 2));
        this.entries = entries

        this.#update_text();

        this.bg
            .setInteractive()
            .on('wheel', (pointer, dx, dy, dz) => {
                if (dy > 0)
                    this.#scroll_down();
                else if (dy < 0)
                    this.#scroll_up();
            });

        this.add([this.bg, this.border, this.title, this.display_text]);
    }

    #scroll_down() {
        if (this.#scroll_y + ListContainer.MAX_LINES_DISPLAYED >= this.entries.length) {
            // we've reached the bottom
            return;
        }
        this.#scroll_y++;
        this.#update_text();
    }

    #scroll_up() {
        if (this.#scroll_y === 0) {
            // we've reached the top
            return;
        }
        this.#scroll_y--;
        this.#update_text();
    }

    #update_text() {
        let output = "";
        for (let i = this.#scroll_y; i < this.#scroll_y + ListContainer.MAX_LINES_DISPLAYED; ++i) {
            if (i === this.entries.length) { // no more to display
                // will probably need to do more here (fill remaining lines with newlines?)
                return;
            }
            output += this.entries[i] + "\n\n";
        }
        this.display_text.setText(output)
            .setPosition(-(this.display_text.width / 2), -(this.display_text.height / 2));
    }
}

export { ListContainer }