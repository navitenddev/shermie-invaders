import { Scene } from 'phaser';
import { ObjectSpawner } from "../objects/spawner";
import { InitKeyDefs } from '../utils/keyboard_input';
import { fonts } from '../utils/fontStyle';
import { GridEnemy } from '../objects/enemy_grid';
import ScoreManager from '../utils/ScoreManager';
import { EventDispatcher } from '../utils/event_dispatcher';
import { start_dialogue } from './Dialogue';
import { init_collision_events, restart_scenes } from '../main';
import Controls from '../controls/controls';

/**
 * @description The scene in which gameplay will occur.
 * @property {ObjectSpawner} objs The object spawner for this scene.
 * @property {SoundBank} sounds Plays sounds
 * @property {Object.<string, Phaser.Input.Keyboard.Key>} Key map to be used for gameplay events
 * @property {Object} timers An object that encapsulates all timing-related values for anything in the game.
 */

export class Game extends Scene {
    emitter = EventDispatcher.getInstance();
    bgScrollSpeed = 0;
    constructor() {
        super('Game');
    }

    init() {
        this.debugMode = false;
    }

    create() {
        this.level = this.registry.get('level');


        this.PUPA_PATHS = {
            LEMNISCATE: this.cache.json.get('PUPA_LEMNISCATE'),
            TRIANGLE: this.cache.json.get('PUPA_TRIANGLE'),
            SPLINE: this.cache.json.get('PUPA_SPLINE'),
            ILLUMINATI: this.cache.json.get('PUPA_ILLUMINATI'),
        }

        if (this.level <= 7) {
            start_dialogue(this.scene, `level${(this.level)}`, "story", "Game", 23);
        }

        this.visualobject = this.add.sprite(-100, -100, 'BGSmallObjects');
        this.visualobject.setVisible(false);
        let bgKey = `BG${this.level}`;
        if (this.level > 7)
            bgKey = 'BG5'; // Default to BG5 for levels above 7

        if (this.level === 3 || this.level === 5) {
            this.bg = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, bgKey).setOrigin(0, 0);
            this.bgScrollSpeed = 1;
        } else {
            this.bg = this.add.image(0, 0, bgKey).setOrigin(0, 0).setAlpha(1);
            this.bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);
        }

        if (this.level % 7 === 0) {
            this.bg = this.add.sprite(0, 0, 'BG7').setOrigin(0, 0);
            this.bg.play('BG7-SpriteSheet'); //can remove bg7 anim if annoying
            console.log("bg7 started")
        } else if ((this.level + 1) % 7 === 0) {
            this.bg = this.add.sprite(0, 0, 'BG6').setOrigin(0, 0);
            this.bg.play('BG6-SpriteSheet'); //can remove bg6 anim if annoying
        } else if (this.level > 7) {
            this.bg = this.add.tileSprite(0, 0, this.sys.game.config.width, this.sys.game.config.height, bgKey).setOrigin(0, 0);
            this.bgScrollSpeed = 1;
        }

        GridEnemy.initDestructionEmitter(this);

        this.initBackgroundObject();
        // Object spawner only needed during gameplay, so we initialize it in this scene.
        this.objs = new ObjectSpawner(this);
        this.powerup_stats = this.registry.get('powerup_stats');
        this.player_vars = this.registry.get('player_vars');
        this.player_stats = this.player_vars.stats;
        this.player_vars.power = "";

        const maxLevelReached = localStorage.getItem('maxLevelReached') || 1;
        if (this.level + 1 > maxLevelReached) {
            localStorage.setItem('maxLevelReached', this.level + 1);
        }
        
        this.objs.init_all();

        this.sounds = this.registry.get('sound_bank');
        this.keys = InitKeyDefs(this);

        this.keys.p.on('down', () => this.pause());
        this.keys.esc.on('down', () => this.pause());

        // Score and high score
        this.scoreManager = new ScoreManager(this);

        this.level = this.registry.get('level');
        this.level_transition_flag = false;
        this.level_text = this.add.bitmapText(0, 16, fonts.medium.fontName, `LEVEL:${this.level}`, fonts.medium.size)
            .setOrigin(1, 0)
            .setPosition(this.sys.game.config.width - 16, 16);


        this.pauseSprite = this.add.sprite(this.sys.game.config.width / 2, 32, 'pause')
            .setOrigin(0.5)
            .setScale(1.5)
            .setAlpha(0.75)
            .setInteractive()
            .on('pointerdown', () => {
                this.pause();
            })
            .setVisible(false);

        if (window.IS_MOBILE) {
            this.controls = new Controls(this);
            this.pauseSprite.setVisible(true); // only show pause btn on mobile
        }

        // Player lives text and sprites
        this.livesText = this.add.bitmapText(16, this.sys.game.config.height - 48, fonts.medium.fontName, '3', fonts.medium.size);
        this.livesSprites = this.add.group({
            key: 'lives',
            repeat: this.player_vars.lives - 2
        });

        let secs = Phaser.Math.Between(15, 60);
        console.log(`Spawning enemy USB in ${secs}s`)
        this.time.delayedCall(secs * 1000, this.objs.spawn_usb_enemy, [], this.scene);
        this.sounds.stop_all_music();
        this.sounds.bank.music.bg.play();

        init_collision_events(this, "Game");

        // Mute when m is pressed
        this.keys.m.on('down', this.sounds.toggle_mute);

        // Toggle debug mode when 'X' key is pressed
        this.keys.x.on('down', () => {
            this.toggleDebug();
        });

        // Event to kill all enemies
        this.emitter.on('kill_all_enemies', this.#kill_all_enemies, this);
        this.emitter.once('player_lose', this.goto_scene, this)

        this.physics.world.drawDebug = this.debugMode;
    }

    toggleDebug() {
        // only allow debug visuals if debug mode is turned oon
        if (this.registry.get('debug_mode') === true) {
            this.debugMode = !this.debugMode;
            this.physics.world.drawDebug = this.debugMode;
            // Clear debug graphics when debug mode is turned off
            if (!this.debugMode) {
                this.physics.world.debugGraphic.clear()
            }
        }
    }

    pause() {
        this.scene.pause('Game');
        this.scene.launch('PauseMenu', { prev_scene: 'Game' });
    }

    #kill_all_enemies() {
        // Loop through all enemies and destroy them
        if (this.objs) {
            this.objs.enemies.grid.children.each(enemy => {
                enemy.die();
                this.scoreManager.addMoney(enemy.moneyValue);
                this.scoreManager.addScore(Math.round(enemy.scoreValue * this.level));
            }, this);

            this.objs.enemies.special.children.each(enemy => {
                this.scoreManager.addMoney(enemy.moneyValue * enemy.hp);
                this.scoreManager.addScore(enemy.scoreValue * enemy.hp);
                enemy.hp = 1;
                enemy.die();
            }, this);
        }
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
        // console.log(`scene active: ${this.scene.isActive()}`);
        if (this.objs.player)
            this.objs.player.update(time, delta, this.keys, this.controls);
        // Update lives text and sprites
        this.livesText.setText(this.player_vars.lives);
        this.updateLivesSprites();
        this.objs.ai_grid_enemies(time);
        this.check_gameover();

        this.bg.tilePositionY -= this.bgScrollSpeed;

        if (this.visualobject.visible) {
            if (this.visualobject.x > this.sys.game.config.width + 100 ||
                this.visualobject.x < -100 ||
                this.visualobject.y < -100 ||
                this.visualobject.y > this.sys.game.config.height + 100) {
                this.visualobject.visible = false;
            }
        }
    }


    check_gameover() {
        if (this.player_vars.lives <= 0 &&
            !this.objs.player.is_inbounds()) {
            this.player_vars.power = "";
            this.gameover = true;
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.goto_scene("Player Lose");
        }

        if (this.objs.enemies.grid.children.entries.length == 0 &&
            !this.level_transition_flag) {
            // if this is a boss level
            if (this.level % 7 === 0) {
                if (!this.boss_spawned) {
                    this.boss_spawned = true;
                    const boss_hp = (40 * Math.floor(this.registry.get('level') / 7));
                    // spawn boss type based on different multiples of 7
                    if (this.level % 21 === 0)
                        this.add.enemy_pupa(this, 0, 0, boss_hp);
                    else if (this.level % 14 === 0)
                        this.add.enemy_lupa(this, this.game.config.width, 525, boss_hp);
                    else
                        this.add.enemy_reaper(this, 0, 0, boss_hp);
                    this.sounds.stop_all_music();
                    this.sounds.bank.music.boss.play();
                    start_dialogue(this.scene, "shermie_boss", "game_blocking", "Game");
                }

                // is boss dead?
                if (this.objs.enemies.special.children.entries.length === 0) {
                    this.objs.player.isInvincible = true;
                    this.goto_scene("Player Win");
                }
                return;
            }
            this.player_vars.active_bullets = 0;
            this.level_transition_flag = true;
            this.emitter.emit('force_dialogue_stop'); // ensure dialogue cleans up before scene transition
            this.player_vars.power = "";
            this.goto_scene("Player Win");
        }
    }

    goto_scene(targetScene) {
        this.emitter.off('kill_all_enemies');
        const cheatModeEnabled = this.registry.get('debug_mode') === true;
        if (!cheatModeEnabled) {
            this.scoreManager.checkAndUpdateHighScore();
        }

        this.cameras.main.fade(500, 0, 0, 0);

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.setVisible(false);
            this.sounds.stop_all_music();
            this.scene.start(targetScene);
        });
    }

    initBackgroundObject() {
        // Create the visual object once with basic setup
        this.visualobject = this.physics.add.sprite(850, 300, 'BGSmallObjects');
        this.visualobject.setDepth(0);
        this.visualobject.setVisible(false);
        this.visualobject.setAlpha(0.8);

        this.time.addEvent({
            delay: 16000,
            callback: () => {
                let objectKey = this.chooseObjectKey();
                if (!objectKey) {
                    this.visualobject.setVisible(false);
                    return;
                }
                let randomScale = 0.6 + (1.0 - 0.6) * Math.random();
                let randomY = Math.random() * 350;
                let direction = Math.random() < 0.5 ? -1 : 1;  // Random direction: -1 for left, 1 for right
                let yDirection = Math.random() < 0.5 ? 1 : -1; // Randomly decide Y direction

                this.visualobject.setScale(randomScale);
                this.visualobject.setPosition(direction === 1 ? -100 : this.sys.game.config.width + 100, randomY);
                this.visualobject.flipX = direction === 1;  // Flip horizontally if moving right
                this.visualobject.visible = true;
                this.visualobject.setVelocityX((4 + Math.random() * 3) * direction * 20);
                this.visualobject.setVelocityY(yDirection * (0.3 + Math.random()) * 20);

                if (this.anims.exists(objectKey)) {
                    this.visualobject.play(objectKey);
                } else {
                    console.error("Animation key not found:", objectKey);
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    chooseObjectKey() {
        switch (this.level) {
            case 1:
            case 2:
            case 3:
                return "Birds";
            case 4:
                return Math.random() < 0.5 ? "Ship" : "Meteor";
            case 5:
            case 6:
                return Math.random() < 0.7 ? "Ship" : "Minions";
            default:
                return null;
        }
    }
}