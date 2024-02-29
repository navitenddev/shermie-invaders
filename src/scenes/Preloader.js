import { Scene } from 'phaser';
import { SoundBank } from '../sounds';
import { AnimationFactory } from '../factory/animation_factory';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, "bg_navitend");

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0x000000);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0x000000);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });
    }
    /* preload all your assets here! */
    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "logo.png");

        this.load.image("background", "leveloneBG.png");

        this.load.image("losescreen", "losescreen.png");

        this.load.image("cottonball", "cottonball.png");

        this.load.image("lives", "lives.png");

        //this.load.audio(['bgmusic','shoot','explosion'], ['SFX/spacebg.wav','SFX/shoot.wav', 'SFX/explosion.wav']);

        this.load.audio('bgmusic', 'SFX/bgmusic.mp3');

        this.load.audio('explosion', ['SFX/explosion.wav']);

        this.load.audio('explosion2', ['SFX/explode2.wav']);

        this.load.audio('explosion3', ['SFX/explode3.wav']);

        this.load.audio('reload', ['SFX/reload.wav']);

        this.load.audio('hurt', ['SFX/hurt.wav']);

        this.load.audio('shoot', ['SFX/shoot.wav']);

        this.load.audio('win', ['SFX/win.wav']);

        this.load.audio('lose', ['SFX/defeat.wav']);

        this.load.spritesheet("necromancer", "necromancer.png", {
            frameWidth: 160,
            frameHeight: 128,
        });

        this.load.spritesheet("bullet", "bullet-shoot.png", {
            frameWidth: 32,
            frameHeight: 16,
        });

        this.load.spritesheet("cottonBullet", "cottonBullet.png", {
            frameWidth: 14,
            frameHeight: 32,
        });

        this.load.spritesheet("usb", "USB.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("usb_explode", "USB.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("enemy_l1_top", "enemy_l1_lock.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.spritesheet("enemy_l1_bottom", "enemy_l1_virus.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.spritesheet("enemy_l1_middle", "enemy_l1_worm.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.spritesheet("shermie", "shermie.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.spritesheet("cottonball_explosion_sheet", "cottonball_explode.png", {
            frameWidth: 32,
            frameHeight: 32,
        });
    }
    create() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        this.anim_factory = new AnimationFactory(this);

        this.sound_bank = new SoundBank(this);
        // we can access sound_bank from another scene with:
        // sound_bank = this.scene.get('Preloader').sound_bank;

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
