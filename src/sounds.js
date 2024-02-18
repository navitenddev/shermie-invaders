/* Define all sounds here */

class SoundBank {
    constructor(scene) {
        this.scene = scene;
        this.muted = false;
        this.sounds = {
            win: null,
            lose: null,
            shoot: null,
            explosion: null,
            bgm: null,
        }

        this.init_sounds();
    }

    init_sounds() {
        this.sounds.shoot =
            this.scene.game.sound.add('shoot', { volume: 0.1, loop: false });
        this.sounds.explosion =
            this.scene.game.sound.add('explosion', { volume: 0.1, loop: false });
        this.sounds.win =
            this.scene.game.sound.add('win', { volume: 0.1, loop: false });
        this.sounds.lose =
            this.scene.game.sound.add('lose', { volume: 0.1, loop: false });
        this.sounds.bgm =
            this.scene.game.sound.add('bgmusic', { volume: 0.2, loop: true });
    }

    play(sound_key) {
        console.log(this)
        if (!this.muted) {
            switch (sound_key) {
                case 'shoot':
                    this.sounds.shoot.play();
                    break;
                case 'explosion':
                    this.sounds.explosion.play();
                    break;
                case 'win':
                    this.sounds.win.play();
                    break;
                case 'lose':
                    this.sounds.lose.play();
                    break;
                case 'bgm':
                    this.sounds.bgm.play();
                    break;
                default:
                    console.error(`Error: Tried to play invalid sound "${sound_key}"!`)
                    break;
            }
        }
    }

    toggle_mute = () => {
        this.muted = !this.muted;
        console.log(`Muted: ${this.muted}`);
        if (this.muted)
            this.sounds.bgm.stop();
        else
            this.sounds.bgm.play();
    }
}

export { SoundBank };