
class apansson {
    constructor(selector) {
        this.selector = selector;
    }
}

const handler = {
    jQueryObject: undefined,
    /*
    construct(target, args) {
        console.log(`Creating a ${target.name}`);
        // Expected output: "Creating a monster"

        return new target(...args);
    },
    */
    initJQueryObject(target) {
        if (!this.jQueryObject) {
            const targetSelector = target.selector;
            this.jQueryObject = $(targetSelector);
        }
    },
    get(target, prop, receiver) {
        this.initJQueryObject(target);
        console.log(`Calling "get"`);
        const retVal = this.jQueryObject.get(prop);
        return retVal;
    },
    apply(target, thisArg, argumentsList) {
        this.initJQueryObject(target);
        console.log(`Calling "apply"`);
        const retVal = this.jQueryObject.apply(target, thisArg, ...argumentsList);
        return retVal;
    },
};

export const jQueryWrapper = (selector) => new Proxy(new apansson(selector), handler);
