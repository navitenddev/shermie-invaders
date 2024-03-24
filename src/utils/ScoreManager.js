import { fonts } from './fontStyle.js';

/**
 * @classdesc Manages the score (go figure) but also the money that shermie earns
 */
export default class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.player_vars = this.scene.registry.get('player_vars');
        this.score = this.player_vars.score;
        this.highScore = this.loadHighScore();
        this.initText();
        this.scene.add.image(36, 97, "shermie_bux") // shermie coin image
            .setScale(0.24, 0.24);
    }

    initText() {
        this.highScoreText = this.scene.add.text(16, 16, `HI-SCORE:${this.highScore}`, fonts.small);

        this.scoreText = this.scene.add.text(16, 40, `SCORE:${this.score}`, fonts.medium);

        this.walletText = this.scene.add.text(64, 80, `${this.player_vars.wallet}`, fonts.medium);
    }

    addScore(points) {
        this.player_vars.score += points;
        this.scoreText.setText(`SCORE:${this.player_vars.score}`);
    }

    addMoney(amount) {
        this.player_vars.wallet += amount;
        this.walletText.setText(`${this.player_vars.wallet}`);
    }

    updateHighScore() {
        if (this.player_vars.score > this.highScore) {
            this.highScore = this.player_vars.score;
            localStorage.setItem('highScore', this.highScore.toString());
            this.updateHighScoreDisplay();
        }
    }

    updateHighScoreDisplay() {
        this.highScoreText.setText(`HI-SCORE:${this.highScore}`);
    }

    loadHighScore() {
        const savedHighScore = localStorage.getItem('highScore');
        return savedHighScore ? parseInt(savedHighScore, 10) : 0;
    }

    resetScore() {
        this.player_vars.score = 0;
        this.updateScoreDisplay();
    }
}