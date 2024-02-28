import { fontStyle } from './fontStyle.js';

export default class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.initScoreText();
        this.initHighScoreText();
    }

    initScoreText() {
        this.scoreText = this.scene.add.text(16, 16, 'SCORE:0', fontStyle);
    }

    initHighScoreText() {
        this.highScoreText = this.scene.add.text(620, 16, `HI-SCORE:${this.highScore}`, fontStyle);
    }

    addScore(points) {
        this.score += points;
        this.updateScoreDisplay();
    }

    updateScoreDisplay() {
        this.scoreText.setText(`SCORE:${this.score}`);
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