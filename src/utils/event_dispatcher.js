/**
 * @classdesc Useful for creating and using custom events.
 * Singleton class.
 */
let instance = null;
class EventDispatcher extends Phaser.Events.EventEmitter {
    static getInstance() {
        if (instance === null)
            instance = new EventDispatcher();
        return instance;
    }
    constructor() {
        super();
    }
}

export { EventDispatcher }