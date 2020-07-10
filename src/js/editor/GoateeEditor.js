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
        this.openFileExplorer = this.openFileExplorer.bind(this);
        this.getFileName = this.getFileName.bind(this);
        this.showHideImageOptions = this.showHideImageOptions.bind(this);
        this.addImageFile = this.addImageFile.bind(this);

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
        const browseImageFileButton = this.editorWrapper.querySelector('#browse-image');
        const imageFileInput = this.editorWrapper.querySelector('#image-file');
        const addImageRadioContainer = this.editorWrapper.querySelector('.add-image-radio-container');
        const addImageOption = this.editorWrapper.querySelector('.add-image-option');

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

        if (addImageOption) {
            addImageOption.addEventListener('click', this.showHideImageOptions);
        }
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
        else if (event.target.classList.contains('add-image-option')) {
            this.editorWrapper.querySelector('#add-image-container').classList.remove('hide');
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
}