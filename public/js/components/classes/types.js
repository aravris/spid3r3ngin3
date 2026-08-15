export default class {
    object = class object {
        constructor(name, type, enabled = true, x = {scale: 0, offset: 0}, y = {scale: 0, offset: 0}, width = {scale: 0, offset: 0}, height = {scale: 0, offset: 0}, pivot = {x: 0, y: 0}, aspectRatio) {
            this.name = name
            this.type = type;
            this.enabled = enabled;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.pivot = pivot;
            this.aspectRatio = aspectRatio;
        }
    }

    button = class button extends this.object {
        constructor(name, events = {}, image, fill, ...args) {
            super(name, "button", ...args);

            this.image = image;
            this.fill = fill;

            for (const index in events) {
                this[index] = events[index];
            }
        }
    }

    image = class image extends this.object {
        constructor(name, image, ...args) {
            super(name, "image", ...args);

            this.image = image;
        }
    }

    rect = class rect extends this.object {
        constructor(name, fill, ...args) {
            super(name, "rect", ...args);

            this.fill = fill;
        }
    }

    text = class text {
        constructor(name, text = "", enabled = true, x = {scale: 0, offset: 0}, y = {scale: 0, offset: 0}, align = "left", color = "#000000", font = "24px monospace", maxWidth, gapSize = 32) {
            this.name = name
            this.type = "text";
            this.enabled = enabled;
            this.x = x;
            this.y = y;
            this.text = text;
            this.align = align;
            this.color = color;
            this.font = font;
            this.maxWidth = maxWidth;
            this.gapSize = gapSize;
        }
    }
}