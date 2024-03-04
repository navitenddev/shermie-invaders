import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { PlayerWin } from './scenes/PlayerWin';
import { PlayerLose } from './scenes/PlayerLose';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { LevelSelect } from './scenes/LevelSelect';
import { HowToPlay } from './scenes/HowToPlay';
import { PauseMenu } from './scenes/PauseMenu';
import { StatsMenu } from './scenes/StatsMenu';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#ffffff',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: true,
        },
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        PlayerWin,
        PlayerLose,
        LevelSelect,
        HowToPlay,
        PauseMenu,
        StatsMenu,
    ]
};
export default new Phaser.Game(config);
