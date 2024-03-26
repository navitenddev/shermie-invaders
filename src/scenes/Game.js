import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../keyboard_input';
import { fonts } from '../utils/fontStyle.js';
import { Barrier } from '../objects/barrier.js';
import ScoreManager from '../utils/ScoreManager.js';
import { GridEnemy } from '../objects/enemy_grid';
import { EventDispatcher } from '../utils/event_dispatcher.js';
import InGameDialogueManager from '../utils/InGameDialogueManager.js';


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
        this.inGameDialogueManager = new InGameDialogueManager(this);
        // fade in from black
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.text(this.sys.game.config.width * (2.9 / 4), 16, `LEVEL:${this.level}`, fonts.medium);

        // create/scale BG image 
        let bgKey = `BG${this.level}`;
        if (this.level === 3 || this.level === 5) {

            let bg = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, bgKey);
            bg.setOrigin(0, 0);
            bg.setScrollFactor(0); 
            this.bgScrollSpeed = 0.5; 
        } else {

            // For other levels, just add the image normally
            let bg = this.add.image(0, 0, bgKey).setAlpha(.90);
            bg.setOrigin(0, 0);
        }

        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.objs.init_all();
        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        // Score and high score
        this.scoreManager = new ScoreManager(this);

        // Event to kill all enemies
        this.emitter.once('kill_all_enemies', this.#kill_all_enemies, this);

        this.emitter.once('player_lose', this.goto_scene, this)

        // Note: this.level is pass by value!


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

    #kill_all_enemies() {
        // Loop through all enemies and destroy them
        this.objs.enemies.grid.children.each(enemy => {
            enemy.die();
            this.scoreManager.addMoney(enemy.moneyValue);
            this.scoreManager.addScore(enemy.scoreValue);
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
        //Move dialogue with player
        if (this.inGameDialogueManager.isActive) {
            this.inGameDialogueManager.updateDialoguePosition(
                this.objs.player.x -130,
                this.objs.player.y - 50 
            );
        }

        if (this.objs.player)
            this.objs.player.update(time, delta, this.keys)
        // Update lives text and sprites
        this.livesText.setText(this.player_vars.lives);
        this.updateLivesSprites();
        this.shieldsText.setText(this.player_stats.shield - 1);
        this.updateShieldSprites();
        this.objs.ai_grid_enemies(time);
        this.check_gameover();

        //background scroller affect for scroller levels
        if (this.level === 3 || this.level === 5) {
            this.children.list.forEach((child) => {
                if (child instanceof Phaser.GameObjects.TileSprite) {
                    child.tilePositionY -= this.bgScrollSpeed * delta/2;
                }
            });
        }
    }


    check_gameover() {
        if (this.objs.enemies.grid.children.entries.length == 0 &&
            !this.level_transition_flag) {
            this.player_vars.active_bullets = 0;
            this.registry.set({ 'level': this.level + 1 });
            this.level_transition_flag = true;
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.player_vars.power = "";
            this.goto_scene("Player Win");
        } else if (this.player_vars.lives <= 0 &&
            !this.objs.player.is_inbounds()) {
            this.player_vars.power = "";
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
            if (this.player_vars.power == "pierce") player_bullet.hurt_bullet();
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
                        this.inGameDialogueManager.displayDialogue('shermie_shieldgone', 2500);
                        currShield = player.stats.shield;
                    }
                    player.updateHitbox();
                } else {
                    this.objs.explode_at(player.x, player.y);
                    player.die();
                    if (this.player_vars.lives === 0)
                        this.inGameDialogueManager.displayDialogue('shermie_dead', 3000);
                    else
                        this.inGameDialogueManager.displayDialogue('shermie_hurt', 2000);
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
            // barr_chunk.destroy(); // OM NOM NOM
        });

        // player bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.player, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            Barrier.explode_at_bullet_hit(this, bullet, barr_chunk, 25);
        });

        // enemy bullet collides with barrier
        this.physics.add.collider(this.objs.bullets.enemy, this.objs.barrier_chunks, (bullet, barr_chunk) => {
            Barrier.explode_at_bullet_hit(this, bullet, barr_chunk, 25);
        });
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