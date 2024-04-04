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
import { Store } from './scenes/Store';
import { Dialogue } from './scenes/Dialogue';
import { Sandbox } from './scenes/Sandbox';
import { TechTipTest } from './scenes/TechTipTest';


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
        Sandbox,
        PlayerWin,
        PlayerLose,
        LevelSelect,
        HowToPlay,
        PauseMenu,
        StatsMenu,
        Store,
        TechTipTest,
        // Dialogue,
    ]
};

/**
 * 
 * @param {Phaser.Scene} scene 
 * @description Unfortunately, due to Josh's lack of understanding on how Phaser
 * scenes actually work, this function is now necessary to run before starting
 * dialogue in another scene, if another scene that uses dialogue is already
 * running (scenes run in the background!). Essentially, this is a foolproof way
 * to now avoid the elusive setSize() bug that occurs with the dialogues.
 * 
 * If any of this confuses you (and don't worry, it IS confusing as it's not
 * clear in the Phaser documentation either) and you have any errors  please
 * consult Josh.
 */
export function restart_scenes(scene) {
    scene.remove('Game');
    scene.add('Game', Game);
    scene.bringToTop('Game');

    scene.remove('PauseMenu');
    scene.add('PauseMenu', PauseMenu);
    scene.bringToTop('PauseMenu');

    scene.remove('StatsMenu');
    scene.add('StatsMenu', StatsMenu);
    scene.bringToTop('StatsMenu');

    scene.remove('Dialogue');
    scene.add('Dialogue', Dialogue);
    scene.bringToTop('Dialogue');

}

export default new Phaser.Game(config);
