const bitmapFonts = {
    PressStart2P_Tiny: 'PressStart2P-Tiny',
    PressStart2P_Small: 'PressStart2P-Small',
    PressStart2P_Middle: 'PressStart2P-Middle',
    PressStart2P_Medium: 'PressStart2P-Medium', 
    PressStart2P_Large: 'PressStart2P-Large',  
};

const baseFontConfig = {
    color: '#ffffff',
    align: 'center'
};

function selectFont(size) {
    if (size <= 10) {
        return bitmapFonts.PressStart2P_Tiny;
    } else if (size <= 15) {
        return bitmapFonts.PressStart2P_Small;
    } else if (size <= 20) {
        return bitmapFonts.PressStart2P_Middle;
    } else if (size <= 30) {
        return bitmapFonts.PressStart2P_Medium;
    } else {
        return bitmapFonts.PressStart2P_Large;
    }
}

const fonts = {
    tiny: {
        ...baseFontConfig,
        fontName: selectFont(10),
        size: 10
    },
    small: {
        ...baseFontConfig,
        fontName: selectFont(15),
        size: 15
    },
    middle: {
        ...baseFontConfig,
        fontName: selectFont(20),
        size: 20
    },
    medium: {
        ...baseFontConfig,
        fontName: selectFont(30),
        size: 30
    },
    large: {
        ...baseFontConfig,
        fontName: selectFont(45),
        size: 45
    }
};

export { fonts };
