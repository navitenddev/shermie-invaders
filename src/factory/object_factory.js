import { Player } from "../objects/player";
import { Enemy1, Enemy2, Enemy3 } from "../objects/enemy";
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
    function (scene, x, y) {
        return new EnemyUSB(scene, x, y);
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