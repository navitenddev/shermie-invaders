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
            key: "usb",
            frames: this.scene.anims.generateFrameNumbers("usb", {
                start: 0,
                end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "usb_explode",
            frames: this.scene.anims.generateFrameNumbers("usb_explode", {
                start: 5, end: 11,
            }),
            frameRate: 16,
        });

        this.scene.anims.create({
            key: "reaper_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_reaper", {
                start: 15, end: 19,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "reaper_shoot",
            frames: this.scene.anims.generateFrameNumbers("enemy_reaper", {
                start: 5, end: 9,
            }),
            frameRate: 8,
        });

        this.scene.anims.create({
            key: "reaper_move",
            frames: this.scene.anims.generateFrameNumbers("enemy_reaper", {
                start: 10, end: 13,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "lupa_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_lupa", {
                start: 0, end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "pupa_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_pupa", {
                start: 0, end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });

        this.scene.anims.create({
            key: "zupa_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy_zupa", {
                start: 0, end: 5,
            }),
            frameRate: 8,
            repeat: -1,
        });
    }
}

export { AnimationFactory };
