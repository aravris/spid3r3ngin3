class layer {
    constructor(name, objects, scene, root, getSizing, enabled, smoothing, index) {
        this.name = (name) ? name : crypto.randomUUID();
        this.scene = scene
        this.canvas = document.createElement("canvas");

        root.appendChild(this.canvas);

        this.context = this.canvas.getContext("2d");
        this.properties = {
            enabled: enabled === true,
            smoothing: smoothing === true,
            index: index !== undefined ? index : 0
        }

        const sizing = getSizing();

        this.canvas.setAttribute("width", sizing.width);
        this.canvas.setAttribute("height", sizing.height);
        this.canvas.setAttribute("style", `z-index: ${this.properties.index}`)

        this.objects = objects !== undefined ? objects : [];
        this.context.imageSmoothingEnabled = this.properties.smoothing;
    }

    addObject = object => {
        this.objects.push(object);
    }

    getObject = name => {
        return this.objects.find(object => {
            return object.name === name
        })
    }

    removeObject = name => {
        let index = this.objects.findIndex(object => {
            return object.name === name
        })

        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
}

export default class {
    constructor(rootNode, getSizing) {
        this.root = rootNode
        this.getSizing = getSizing;
    }

    #layers = []

    #getLayerIndex = name => {
        return this.#layers.findIndex(layerClass => layerClass.name === name);
    }

    getLayers = () => {
        return this.#layers;
    }

    getLayer = name => {
        return this.#layers.find(layerClass => layerClass.name === name);
    }

    addLayer = (name, objects, scene, ...args) => {
        const layerClass = new layer(name, objects, scene, this.root, this.getSizing, ...args);

        this.#layers.push(layerClass);

        return layerClass;
    }

    removeLayer = name => {
        const index = this.#getLayerIndex(name);

        if (index > -1) {
            this.#layers[index].canvas.remove();
            this.#layers.splice(index, 1);
        }
    }
}