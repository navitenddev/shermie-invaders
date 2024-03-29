/**
 * 
 */
class FillBar extends Phaser.GameObjects.Rectangle {
    total;
    inner; // inner rect
    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     * @param {number} total The total HP of the bar
     * @param {string | number} color Color of the inner bar
     */
    constructor(scene, x, y, width, height, total, color = 0x33b013) {
        super(scene, x, y, width, height, 0x000000);
        scene.add.existing(this);
        this.setOrigin(0, 0);
        this.total = total;
        this.inner = scene.add.rectangle(x + 2, y + 2,
            width - 2, height - 2,
            color
        )
        this.value = total;
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        if (this.inner)
            this.inner.setPosition(this.x + 2, this.y + 2);
    }

    set_value(value) {
        this.value = value;
        const ratio = value / this.total;
        this.inner.setOrigin(0, 0)
            .setSize((this.width * ratio), this.height)
    }

    destroy() {
        super.destroy();
        this.inner.destroy();
    }
}

export { FillBar }
