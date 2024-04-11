import { BaseMenu } from "./BaseMenu";
import { fonts } from '../utils/fontStyle.js';

export class HowToPlay extends BaseMenu {
  constructor() {
    super('HowToPlay');
  }

  create() {
    super.create();
    this.sounds = this.registry.get('sound_bank');
    this.sounds.stop_all_music();
    this.sounds.bank.music.shop.play();

    let width = this.game.config.width;

    this.keys.m.on("down", this.sounds.toggle_mute);

    const instructionsText = `Movement:
  - A/D or Left Arrow/Right Arrow

Shoot:
  - W or Space
        
Pause:
  - P or ESC

Skip Dialogue:
  - ESC
        
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

      this.add.bitmapText(this.game.config.width / 3, 75, fonts.medium.fontName, 'HOW TO PLAY', fonts.medium.size).setDepth(3);

      this.add
        .bitmapText(
          width / 4,
          140,
          fonts.small.fontName,
          instructionsText,
          fonts.small.size
        )
        .setDepth(3)
        .setLineSpacing(5);

    this.setupBackButton();
  }
}