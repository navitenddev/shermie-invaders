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
export function init_collision_events(scene) {
    scene.physics.world.setBounds(0, 0, scene.sys.game.config.width, scene.sys.game.config.height);
    scene.level = scene.registry.get('level');
    // player bullet hits grid enemy
    scene.physics.add.overlap(scene.objs.bullets.player, scene.objs.enemies.grid, (player_bullet, enemy) => {
        scene.objs.explode_at(enemy.x, enemy.y);
        if (scene.player_vars.power == "pierce") player_bullet.hurt_bullet();
        else player_bullet.deactivate();
        enemy.die();
        if (scene.scoreManager) {
            scene.scoreManager.addScore(Math.round(enemy.scoreValue * scene.level));
            scene.scoreManager.addMoney(enemy.moneyValue);
        }
    });

    // player bullet hits special enemy
    scene.physics.add.overlap(scene.objs.bullets.player, scene.objs.enemies.special, (player_bullet, enemy) => {
        scene.objs.explode_at(enemy.x, enemy.y);
        player_bullet.deactivate();
        enemy.die();
        if (scene.scoreManager) {
            scene.scoreManager.addScore(Math.round(enemy.scoreValue * scene.level));
            scene.scoreManager.addMoney(enemy.moneyValue);
        }
    });

    // enemy bullet hits player
    scene.physics.add.overlap(scene.objs.bullets.enemy, scene.objs.player, (player, enemy_bullet) => {
        if (!player.is_dead) {
            enemy_bullet.deactivate();
            if (player.stats.shield > 1) {
                player.shieldParticles.explode(10, player.x, scene.sys.game.config.height - 135);
                const dialogue_key = (--player.stats.shield === 1) ? 'shermie_shieldgone' : 'shermie_shieldhurt';
                start_dialogue(scene.scene, dialogue_key, "game");
                player.updateHitbox();
            } else {
                scene.objs.explode_at(player.x, player.y);
                player.die();
                if (scene.sandbox_mode)
                    scene.player_vars.lives = 3; // disable lives in sandbox mode
                (scene.player_vars.lives === 0) ?
                    start_dialogue(scene.scene, 'shermie_dead', "game") :
                    start_dialogue(scene.scene, 'shermie_hurt', "game");
            }
        }
    });

    // player collides with powerup 
    scene.physics.add.overlap(scene.objs.powers, scene.objs.player, (player, powerup) => {
        player.changePower(powerup.buff);
        powerup.deactivate();
    });

    // enemy bullet collides with player bullet
    scene.physics.add.overlap(scene.objs.bullets.enemy, scene.objs.bullets.player, (enemy_bullet, player_bullet) => {
        if (player_bullet.active && enemy_bullet.active) {
            scene.objs.explode_at(player_bullet.x, player_bullet.y);
            player_bullet.deactivate();
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
