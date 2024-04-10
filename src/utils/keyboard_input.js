/* NO key functionality belongs in this file. */

/**  
 * @description Any keys that will be needed for the game should be defined here, then imported as needed. 
 */

const KEYBOARD_INPUT_DEFS = {
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D,
    p: Phaser.Input.Keyboard.KeyCodes.P,
    m: Phaser.Input.Keyboard.KeyCodes.M,
    g: Phaser.Input.Keyboard.KeyCodes.G,
    c: Phaser.Input.Keyboard.KeyCodes.C,
    v: Phaser.Input.Keyboard.KeyCodes.V,
    x: Phaser.Input.Keyboard.KeyCodes.X,
    right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    left: Phaser.Input.Keyboard.KeyCodes.LEFT,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    esc: Phaser.Input.Keyboard.KeyCodes.ESC,
};

/**
 * @param {Phaser.Scene} scene The scene in which to add the key defs too.
 * @returns {Object.<string, Phaser.Input.Keyboard.Key>} Returns an array of phaser key objects to use for gameplay. The keycodes are defined in `KEYBOARD_INPUT_DEFS` located in `keyboard_input.js`. 
 */
function InitKeyDefs(scene) {
    let keys = {};
    for (const [key_name, key_code] of Object.entries(KEYBOARD_INPUT_DEFS))
        keys[key_name] = scene.input.keyboard.addKey(key_code);
    return keys;
}

export { InitKeyDefs };