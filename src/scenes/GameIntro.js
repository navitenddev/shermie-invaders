import { Scene } from 'phaser';

export class GameIntro extends Scene {
    constructor() {
        super('GameIntro');
    }

    create() {
        this.add.image(512, 384, 'BG1');

        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.enemies = this.add.group();
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 12; j++) {
                let enemyKey;
                if (i === 0 || i === 1) {
                    enemyKey = 'enemy1_idle';
                } else if (i === 2 || i === 3) {
                    enemyKey = 'enemy2_idle';
                } else {
                    enemyKey = 'enemy3_idle';
                }
                const enemy = this.add.sprite(j * 67 + 80, -255 - i * 51, 'enemy_spritesheet', 0);
                enemy.play(enemyKey);
                this.enemies.add(enemy);
            }
        }

        this.tweens.add({
            targets: this.enemies.getChildren(),
            y: '+= 600',
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                this.scene.start('Game');
            }            
        });
    }
}