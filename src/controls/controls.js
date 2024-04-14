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

        this.joyStick = scene.plugins.get('rexVirtualJoystick').add(scene, {
            x: 120,
            y: screenHeight - 120,
            radius: 100,
            base: scene.add.sprite(0, 0, 'joystick_split', 0.75).setScale(.66),
            thumb: scene.add.sprite(0, 0, 'joystick_handle', 0.75).setScale(.66),
        });

        this.left = this.joyStick.left;
        this.right = this.joyStick.right;
    }

    onPointerDown(pointer) {
        if (pointer.x >= this.shootButtonBounds.x1 && pointer.x <= this.shootButtonBounds.x2 &&
            pointer.y >= this.shootButtonBounds.y1 && pointer.y <= this.shootButtonBounds.y2) {
            return;
        }

        if (pointer.x < this.leftZoneWidth) {
            this.left = true;
        } else if (pointer.x > this.scene.cameras.main.width - this.rightZoneWidth) {
            this.right = true;
        }
    }

    onPointerUp(pointer) {
        if (pointer.x < this.leftZoneWidth) {
            this.left = false;
        } else if (pointer.x > this.scene.cameras.main.width - this.rightZoneWidth) {
            this.right = false;
        }
    }
}