import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.
        this.load.setPath("assets");

        this.load.image("bg_navitend", "backgrounds/bg_navitend.png");
        this.load.svg('animatedbg', 'ui/animatedbg.svg');
        this.load.image('titlelogo', 'ui/SHERMIE INVADERS.png');
        this.load.image('levelSelectlogo', 'ui/Level_Select.png');
        this.load.image('howToPlayLogo', 'ui/How_to_play.png');
    }

    create() {
        this.scene.start('Preloader');
    }
}
