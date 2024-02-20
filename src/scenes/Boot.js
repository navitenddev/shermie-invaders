import { Scene } from 'phaser';

export class Boot extends Scene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        // this.load.image('background', 'assets/bg.png');
        this.load.svg('animatedbg', '/assets/logos/animatedbg.svg');
        this.load.image('titlelogo', '/assets/logos/SHERMIE INVADERS.png');
        this.load.image('levelSelectlogo', '/assets/logos/Level_Select.png');
        this.load.image('howToPlayLogo', '/assets/How_to_play.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
