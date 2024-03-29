let chunk_size = { w: 5, h: 5 };

/**
 * @description an individual chunk within a Barrier object
 */

class BarrierChunk extends Phaser.GameObjects.Rectangle {
    constructor(scene, x, y, width, height, color, health = 10) {
        super(scene, x, y, width, height);
        scene.physics.add.existing(this, true);
        scene.add.existing(this);
        this.setFillStyle(color);
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

    static explode_at_bullet_hit(scene, bullet, barr_chunk, baseExplosionRadius = 20) {
        const maxDamage = 100;

        // randomn explosion radius
        const randomRadiusFactor = Phaser.Math.FloatBetween(1.0, 1.6);
        const explosionRadius = baseExplosionRadius * randomRadiusFactor;

        // loop through all barrier chunks to apply damage
        scene.objs.barrier_chunks.children.each(chunk => {
            const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, chunk.x, chunk.y);

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
        let c = this.chunk_defs;
        for (let j = this.rect.y; j < this.rect.y + c.n.rows * c.dims.h; j += c.dims.h) {
            for (let i = this.rect.x; i < this.rect.x + c.n.cols * c.dims.w; i += c.dims.w) {
                let chunk = this.scene.add.barrier_chunk(this.scene,
                    i, j,
                    c.dims.w, c.dims.h,
                    c.color
                );
                chunk.parent = this; // reference to the parent barrier because we need to update the flame size based on chunks remaining
                this.chunks.push(chunk);
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
                lifespan: {min: 500, max: 1400},
                angle: { min: -90, max: -90 },
                scale: { start: 0.50, end: 0, ease: 'sine.in' },
                speed: 100,
                blendMode: 'COLOR',
                alpha: { start: 1, end: .55 },
                emitZone: {
                    type: 'random',
                    source: new Phaser.Geom.Rectangle(-55, 0, this.rect.width, 10),
                    quantity: 50,
                }
            });

        this.flames = flames; // reference to the flames particle emitter so we can update the size based on chunks remaining

        flames.setPosition(this.rect.x + this.rect.width / 2, this.rect.centerY);
    }

    update_flame_size() {
        const remainingChunks = this.chunks.filter(chunk => chunk.active).length; // count the number of active chunks
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