class AnimationFactory {
    constructor(scene) {
        this._init_anims();
    }

    init_anims() {
        this._scene.anims.create({
            key: "player_idle",
            frames: this._scene.anims.generateFrameNumbers("necromancer", {
                start: 0,
                end: 7,
            }),
            frameRate: 16,
            repeat: -1,
        });

        this._scene.anims.create({
            key: "player_walk",
            frames: this._scene.anims.generateFrameNumbers("necromancer", {
                start: 17,
                end: 24,
            }),
            frameRate: 16,
            repeat: -1,
        });

        this._scene.anims.create({
            key: "player_shoot",
            frames: this._scene.anims.generateFrameNumbers("necromancer", {
                start: 51,
                end: 63,
            }),
            frameRate: 32,
        });

        this._scene.anims.create({
            key: "bullet",
            frames: this._scene.anims.generateFrameNumbers("bullet", {
                frames: [1, 2, 3, 4],
            }),
            frameRate: 8,
            repeat: -1,
        });

        this._scene.anims.create({
            key: "enemy_idle",
            frames: this._scene.anims.generateFrameNumbers("enemy", {
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
