import { fabric } from 'fabric';

export default class GoateeEditor {

    constructor(elementSelector, config) {
        this.elementSelector = elementSelector;
        this.width = config.width;
        this.height = config.height;

        this.init();
    }

    init() {
        // Create canvas element
        let canvasElement = document.createElement('CANVAS');
        canvasElement.width = this.width;
        canvasElement.height = this.height;
        canvasElement.id = 'goatee-editor';
        document.querySelector(this.elementSelector).appendChild(canvasElement);

        // Plug the fabricjs plugin
        var canvas = new fabric.Canvas('goatee-editor');

        var rect = new fabric.Rect({
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'red'
        });

        canvas.add(rect);
    }

    open(url) {
        document.querySelector(this.elementSelector)
    }
}