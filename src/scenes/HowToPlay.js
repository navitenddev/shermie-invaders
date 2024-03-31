import { Scene } from 'phaser';
import { bitmapFonts, fonts } from '../utils/fontStyle.js';
import { InitKeyDefs } from "../utils/keyboard_input";

export class HowToPlay extends Scene {
  constructor() {
    super('HowToPlay');
  }

  create() {
    this.keys = InitKeyDefs(this);

    this.animatedBg = this.add.tileSprite(400, 300, 1500, 1000, 'animatedbg');
    this.animatedBg.setOrigin(0.5, 0.5);
    this.sounds = this.registry.get('sound_bank');
    this.add.image(512, 150, 'howToPlayLogo').setScale(0.8);
    this.keys.m.on('down', this.sounds.toggle_mute)

    let width = this.game.config.width

    const instructionsText =
      `Movement:
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


    this.add.bitmapText(width / 4, 250, bitmapFonts.PressStart2P_Stroke, instructionsText, fonts.small.sizes[bitmapFonts.PressStart2P_Stroke])

    this.backButton = this.add.bitmapText(512, 600, bitmapFonts.PressStart2P_Stroke, 'Back', fonts.medium.sizes[bitmapFonts.PressStart2P_Stroke])
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.sounds.bank.sfx.click.play();
        this.scene.start('MainMenu');
      });
  }
  update() {
    if (this.animatedBg) {
      this.animatedBg.tilePositionY += 1;
      this.animatedBg.tilePositionX += 1;
    }
  }
}