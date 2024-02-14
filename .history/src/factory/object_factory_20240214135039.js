import { Player } from "../objects/player";
import { Enemy } from "../objects/enemy";
import { Bullet } from "../objects/bullet";
import "../factory/object_factory";

/* All factory object defintions are responsible for handling object spawning. Put them in this file */

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
    "enemy",
    function (
        scene: Phaser.Scene,
        x: number,
        y: number
    ): Phaser.GameObjects.GameObject {
        let enemy = new Enemy(scene, x, y);
        enemy.setCollideWorldBounds(true);
        scene.add.existing(enemy);
        return enemy;
    }
);

Phaser.GameObjects.GameObjectFactory.register(
    "bullet",
    function (
        scene: Phaser.Scene,
        x: number,
        y: number
    ): Phaser.GameObjects.GameObject {
        let bullet = new Bullet(scene, x, y);
        scene.add.existing(bullet);
        bullet.setVisible(false);
        bullet.setActive(false);
        bullet.setAngle(-90);
        return bullet;
    }
);
