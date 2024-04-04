/* Define all sounds here */

/**
 * @classdesc An object that encapsulates any sounds that will be played throughout the game. 
 * 
 * It will also handle muting, and changing volume (if we implement it).
 * 
 * The sound bank is initialized in `Preload.js` and is a singleton (but not implemented as one) so DO NOT initialize this anywhere else. Otherwise methods like `toggle_mute()` will lose its effect upon scene transitions.
 * 
 * @property {Phaser.Scene} scene The scene that the sounds will play on.
 * @property {Object<string, Phaser.Types.Sound>} bank.sfx The sound bank that contains all sound effects.
 * @property {Object<string, Phaser.Types.Sound>} bank.music The sound bank that contains all music.
 * @example // To access the soundbank in `Preloader.js` from another file:
 * scene.get('Preloader').sound_bank;
 * @example // To play the win sound:
 * let sounds = scene.get('Preloader').sound_bank;
 * sounds.bank.sfx.win.play();
 */
class SoundBank {
    constructor(scene) {
        this.scene = scene;
        this.bank = {
            sfx: {
                win: null,
                lose: null,
                shoot: null,
                explosion: [],
                hurt: null,
                click: null,
                reload: null,
            },
            music: {
                bg: null,
                start: null,
                ff7_fighting: null,
            }
        }
        this.init_sounds();
        this.load_mute_preference();
    }
    /** 
     * @private
     * Initializes all sounds to be used by the `scene` provided in the constructor.
     * See the `@classdesc` to learn how to access the sound bank from another scene.
     */
    init_sounds() {
        this.bank = {
            sfx: {
                shoot: this.scene.game.sound.add('shoot', { volume: 0.1, loop: false }),
                explosion: [
                    this.scene.game.sound.add('explosion', { volume: 0.1, loop: false }),
                    this.scene.game.sound.add('explosion2', { volume: 0.1, loop: false }),
                    this.scene.game.sound.add('explosion3', { volume: 0.1, loop: false })
                ],
                reload: this.scene.game.sound.add('reload', { volume: 0.1, loop: false }),
                hurt: this.scene.game.sound.add('hurt', { volume: 0.3, loop: false }),
                win: this.scene.game.sound.add('win', { volume: 0.1, loop: false }),
                lose: this.scene.game.sound.add('lose', { volume: 0.1, loop: false }),
                click: this.scene.game.sound.add('click', { volume: 0.1, loop: false })
            },
            music: {
                bg: this.scene.game.sound.add('bgmusic', { volume: 0.2, loop: true }),
                start: this.scene.game.sound.add('start', { volume: 0.1, loop: true }),
                ff7_fighting: this.scene.game.sound.add('ff7_fighting', { volume: 0.1, loop: true })
            }
        }
    }

    /** 
     * @public
     * @description Mutes all sounds for the `scene` provided in the constructor. It's worth noting that this will only mute sounds for one scene, unless they all share the same sound bank, hence why they should share the same `SoundBank`.
     */
    toggle_mute = () => {
        this.scene.game.sound.mute = !this.scene.game.sound.mute;
        localStorage.setItem('mute', this.scene.game.sound.mute);
    }
    
    load_mute_preference() {
        const mute = localStorage.getItem('mute'); // check if mute is set in localStorage
        if (mute !== null) { // if it is, set the mute preference
          this.scene.game.sound.mute = mute === 'false';
        }
    }
}

export { SoundBank };