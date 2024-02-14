class AnimationFactory {
    constructor(scene) {
        this.scene = scene;
        this.init_anims();
    }

    init_anims() {
        this.scene.anims.create({
            key: "shermie_walk",
            frames: this.scene.anims.generateFrameNumbers("shermie", {
                start: 0,
                end: 1,
            }),
            frameRate: 2,
            repeat: -1,
        })
        /* Note: We are not using necromancer spritesheets, these are just examples on how to implement new sprites. */
        /*
        this.scene.anims.create({
            key: "necromancer_idle",
            frames: this.scene.anims.generateFrameNumbers("necromancer", {
                start: 0,
                end: 7,
            }),
            frameRate: 16,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "necromancer_walk",
            frames: this.scene.anims.generateFrameNumbers("necromancer", {
                start: 17,
                end: 24,
            }),
            frameRate: 16,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "necromancer_shoot",
            frames: this.scene.anims.generateFrameNumbers("necromancer", {
                start: 51,
                end: 63,
            }),
            frameRate: 32,
        });
        */

        this.scene.anims.create({
            key: "bullet",
            frames: this.scene.anims.generateFrameNumbers("bullet", {
                frames: [1, 2, 3, 4],
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "enemy_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy", {
                start: 3,
                end: 5,
            }),
            frameRate: 4,
            repeat: -1,
        });
    }

    /* TODO: Add impact explosion animation, alternatively we could try and use some particle effects */
}

export { AnimationFactory };
