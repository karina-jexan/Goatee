import { fabric } from 'fabric';

export default class GoateeEditor {

    constructor(elementSelector, config) {
        this.elementSelector = elementSelector;
        this.width = config.width;
        this.height = config.height;
        this.editorWrapper = document.getElementById('editor-wrapper');

        // Main canvas element
        this.canvas = null;

        // Bind functions
        this.addImageFromUrl = this.addImageFromUrl.bind(this);

        this.init();
        this.addEvents();
    }

    init() {
        // Create canvas element
        let canvasElement = document.createElement('CANVAS');
        canvasElement.width = this.width;
        canvasElement.height = this.height;
        canvasElement.id = 'goatee-editor';
        document.querySelector(this.elementSelector).appendChild(canvasElement);

        // Plug the fabricjs plugin
        this.canvas = new fabric.Canvas('goatee-editor');
    }

    addEvents() {
        const submitImageURLButton = this.editorWrapper.querySelector('#submit-image-url');


        if (submitImageURLButton) {
            submitImageURLButton.addEventListener('click', this.addImageFromUrl);
        }
    }

    addImageFromUrl() {
        console.log('holi');
        let _localCanvas = this.canvas;
        let imgURL = this.editorWrapper.querySelector('#image-url').value;
        console.log(imgURL);
        if (imgURL != '') {
            fabric.Image.fromURL(imgURL, function (oImg) {
                _localCanvas.add(oImg);
                _localCanvas.renderAll();
            });
        }
    }
}