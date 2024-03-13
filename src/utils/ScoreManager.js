import { fonts } from './fontStyle.js';

/**
 * @classdesc Manages the score (go figure) but also the money that shermie earns
 */
export default class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = this.scene.registry.get('score');
        this.player_vars = this.scene.registry.get('player_vars');
        this.highScore = this.loadHighScore();
        this.initText();
    }

    initText() {
        this.scoreText = this.scene.add.text(16, 16, `SCORE:${this.score}`, fonts.medium);
        this.highScoreText = this.scene.add.text(620, 16, `HI-SCORE:${this.highScore}`, fonts.medium);
        this.walletText = this.scene.add.text(16, 52, `BUX:${this.player_vars.wallet}`, fonts.medium);
    }

    addScore(points) {
        this.score += points;
        this.scoreText.setText(`SCORE:${this.score}`);
    }

    addMoney(amount) {
        this.player_vars.wallet += amount;
        this.walletText.setText(`BUX:${this.player_vars.wallet}`);
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
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
        this.score = 0;
        this.updateScoreDisplay();
    }
}