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
            key: "enemy1_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy1", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy2_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy2", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy3_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy3", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy4_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy4", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy5_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy5", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy6_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy6", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy7_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy7", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy8_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy8", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy9_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy9", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy10_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy10", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy11_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy11", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy12_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy12", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy13_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy13", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy14_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy14", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy15_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy15", {
                start: 0,
                end: 0,
            })
        });

        this.scene.anims.create({
            key: "enemy16_idle",
            frames: this.scene.anims.generateFrameNumbers("enemy16", {
                start: 0,
                end: 0,
            })
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
