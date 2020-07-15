import { fabric } from 'fabric';

export default class GoateeEditor {

    constructor(elementSelector, config) {
        this.elementSelector = elementSelector;
        this.width = config.width;
        this.height = config.height;
        this.editorWrapper = document.getElementById('editor-wrapper');
        this.editorContainer = document.getElementById('editor-container');
        this.optionsWrapper = this.editorWrapper.querySelector('#options-fields-container');
        this.textElementInCanvas = false;

        // Main canvas DOM element
        this.canvasElement = null;
        // Main canvas object
        this.canvas = null;

        // Bind functions
        this.init = this.init.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.addImageFromUrl = this.addImageFromUrl.bind(this);
        this.openFileExplorer = this.openFileExplorer.bind(this);
        this.getFileName = this.getFileName.bind(this);
        this.showHideImageOptions = this.showHideImageOptions.bind(this);
        this.addImageFile = this.addImageFile.bind(this);
        this.closeAllOptions = this.closeAllOptions.bind(this);
        this.openOption = this.openOption.bind(this);
        this.addText = this.addText.bind(this);


        this.init();
        this.addEvents();
    }

    init() {

        this.canvasElement = document.getElementById('goatee-editor');
        let context = this.canvasElement.getContext("2d");
        this.editorContainer = document.getElementById('editor-container');
        context.canvas.width = this.editorContainer.clientWidth;
        context.canvas.height = this.editorContainer.clientHeight;

        // Plug the fabricjs plugin
        this.canvas = new fabric.Canvas('goatee-editor');

    }

    addEvents() {
        window.addEventListener('resize', this.resizeCanvas, false);
        const submitImageURLButton = this.editorWrapper.querySelector('#submit-image-url');
        const browseImageFileButton = this.editorWrapper.querySelector('#browse-image');
        const imageFileInput = this.editorWrapper.querySelector('#image-file');
        const addImageRadioContainer = this.editorWrapper.querySelector('.add-image-radio-container');
        const addImageOption = this.editorWrapper.querySelector('.add-image-option');
        const mainOptionButtons = this.editorWrapper.querySelectorAll('#options-container .editor-option button.open-options');
        const addTextInput = this.editorWrapper.querySelector('#add-text-input');

        if (submitImageURLButton) {
            submitImageURLButton.addEventListener('click', this.addImageFromUrl);
        }

        if (browseImageFileButton) {
            browseImageFileButton.addEventListener('click', this.openFileExplorer);
        }

        if (imageFileInput) {
            imageFileInput.addEventListener('change', this.getFileName);
        }

        if (addImageRadioContainer) {
            addImageRadioContainer.addEventListener('click', this.showHideImageOptions);
        }

        if (mainOptionButtons) {
            mainOptionButtons.forEach(element => {
                element.addEventListener('click', this.openOption);
            });
        }

        if (addTextInput) {
            addTextInput.addEventListener('keyup', this.addText);
        }
    }

    resizeCanvas(event) {
        this.canvasElement.width = this.editorContainer.clientWidth;
        this.canvasElement.height = this.editorContainer.clientHeight;
    }

    addImageFromUrl() {
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

    openFileExplorer(event) {
        let fileInput = this.editorWrapper.querySelector('#' + event.target.dataset.fileinputid);
        fileInput.click();
    }

    getFileName(event) {
        const displayNameInput = this.editorWrapper.querySelector(`input[data-fileinputid="${event.target.id}"]`);
        if (displayNameInput) {
            displayNameInput.value = event.target.files[0].name;
        }
        this.addImageFile(event);
    }

    showHideImageOptions(event) {
        if (event.target.id === 'image-url-radio') {
            this.editorWrapper.querySelector('.image-upload-container').classList.add('hide');
            this.editorWrapper.querySelector('.image-url-container').classList.remove('hide');
        }
        else if (event.target.id === 'image-file-radio') {
            this.editorWrapper.querySelector('.image-upload-container').classList.remove('hide');
            this.editorWrapper.querySelector('.image-url-container').classList.add('hide');
        }
    }

    addImageFile(event) {
        let _localCanvas = this.canvas;
        let reader = new FileReader();
        reader.onload = function (e) {
            let imgObj = new Image();
            imgObj.src = e.target.result;
            imgObj.onload = function () {
                let image = new fabric.Image(imgObj);
                _localCanvas.add(image);
                _localCanvas.renderAll();
            }
        }
        reader.readAsDataURL(event.target.files[0]);
    }

    closeAllOptions() {
        const optionsElements = this.optionsWrapper.children;
        for (let i = 0; i < optionsElements.length; i++) {
            optionsElements[i].classList.add('hide');
        }
    }

    openOption(event) {
        this.closeAllOptions();

        const optionID = event.target.dataset.optionid;
        if (optionID) {
            this.editorWrapper.querySelector('#' + optionID).classList.remove('hide');
        }
    }

    addText(event) {
        // Create text object this will only occur the first time the object is added
        let _localCanvas = this.canvas;
        const canvasObjects = _localCanvas.getObjects();
        if (this.textElementInCanvas) {
            canvasObjects.forEach(object => {
                if (object.name === 'textElement') {
                    object.set('text', event.target.value)
                }
            });
        }
        else {
            this.textElementInCanvas = true;
            let inputValue = event.target.value;
            let textElement = new fabric.Text(inputValue, { name: 'textElement' });
            textElement.center();
            _localCanvas.add(textElement);
        }

        _localCanvas.renderAll();
    }
}