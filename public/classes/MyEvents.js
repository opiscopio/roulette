export class MyEvents {

    events = {};
    maxID = 0;

    constructor(eventNames) {
        eventNames.forEach(name => {
            this.events[name] = {};
        })
    }

    on(event, callback) {
        const id = this.maxID++;
        this.events[event][id] = callback;
        return id;
    }

    callEvent(id, ...args) {
        console.log(id);
        console.log(this.events);
        Object.values(this.events[id]).forEach(cb => {
            cb(...args);
        })
    }
}