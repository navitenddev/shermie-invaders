import { BaseMenu } from "./BaseMenu";
import { bitmapFonts, fonts } from '../utils/fontStyle.js';

export class HowToPlay extends BaseMenu {
    constructor() {
        super('HowToPlay');
    }

    create() {
      super.create();
      

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

      this.add.bitmapText(this.game.config.width / 3, 125, bitmapFonts.PressStart2P_Stroke, 'HOW TO PLAY', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke]).setDepth(3);

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