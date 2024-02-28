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
        let enemy = new Enemy1(scene, x, y);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_middle",
    function (scene, x, y) {
        let enemy = new Enemy2(scene, x, y);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_bottom",
    function (scene, x, y) {
        let enemy = new Enemy3(scene, x, y);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_bullet",
    function (scene, x, y) {
        let enemy_bullet = new EnemyBullet(scene, x, y);
        return enemy_bullet;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "explosion",
    function (scene) {
        let explosion = new Explosion(scene);
        return explosion;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "player",
    function (scene, x, y) {
        let player = new Player(scene, x, y);
        return player;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "player_bullet",
    function (scene) {
        let player_bullet = new PlayerBullet(scene);
        return player_bullet;
    }
);