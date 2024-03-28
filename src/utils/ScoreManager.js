import { bitmapFonts, fonts } from './fontStyle.js';

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
        this.scene.add.image(36, 89, "shermie_bux") // shermie coin image
            .setScale(0.24, 0.24);
    }

    initText() {
        this.highScoreText = this.scene.add.bitmapText(16, 16, bitmapFonts.PressStart2P_Stroke, `HI-SCORE:${this.highScore}`, fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]);

        this.scoreText = this.scene.add.bitmapText(16, 40, bitmapFonts.PressStart2P_Stroke, `SCORE:${this.score}`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);

        this.walletText = this.scene.add.bitmapText(64, 76, bitmapFonts.PressStart2P_Stroke, `${this.player_vars.wallet}`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);
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