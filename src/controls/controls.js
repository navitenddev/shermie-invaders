const SPEAKER_MAP = {
    "unmuted": 0,
    "muted": 1,
}

class MuteButton extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "speaker_tileset", SPEAKER_MAP.unmuted);
        scene.add.existing(this);

        scene.sounds.load_mute_preference();

        this.setIcon();
        this.setTint(0xFFFFFF)
            .setScale(0.70, 0.70)
            .setInteractive()
            .on('pointerdown', () => {
                scene.sounds.toggle_mute();
                this.setIcon();
            });
    }

    setIcon() {
        let icon_key = (this.scene.game.sound.mute) ?
            SPEAKER_MAP.unmuted :
            SPEAKER_MAP.muted;
        this.setTexture("speaker_tileset", icon_key);
    }
};

export default class Controls {
    constructor(scene) {
        this.scene = scene;
        const screenWidth = scene.cameras.main.width;
        const screenHeight = scene.cameras.main.height;

        // touch zones
        this.leftZoneWidth = screenWidth * 0.4; // 40% left touch zone
        this.rightZoneWidth = screenWidth * 0.4; // 40% right touch zone

        const shootButtonX = screenWidth - 85;
        const shootButtonY = screenHeight - 85;
        this.shootButton = scene.add.sprite(shootButtonX, shootButtonY, 'controls')
            .setScale(1.5, 1.5)
            .setInteractive();

        // exclusion zone
        this.shootButtonBounds = {
            x1: shootButtonX - this.shootButton.displayWidth / 2,
            x2: shootButtonX + this.shootButton.displayWidth / 2,
            y1: shootButtonY - this.shootButton.displayHeight / 2,
            y2: shootButtonY + this.shootButton.displayHeight / 2,
        };

        this.shoot = false;

        this.shootButton.on('pointerdown', () => this.shoot = true);
        this.shootButton.on('pointerup', () => this.shoot = false);
        this.shootButton.on('pointerout', () => this.shoot = false);

        scene.input.on('pointerdown', this.onPointerDown, this);
        scene.input.on('pointerup', this.onPointerUp, this);

        this.mute_btn = new MuteButton(scene, scene.game.config.width / 2 + 100, 30);
    }

    onPointerDown(pointer) {
        if (pointer.x >= this.shootButtonBounds.x1 && pointer.x <= this.shootButtonBounds.x2 &&
            pointer.y >= this.shootButtonBounds.y1 && pointer.y <= this.shootButtonBounds.y2) {
            return;
        }

        if (pointer.x < this.leftZoneWidth) {
            this.left = true;
            this.right = false;
        } else if (pointer.x > this.scene.cameras.main.width - this.rightZoneWidth) {
            this.right = true;
            this.left = false;
        }
    }

    onPointerUp(pointer) {
        this.left = false;
        this.right = false;
    }
}
