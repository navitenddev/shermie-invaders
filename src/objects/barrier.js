let chunk_size = { w: 5, h: 5 };

/**
 * @description an individual chunk within a Barrier object
 */

class BarrierChunk extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, width, height, color) {
        super(scene, x, y, width, height);
        scene.physics.add.existing(this, true);
        scene.add.existing(this);
        this.setFillStyle(color);
        this.body.debugShowBody = false;
    }
}
/**
 * @description A Barrier object which contains a group of barrier chunks
 * @property 
 */

class Barrier {
    /**
     * 
     * @param {Phaser.Scene} scene The scene to initialize the barrier in
     * @param {number} x Top-left x coordinate of barrier 
     * @param {number} y Top-left y coordinate of barrier 
     * @param {number} cw individuial chunk width
     * @param {number} ch individual chunk height
     * @param {number} n_cols number of columns of chunks
     * @param {number} n_rows number of rows of chunks
     * @param {number} color color of each chunk
     */
    constructor(scene,
        x, y,             // barrier top-left corner coordinate
        cw, ch,           // chunk width/height
        n_cols, n_rows,   // number of chunks for each row/col
        color = 0x000000, // hex color code for barrier chunk fill color
    ) {
        this.scene = scene;

        let w = n_cols * cw;
        let h = n_rows * ch;

        this.rect = new Phaser.Geom.Rectangle(x, y, w, h);
        this.chunk_defs = {
            dims: { w: cw, h: ch },
            n: { rows: n_rows, cols: n_cols },
            color: color
        };
        this.chunks = [];

        // this.result;
        // this.tree = new Phaser.Structs.RTree();
        this.init_chunks();
    }

    init_chunks() {
        let c = this.chunk_defs;
        for (let j = this.rect.y; j < this.rect.y + c.n.rows * c.dims.h; j += c.dims.h) {
            for (let i = this.rect.x; i < this.rect.x + c.n.cols * c.dims.w; i += c.dims.w) {
                let chunk = this.scene.add.barrier_chunk(this.scene,
                    i, j,
                    c.dims.w, c.dims.h,
                    c.color
                );
                this.chunks.push(chunk);
            }
        }
    }
}

export { BarrierChunk, Barrier };