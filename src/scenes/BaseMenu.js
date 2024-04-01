import { Scene } from 'phaser';
import { InitKeyDefs } from '../utils/keyboard_input';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';

export class BaseMenu extends Scene {
    constructor(sceneName) {
        super(sceneName);
    }

    create() {
        this.setupBackground();
        this.setupKeys();
        this.setupSounds();
    }

    setupBackground() {
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, 0x000000)
            .setOrigin(0, 0)
            .setDepth(0);
    
        this.animatedBg = this.add.group();
        const numSprites = 50;
        this.spriteWidth = 60;
        this.spriteHeight = 60;
    
        for (let i = 0; i < numSprites; i++) {
            const randomX = Phaser.Math.Between(0, this.game.config.width);
            const randomY = Phaser.Math.Between(0, this.game.config.height);
    
            let sprite;
            if (Math.random() < 0.33) {
                sprite = this.add.sprite(randomX, randomY, 'shermie_bg')
                    .setOrigin(0.5, 0.5)
                    .setScale(0.5)
                    .play('shermie_bg_idle');
            } else {
                const randomFrame = Phaser.Math.Between(1, 18);
                sprite = this.add.sprite(randomX, randomY, `enemy${randomFrame}`)
                    .setOrigin(0.5, 0.5)
                    .setScale(0.5)
                    .play(`enemy${randomFrame}_idle`);
            }
    
            this.animatedBg.add(sprite);
        }
    
        const overlayColor = 0x000000;
        const overlayAlpha = 0.6;
        this.add.rectangle(0, 0, this.game.config.width, this.game.config.height, overlayColor, overlayAlpha)
            .setOrigin(0, 0)
            .setDepth(2);
    }

    setupKeys() {
        this.keys = InitKeyDefs(this);
    }

    setupSounds() {
        this.sounds = this.registry.get('sound_bank');
    }

    setupBackButton() {
        this.backButton = this.add.bitmapText(512, 660, bitmapFonts.PressStart2P_Stroke, 'Back', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
            .setOrigin(0.5)
            .setInteractive()
            .setDepth(3)
            .on('pointerdown', () => {
                this.sounds.bank.sfx.click.play();
                this.scene.start('Main Menu');
            });
    }

    update() {
        if (this.animatedBg) {
            this.animatedBg.children.iterate((sprite) => {
                sprite.y += 1;
                if (sprite.y > this.game.config.height) {
                    sprite.y = -this.spriteHeight;
                    
                    if (Math.random() < 0.33) {
                        sprite.setTexture('shermie_bg');
                    } else {
                        sprite.setTexture(`enemy${Phaser.Math.Between(1, 22)}`);
                    }
                }
            });
        }
    }
}