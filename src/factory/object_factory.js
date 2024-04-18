import { Player } from "../objects/player";
import { GridEnemy } from "../objects/enemy_grid";
import { EnemyReaper } from "../objects/enemy_reaper";
import { EnemyLupa } from "../objects/enemy_lupa";
import { EnemyPupa } from "../objects/enemy_pupa";
import { EnemyUSB } from "../objects/enemy_usb";
import { PlayerBullet, EnemyBullet, PlayerBulletConstDefs, EnemyBulletConstDefs } from "../objects/bullet";
import { Explosion } from "../objects/explosions"
import { BarrierChunk } from "../objects/barrier";
import { Powerups, PowerupsConstDefs } from "../objects/powerup";
import "../factory/object_factory";

/* All factory object defintions are responsible for handling object spawning. 
 *
 * Put them in this file.
 */


console.log("Loading Phaser Factories...")

Phaser.GameObjects.GameObjectFactory.register(
    "barrier_chunk",
    function (scene, x, y, key, health) {
        return new BarrierChunk(scene, x, y, key, health);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "grid_enemy",
    function (scene, x, y, anim_key, score_val = 0, money_val = 0) {
        return new GridEnemy(scene, x, y, anim_key, score_val, money_val);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_usb",
    function (scene, spawn_right) {
        return new EnemyUSB(scene, spawn_right);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_reaper",
    function (scene, x, y, hp, shoot_cd, should_clone, score_value, money_value) {
        return new EnemyReaper(scene, x, y, hp, shoot_cd, should_clone, score_value, money_value);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_lupa",
    function (scene, x, y, hp = 40) {
        return new EnemyLupa(scene, x, y, hp);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_pupa",
    function (scene, x, y, hp = 40) {
        return new EnemyPupa(scene, x, y, hp);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_bullet",
    function (scene, x, y) {
        return new EnemyBullet(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "explosion",
    function (scene) {
        return new Explosion(scene);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "player",
    function (scene, x, y) {
        return new Player(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "player_bullet",
    function (scene) {
        return new PlayerBullet(scene);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "powerup",
    function (scene) {
        return new Powerups(scene, "spread");
    }
);