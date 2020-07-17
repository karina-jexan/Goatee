import { fabric } from 'fabric';

export default class GoateeEditor {

    constructor(elementSelector, config) {
        this.elementSelector = elementSelector;
        this.width = config.width;
        this.height = config.height;
        this.canvasRatio = 0.703;
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
        this.setActiveTab = this.setActiveTab.bind(this);
        this.showFacebookOptions = this.showFacebookOptions.bind(this);
        this.addImageFromUrlFacebook = this.addImageFromUrlFacebook.bind(this);
        this.cancelUploadFromFacebook = this.cancelUploadFromFacebook.bind(this);
        this.showInstagramOptions = this.showInstagramOptions.bind(this);
        this.addImageFromUrlInstagram = this.addImageFromUrlInstagram.bind(this);
        this.cancelUploadFromInstagram = this.cancelUploadFromInstagram.bind(this);
        this.removeObjectFromCanvas = this.removeObjectFromCanvas.bind(this);
        this.showElement = this.showElement.bind(this);
        this.hideElement = this.hideElement.bind(this);

        this.init();
        this.addEvents();
    }

    init() {

        this.canvasElement = document.getElementById('goatee-editor');
        let context = this.canvasElement.getContext("2d");
        this.editorContainer = document.getElementById('editor-container');
        context.canvas.width = this.editorContainer.clientWidth;
        context.canvas.height = this.editorContainer.clientWidth * this.canvasRatio;

        // Plug the fabricjs plugin
        this.canvas = new fabric.Canvas('goatee-editor');
        let _localCanvas = this.canvas;
        // Add initial image
        fabric.Image.fromURL('../img/placeholder-image-purple.png', function (oImg) {
            oImg.set('name', 'initialImage');
            oImg.set('selectable', false);
            _localCanvas.add(oImg);
            oImg.center();
            _localCanvas.renderAll();
        });
    }

    addEvents() {
        window.addEventListener('resize', this.resizeCanvas, false);
        const browseImageFileButton = this.editorWrapper.querySelector('#browse-image');
        const imageFileInput = this.editorWrapper.querySelector('#image-file');
        const addImageRadioContainer = this.editorWrapper.querySelector('.add-image-radio-container');
        const mainOptionsTabs = this.editorWrapper.querySelectorAll('#tabs-container .editor-tab .tab-link');
        const uploadFromFacebookButton = this.editorWrapper.querySelector('#upload-facebook');
        const cancelUploadFromFacebookButton = this.editorWrapper.querySelector('#cancel-facebook-image');
        const submitImageURLFacebookButton = this.editorWrapper.querySelector('#submit-image-url-facebook');
        const uploadFromInstagramButton = this.editorWrapper.querySelector('#upload-instagram');
        const cancelUploadFromInstagramButton = this.editorWrapper.querySelector('#cancel-instagram-image');
        const submitImageURLInstagramButton = this.editorWrapper.querySelector('#submit-image-url-instagram');
        const addTextInput = this.editorWrapper.querySelector('#add-text-input');

        if (browseImageFileButton) {
            browseImageFileButton.addEventListener('click', this.openFileExplorer);
        }

        if (imageFileInput) {
            imageFileInput.addEventListener('change', this.getFileName);
        }

        if (addImageRadioContainer) {
            addImageRadioContainer.addEventListener('click', this.showHideImageOptions);
        }

        if (mainOptionsTabs) {
            mainOptionsTabs.forEach(element => {
                element.addEventListener('click', this.openOption);
            });
        }

        if (uploadFromFacebookButton) {
            uploadFromFacebookButton.addEventListener('click', this.showFacebookOptions)
        }

        if (submitImageURLFacebookButton) {
            submitImageURLFacebookButton.addEventListener('click', this.addImageFromUrlFacebook);
        }

        if (cancelUploadFromFacebookButton) {
            cancelUploadFromFacebookButton.addEventListener('click', this.cancelUploadFromFacebook);
        }

        if (uploadFromInstagramButton) {
            uploadFromInstagramButton.addEventListener('click', this.showInstagramOptions)
        }

        if (submitImageURLInstagramButton) {
            submitImageURLInstagramButton.addEventListener('click', this.addImageFromUrlInstagram);
        }

        if (cancelUploadFromInstagramButton) {
            cancelUploadFromInstagramButton.addEventListener('click', this.cancelUploadFromInstagram);
        }

        if (addTextInput) {
            addTextInput.addEventListener('keyup', this.addText);
        }
    }

    resizeCanvas(event) {
        const outerCanvasContainer = document.getElementById('editor-container');

        const ratio = this.canvas.getWidth() / this.canvas.getHeight();
        const containerWidth = outerCanvasContainer.clientWidth;
        const containerHeight = outerCanvasContainer.clientHeight;

        const scale = containerWidth / this.canvas.getWidth();
        const zoom = this.canvas.getZoom() * scale;
        this.canvas.setDimensions({ width: containerWidth, height: containerWidth / ratio });
        this.canvas.setViewportTransform([zoom, 0, 0, zoom, 0, 0]);
    }

    addImageFromUrlFacebook(event) {
        const imgUrl = this.editorWrapper.querySelector('#image-url-facebook').value;
        this.removeObjectFromCanvas('initialImage');
        this.addImageFromUrl(imgUrl);
    }

    cancelUploadFromFacebook(event) {
        this.hideElement('.image-url-container-fb');
        this.showElement('#image-options-container');
    }

    addImageFromUrlInstagram(event) {
        this.removeObjectFromCanvas('initialImage');
        const imgUrl = this.editorWrapper.querySelector('#image-url-instagram').value;
        this.addImageFromUrl(imgUrl);
    }

    cancelUploadFromInstagram(event) {
        this.hideElement('.image-url-container-ig');
        this.showElement('#image-options-container');
    }

    addImageFromUrl(imgURL) {
        this.removeObjectFromCanvas('initialImage');
        let _localCanvas = this.canvas;
        if (imgURL != '') {
            fabric.Image.fromURL(imgURL, function (oImg) {
                oImg.scaleToWidth(_localCanvas.getWidth());
                oImg.scaleToHeight(_localCanvas.getHeight());
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
        this.removeObjectFromCanvas('initialImage');
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
                image.scaleToWidth(_localCanvas.getWidth());
                image.scaleToHeight(_localCanvas.getHeight());
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
        event.preventDefault();
        this.closeAllOptions();
        this.setActiveTab(event);
        const optionID = event.target.dataset.optionid;
        if (optionID) {
            this.editorWrapper.querySelector('#' + optionID).classList.remove('hide');
        }
    }

    setActiveTab(event) {
        const currentActiveTab = this.editorWrapper.querySelector('#tabs-container .editor-tab.active');
        currentActiveTab.classList.remove('active');
        event.target.parentElement.classList.add('active');
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

    showFacebookOptions(event) {
        this.hideElement('#image-options-container');
        this.showElement('.image-url-container-fb');
    }


    showInstagramOptions(event) {
        this.hideElement('#image-options-container');
        this.showElement('.image-url-container-ig');
    }

    hideElement(elementSelector) {
        this.editorWrapper.querySelector(elementSelector).classList.add('hide');
    }

    showElement(elementSelector) {
        this.editorWrapper.querySelector(elementSelector).classList.remove('hide');
    }

    removeObjectFromCanvas(objectName) {
        let _localCanvas = this.canvas;
        var objects = _localCanvas.getObjects();
        objects.forEach(function (element) {
            if (element.name && element.name === objectName) {
                _localCanvas.remove(element);
            }
        });
        _localCanvas.renderAll()
    }
}