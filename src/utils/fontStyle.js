const bitmapFonts = {
    PressStart2P: 'PressStart2P',
    PressStart2P_Stroke: 'PressStart2P-Stroke',
    GlassTTY: 'GlassTTY'
};

const baseFontConfig = {
    color: '#ffffff',
    align: 'center'
};

const fonts = {
    tiny: {
        ...baseFontConfig,
        align: 'left',
        sizes: {
            [bitmapFonts.PressStart2P]: 10,
            [bitmapFonts.GlassTTY]: 10,
            [bitmapFonts.PressStart2P_Stroke]: 10
        }
    },
    small: {
        ...baseFontConfig,
        sizes: {
            [bitmapFonts.PressStart2P]: 15,
            [bitmapFonts.GlassTTY]: 15,
            [bitmapFonts.PressStart2P_Stroke]: 15
        }
    },
    medium: {
        ...baseFontConfig,
        sizes: {
            [bitmapFonts.PressStart2P]: 30,
            [bitmapFonts.GlassTTY]: 30,
            [bitmapFonts.PressStart2P_Stroke]: 30
        }
    },
    large: {
        ...baseFontConfig,
        sizes: {
            [bitmapFonts.PressStart2P]: 45,
            [bitmapFonts.GlassTTY]: 45,
            [bitmapFonts.PressStart2P_Stroke]: 45
        }
    }
};

export { bitmapFonts, fonts };