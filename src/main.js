import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { BossRush } from './scenes/BossRush';
import { BossRushLose } from './scenes/BossRushLose';
import { BossRushWin } from './scenes/BossRushWin';
import { PlayerWin } from './scenes/PlayerWin';
import { PlayerLose } from './scenes/PlayerLose';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { LevelSelect } from './scenes/LevelSelect';
import { HowToPlay } from './scenes/HowToPlay';
import { PauseMenu } from './scenes/PauseMenu';
import { StatsMenu } from './scenes/StatsMenu';
import { Store } from './scenes/Store';
import { Dialogue } from './scenes/Dialogue';
import { Sandbox } from './scenes/Sandbox';
import { TechTipTest } from './scenes/TechTipTest';
import { Barrier } from './objects/barrier';
import { start_dialogue } from './scenes/Dialogue';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { Credits } from './scenes/Credits';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: true,
        },
    },
    input: {
        activePointers: 3,
    },
    plugins: {
        global: [{
            key: 'rexVirtualJoystick',
            plugin: VirtualJoystickPlugin,
            start: true
        }]
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        BossRush,
        Sandbox,
        PlayerWin,
        PlayerLose,
        LevelSelect,
        HowToPlay,
        PauseMenu,
        StatsMenu,
        Store,
        TechTipTest,
        BossRushLose,
        BossRushWin,
        Credits,
        // Dialogue,
    ]
};

/**
 * 
 * @param {Phaser.Scene} scene 
 * @description Unfortunately, due to Josh's lack of understanding on how Phaser
 * scenes actually work, this function is now necessary to run before starting
 * dialogue in another scene, if another scene that uses dialogue is already
 * running (scenes run in the background!). Essentially, this is a foolproof way
 * to now avoid the elusive setSize() bug that occurs with the dialogues.
 * 
 * If any of this confuses you (and don't worry, it IS confusing as it's not
 * clear in the Phaser documentation either) and you have any errors  please
 * consult Josh.
 */
export function restart_scenes(scene) {
    scene.remove('Game');
    scene.add('Game', Game);
    scene.bringToTop('Game');

    scene.remove('Boss Rush');
    scene.add('Boss Rush', BossRush);
    scene.bringToTop('Boss Rush');

    scene.remove('PauseMenu');
    scene.add('PauseMenu', PauseMenu);
    scene.bringToTop('PauseMenu');

    scene.remove('StatsMenu');
    scene.add('StatsMenu', StatsMenu);
    scene.bringToTop('StatsMenu');

    scene.remove('Dialogue');
    scene.add('Dialogue', Dialogue);
    scene.bringToTop('Dialogue');

}
/**
 * @description Initializes all collision and overlap events. This function should be called after objects are initialized.
 * @param scene The scene to initialize the collision events to
 */
export function init_collision_events(scene, scene_key) {
    scene.physics.world.setBounds(0, 0, scene.sys.game.config.width, scene.sys.game.config.height);
    scene.level = scene.registry.get('level');
    // player bullet hits grid enemy
    scene.physics.add.overlap(scene.objs.bullets.player, scene.objs.enemies.grid, (player_bullet, enemy) => {
        scene.sounds.bank.sfx.explosion[3].play();
        if (scene.player_vars.power == "pierce" || scene.player_vars.perm_power.includes("pierce")) player_bullet.hurt_bullet();
        else player_bullet.deactivate();
        scene.objs.player.totalHits++;
        enemy.die();
        if (scene.scoreManager) {
            scene.scoreManager.addScore(Math.round(enemy.scoreValue * scene.level));
            scene.scoreManager.addMoney(enemy.moneyValue);
        }
    });

    // player bullet hits special enemy
    scene.physics.add.overlap(scene.objs.bullets.player, scene.objs.enemies.special, (player_bullet, enemy) => {
        scene.sounds.bank.sfx.explosion[3].play();
        scene.objs.player.totalHits++;
        player_bullet.deactivate();
        enemy.die();
        if (scene.scoreManager) {
            scene.scoreManager.addScore(Math.round(enemy.scoreValue * scene.level));
            scene.scoreManager.addMoney(enemy.moneyValue);
        }
    });

    // enemy bullet hits player
    scene.physics.add.overlap(scene.objs.bullets.enemy, scene.objs.player, (player, enemy_bullet) => {
        scene.cameras.main.shake(200, 0.02);
        if (!player.is_dead) {
            enemy_bullet.deactivate();
            let dialogue_key;
            if (player.stats.shield > 1) {
                player.shieldParticles.explode(10, player.x, scene.sys.game.config.height - 135);
                if (--player.stats.shield === 1) {
                    dialogue_key = 'shermie_shieldgone';
                    scene.sounds.bank.sfx.shield_destroy.play();
                } else {
                    dialogue_key = 'shermie_shieldhurt';
                    scene.sounds.bank.sfx.shield_hurt.play();
                }
                player.updateHitbox();
                start_dialogue(scene.scene, dialogue_key, "game", scene_key);
            } else {
                scene.objs.explode_at(player.x, player.y);
                player.die();
                dialogue_key = (scene.player_vars.lives === 0) ? "shermie_dead" : "shermie_hurt";

                if (scene.sandbox_mode)
                    scene.player_vars.lives = 3; // disable lives in sandbox mode
            }
            start_dialogue(scene.scene, dialogue_key, "game", scene_key);
        }
    });

    // player collides with powerup 
    scene.physics.add.overlap(scene.objs.powers, scene.objs.player, (player, powerup) => {
        scene.sounds.bank.sfx.powerup.play();
        player.changePower(powerup.buff);
        powerup.deactivate();
    });

    // enemy bullet collides with player bullet
    scene.physics.add.overlap(scene.objs.bullets.enemy, scene.objs.bullets.player, (enemy_bullet, player_bullet) => {
        if (player_bullet.active && enemy_bullet.active) {
            const bulletCollisionEmitter = scene.add.particles(0, 0, 'flares', {
                frame: ['white'],
                color: [0xFF3131],
                colorEase: 'quad.out',
                scale: { start: 0.2, end: 0, ease: 'exp.out' },
                alpha: { start: 1, end: .5, ease: 'exp.out' },
                lifespan: 500,
                speed: 350,
                gravityY: 1000,
                blendMode: 'COLOR',
                emitting: false
            });
            bulletCollisionEmitter.explode(10, player_bullet.x, player_bullet.y);

            if (scene.player_vars.power == "pierce" || scene.player_vars.perm_power.includes("pierce")) player_bullet.hurt_bullet();
            else player_bullet.deactivate();
            enemy_bullet.deactivate();
        }
    });

    // when grid enemy hits barrier, it eats it
    scene.physics.add.overlap(scene.objs.enemies.grid, scene.objs.barrier_chunks, (enemy, barr_chunk) => {
        // console.log(barr_chunk);
        barr_chunk.parent.update_flame_size();
        barr_chunk.destroy(); // OM NOM NOM
    });

    // when special enemy hits barrier, it eats it
    scene.physics.add.overlap(scene.objs.enemies.special, scene.objs.barrier_chunks, (enemy, barr_chunk) => {
        barr_chunk.parent.update_flame_size();
        barr_chunk.destroy(); // OM NOM NOM
    });


    // player bullet collides with barrier
    scene.physics.add.collider(scene.objs.bullets.player, scene.objs.barrier_chunks, (bullet, barr_chunk) => {
        Barrier.explode_at_bullet_hit(scene, bullet, barr_chunk, 15);
    });

    // enemy bullet collides with barrier
    scene.physics.add.collider(scene.objs.bullets.enemy, scene.objs.barrier_chunks, (bullet, barr_chunk) => {
        Barrier.explode_at_bullet_hit(scene, bullet, barr_chunk, 15);
    });
}

export default new Phaser.Game(config);
