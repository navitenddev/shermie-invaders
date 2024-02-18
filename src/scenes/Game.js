import { Scene } from 'phaser';
import { AnimationFactory } from "../factory/animation_factory";
import { ObjectSpawner } from "../objects/spawner";
import { EnemyBullet } from '../objects/bullet';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x2e2e2e);
        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.anim_factory = new AnimationFactory(this);
        this.objs = new ObjectSpawner(this);

        this.keys = {
            w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            p: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P),
            space: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.SPACE
            ),
            enter: this.input.keyboard.addKey(
                Phaser.Input.Keyboard.KeyCodes.ENTER
            ),
            esc: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
        };

        const player = this.add.player(this, this.game.config.width / 2, this.game.config.height - 64);
        this.objs.player = player;

        this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);


        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies,
            this.player_bullet_hit_enemy);

        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.player,
            this.player_hit_enemy_bullet);

        /* TODO: This values will be useful for tweaking difficulty */
        this.enemy_timers = {
            e1_last_fired: 0,
            e1_shoot_cd: { // the cooldown range interval that the enemies will shoot at
                min: 50,
                max: 500,
            }
        }

        console.log(this);
    }


    update(time, delta) {
        this.objs.player.update(time, delta, this.keys)
        this.objs.cleanup_enemies();
        let is_gameover = this.ai_enemy1(time);
        if (is_gameover)
            this.goto_gameover_screen();

        this.check_gameover();

    }

    explode_at(x, y) {
        // console.log(`Exploding at (${x},${y})`)
        let explosion = this.objs.explosions.getFirstDead(false, 0, 0, "explosion");
        if (explosion !== null) {
            explosion.activate(x, y);
            explosion.on('animationcomplete', () => {
                explosion.deactivate();
            })
        }
    }

    // callback function for when player bullet collides w/ enemy
    player_bullet_hit_enemy = (player_bullet, enemy) => {
        // console.log("PLAYER BULLET HIT ENEMY")
        // spawn explosion
        this.explode_at(enemy.x, enemy.y);
        // deactivate bullet
        player_bullet.activate(false);
        // kill enemy
        enemy.die();
        this.diesfx = this.sound.add('explosion', { volume: 0.1, loop: false });
        this.diesfx.play();
    }

    // callback function for when player bullet collides w/ enemy
    player_hit_enemy_bullet = (player, enemy_bullet) => {
        // console.log("ENEMY BULLET HIT PLAYER")
        // spawn explosion
        this.explode_at(player.x, player.y);
        // deactivate bullet
        enemy_bullet.activate(false);
        // kill player 
        // player.die();
        this.diesfx = this.sound.add('explosion', { volume: 0.1, loop: false });
        this.diesfx.play();
    }

    ai_enemy1(time) {
        let entries = this.objs.enemies.children.entries;
        // check if enemy is out of bounds
        for (let enemy of entries) {
            if (!enemy.is_x_inbounds()) {
                console.log("Enemy1 is changing rows!")
                for (let enemy of entries)
                    enemy.change_row(time)
                break;
            }

            if (!enemy.is_y_inbounds())
                this.goto_lose_scene();
        }

        // handle enemy shooting ai
        let e_timers = this.enemy_timers;
        if (time > e_timers.e1_last_fired) {
            let enemies = this.objs.enemies.children.entries;
            if (enemies && enemies.length) {
                let rand_cd = Math.round(Math.random() * (e_timers.e1_shoot_cd.max - e_timers.e1_shoot_cd.min) + e_timers.e1_shoot_cd.min);
                e_timers.e1_last_fired = time + rand_cd;
                // choose a random enemy
                let rand_index = Math.round(Math.random() * (enemies.length - 1));
                let player = this.objs.player;
                let enemy = enemies[rand_index];
                let x_dist = Math.abs(player.x + (player.w / 2) - enemy.x + (enemy.w / 2));
                // if player.x is close to enemy.x
                if (x_dist < enemy.x_shoot_bound)
                    enemy.shoot(time);
            }
        }
    }

    check_gameover() {
        if (this.objs.enemies.children.entries.length === 0) {
            this.goto_win_scene();
        }

    }

    goto_win_scene() {
        this.scene.start("Player Win");
    }

    goto_lose_scene() {
        this.scene.start("Player Lose");
    }
}
