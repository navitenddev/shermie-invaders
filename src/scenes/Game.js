import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { KB_INPUT_DEFS } from '../keyboard_input';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor(0x2e2e2e);
        this.add.image(512, 384, 'background').setAlpha(0.5);

        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);

        this.sounds = this.scene.get('Preloader').sound_bank;

        const key_defs = KB_INPUT_DEFS;
        this.keys = {};
        for (const [key_name, key_code] of Object.entries(key_defs))
            this.keys[key_name] = this.input.keyboard.addKey(key_code);


        // The timers will be useful for tweaking the difficulty
        this.timers = {
            e1: {
                last_fired: 0,
                shoot_cd: { // the cooldown range interval that the enemies will shoot at
                    min: 50,
                    max: 500,
                }
            },
            player: {
                last_fired: 0,
                shoot_cd: 150,
            }
        }

        const player = this.add.player(this, this.game.config.width / 2, this.game.config.height - 64);
        this.objs.player = player;

        this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);


        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies,
            this.player_bullet_hit_enemy);

        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.player,
            this.player_hit_enemy_bullet);

        this.sounds.bank.bgm.play();

        this.keys.m.on('down', this.sounds.toggle_mute);

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
        this.sounds.bank.explosion.play();
    }

    // callback function for when player bullet collides w/ enemy
    player_hit_enemy_bullet = (player, enemy_bullet) => {
        // console.log("ENEMY BULLET HIT PLAYER")
        // spawn explosion
        this.explode_at(player.x, player.y);
        // deactivate bullet
        enemy_bullet.activate(false);
        // kill player 
        player.die();
        this.sounds.bank.explosion.play();
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
        let timers = this.timers;
        if (time > timers.e1.last_fired) {
            let enemies = this.objs.enemies.children.entries;
            if (enemies && enemies.length) {
                let rand_cd = Math.round(Math.random() * (timers.e1.shoot_cd.max - timers.e1.shoot_cd.min) + timers.e1.shoot_cd.min);
                timers.e1.last_fired = time + rand_cd;
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
        if (this.objs.enemies.children.entries.length === 0)
            this.goto_win_scene();
        if (!this.objs.player.is_inbounds())
            this.goto_lose_scene();
    }

    goto_win_scene() {
        this.sounds.bank.bgm.stop();
        this.scene.start("Player Win");
    }

    goto_lose_scene() {
        this.sounds.bank.bgm.stop();
        this.scene.start("Player Lose");
    }
}
