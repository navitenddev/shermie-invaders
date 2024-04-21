import { fonts } from "../utils/fontStyle";

class StatsContainer extends Phaser.GameObjects.Container {
    constructor(scene,
        x, y,
        w, h,
        bg_color = 0x2B2D31,
        border_color = 0x879091,
    ) {
        super(scene, x, y);
        this.scene.add.existing(this);
        this.bg = this.scene.add.rectangle(0, 0, w, h, bg_color);
        this.border = this.scene.add.graphics();

        this.border
            .lineStyle(2, border_color, 1)
            .strokeRect(-(w / 2), -(h / 2), w, h);

        const { shots_fired, shots_hit } = this.scene.player_vars.game_stats;
        const hit_ratio = shots_hit / (shots_fired || 1);

        const statsSpacing = 35;

        const text_shots_fired = this.scene.add.bitmapText(
            -(w / 2),
            0,
            fonts.small.fontName,
            `SHOTS FIRED: ${shots_fired}`,
            fonts.small.size,
            'center'
        )
            .setTint(0xade6ff);
        const text_shots_hit = this.scene.add.bitmapText(
            -(w / 2),
            1 * statsSpacing,
            fonts.small.fontName,
            `HITS: ${shots_hit}`,
            fonts.small.size,
            'center'
        );
        const text_hit_ratio = this.scene.add.bitmapText(
            -(w / 2),
            statsSpacing * 2,
            fonts.small.fontName,
            `ACCURACY: ${(hit_ratio * 100).toFixed(0)}%`,
            fonts.small.size,
            'center'
        )
            .setTint(0xe0de2c);


        this.add([this.bg, this.border, text_shots_fired, text_shots_hit, text_hit_ratio]);
        text_shots_fired.setPosition(-(text_shots_fired.width / 2),
            -(text_shots_fired.height / 2) - statsSpacing);
        text_shots_hit.setPosition(-(text_shots_hit.width / 2), -(text_shots_hit.height / 2));
        text_hit_ratio.setPosition(-(text_hit_ratio.width / 2), -(text_hit_ratio.height / 2) + statsSpacing);
    }

}

export { StatsContainer }