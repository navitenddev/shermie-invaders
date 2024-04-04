import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../utils/keyboard_input';
import { bitmapFonts, fonts } from '../utils/fontStyle';
import { Barrier } from '../objects/barrier';
import ScoreManager from '../utils/ScoreManager';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher';
import { start_dialogue } from './Dialogue';

// The imports below aren't necessary for functionality, but are here for the JSdoc descriptors.
import { SoundBank } from '../utils/sounds';

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

    init() {
        this.debugMode = false;
    }

    create() {
        this.level = this.registry.get('level');
        // fade in from black
        this.cameras.main.fadeIn(500, 0, 0, 0);
        // For now, the level dialogues will repeat after it exceeds the final level dialogue.

        if (this.level <= 7) {
            start_dialogue(this.scene, `level${(this.level)}`, "story", 23);
        }

        let bgKey;
        if (this.level > 7) {
            bgKey = 'BG5'; // Default to BG5 for levels above 7
        } else {
            bgKey = `BG${this.level}`; // Use the dynamic background key for levels 7 and below
        }

        if (this.level === 3 || this.level === 5) {
            // If the level is 3 or 5, create a TileSprite instead of a static image
            let bg = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, bgKey);
            bg.setOrigin(0, 0);
            bg.setScrollFactor(0); // This makes sure it doesn't scroll with the camera
            this.bgScrollSpeed = 0.5; // Adjust scroll speed as needed
        } else {
            // For other levels, just add the image normally
            let bg = this.add.image(0, 0, bgKey).setAlpha(1);
            bg.setOrigin(0, 0);
        }

        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.objs.init_all();

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
            () => {
                this.keys.p.on('down', () => this.pause());
                this.keys.esc.on('down', () => this.pause());
            }
        );
        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        // Score and high score
        this.scoreManager = new ScoreManager(this);

        // Event to kill all enemies
        this.emitter.once('kill_all_enemies', this.#kill_all_enemies, this);

        this.emitter.once('player_lose', this.goto_scene, this)

        // Note: this.level is pass by value!
        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.bitmapText(0, 16, bitmapFonts.PressStart2P, `LEVEL:${this.level}`, fonts.medium.sizes[bitmapFonts.PressStart2P])
            .setOrigin(1, 0)
            .setPosition(this.sys.game.config.width - 16, 16);

        this.player_vars = this.registry.get('player_vars');
        this.player_stats = this.player_vars.stats;
        this.player_vars.power = "";
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE,
            () => {
                this.keys.p.on('down', () => this.pause());
                this.keys.esc.on('down', () => this.pause());
            }
        );

        // Player lives text and sprites
        this.livesText = this.add.bitmapText(16, this.sys.game.config.height - 48, bitmapFonts.PressStart2P, '3', fonts.medium.sizes[bitmapFonts.PressStart2P]);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: this.player_vars.lives - 2
        });

        let secs = Phaser.Math.Between(15, 60);
        console.log(`Spawning enemy USB in ${secs}s`)
        this.time.delayedCall(secs * 1000, this.objs.spawn_usb_enemy, [], this.scene);
        this.sounds.bank.music.start.stop();
        this.sounds.bank.music.bg.play();

        this.init_collision_events();

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);

        // Toggle debug mode when 'X' key is pressed
        this.keys.x.on('down', () => {
            this.toggleDebug();
        });

        this.physics.world.drawDebug = this.debugMode;
    }

    toggleDebug() {
        this.debugMode = !this.debugMode;
        this.physics.world.drawDebug = this.debugMode;
        // Clear debug graphics when debug mode is turned off
        if (!this.debugMode) {
            this.physics.world.debugGraphic.clear()
        }
    }

    pause() {
        this.scene.pause('Game');
        this.scene.launch('PauseMenu', { prev_scene: 'Game' });
    }

    #kill_all_enemies() {
        // Loop through all enemies and destroy them
        const score_scaling = 1.2; // Adjust scaling as you see fit
        this.objs.enemies.grid.children.each(enemy => {
            enemy.die();
            this.scoreManager.addMoney(enemy.moneyValue);
            this.scoreManager.addScore(Math.round(enemy.scoreValue * Math.pow(score_scaling, this.level)));
        });

        this.objs.enemies.special.children.each(enemy => {
            this.scoreManager.addMoney(enemy.moneyValue * enemy.hp);
            this.scoreManager.addScore(enemy.scoreValue * enemy.hp);
            enemy.hp = 1;
            enemy.die();
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


    update(time, delta) {
        if (this.objs.player)
            this.objs.player.update(time, delta, this.keys)
        // Update lives text and sprites
        this.livesText.setText(this.player_vars.lives);
        this.updateLivesSprites();
        this.objs.ai_grid_enemies(time);
        this.check_gameover();
    }


    check_gameover() {
        if (this.objs.enemies.grid.children.entries.length == 0 &&
            !this.level_transition_flag) {
            this.player_vars.active_bullets = 0;
            this.level_transition_flag = true;
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.player_vars.power = "";
            this.objs.player.setInvincible = true;
            this.goto_scene("Player Win");
        } else if (this.player_vars.lives <= 0 &&
            !this.objs.player.is_inbounds()) {
            this.player_vars.power = "";
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.goto_scene("Player Lose");
        }
    }

    goto_scene(targetScene) {
        const cheatModeEnabled = this.registry.get('debug_mode') === true;
        if (!cheatModeEnabled) {
            this.scoreManager.checkAndUpdateHighScore();
        }

        this.cameras.main.fade(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.sounds.bank.music.bg.stop();
            if (targetScene === "Player Lose") {
                this.scene.start('Player Lose');
            } else {
                this.scene.start(targetScene);
            }
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
            if (this.player_vars.power == "pierce") player_bullet.hurt_bullet();
            else player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
            this.scoreManager.checkAndUpdateHighScore();
            this.scoreManager.addMoney(enemy.moneyValue);
        });

        // player bullet hits special enemy
        this.physics.add.overlap(this.objs.bullets.player, this.objs.enemies.special, (player_bullet, enemy) => {
            this.objs.explode_at(enemy.x, enemy.y);
            player_bullet.deactivate();
            enemy.die();
            this.scoreManager.addScore(enemy.scoreValue);
            this.scoreManager.checkAndUpdateHighScore();
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
                        start_dialogue(this.scene, 'shermie_shieldgone', "game");
                        currShield = player.stats.shield;
                    }
                    player.updateHitbox();
                } else {
                    this.objs.explode_at(player.x, player.y);
                    player.die();
                    if (this.player_vars.lives === 0)
                        start_dialogue(this.scene, 'shermie_dead', "game");
                    else
                        start_dialogue(this.scene, 'shermie_hurt', "game");
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
                if (this.player_vars.power == "pierce") player_bullet.hurt_bullet();
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
            barr_chunk.destroy();
        });

        // player bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.player, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            Barrier.explode_at_bullet_hit(this, bullet, barr_chunk, 15);
        });

        // enemy bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.enemy, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            Barrier.explode_at_bullet_hit(this, bullet, barr_chunk, 15);
        });
    }
}