// imports

import {default as layersClass} from "./classes/layers.js";

// app

export default class renderer {
    constructor(root, aspectRatio) {
        const container = document.createElement("div");
        container.setAttribute("class", "container");

        root.appendChild(container);

        this.root = container;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspectRatio = aspectRatio;

        if (this.aspectRatio) {
            this.calculateAspectRatio(this.aspectRatio.x, this.aspectRatio.y);
        }
        this.mouse = {
            x: 0,
            y: 0
        }
        this.activeButtonLayers = []
        this.activeButtonLayer = undefined;
        this.cache = {
            images: []
        }
        this.touch = false
        
        this.layers = new layersClass(this.root, () => {
            return {
                width: this.width,
                height: this.height
            }
        });

        window.addEventListener("resize", () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            if (this.aspectRatio) {
                this.calculateAspectRatio(this.aspectRatio.x, this.aspectRatio.y);
            }
        
            let currentLayers = this.layers.getLayers();

            for (const currentLayer of currentLayers) {
                currentLayer.canvas.setAttribute("width", this.width);
                currentLayer.canvas.setAttribute("height", this.height);
                currentLayer.context.imageSmoothingEnabled = currentLayer.properties.smoothing;
            }
        })

        window.addEventListener("pointerdown", event => {
            this.mouse.x = event.clientX - ((window.innerWidth - this.width) / 2);
            this.mouse.y = event.clientY - ((window.innerHeight - this.height) / 2);

            if (event.pointerType === "touch") {
                this.touch = true

                let currentLayers = this.layers.getLayers();
                for (const currentLayer of currentLayers) {
                    if (currentLayer.properties.enabled) {
                        for (const layerObject of currentLayer.objects) {
                            if (layerObject.type === "button" && layerObject.enabled) {
                                if (this.calculateInBounds(this.mouse.x, this.mouse.y, layerObject) && !this.activeButtonLayer) {
                                    this.activeButtonLayers.push(layerObject);
                                }
                            }
                        }
                    }   
                }
            }
            else {
                this.touch = false;
            }

            let downObj;
            let events = [];
            
            for (const button of this.activeButtonLayers) {
                if (button.down) {
                    downObj = button;
                }
                else if (button.event && !downObj) {
                    events.push(button);
                }
            }

            if (downObj) {
                this.activeButtonLayer = downObj;
            }
            else {
                for (const button of events) {
                    button.event(button, this)
                }
            }
        })

        window.addEventListener("pointerup", event => {
            if (event.button == 2) return;
            
            this.mouse.x = event.clientX - ((window.innerWidth - this.width) / 2);
            this.mouse.y = event.clientY - ((window.innerHeight - this.height) / 2);
            
            if (this.activeButtonLayer) {
                if (this.activeButtonLayer.up) {
                    this.activeButtonLayer.up(this.activeButtonLayer, renderer);
                }

                this.activeButtonLayer = undefined;
            }
        })

        window.addEventListener("pointermove", event => {
            this.mouse.x = event.clientX - ((window.innerWidth - this.width) / 2);
            this.mouse.y = event.clientY - ((window.innerHeight - this.height) / 2);
        })
        
        let last = 0;
        const thread = async timestamp => {
            let delta = Math.min(timestamp - last, 100);
            last = timestamp;

            this.renderFrame(delta)
            requestAnimationFrame(thread);
        }

        requestAnimationFrame(thread);
    }

    types = {
        getMeasurements: layerObject => {
            let xPosition = (layerObject.x.scale * this.width) + layerObject.x.offset;
            let yPosition = (layerObject.y.scale * this.height) + layerObject.y.offset;

            if (layerObject.type === "text") {
                return [xPosition, yPosition]
            }
            else {
                let objectWidth = (layerObject.width.scale * this.width) + layerObject.width.offset
                let objectHeight = (layerObject.height.scale * this.height) + layerObject.height.offset
                            
                if (layerObject.aspectRatio) {
                    let currentObjectRatio = objectWidth / objectHeight

                    if (currentObjectRatio < layerObject.aspectRatio) {
                        objectHeight = Math.floor(objectWidth / layerObject.aspectRatio);
                    }
                    else {
                        objectWidth = Math.floor(objectHeight * layerObject.aspectRatio)
                    }
                }

                let xPivotOffset = objectWidth * layerObject.pivot.x
                let yPivotOffset = objectHeight * layerObject.pivot.y
                

                return [objectWidth, objectHeight, xPosition, yPosition, xPivotOffset, yPivotOffset]
            }
        },
        text: (layerObject, currentLayer) => {
            let [xPosition, yPosition] = this.types.getMeasurements(layerObject);
            currentLayer.context.fillStyle = layerObject.color
            currentLayer.context.textAlign = layerObject.align
            currentLayer.context.font = layerObject.font

            console.log(currentLayer, layerObject)

            if (layerObject.maxWidth) {
                let lines = this.measureLines(currentLayer, layerObject.maxWidth, layerObject.text);

                lines.forEach((line, index) => {
                    currentLayer.context.fillText(line, xPosition, yPosition + (index * layerObject.gapSize), layerObject.maxWidth)
                });
            } else {
                currentLayer.context.fillText(layerObject.text, xPosition, yPosition)
            }
        },
        rect: (layerObject, currentLayer) => {
            let [objectWidth, objectHeight, xPosition, yPosition, xPivotOffset, yPivotOffset] = this.types.getMeasurements(layerObject);

            currentLayer.context.fillStyle = layerObject.fill;
            currentLayer.context.fillRect(xPosition - xPivotOffset, yPosition - yPivotOffset, objectWidth, objectHeight);
        },
        button: (layerObject, currentLayer) => {
            let [objectWidth, objectHeight, xPosition, yPosition, xPivotOffset, yPivotOffset] = this.types.getMeasurements(layerObject);

            if (layerObject.fill) {
                currentLayer.context.fillStyle = layerObject.fill;
                currentLayer.context.fillRect(xPosition - xPivotOffset, yPosition - yPivotOffset, objectWidth, objectHeight);
            }

            if (layerObject.image) {
                this.types.image(layerObject, currentLayer);
            }

            if (!this.touch) {
                if (this.calculateInBounds(this.mouse.x, this.mouse.y, layerObject) && !this.activeButtonLayer) {
                    this.activeButtonLayers.push(layerObject);

                    if (!layerObject.entered) {
                        layerObject.entered = true;

                        if (layerObject.enter) {
                            layerObject.enter(layerObject, this);
                        }
                    }
                }
                else {
                    if (layerObject.entered && this.activeButtonLayer !== layerObject) {
                        layerObject.entered = undefined;

                        if (layerObject.leave) {
                            layerObject.leave(layerObject, this);
                        }
                    }
                }
            }
        },
        image: (layerObject, currentLayer) => {
            let [objectWidth, objectHeight, xPosition, yPosition, xPivotOffset, yPivotOffset] = this.types.getMeasurements(layerObject);

            if (!this.cache.images[layerObject.image]) {
                let newimg = this.cache.images[layerObject.image];

                if (typeof(layerObject.image) === "string") {
                    newimg = new Image();

                    newimg.src = layerObject.image
                }
                this.cache.images[layerObject.image] = newimg
            }

            currentLayer.context.drawImage(this.cache.images[layerObject.image], xPosition - xPivotOffset, yPosition - yPivotOffset, objectWidth, objectHeight);
        }
    }

    calculateInBoundsOfScreen = (currentX, currentY) => {
        return ((0 < currentX) && (currentX < this.width)) && ((0 < currentY) && (currentY < this.height))
    }

    calculateInBounds = (currentX, currentY, layerObject) => {
        let [objectWidth, objectHeight, xPosition, yPosition, xPivotOffset, yPivotOffset] = this.types.getMeasurements(layerObject);
    
        let leftX = xPosition - xPivotOffset;
        let rightX = leftX + objectWidth

        let topY = yPosition - yPivotOffset;
        let bottomY = topY + objectHeight;
        
        return ((((leftX < currentX) && (currentX < rightX)) && ((topY < currentY) && (currentY < bottomY))) && (((0 < this.mouse.x) && (this.mouse.x < this.width)) && ((0 < this.mouse.y) && (this.mouse.y < this.height))))
    }

    calculateAspectRatio = (ratioX, ratioY) => {
        let fixedRatio = ratioX / ratioY
        let currentRatio = this.width / this.height;

        if (currentRatio < fixedRatio) {
            this.height = Math.floor(this.width / fixedRatio);
        }
        else {
            this.width = Math.floor(this.height * fixedRatio);
        }
    }

    measureLines = (currentLayer, maxWidth, string) => {
        let split = string.split(" ");
        let lines = [];
        let currentLine = split[0];

        for (let i = 1; i < split.length; i++) {
            let selected = split[i];
            let length = currentLayer.context.measureText(`${currentLine} ${selected}`).width;

            if (length < maxWidth) {
                currentLine = `${currentLine} ${selected}`;
            } else {
                lines.push(currentLine);
                currentLine = selected;
            }
        }
        lines.push(currentLine);

        return lines;
    }

    renderFrame = delta => {
        this.activeButtonLayers = [];
        let currentLayers = this.layers.getLayers();

        for (const currentLayer of currentLayers) {
            currentLayer.context.clearRect(0, 0, this.width, this.height);

            if (currentLayer.properties.enabled) {
                if (currentLayer.scene) {
                    currentLayer.scene();
                }

                for (const layerObject of currentLayer.objects) {
                    if (this.types[layerObject.type] && layerObject.enabled) {
                        this.types[layerObject.type](layerObject, currentLayer);
                    }
                }
            }   
        }

        if (this.activeButtonLayer) {
            document.body.setAttribute("style", "cursor: pointer;")
        
            if (this.calculateInBoundsOfScreen(this.mouse.x, this.mouse.y)) {
                this.activeButtonLayer.down(this.activeButtonLayer, this);
            }
        }
        else {
            if (this.activeButtonLayers.length > 0) {
                document.body.setAttribute("style", "cursor: pointer;")
            }
            else {
                document.body.removeAttribute("style")
            }
        }
    }
}