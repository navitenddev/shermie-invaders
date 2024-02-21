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
                explosion: null,
            },
            music: {
                bg: null,
            }
        }
        this.init_sounds();
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
                explosion: this.scene.game.sound.add('explosion', { volume: 0.1, loop: false }),
                win: this.scene.game.sound.add('win', { volume: 0.1, loop: false }),
                lose: this.scene.game.sound.add('lose', { volume: 0.1, loop: false }),
            },
            music: {
                bg: this.scene.game.sound.add('bgmusic', { volume: 0.2, loop: true }),
            }
        }
    }

    /** 
     * @public
     * @description Mutes all sounds for the `scene` provided in the constructor. It's worth noting that this will only mute sounds for one scene, unless they all share the same sound bank, hence why they should share the same `SoundBank`.
     */
    toggle_mute = () => {
        this.scene.game.sound.mute = !this.scene.game.sound.mute;
    }
}

export { SoundBank };