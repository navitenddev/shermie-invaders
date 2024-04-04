import { BaseMenu } from "./BaseMenu";
import { bitmapFonts, fonts } from '../utils/fontStyle.js';

export class HowToPlay extends BaseMenu {
  constructor() {
    super('HowToPlay');
  }

  create() {
    super.create();
    this.sounds = this.registry.get('sound_bank');
    this.sounds.stop_all_music();
    this.sounds.bank.music.shop.play();

    this.add.image(512, 150, "howToPlayLogo").setScale(0.8).setDepth(3);

    let width = this.game.config.width;

    this.keys.m.on("down", this.sounds.toggle_mute);

    const instructionsText = `Movement:
  - A/D or Left Arrow/Right Arrow

Shoot:
  - W or Space
        
Pause:
  - P or Esc
        
Mute Sounds:
  - M
        
Goal:
  - Eliminate all the enemies 
    before they reach your base
  - Avoid enemy attacks and
    collect power-ups
  - Advance to the next level
    and earn Shermie Coins
        
Good luck and have fun!`;

    this.add
      .bitmapText(
        width / 4,
        250,
        bitmapFonts.PressStart2P_Stroke,
        instructionsText,
        fonts.small.sizes[bitmapFonts.PressStart2P_Stroke]
      )
      .setDepth(3);

    this.setupBackButton();
  }
}