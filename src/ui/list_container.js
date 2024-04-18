import { fonts } from "../utils/fontStyle";
import { EventDispatcher } from "../utils/event_dispatcher";

class ListContainer extends Phaser.GameObjects.Container {
    emitter = EventDispatcher.getInstance();
    static MARGINS = 10;
    static MAX_LINES_DISPLAYED = 10;
    static ARROW_OFFSET = 15;
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

        this.title = this.scene.add.bitmapText(0, 0, fonts.small.fontName, title, fonts.small.size, 'Center');
        this.title.setPosition(-(this.title.width / 2), -(h / 2) + ListContainer.MARGINS);
        this.display_text = this.scene.add.bitmapText(0, 0,
            fonts.small.fontName, "", fonts.small.size, 'left');
        this.entries = entries

        this.bg
            .setInteractive({ draggable: true })
            .on('wheel', (pointer, dx, dy, dz) => {
                if (dy > 0)
                    this.#scroll_down();
                else if (dy < 0)
                    this.#scroll_up();
            })
            .on('drag', (pointer, dx, dy) => {
                if (dy > 0)
                    this.#scroll_up();
                else if (dy < 0)
                    this.#scroll_down();
            });

        this.arrow_up = this.scene.add.image(0, -(this.display_text.height / 2) - ListContainer.ARROW_OFFSET, 'arrow')
            .setScale(0.5)
            .setVisible(false);
        // .setInteractive()
        // .on('pointerdown', () => { this.#scroll_up(); });
        this.arrow_down = this.scene.add.image(0, +(this.display_text.height / 2) + ListContainer.ARROW_OFFSET, 'arrow')
            .setAngle(180)
            .setScale(0.5);
        // .setInteractive()
        // .on('pointerdown', () => { this.#scroll_down(); });


        if (this.#scroll_y + ListContainer.MAX_LINES_DISPLAYED < this.entries.length)
            this.arrow_down.setVisible(false);
        this.#update_text();

        this.add([this.bg, this.border, this.title, this.display_text, this.arrow_up, this.arrow_down]);
        this.arrow_up.setPosition(0, -(this.display_text.height / 2) - ListContainer.ARROW_OFFSET);
        this.arrow_down.setPosition(0, +(this.display_text.height / 2) + ListContainer.ARROW_OFFSET);
        this.display_text.setPosition(-(this.display_text.width / 2), -(this.display_text.height / 2));
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

        let i, start;
        i = start = this.#scroll_y;
        while (i < this.#scroll_y + ListContainer.MAX_LINES_DISPLAYED) {
            if (i === this.entries.length) // no more to display
                break;
            output += this.entries[i] + "\n\n";
            ++i;
        }

        if (this.#scroll_y === 0)
            this.arrow_up.setVisible(false);
        else
            this.arrow_up.setVisible(true);

        if (this.#scroll_y + ListContainer.MAX_LINES_DISPLAYED < this.entries.length)
            this.arrow_down.setVisible(true);
        else
            this.arrow_down.setVisible(false);

        this.display_text.setText(output);
    }
}

export { ListContainer }