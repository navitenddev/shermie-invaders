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
    "enemy1",
    function (scene, x, y) {
        return new Enemy1(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy2",
    function (scene, x, y) {
        return new Enemy2(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy3",
    function (scene, x, y) {
        return new Enemy3(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy4",
    function (scene, x, y) {
        return new Enemy4(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy5",
    function (scene, x, y) {
        return new Enemy5(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy6",
    function (scene, x, y) {
        return new Enemy6(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy7",
    function (scene, x, y) {
        return new Enemy7(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy8",
    function (scene, x, y) {
        return new Enemy8(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy9",
    function (scene, x, y) {
        return new Enemy9(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy10",
    function (scene, x, y) {
        return new Enemy10(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy11",
    function (scene, x, y) {
        return new Enemy11(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy12",
    function (scene, x, y) {
        return new Enemy12(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy13",
    function (scene, x, y) {
        return new Enemy13(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy14",
    function (scene, x, y) {
        return new Enemy14(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy15",
    function (scene, x, y) {
        return new Enemy15(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy16",
    function (scene, x, y) {
        return new Enemy16(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy17",
    function (scene, x, y) {
        return new Enemy17(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy18",
    function (scene, x, y) {
        return new Enemy18(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy19",
    function (scene, x, y) {
        return new Enemy19(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy20",
    function (scene, x, y) {
        return new Enemy20(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy21",
    function (scene, x, y) {
        return new Enemy21(scene, x, y);
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy22",
    function (scene, x, y) {
        return new Enemy22(scene, x, y);
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