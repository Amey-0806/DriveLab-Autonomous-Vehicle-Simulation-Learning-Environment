class Viewport {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.zoom = 1;
        this.center = new Point(canvas.width / 1, canvas.height / 2);
        this.offset = scale(this.center, -1);

        this.drag = {
            start: new Point(0, 0),
            end: new Point(0, 0),
            offset: new Point(0, 0),
            active: false,
        };

        this.#addEventListeners();
    }

    reset() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        this.ctx.scale(1 / this.zoom, 1 / this.zoom);
        const offset = this.getOffset();
        this.ctx.translate(offset.x, offset.y);
    }

    getMouse(evt, substractDragOffset = false) {
        const p = new Point(
            (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
            (evt.offsetY - this.center.y) * this.zoom - this.offset.y,
        );

        return substractDragOffset ? substract(p, this.drag.offset) : p
    }

    getOffset() {
        return add(this.offset, this.drag.offset);
    }

    #addEventListeners() {
        this.canvas.addEventListener(
            "mousewheel",
            this.#handleMouseWheel.bind(this),
        );
        this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
        this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
        this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
    }

    #handleMouseDown(evt) {
        if (evt.button == 1) {
            evt.preventDefault();
            this.drag.start = new Point(
                evt.offsetX * this.zoom,
                evt.offsetY * this.zoom,
            );
            this.drag.end = this.drag.start;
            this.drag.offset = new Point(0, 0);
            this.drag.active = true;
        }
    }

    #handleMouseMove(evt) {
        if (this.drag.active) {
            this.drag.end = new Point(
                evt.offsetX * this.zoom,
                evt.offsetY * this.zoom,
            );
            this.drag.offset = substract(this.drag.end, this.drag.start);
        }
    }

    #handleMouseUp(evt) {
        if (this.drag.active) {
            this.offset = add(this.offset, this.drag.offset);
            this.drag = {
                start: new Point(0, 0),
                end: new Point(0, 0),
                offset: new Point(0, 0),
                active: false,
            };
        }
    }

    #handleMouseWheel(evt) {
        evt.preventDefault();
        const dir = Math.sign(evt.deltaY);
        this.zoom += dir * 0.1;
        this.zoom = Math.max(1, Math.min(5, this.zoom));
    }
}
