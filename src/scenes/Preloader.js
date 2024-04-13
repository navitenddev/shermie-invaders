import { Scene } from 'phaser';
import { SoundBank } from '../utils/sounds';
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

        this.text = this.add.text(
            this.game.config.width / 2, this.game.config.height / 2,
            "Loading...", {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'left',
            wordWrap: {
                width: this.sys.game.config.width - 200,
                useAdvancedWrap: true
            }
        });

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0x000000);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on("progress", (progress) => {
            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + 460 * progress;
        });

        this.load.on('fileprogress', (file) => {
            var output = `Loading asset: ${file.key}`;
            this.text
                .setText(output)
                .setPosition((this.game.config.width / 2) - (this.text.width / 2),
                    420);
            console.log(output);
        });
    }
    /* preload all your assets here! */
    preload() {

        //  Load the assets for the game - Replace with your own assets
        this.load.setPath("assets");

        this.load.image("logo", "ui/logo.png");

        this.load.image('titlelogo', 'ui/logo_main.png');

        this.load.image("background", "backgrounds/leveloneBG.png");

        this.load.image("BG1", "backgrounds/BG1.png");

        this.load.image("BG2", "backgrounds/BG2.png");

        this.load.image("BG3", "backgrounds/BG3.png");

        this.load.image("BG4", "backgrounds/BG4.png");

        this.load.image("BG5", "backgrounds/BG5.png");

        this.load.image("BG6", "backgrounds/BG6.png");

        this.load.image("BG7", "backgrounds/BG7.png");

        this.load.image("upgradeTilemap", "backgrounds/leveloneTilemap.png");

        // this.load.image("losescreen", "backgrounds/losescreen.png");

        this.load.image("cottonball", "projectiles/cottonball.png");

        this.load.image("lives", "ui/lives.png");

        this.load.image("shields", "ui/shields.png");

        this.load.image("placeholder", "placeholder.png");

        this.load.image("shermie_bux", "ui/coin.png")

        this.load.image("reaper_icon", "characters/Nexus-icon.png");

        this.load.image("usb_icon", "characters/USB-icon.png");

        this.load.image("lupa_icon", "characters/lupa-icon.png");

        this.load.image("pupa_icon", "characters/pupa-icon.png");

        this.load.image("zupa_icon", "characters/zupa-icon.png");

        this.load.image("nuke_icon", "ui/nuke-icon.png");

        this.load.image("firewall_icon", "ui/firewall-icon.png");

        this.load.image("brick_tileset", "misc/brick-tileset.png");

        // process tilemap after load is complete
        this.load.on('complete', () => {
            const brick_tiles = this.textures.get('brick_tileset');
            const base = brick_tiles.get();
            Phaser.Textures.Parsers.SpriteSheet(brick_tiles, base.sourceIndex, base.x, base.y, base.width, base.height, {
                frameWidth: 5,
                frameHeight: 5
            });
        })

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

        this.load.audio('start', ['SFX/start_screen.mp3']);

        this.load.audio('click', ['SFX/click.wav']);

        this.load.audio('hover', ['SFX/hover.wav']);

        this.load.audio('story_music', 'SFX/8 Bit Presentation - David Fesliyan.mp3');

        this.load.audio('story_music', 'SFX/8 Bit Presentation - David Fesliyan.mp3');

        this.load.audio('shop_music', 'SFX/Retro Forest - David Fesliyan.mp3');

        this.load.audio('boss_music', 'SFX/Retro Platforming - David Fesliyan.mp3');

        this.load.audio('boss_rush_music', 'SFX/Epic Boss Battle (Dark Action Music) - Rafael Krux.m4a');

        this.load.audio('champion_music', 'SFX/Youre The Champion - MaxKoMusic.mp3');

        this.load.audio('sandbox_music', 'SFX/8 Bit Adventure - David Fesliyan.mp3');

        // this.load.spritesheet("necromancer", "characters/necromancer.png", {
        //     frameWidth: 160,
        //     frameHeight: 128,
        // });

        // this.load.spritesheet("bullet", "projectiles/bullet-shoot.png", {
        //     frameWidth: 32,
        //     frameHeight: 16,
        // });

        this.load.spritesheet("bullet", "projectiles/bullet-laser.png", {
            frameWidth: 32,
            frameHeight: 16,
        });


        this.load.spritesheet("cottonBullet", "projectiles/cottonBullet.png", {
            frameWidth: 14,
            frameHeight: 32,
        });

        this.load.spritesheet("spreadshot_icon", "projectiles/spreadshot.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("pierceshot_icon", "projectiles/Wool-Rocket.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("usb", "characters/USB.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("usb_explode", "characters/USB.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        for (let i = 1; i <= 22; i++) {
            this.load.spritesheet(`enemy${i}`, `characters/enemies/enemyspritesheet.png`, {
                frameWidth: 39,
                frameHeight: 39,
            });
        }

        this.load.image('enemy_icon', 'characters/enemies/enemy-icon.png');

        this.load.spritesheet("shermie", "characters/shermie.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.spritesheet("Shermie-runshoot", "characters/Shermie-runshoot.png", {
            frameWidth: 80,
            frameHeight: 80,
        });

        this.load.spritesheet("cottonball_explosion_sheet", "projectiles/cottonball_explode.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("enemy_reaper", "characters/Nexus.png", {
            frameWidth: 128,
            frameHeight: 128,
        });

        this.load.spritesheet("enemy_lupa", "characters/lupa.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.spritesheet("enemy_pupa", "characters/pupa.png", {
            frameWidth: 64,
            frameHeight: 64,
        });

        this.load.spritesheet("placeholder_anim", "placeholder.png", {
            frameWidth: 32,
            frameHeight: 32,
        });

        this.load.spritesheet("shermie_bg", "misc/shermie_bg.png", {
            frameWidth: 60,
            frameHeight: 60,
        });
        this.load.spritesheet("Dialouge-SpriteSheet", "backgrounds/Dialouge-SpriteSheet.png", {
            frameWidth: 1024,
            frameHeight: 768,
        });
        this.load.spritesheet("BG6-SpriteSheet", "backgrounds/BG6-SpriteSheet.png", {
            frameWidth: 1024,
            frameHeight: 768,
        });
        this.load.spritesheet("BG7-SpriteSheet", "backgrounds/BG7-SpriteSheet.png", {
            frameWidth: 1024,
            frameHeight: 768,
        });
        this.load.spritesheet("BGSmallObjects", "backgrounds/backgroundobjects-Sheet.png", {
            frameWidth: 64,
            frameHeight: 64,
        });
        this.load.spritesheet("BGLargeObjects", "backgrounds/clouds-Sheet.png", {
            frameWidth: 200,
            frameHeight: 100,
        });

        this.load.atlas('flares', 'particles/flares.png', 'particles/flares.json');

        this.load.image('pause', 'controls/pause.png');
        this.load.image('controls', 'controls/controls.png');
        this.load.bitmapFont('PressStart2P-Large', 'fonts/PressStart2P-Large.png', 'fonts/PressStart2P-Large.xml');
        this.load.bitmapFont('PressStart2P-Medium', 'fonts/PressStart2P-Medium.png', 'fonts/PressStart2P-Medium.xml');
        this.load.bitmapFont('PressStart2P-Middle', 'fonts/PressStart2P-Middle.png', 'fonts/PressStart2P-Middle.xml');
        this.load.bitmapFont('PressStart2P-Small', 'fonts/PressStart2P-Small.png', 'fonts/PressStart2P-Small.xml');
        this.load.bitmapFont('PressStart2P-Tiny', 'fonts/PressStart2P-Tiny.png', 'fonts/PressStart2P-Tiny.xml');

        
        this.load.json({
            key: "PUPA_LEMNISCATE",
            url: "paths/pupa.json",
            dataKey: "LEMNISCATE",
        });
        this.load.json({
            key: "PUPA_TRIANGLE",
            url: "paths/pupa.json",
            dataKey: "TRIANGLE",
        });
        this.load.json({
            key: "PUPA_SPLINE",
            url: "paths/pupa.json",
            dataKey: "SPLINE1",
        });
        this.load.json({
            key: "PUPA_ILLUMINATI",
            url: "paths/pupa.json",
            dataKey: "ILLUMINATI",
        });
    }
    create() {
        //  When all the assets have loaded, it's often worth creating global
        //  objects here that the rest of the game can use.  For example, yo
        //  can define global animations here, so we can use them in other
        //  scenes.
        this.anim_factory = new AnimationFactory(this);
        this.registry.set('powerup_stats', {
            power_bank: ['spread', 'pierce'],// list of powerups
            active_powerups: 0, // active # of powerups on field
        })
        this.registry.set('level', 1);
        this.registry.set('score', 0);
        this.registry.set('sound_bank', new SoundBank(this));
        this.registry.set('debug_mode', false);
        this.registry.set('sandbox_mode', false);
        this.sounds = this.registry.get('sound_bank');
        this.registry.set('player_vars', {
            lives: 3,
            /* Player stats/upgrades: These will need a maximum (maybe like 10 or so)
             * so that the player can't get infinite upgrades.
             */
            stats: {
                bullet_speed: 1,
                fire_rate: 1,
                move_speed: 1,
                shield: 1,
                // ...more to be added
            },
            wallet: 0, // holds shermie bux
            active_bullets: 0, // the number of bullets that the player currently has on screen
            score: 0, // player score
            power: "", //powerup
            perm_power: [], //powerup
        });
        //  Move to the MainMenu. You could also swap this for a Scene
        //  Transition, such as a camera fade.
        this.scene.start('Main Menu');
    }
}
