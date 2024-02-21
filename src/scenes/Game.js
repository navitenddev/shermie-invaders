import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../keyboard_input';


// The imports below aren't necessary for functionality, but are here for the JSdoc descriptors.
import { SoundBank } from '../sounds';

/**
 * @description The scene in which gameplay will occur.
 * @property {ObjectSpawner} objs The object spawner for this scene.
 * @property {SoundBank} sounds Plays sounds
 * @property {Object.<string, Phaser.Input.Keyboard.Key>} Key map to be used for gameplay events
 * @property {Object} timers An object that encapsulates all timing-related values for anything in the game.
 */

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

        this.keys = InitKeyDefs(this);


        // The timers will be useful for tweaking the difficulty
        this.timers = {
            grid_enemy: {
                last_fired: 0,
                shoot_cd: { // the cooldown range interval that the enemies will shoot at
                    min: 50,
                    max: 500,
                },
                last_moved: 0,
                move_cd: 200,
            },
            player: {
                last_fired: 0,
                shoot_cd: 150,
            }
        }

        this.objs.player = this.add.player(this, this.game.config.width / 2, this.game.config.height - 64);

        this.physics.world.setBounds(0, 0, this.game.config.width, this.game.config.height);


        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies,
            this.player_bullet_hit_enemy);

        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.player,
            this.player_hit_enemy_bullet);

        this.sounds.bank.music.bg.play();

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);

        console.log(this);
        console.log(this.objs.enemies)
    }


    update(time, delta) {
        this.objs.player.update(time, delta, this.keys)
        this.objs.cleanup_enemies();
        let is_gameover = this.ai_grid_enemies(time);
        if (is_gameover)
            this.goto_gameover_screen();

        this.check_gameover();
    }

    /**
     * @description Activate explosion animation at (x,y)
     * @param {*} x The x-coord to explode at 
     * @param {*} y The y-coord to explode at
     */
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

    /**
     * @private
     * Handles all logic for grid-based enemies
     */
    ai_grid_enemies(time) {
        let entries = this.objs.enemies.children.entries;
        // Move all enemies down if we hit the x boundaries
        for (let enemy of entries) {
            if (!enemy.is_x_inbounds()) {
                console.log("Enemy1 is changing rows!")
                for (let enemy of entries)
                    enemy.move_down()
                break;
            }
            if (!enemy.is_y_inbounds())
                this.goto_lose_scene();
        }

        // Move left or right if it's time to do so
        if (time > this.timers.grid_enemy.last_moved) {
            this.timers.grid_enemy.last_moved = time + this.timers.grid_enemy.move_cd;
            for (let enemy of entries) {
                enemy.move_x();
            }
        }

        // handle enemy shooting ai
        let timers = this.timers;
        if (time > timers.grid_enemy.last_fired) {
            let enemies = this.objs.enemies.children.entries;
            if (enemies && enemies.length) {
                let rand_cd = Math.round(Math.random() * (timers.grid_enemy.shoot_cd.max - timers.grid_enemy.shoot_cd.min) + timers.grid_enemy.shoot_cd.min);
                timers.grid_enemy.last_fired = time + rand_cd;
                // choose a random enemy
                let rand_index = Math.round(Math.random() * (enemies.length - 1));
                let player = this.objs.player;
                let enemy = enemies[rand_index];
                // shoot only if player.x is close to enemy.x
                let x_dist = Math.abs(player.x + (player.w / 2) - enemy.x + (enemy.w / 2));
                if (x_dist < enemy.x_shoot_bound)
                    enemy.shoot(time);
            }
        }
    }
    /** 
     * @private
     * @description callback function for when player bullet collides with an enemy
     * @param {*} player_bullet 
     * @param {*} enemy 
     */
    player_bullet_hit_enemy = (player_bullet, enemy) => {
        // console.log("PLAYER BULLET HIT ENEMY")
        // spawn explosion
        this.explode_at(enemy.x, enemy.y);
        player_bullet.deactivate();
        // kill enemy
        enemy.die();
        this.sounds.bank.sfx.explosion.play();
    }

    /** 
     * @private
     * @description callback function for when player collides with an enemy bullet
     * @param {*} player
     * @param {*} enemy_bullet
     */
    player_hit_enemy_bullet = (player, enemy_bullet) => {
        if (!player.is_dead) {
            // console.log("ENEMY BULLET HIT PLAYER")
            // spawn explosion
            this.explode_at(player.x, player.y);
            // deactivate bullet
            enemy_bullet.deactivate();
            // kill player 
            player.die();
            this.sounds.bank.sfx.explosion.play();
        }
    }

    check_gameover() {
        console.log(this.objs.enemies.children.entries.length);
        if (this.objs.enemies.children.entries.length === 0)
            this.goto_win_scene();
        if (!this.objs.player.is_inbounds())
            this.goto_lose_scene();
    }

    goto_win_scene() {
        this.sounds.bank.music.bg.stop();
        this.scene.start("Player Win");
    }

    goto_lose_scene() {
        this.sounds.bank.music.bg.stop();
        this.scene.start("Player Lose");
    }
}
