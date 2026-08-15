// app

class eventClass {
    #connectors = [];

    constructor(name) {
        this.name = name;
    }

    getLength = () => {
        return this.#connectors.length;
    }

    remove = identifier => {
        const index = this.#connectors.findIndex(connector => connector.identifier === identifier)

        if (index > -1) {
            this.#connectors.splice(index, 1);
        }
    }

    insert = connectorCallback => {
        const identifier = window.crypto.randomUUID();

        this.#connectors.push({
            identifier: identifier,
            callback: async (...args) => connectorCallback(...args)
        })

        return identifier
    }

    emit = async (...args) => {
        await Promise.all(this.#connectors.map(connector => connector.callback(...args)));
    }
}

export default class eventBus {
    #events = [];

    #getEventClass = name => {
        return this.#events.find(event => event.name === name);
    }

    #getEventIndex = name => {
        return this.#events.findIndex(event => event.name === name);
    }

    #createEventClass = name => {
        if (this.#getEventClass(name) !== undefined) {
            this.clearEvent(name);
        }

        let event = new eventClass(name);
        this.#events.push(event);

        return event;
    }

    addEventConnector = (eventName, connectorCallback) => {
        let eventClass = this.#getEventClass(eventName);

        if (eventClass === undefined) {
            eventClass = this.#createEventClass(eventName);
        }

        let connectorIdentifier = eventClass.insert(connectorCallback);
        return connectorIdentifier;
    }

    removeEventConnector = (eventName, connectorIdentifier) => {
        let eventClass = this.#getEventClass(eventName);

        if (eventClass === undefined) {
            throw new Error("Event object doesn't exist!");
        }

        eventClass.remove(connectorIdentifier);

        if (eventClass.getLength() === 0) {
            this.clearEvent(eventName);
        }
    }

    clearEvent = name => {
        let index = this.#getEventIndex(name);

        if (index > -1) {
            this.#events.splice(index, 1);
        }
    }

    emitEvent = async (eventName, ...args) => {
        let eventClass = this.#getEventClass(eventName);

        if (eventClass === undefined) {
            throw new Error("Event object doesn't exist!");
        }
        
        await eventClass.emit(...args);
    }
}