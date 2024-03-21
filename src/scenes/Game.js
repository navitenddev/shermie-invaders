import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import ScoreManager from '../utils/ScoreManager.js';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher.js';

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
    emitter = EventDispatcher.getInstance();
    constructor() {
        super('Game');
    }

    create() {

        // fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // create/scale BG image 
        let bg = this.add.image(0, 0, 'background').setAlpha(0.85);
        bg.setOrigin(0, 0);
        bg.displayWidth = this.sys.game.config.width;
        bg.scaleY = bg.scaleX;
        bg.y = -250;

        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.objs.init_all();
        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        // Score and high score
        this.scoreManager = new ScoreManager(this);

        // Event to kill all enemies
        this.emitter.once('kill_all_enemies', this.killAllEnemies, this);

        // Note: this.level is pass by value!
        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.text(this.sys.game.config.width / 3, 16, `LEVEL:${this.level}`, fonts.medium);

        this.player_vars = this.registry.get('player_vars');
        this.player_stats = this.player_vars.stats;
        this.player_vars.power="";
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
            () => {
                if (this.level === 1)
                    this.start_dialogue('shermie_start', true)
                this.keys.p.on('down', () => this.pause());
                this.keys.esc.on('down', () => this.pause());
            }
        );

        // The timers will be useful for tweaking the difficulty
        GridEnemy.timers = {
            last_fired: 0,
            // shoot_cd will not go below 100 frames per shot
            shoot_cd: Math.max(100, 1000 - (this.level * 10)),
            last_moved: 0,
            move_cd: 0, // NOTE: This is set in ai_grid_enemies()
        };

        // this.objs.player = this.add.player(this, this.sys.game.config.width / 2, this.game.config.height - 96);

        // Player lives text and sprites
        this.livesText = this.add.text(16, this.sys.game.config.height - 48, '3', fonts.medium);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: this.player_vars.lives - 2
        });

        // Player shields text and sprites
        this.shieldsText = this.add.text(970, this.sys.game.config.height - 48, '0', fonts.medium);
        this.shieldsSprites = this.add.group({
            key: 'shields',
            repeat: this.player_stats.shield - 1
        });

        let secs = Phaser.Math.Between(15, 60);
        console.log(`Spawning enemy USB in ${secs}s`)
        this.time.delayedCall(secs * 1000, this.objs.spawn_usb_enemy, [], this.scene);

        this.sounds.bank.music.bg.play();

        this.init_collision_events();

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);
    }

    pause() {
        this.scene.pause('Game');
        this.scene.launch('PauseMenu', { prev_scene: 'Game' });
    }

    killAllEnemies() {
        // Loop through all enemies and destroy them
        this.objs.enemies.grid.children.each(enemy => {
            this.objs.explode_at(enemy.x, enemy.y);
            enemy.die();
            this.scoreManager.addMoney(enemy.moneyValue);
            this.scoreManager.addScore(enemy.scoreValue);
        });

        this.objs.enemies.special.children.each(enemy => {
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
        });
    }

    /**
     * @description Updates the lives sprites to reflect the current number of lives
     * @param {number} lives The number of lives the player has
    */
    updateLivesSprites() {
        this.livesSprites.clear(true, true); // Clear sprites
        for (let i = 0; i < this.player_vars.lives; i++) {
            // coordinates for the lives sprites
            let lifeConsts = { x: 84 + i * 48, y: this.sys.game.config.height - 32 };
            this.livesSprites.create(lifeConsts.x, lifeConsts.y, 'lives', 0)
        }
    }

    /**
 * @description Updates the shield sprites to reflect the current number of shields
 * @param {number} shields The number of shields the player has
*/
    updateShieldSprites() {
        this.shieldsSprites.clear(true, true); // Clear sprites
        for (let i = 1; i < this.player_stats.shield; i++) {
            // coordinates for the shield sprites
            let shieldConsts = { x: 990 - i * 48, y: this.sys.game.config.height - 32 };
            this.shieldsSprites.create(shieldConsts.x, shieldConsts.y, 'shields', 0)
        }
    }

    update(time, delta) {
        if (this.objs.player)
            this.objs.player.update(time, delta, this.keys)
        // Update lives text and sprites
        this.livesText.setText(this.player_vars.lives);
        this.updateLivesSprites();
        this.shieldsText.setText(this.player_stats.shield - 1);
        this.updateShieldSprites();
        this.ai_grid_enemies(time);
        this.check_gameover();
    }

    /**
     * @private
     * Handles all logic for grid-based enemies
     */
    ai_grid_enemies(time) {
        let enemies = this.objs.enemies.grid.children.entries;

        GridEnemy.timers.move_cd = (enemies.length * 10) - (this.level * 2);
        // Move all enemies down if we hit the x boundaries
        for (let enemy of enemies) {
            if (!enemy.is_x_inbounds()) {
                console.log("Enemy1 is changing rows!")
                for (let enemy of enemies)
                    enemy.move_down()
                break;
            }
            if (!enemy.is_y_inbounds())
                this.goto_scene('Player Lose');
        }

        // Move left or right if it's time to do so
        if (time > GridEnemy.timers.last_moved) {
            GridEnemy.timers.last_moved = time + GridEnemy.timers.move_cd;
            for (let enemy of enemies)
                enemy.move_x();
        }

        /* Right now, there are two grid enemy shooting types:
         * 1) Closest enemy shoots at the player (Euclidean distance)
         * 2) Random enemy shoots
         */

        // handle enemy shooting ai
        let player = this.objs.player;

        if (time > GridEnemy.timers.last_fired) {
            // Roll the dice
            let shoot_mode = Phaser.Math.Between(0, 1);

            if (enemies && enemies.length) {
                GridEnemy.timers.last_fired = time + GridEnemy.timers.shoot_cd;
                switch (shoot_mode) {
                    case 0: // closest enemy shoots at player (Euclidean distance)
                        {
                            let closest = {
                                enemy: null,
                                dist: Number.MAX_SAFE_INTEGER
                            };

                            // Find the enemy closest to the player
                            for (let enemy of enemies) {
                                let dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
                                if (dist < closest.dist)
                                    closest = { enemy: enemy, dist: dist };
                            }
                            if (closest.enemy) closest.enemy.shoot();
                            break;
                        }
                    case 1: // Completely random enemy shoots
                        {
                            // choose a random enemy
                            let rand_index = Phaser.Math.Between(0, enemies.length - 1);
                            let enemy = enemies[rand_index].shoot(time);
                            break;
                        }
                    case 2: // Enemy closest to player's x position shoots
                        if (enemies.length) {
                            let closest = enemies[0];
                            for (let enemy of enemies) {
                                let x_dist = Math.abs(player.x - enemy.x);
                                if (Math.abs(player.x - closest.x) == x_dist)
                                    closest.push(enemy)
                                else if (Math.abs(player.x - closest.x) < x_dist)
                                    closest = [enemy];
                            }

                            // choose random from closest x
                            let rand_index = Phaser.Math.Between(0, closest.length - 1);
                            enemies[rand_index].shoot(time);
                        }
                        break;
                    default:
                        console.error(`Error: Invalid grid enemy shoot mode!`);
                        break;
                }
            }

        }

    }

    check_gameover() {
        if (this.objs.enemies.grid.children.entries.length == 0 &&
            !this.level_transition_flag) {
            this.player_vars.active_bullets = 0;
            this.registry.set({ 'level': this.level + 1 });
            this.level_transition_flag = true;
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.player_vars.power="";
            this.goto_scene("Player Win");
        } else if (this.player_vars.lives <= 0 &&
            !this.objs.player.is_inbounds()) {
                this.player_vars.power="";
                this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
                this.goto_scene("Player Lose");
        }
    }

    goto_scene(targetScene) {
        this.scoreManager.updateHighScore();

        this.cameras.main.fade(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.sounds.bank.music.bg.stop();
            this.scene.start(targetScene);
        });
    }

    /**
     * @description Initializes all collision and overlap events. This function
     * should be called after objects are initialized.
     */
    init_collision_events() {
        this.physics.world.setBounds(0, 0, this.sys.game.config.width, this.sys.game.config.height);

        // player bullet hits grid enemy
        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies.grid, (player_bullet, enemy) => {
            this.objs.explode_at(enemy.x, enemy.y);
            if(this.player_vars.power == "pierce")  player_bullet.hurt_bullet();
            else player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
            this.scoreManager.addMoney(enemy.moneyValue);
        });

        // player bullet hits special enemy
        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies.special, (player_bullet, enemy) => {
            this.objs.explode_at(enemy.x, enemy.y);
            player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);

        });

        let currShield = this.player_stats.shield;
        // enemy bullet hits player
        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.player, (player, enemy_bullet) => {
            if (!player.is_dead) {
                enemy_bullet.deactivate();
                if (player.stats.shield > 1) {
                    player.shieldParticles.explode(10, player.x, this.sys.game.config.height - 135);
                    // console.log('Shield particle emitter explode called');
                    player.stats.shield--;
                    if (player.stats.shield < currShield) {
                        this.start_dialogue('shermie_shieldgone', false);
                        currShield = player.stats.shield;
                    }
                    player.updateHitbox();
                } else {
                    this.objs.explode_at(player.x, player.y);
                    player.die();
                    if (this.player_vars.lives === 0)
                        this.start_dialogue('shermie_dead', false);
                    else
                        this.start_dialogue('shermie_hurt', false);
                }
            }
        });

        // player catches powerup
        this.physics.add.overlap(this.objs.powers, this.objs.player, (player, powerup) => {
            player.changePower(powerup.buff);
            powerup.deactivate();
        });

        // enemy bullet collides with player bullet
        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.bullets.player, (enemy_bullet, player_bullet) => {
            if (player_bullet.active && enemy_bullet.active) {
                this.objs.explode_at(player_bullet.x, player_bullet.y);
                if(this.player_vars.power == "pierce")  player_bullet.hurt_bullet();
                else player_bullet.deactivate();
                enemy_bullet.deactivate();
            }
        });

        // when grid enemy hits barrier, it eats it
        this.physics.add.overlap(this.objs.enemies.grid, this.objs.barrier_chunks, (enemy, barr_chunk) => {
            console.log(barr_chunk);
            barr_chunk.parent.update_flame_size();
            barr_chunk.destroy(); // OM NOM NOM
        });

        // when special enemy hits barrier, it eats it
        this.physics.add.overlap(this.objs.enemies.special, this.objs.barrier_chunks, (enemy, barr_chunk) => {
            barr_chunk.parent.update_flame_size();
            console.log(barr_chunk);
            // barr_chunk.destroy(); // OM NOM NOM
        });

        // player bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.player, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            this.explode_at_bullet_hit(bullet, barr_chunk, 25);

        });

        // enemy bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.enemy, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            this.explode_at_bullet_hit(bullet, barr_chunk, 25);
        });
    }

    explode_at_bullet_hit(bullet, barr_chunk, baseExplosionRadius = 20) {
        const maxDamage = 100;

        // randomn explosion radius
        const randomRadiusFactor = Phaser.Math.FloatBetween(1.0, 1.6);
        const explosionRadius = baseExplosionRadius * randomRadiusFactor;

        // loop through all barrier chunks to apply damage
        this.objs.barrier_chunks.children.each(chunk => {
            const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, chunk.x, chunk.y);

            if (chunk.active && distance < explosionRadius) {
                // calculate damage based on distance
                let damage = maxDamage * (1 - distance / explosionRadius);
                let randomDamageFactor = Phaser.Math.FloatBetween(0.1, 1.2);
                damage *= randomDamageFactor;

                chunk.applyDamage(damage);

                // destruction particles
                if (chunk.health <= 0) {
                    barr_chunk.parent.destructionEmitter.explode(1, chunk.x, chunk.y);
                }
            }
        });

        // update the flame size based on remaining barrier chunks
        barr_chunk.parent.update_flame_size();
        bullet.deactivate();
    }

    /**
     * @param {*} key Start the dialogue sequence with this key
     * @param {*} blocking If true, will stop all actions in the current scene. Until dialogue complete
     */
    start_dialogue(key, blocking = true) {
        this.emitter.emit('force_dialogue_stop'); // never have more than one dialogue manager at once
        this.scene.launch('Dialogue', { dialogue_key: key, caller_scene: 'Game' });
        if (blocking)
            this.scene.pause();
    }
}