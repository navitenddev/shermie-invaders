import { Player } from "../objects/player";
import { Enemy1, Enemy2, Enemy3 } from "../objects/enemy";
import { EnemyReaper } from "../objects/enemy_reaper";
import { EnemyLupa } from "../objects/enemy_lupa";
import { EnemyPupa } from "../objects/enemy_pupa";
import { EnemyZupa } from "../objects/enemy_zupa";
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
    function (scene, x, y, width, height, fill_color) {
        return new BarrierChunk(scene, x, y, width, height, fill_color);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_top",
    function (scene, x, y) {
        return new Enemy1(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_middle",
    function (scene, x, y) {
        return new Enemy2(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_bottom",
    function (scene, x, y) {
        return new Enemy3(scene, x, y);
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
    function (scene, x, y) {
        return new EnemyLupa(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_pupa",
    function (scene, x, y) {
        return new EnemyPupa(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_zupa",
    function (scene, x, y) {
        return new EnemyZupa(scene, x, y);
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
        let temp=this.scene.powerup_stats.power_bank[Phaser.Math.Between(0, this.scene.powerup_stats.power_bank.length-1 )];
        console.log(temp);
        return new Powerups(scene,temp);
    }
);