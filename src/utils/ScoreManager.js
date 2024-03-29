import { bitmapFonts, fonts } from './fontStyle.js';

/**
 * @classdesc Manages the score (go figure) but also the money that shermie earns
 */
export default class ScoreManager {
    constructor(scene) {
        this.scene = scene;
        this.player_vars = this.scene.registry.get('player_vars');
        this.highScore = this.loadHighScore();
        this.initText();
        this.scene.add.image(36, 89, "shermie_bux") // shermie coin image
            .setScale(0.24, 0.24);
    }

    initText() {
        this.highScoreText = this.scene.add.bitmapText(16, 16, bitmapFonts.PressStart2P_Stroke, `HI-SCORE:${this.highScore}`, fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]);
        this.scoreText = this.scene.add.bitmapText(16, 40, bitmapFonts.PressStart2P_Stroke, `SCORE:${this.player_vars.score}`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);
        this.walletText = this.scene.add.bitmapText(64, 76, bitmapFonts.PressStart2P_Stroke, `${this.player_vars.wallet}`, fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]);
    }

    addScore(points) {
        this.player_vars.score += points;
        this.scoreText.setText(`SCORE:${this.player_vars.score}`);
        this.checkAndUpdateHighScore();
    }

    addMoney(amount) {
        this.player_vars.wallet += amount;
        this.walletText.setText(`${this.player_vars.wallet}`);
    }

    checkAndUpdateHighScore() {
        const cheatModeEnabled = this.scene.registry.get('debug_mode') === true;
        if (!cheatModeEnabled && this.player_vars.score > this.highScore) {
            this.highScore = this.player_vars.score;
            this.highScoreText.setText(`HI-SCORE:${this.highScore}`);
            localStorage.setItem('highScore', this.highScore.toString());
        }
    }
    
    loadHighScore() {
        const savedHighScore = localStorage.getItem('highScore');
        return savedHighScore ? parseInt(savedHighScore, 10) : 0;
    }
}