import { Player } from "../objects/player";
import { Enemy1, Enemy2, Enemy3 } from "../objects/enemy";
import { PlayerBullet, EnemyBullet } from "../objects/bullet";
import { Explosion } from "../objects/explosions"
import "../factory/object_factory";

/* All factory object defintions are responsible for handling object spawning. Put them in this file */


console.log("Loading Phaser Factories...")

Phaser.GameObjects.GameObjectFactory.register(
    "player",
    function (scene, x, y) {
        let player = new Player(scene, x, y);
        player.setCollideWorldBounds(true);
        scene.add.existing(player);
        return player;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_top",
    function (scene, x, y) {
        let enemy = new Enemy1(scene, x, y);
        scene.add.existing(enemy);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_middle",
    function (scene, x, y) {
        let enemy = new Enemy2(scene, x, y);
        scene.add.existing(enemy);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_l1_bottom",
    function (scene, x, y) {
        let enemy = new Enemy3(scene, x, y);
        scene.add.existing(enemy);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "player_bullet",
    function (scene, x, y) {
        let player_bullet = new PlayerBullet(scene, x, y);
        scene.add.existing(player_bullet);
        player_bullet.setTexture("cottonball");
        player_bullet.setVisible(false);
        player_bullet.setActive(false);
        player_bullet.body.onOverlap = true;
        return player_bullet;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "enemy_bullet",
    function (scene, x, y) {
        let enemy_bullet = new EnemyBullet(scene, x, y);
        scene.add.existing(enemy_bullet);
        enemy_bullet.play("bullet");
        enemy_bullet.setVisible(false);
        enemy_bullet.setActive(false);
        enemy_bullet.setAngle(90);
        enemy_bullet.body.onOverlap = true;
        return enemy_bullet;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "explosion",
    function (scene) {
        let explosion = new Explosion(scene);
        explosion.setVisible(false);
        explosion.setActive(false);
        scene.add.existing(explosion);
        return explosion;
    }
);