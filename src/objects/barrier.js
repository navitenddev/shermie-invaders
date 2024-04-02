
const TILE_KEYMAP = {
    "tl": 0, // top left
    "tr": 1, // top right
    "bl": 2, // bottom left
    "br": 3, // bottom right
    "l": 4, // left
    "m": 5, // mid
    "r": 6, // mid
    "bm": 7, // bottom mid
    "tm": 8, // top mid
};

/**
 * @description an individual chunk within a Barrier object
 */

class BarrierChunk extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, key, health = 10) {
        super(scene, x, y, "brick_tileset", TILE_KEYMAP[key]);
        scene.physics.add.existing(this, true);
        scene.add.existing(this);
        this.body.debugShowBody = false;
        this.health = health;
    }

    applyDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.destroy();
        }
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
            color: color,
            health: 10
        };
        this.chunks = [];

        // this.result;
        // this.tree = new Phaser.Structs.RTree();
        this.init_particles();
        this.init_chunks();
        this.chunk_particle_emitter();
    }

    // Adds rectangular brick
    #add_brick(x, y) {
        /* Dunno a better way to do this without hard coding, sorry for the stinky code */
        let chunks = [
            this.scene.add.barrier_chunk(this.scene,
                x, y, "tl"),
            this.scene.add.barrier_chunk(this.scene,
                x + 5, y, "tm"),
            this.scene.add.barrier_chunk(this.scene,
                x + 10, y, "tr"),
            this.scene.add.barrier_chunk(this.scene,
                x, y + 5, "bl"),
            this.scene.add.barrier_chunk(this.scene,
                x + 5, y + 5, "bm"),
            this.scene.add.barrier_chunk(this.scene,
                x + 10, y + 5, "br")
        ];

        chunks.forEach((c) => {
            c.parent = this;
            this.chunks.push(c);
        });
    }

    #add_square_brick(x, y) {
        let chunks = [
            this.scene.add.barrier_chunk(this.scene,
                x, y, "tl"),
            this.scene.add.barrier_chunk(this.scene,
                x + 5, y, "tr"),
            this.scene.add.barrier_chunk(this.scene,
                x, y + 5, "bl"),
            this.scene.add.barrier_chunk(this.scene,
                x + 5, y + 5, "br"),
        ];
        chunks.forEach((c) => {
            c.parent = this;
            this.chunks.push(c);
        });
    }

    static explode_at_bullet_hit(scene, bullet, barr_chunk, baseExplosionRadius = 20) {
        const maxDamage = 100;

        // randomn explosion radius
        const randomRadiusFactor = Phaser.Math.FloatBetween(1.0, 1.6);
        const explosionRadius = baseExplosionRadius * randomRadiusFactor;

        // loop through all barrier chunks to apply damage
        scene.objs.barrier_chunks.children.each(chunk => {
            // const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, chunk.x, chunk.y);
            const distance = Phaser.Math.Distance.Between(barr_chunk.x, barr_chunk.y, chunk.x, chunk.y);

            if (chunk.active && distance < explosionRadius) {
                // calculate damage based on distance
                let damage = maxDamage * (1 - distance / explosionRadius);
                let randomDamageFactor = Phaser.Math.FloatBetween(0.1, 1.2);
                damage *= randomDamageFactor;

                chunk.applyDamage(damage);

                // destruction particles
                if (chunk.health <= 0) {
                    barr_chunk.parent.destructionEmitter.explode(1, chunk.x, chunk.y);
                }
            }
        });

        // update the flame size based on remaining barrier chunks
        barr_chunk.parent.update_flame_size();
        bullet.deactivate();
    }

    init_chunks() {
        const BRICK_W = 3 * 5;
        const BRICK_H = 2 * 5;

        const rows = 7, cols = 7;

        let k = 0;
        for (let j = 0; j < rows * BRICK_H; j += BRICK_H, k++) {
            for (let i = 0; i < cols * BRICK_W; i += BRICK_W - 1) {
                // this.#add_brick(this.rect.x + i, this.rect.y + j);
                (k % 2 === 0) ?
                    this.#add_brick(this.rect.x + i, this.rect.y + j) :
                    this.#add_brick(this.rect.x + i - ((BRICK_W) / 2), this.rect.y + j);
            }
            if (k % 2 === 0) {
                // add left square
                this.#add_square_brick(this.rect.x - (BRICK_W / 2), this.rect.y + j)
            } else {
                // add right square
                this.#add_square_brick(this.rect.x + ((BRICK_W) * cols) - 2, this.rect.y + j)
            }
        }
    }

    setChunkHealth(health) {
        this.chunk_defs.health = health;
        this.chunks.forEach(chunk => {
            chunk.health = health;
        });
    }

    init_particles() {
        const flames = this.scene.add.particles(150, 550, 'flares',
            {
                frame: 'white',
                color: [0xffd700, 0xffa500, 0xff6347, 0xdc143c],
                colorEase: 'quad.out',
                lifespan: { min: 500, max: 1400 },
                angle: { min: -90, max: -90 },
                scale: { start: 0.50, end: 0, ease: 'sine.in' },
                speed: 100,
                blendMode: 'COLOR',
                alpha: { start: 1, end: .55 },
                emitZone: {
                    type: 'random',
                    source: new Phaser.Geom.Rectangle(-65, 0, this.rect.width+10, 10),
                    quantity: 50,
                }
            });

        this.flames = flames; // reference to the flames particle emitter so we can update the size based on chunks remaining

        flames.setPosition(this.rect.x + this.rect.width / 2, this.rect.centerY);
    }
    /**
     * 
     * @param {bool} clear_flames If true, clears all flames. False by default
     */
    update_flame_size(clear_flames = false) {
        let remainingChunks = (clear_flames) ?
            0 : // assume no chunks to clear the barrier
            // count the number of active chunk
            this.chunks.filter(chunk => chunk.active).length;
        const totalChunks = this.chunk_defs.n.rows * this.chunk_defs.n.cols;
        const percentRemaining = remainingChunks / totalChunks;

        // if less than 50% of the barrier is remaining, scale/fade away the flames
        if (percentRemaining <= 0.5) {
            if (this.flames && this.flames.active) {
                this.scene.tweens.add({
                    targets: this.flames,
                    scale: 0,
                    alpha: 0,
                    duration: 2000,
                    ease: 'Quintic.Out',
                    onComplete: () => {
                        if (this.flames && this.flames.active) {
                            this.flames.destroy();
                        }
                        this.flames = null;
                    }
                });
            }
        } else {
            if (this.flames && this.flames.active) {
                this.scene.tweens.add({
                    targets: this.flames,
                    scale: percentRemaining,
                    alpha: percentRemaining,
                    duration: 1500,
                    ease: 'Quintic.Out',
                });
            }
        }
    }

    chunk_particle_emitter() {
        this.destructionEmitter = this.scene.add.particles(0, 0, 'flares', {
            frame: ['white'],
            color: [0xffffff, 0xf89800, 0xf83600, 0x9f0404],
            scale: { start: 0.2, end: 0, ease: 'exp.out' },
            alpha: { start: 1, end: 0, ease: 'exp.out' },
            lifespan: 500,
            speed: { min: 150, max: 350 },
            gravityY: 1000,
            blendMode: 'ADD',
            emitting: false
        });
    }

}

export { BarrierChunk, Barrier };