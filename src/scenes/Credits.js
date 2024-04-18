import { BaseMenu } from "./BaseMenu";
import { fonts } from '../utils/fontStyle.js';

export class Credits extends BaseMenu {
  constructor() {
    super('Credits');
  }

  create() {
    super.create();
    this.sounds = this.registry.get('sound_bank');
    this.sounds.stop_all_music();
    this.sounds.bank.music.shop.play();

    let width = this.game.config.width;
    this.keys.esc.on('down', () => this.exitCredits());

    const creditsText = `
                      DEVELOPERS
____________________________________________________________________________________________




                      Joshua Ortiga



                      MEHMET BAYRAM



                      JUAN PABLO GUTIERREZ



                      XIN LI



                      JONATHAN LE










                        MUSIC
____________________________________________________________________________________________




            Retro Platforming - David Fesliyan



            8 Bit Presentation - David Fesliyan



            Retro Forest - David Fesliyan



            8 Bit Adventure - David Fesliyan



    Epic Boss Battle (Dark Action Music) - Rafael Krux



You’re The Champion by MaxKoMusic | https://maxkomusic.com/
Music promoted by https://www.free-stock-music.com
Creative Commons / Attribution-ShareAlike 3.0 Unported 
                (CC BY-SA 3.0)
https://creativecommons.org/licenses/by-sa/3.0/deed.en_US`;

    const scrollingText = this.add.bitmapText(
      width / 12,
      this.game.config.height, 
      fonts.small.fontName,
      creditsText,
      fonts.small.size
    ).setDepth(3).setLineSpacing(5);


    const speed = 30;
    const duration = (scrollingText.height + this.game.config.height) / speed * 1000;

    this.tweens.add({
      targets: scrollingText,
      y: -scrollingText.height, 
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        scrollingText.destroy(); 
        this.scene.start('Main Menu');
      }
    });
  }
  exitCredits() {
    this.scene.start('Main Menu');
  }
}
