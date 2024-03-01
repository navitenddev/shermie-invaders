/**
 * @description Any animations used in the game should be defined in this object.
 * 
 * This class does not need to be referenced, as no functions actually need to be called. However, this class does need to be instantiated before any phaser animations can be used.
 */
class AnimationFactory {
    constructor(scene) {
        this.scene = scene;
        this.init_anims();
    }
    /**
     * @private
     * @description Initialize all sprite animations
     */
    init_anims() {
        this.scene.anims.create({
            key: "shermie_idle",
            frames: this.scene.anims.generateFrameNumbers("shermie", {
                start: 0,
                end: 3,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "shermie_walk",
            frames: this.scene.anims.generateFrameNumbers("shermie", {
                start: 6,
                end: 11,
            }),
            frameRate: 16,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "shermie_shoot",
            frames: this.scene.anims.generateFrameNumbers("shermie", {
                start: 12,
                end: 15,
            }),
            frameRate: 16,
        });

        this.scene.anims.create({
            key: "bullet",
            frames: this.scene.anims.generateFrameNumbers("bullet", {
                start: 1,
                end: 4,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "usb",
            frames: this.scene.anims.generateFrameNumbers("usb", {
                start: 0,
                end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "enemy_l1_top_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_l1_top", {
                start: 0,
                end: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "enemy_l1_middle_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_l1_middle", {
                start: 0,
                end: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "enemy_l1_bottom_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_l1_bottom", {
                start: 0,
                end: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "cottonball_explode",
            frames: this.scene.anims.generateFrameNumbers("cottonball_explosion_sheet", {
                start: 0, end: 3,
            }),
            frameRate: 8,
        });

        this.scene.anims.create({
            key: "cottonBullet",
            frames: this.scene.anims.generateFrameNumbers("cottonBullet", {
                start: 0, end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "usb_explode",
            frames: this.scene.anims.generateFrameNumbers("usb_explode", {
                start: 5, end: 11,
            }),
            frameRate: 8,
        });

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
    }

    /* TODO: Add impact explosion animation, alternatively we could try and use some particle effects */
}

export { AnimationFactory };
