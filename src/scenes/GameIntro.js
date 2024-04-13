import { Scene } from "phaser";
import { start_dialogue } from "./Dialogue";

export class GameIntro extends Scene {
  constructor() {
    super("GameIntro");
  }

  create() {
    this.add.image(512, 384, "BG1");

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.spawnShermie();

    // wait for shermie to finish walking
    this.time.delayedCall(3500, () => {
      start_dialogue(this.scene, "level1", "game_blocking", "GameIntro");
      this.spawnEnemies();
    });

    
  }

  spawnShermie() {
    // Create Shermie sprite
    this.shermie = this.add.sprite(
      -100,
      this.game.config.height - 96,
      "shermie_spritesheet"
    );

    // Play the walking animation
    this.shermie.play("shermie_walk");

    // Move Shermie to the middle of the scene
    this.tweens.add({
      targets: this.shermie,
      x: this.game.config.width / 2.5,
      duration: 3000,
      ease: "Linear",
      onComplete: () => {
        // Play the idle animation when Shermie reaches the middle
        this.shermie.play("shermie_idle");
      },
    });
  }

  spawnEnemies() {
    this.enemies = this.add.group();
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 12; j++) {
        let enemyKey;
        if (i === 0 || i === 1) {
          enemyKey = "enemy1_idle";
        } else if (i === 2 || i === 3) {
          enemyKey = "enemy2_idle";
        } else {
          enemyKey = "enemy3_idle";
        }
        const enemy = this.add.sprite(
          j * 67 + 80,
          -255 - i * 51,
          "enemy_spritesheet",
          0
        );
        enemy.play(enemyKey);
        this.enemies.add(enemy);
      }
    }

    this.tweens.add({
      targets: this.enemies.getChildren(),
      y: "+= 600",
      duration: 2000,
      ease: "Power2",
      onComplete: () => {
        this.scene.start("Game");
      },
    });
  }
}
