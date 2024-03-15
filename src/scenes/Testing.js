import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import ScoreManager from '../utils/ScoreManager.js';
import { BaseGridEnemy } from '../objects/enemy.js';
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

export class Testing extends Scene {
    emitter = EventDispatcher.getInstance();
    win_flag = false;
    lose_flag = false;
    constructor() {
        super('Testing');
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
        this.objs.init_all_without_grid();
        this.sounds = this.registry.get('sound_bank');

        this.keys = InitKeyDefs(this);

        // Score and high score
        this.scoreManager = new ScoreManager(this);

        // Note: this.level is pass by value!
        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.text(this.sys.game.config.width / 3, 16, `LEVEL:${this.level}`, fonts.medium);

        this.player_vars = this.registry.get('player_vars');
        this.player_stats = this.player_vars.stats;

        // The timers will be useful for tweaking the difficulty
        BaseGridEnemy.timers = {
            last_fired: 0,
            shoot_cd: 1000 - (this.level * 10),
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

        this.sounds.bank.music.bg.play();

        this.init_collision_events();

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);
        this.keys.p.on('down', () => this.pause());
        this.keys.esc.on('down', () => this.pause());

        this.mouse_pos_text = this.add.text(25, 50, `(0,0)`, fonts.small);
        this.reaper = this.add.enemy_reaper(this, 0, 200)
    }

    pause() {
        this.scene.pause('Testing');
        this.scene.launch('PauseMenu', { prev_scene: 'Testing' });
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

    update(time, delta) {
        if (this.objs.player.update)
            this.objs.player.update(time, delta, this.keys)
        // Update lives text and sprites
        this.livesText.setText(this.player_vars.lives);
        this.updateLivesSprites();
        this.update_mouse_pos_text();
        this.check_gameover();
    }


    check_gameover() {
        if (this.win_flag &&
            !this.level_transition_flag) {
            this.player_vars.active_bullets = 0;
            this.registry.set({ 'level': this.level + 1 });
            this.level_transition_flag = true;
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.goto_scene("Player Win");
        } else if (this.player_vars.lives <= 0 &&
            !this.objs.player.is_inbounds()) {
            console.log('PLAYER LOSE')
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
            player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
        });

        // player bullet hits special enemy
        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies.special, (player_bullet, enemy) => {
            this.objs.explode_at(enemy.x, enemy.y);
            player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
        });

        // enemy bullet hits player
        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.player, (player, enemy_bullet) => {
            if (!player.is_dead) {
                this.objs.explode_at(player.x, player.y);
                enemy_bullet.deactivate();
                player.die();
                if (this.player_vars.lives === 0)
                    this.start_dialogue('shermie_dead', false);
                else
                    this.start_dialogue('shermie_hurt', false);
            }
        });

        // enemy bullet collides with player bullet
        this.physics.add.overlap(this.objs.bullets.enemy, this.objs.bullets.player, (enemy_bullet, player_bullet) => {
            if (player_bullet.active && enemy_bullet.active) {
                this.objs.explode_at(player_bullet.x, player_bullet.y);
                player_bullet.deactivate();
                enemy_bullet.deactivate();
            }
        });

        // when grid enemy hits barrier, it eats it
        this.physics.add.overlap(this.objs.enemies.grid, this.objs.barrier_chunks, (enemy, barr_chunk) => {
            barr_chunk.destroy(); // OM NOM NOM
        });

        // when special enemy hits barrier, it eats it
        this.physics.add.overlap(this.objs.enemies.special, this.objs.barrier_chunks, (enemy, barr_chunk) => {
            barr_chunk.destroy(); // OM NOM NOM
        });

        // player bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.player, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            this.explode_at_bullet_hit(bullet, barr_chunk);

        });

        // enemy bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.enemy, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            this.explode_at_bullet_hit(bullet, barr_chunk);
        });
    }

    explode_at_bullet_hit(bullet, barr_chunk) {
        const baseExplosionRadius = 18;
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

    update_mouse_pos_text() {
        let x = this.game.input.mousePointer.x.toFixed(1);
        let y = this.game.input.mousePointer.y.toFixed(1);
        this.mouse_pos_text.setText(`(${x},${y})`);
    }

    /**
     * @param {*} key Start the dialogue sequence with this key
     * @param {*} blocking If true, will stop all actions in the current scene. Until dialogue complete
     */
    start_dialogue(key, blocking = true) {
        this.emitter.emit('force_dialogue_stop'); // never have more than one dialogue manager at once
        this.scene.launch('Dialogue', { dialogue_key: key, caller_scene: 'Testing' });
        if (blocking)
            this.scene.pause();
    }
}