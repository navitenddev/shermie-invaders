import { Scene } from 'phaser';
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';

export class StatsMenu extends Scene {
    constructor() {
        super('StatsMenu');
    }

    create() {
        this.player = this.registry.get('player');
        if (this.player) {
            console.log('Player stats:', this.player.stats);
        }
        const boxWidth = 610;
        const boxHeight = 320;
        const boxX = (this.game.config.width - boxWidth) / 2;
        const boxY = (this.game.config.height - boxHeight) / 2;

        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.9); 
        graphics.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 10);

        this.addMoveSpeed = this.add.text(boxX + 20, boxY + 20, '+', fonts.medium)
            .setInteractive();
        this.subtractMoveSpeed = this.add.text(boxX + 550, boxY + 20, '-', fonts.medium)
            .setInteractive();

        this.addBulletSpeed = this.add.text(boxX + 20, boxY + 70, '+', fonts.medium)
            .setInteractive();
        this.subtractBulletSpeed = this.add.text(boxX + 550, boxY + 70, '-', fonts.medium)
            .setInteractive();

        this.addFireRate = this.add.text(boxX + 20, boxY + 120, '+', fonts.medium)
            .setInteractive();
        this.subtractFireRate = this.add.text(boxX + 550, boxY + 120, '-', fonts.medium)
            .setInteractive();
            
        this.addMaxBullets = this.add.text(boxX + 20, boxY + 170, '+', fonts.medium)
            .setInteractive();
        this.subtractMaxBullets = this.add.text(boxX + 550, boxY + 170, '-', fonts.medium)
            .setInteractive();

        this.backButton = this.add.text(boxX + 70, boxY + 250, 'Back', fonts.medium)
            .setInteractive();

        this.backButton.on('pointerdown', () => {
                this.scene.stop('StatsMenu');
                this.scene.start('PauseMenu');
        });

        this.addMoveSpeed.on('pointerdown', () => {
            this.modifyStat('move_speed', 1);
            this.addMoveSpeed.setStyle({ color: '#ff0000' });
        });
        this.addMoveSpeed.on('pointerup', () => {
            this.addMoveSpeed.setStyle(fonts.medium);
        });
        this.subtractMoveSpeed.on('pointerdown', () => {
            this.modifyStat('move_speed', -1);
            this.subtractMoveSpeed.setStyle({ color: '#ff0000' });
        });
        this.subtractMoveSpeed.on('pointerup', () => {
            this.subtractMoveSpeed.setStyle(fonts.medium);
        });

        this.addBulletSpeed.on('pointerdown', () => {
            this.modifyStat('bullet_speed', 1);
            this.addBulletSpeed.setStyle({ color: '#ff0000' });
        });
        this.addBulletSpeed.on('pointerup', () => {
            this.addBulletSpeed.setStyle(fonts.medium);
        });
        this.subtractBulletSpeed.on('pointerdown', () => {
            this.modifyStat('bullet_speed', -1);
            this.subtractBulletSpeed.setStyle({ color: '#ff0000' });
        });
        this.subtractBulletSpeed.on('pointerup', () => {
            this.subtractBulletSpeed.setStyle(fonts.medium);
        });

        this.addFireRate.on('pointerdown', () => {
            this.modifyStat('fire_rate', 1);
            this.addFireRate.setStyle({ color: '#ff0000' });
        });
        this.addFireRate.on('pointerup', () => {
            this.addFireRate.setStyle(fonts.medium);
        });
        this.subtractFireRate.on('pointerdown', () => {
            this.modifyStat('fire_rate', -1);
            this.subtractFireRate.setStyle({ color: '#ff0000' });
        });
        this.subtractFireRate.on('pointerup', () => {
            this.subtractFireRate.setStyle(fonts.medium);
        });

        this.addMaxBullets.on('pointerdown', () => {
            this.modifyStat('max_bullets', 1);
            this.addMaxBullets.setStyle({ color: '#ff0000' });
        });
        this.addMaxBullets.on('pointerup', () => {
            this.addMaxBullets.setStyle(fonts.medium);
        });
        this.subtractMaxBullets.on('pointerdown', () => {
            this.modifyStat('max_bullets', -1);
            this.subtractMaxBullets.setStyle({ color: '#ff0000' });
        });
        this.subtractMaxBullets.on('pointerup', () => {
            this.subtractMaxBullets.setStyle(fonts.medium);
        });
        
        this.moveSpeed = this.add.text(boxX + 70, boxY + 20, 'Move Speed', fonts.medium)
        this.BulletSpeed = this.add.text(boxX + 70, boxY + 70, 'Bullet Speed', fonts.medium)
        this.FireRate = this.add.text(boxX + 70, boxY + 120, 'Fire Rate', fonts.medium)
        this.MaxBullets = this.add.text(boxX + 70, boxY + 170, 'Maximum Bullets', fonts.medium)

    }
    modifyStat(statName, amount) {
        // Add or subtract from the specified stat
        this.player.stats[statName] += amount;

        // Ensure the stats don't go below a certain value (e.g., 1)
        this.player.stats[statName] = Math.max(this.player.stats[statName], 1);
        console.log(`Modified ${this.player.stats[statName]} to ${this.player.stats[statName]}`);
    }
}