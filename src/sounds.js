/* Define all sounds here */

class SoundBank {
    constructor(scene) {
        this.scene = scene;
        this.muted = false;
        this.bank = {
            win: null,
            lose: null,
            shoot: null,
            explosion: null,
            bgm: null,
        }

        this.init_sounds();
    }

    init_sounds() {
        this.bank.shoot =
            this.scene.game.sound.add('shoot', { volume: 0.1, loop: false });
        this.bank.explosion =
            this.scene.game.sound.add('explosion', { volume: 0.1, loop: false });
        this.bank.win =
            this.scene.game.sound.add('win', { volume: 0.1, loop: false });
        this.bank.lose =
            this.scene.game.sound.add('lose', { volume: 0.1, loop: false });
        this.bank.bgm =
            this.scene.game.sound.add('bgmusic', { volume: 0.2, loop: true });
    }

    toggle_mute = () => {
        if (this.scene.game.sound.mute)
            this.scene.game.sound.mute = false;
        else
            this.scene.game.sound.mute = true;
    }
}

export { SoundBank };