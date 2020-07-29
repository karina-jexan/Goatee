import { fabric } from 'fabric';
const FontFaceObserver = require('fontfaceobserver');
const AColorPicker = require('a-color-picker');

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
        this.initialStickersPosition = 0;
        this.textObject = null;
        this.pickerElement = null;

        this.hideControls = {
            'tl':true,
            'tr':false,
            'bl':true,
            'br':true,
            'ml':true,
            'mt':true,
            'mr':true,
            'mb':true,
            'mtr':true
        };


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
        this.changeElementPositionArrows = this.changeElementPositionArrows.bind(this);
        this.updateObjectCoords = this.updateObjectCoords.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.zoomElementMagnifying = this.zoomElementMagnifying.bind(this);
        this.zoomElement = this.zoomElement.bind(this);
        this.rotateElementButton = this.rotateElementButton.bind(this);
        this.rotateElement = this.rotateElement.bind(this);
        this.changeElementLayer = this.changeElementLayer.bind(this);
        this.showStickerOptions = this.showStickerOptions.bind(this);
        this.stickerCarouselElementButton = this.stickerCarouselElementButton.bind(this);
        this.addSticker = this.addSticker.bind(this);
        this.getSelectedFont = this.getSelectedFont.bind(this);
        this.changeFont = this.changeFont.bind(this);
        this.updateFont = this.updateFont.bind(this);
        this.toggleColorPicker = this.toggleColorPicker.bind(this);
        this.updateTextColorInput = this.updateTextColorInput.bind(this);
        this.updateTextColor = this.updateTextColor.bind(this);
        this.getCurrentColor = this.getCurrentColor.bind(this);
        this.closeEverything = this.closeEverything.bind(this);        
        this.globalOptions = this.globalOptions.bind(this);
        this.deleteOption = this.deleteOption.bind(this);
        this.deleteElement = this.deleteElement.bind(this);
        this.addOnCanvasDeleteBtn = this.addOnCanvasDeleteBtn.bind(this);
        this.containerActions = this.containerActions.bind(this);
        this.downloadImage = this.downloadImage.bind(this);

        // Canvas event handlers
        this.objectSelected = this.objectSelected.bind(this);
        this.objectRotating = this.objectRotating.bind(this);
        this.objectModified = this.objectModified.bind(this);
        this.objectScaled = this.objectScaled.bind(this);
        this.objectMoving = this.objectMoving.bind(this);
        this.canvasCleared = this.canvasCleared.bind(this);

        this.init();
        this.addEvents();
    }

    init() {

        this.canvasElement = document.getElementById('goatee-editor');
        let context = this.canvasElement.getContext("2d");
        this.editorContainer = document.getElementById('editor-container');
        context.canvas.width = this.editorContainer.clientWidth;
        context.canvas.height = this.editorContainer.clientWidth * this.canvasRatio;

        fabric.Object.prototype.set({
            transparentCorners: false,
            borderColor: '#88008B',
            cornerColor: '#88008B'
        });
        // Plug the fabricjs plugin
        this.canvas = new fabric.Canvas('goatee-editor');
        // Add event handler when any object is selected;
        this.canvas.on('selection:created', this.objectSelected);
        // Add event handler when any object is selected;
        this.canvas.on('selection:updated', this.objectSelected);
        // Add event when any object is rotating
        this.canvas.on('object:rotating', this.objectRotating);
        // Add event handler when any object is modified
        this.canvas.on('object:modified', this.objectModified);
        // Add event handler when any object is beign scaled
        this.canvas.on('object:scaling', this.objectScaled);
        // Add event handler when any object is beign moved
        this.canvas.on('object:moving', this.objectMoving);
        // Add event handler when there is no object selected in the canvas
        this.canvas.on('selection:cleared', this.canvasCleared);
        // Prevent that all selected objects go to the front automatically
        this.canvas.preserveObjectStacking = true;

        let _localCanvas = this.canvas;
        // Add initial image
        fabric.Image.fromURL('../img/placeholder-image-purple.png', function (oImg) {
            oImg.set('name', 'initialImage');
            oImg.set('selectable', false);
            _localCanvas.add(oImg);
            oImg.center();
            _localCanvas.renderAll();
        });

        // Initialize a-color-picker package
        this.pickerElement = AColorPicker.createPicker('#editor-wrapper .a-color-picker-wrapper', {
            "color": "#000000",
            "palette" : ["#f44336", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#03a9f4","#00bcd4", "#00bcd4", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800","#ff5722", "#795548", "#9e9e9e", "#607d8b", "#000000", "#ffffff"],
            "showHSL" : false,
            "showRGB": false,
            "showAlpha" : false
        });
        this.pickerElement.on('change', this.updateTextColorInput)
        this.pickerElement.toggle();
    }

    objectMoving(event) {
        // Hide delete button from canvas
        this.removeOnCanvasDeleteButton();
    }

    objectScaled(event) {
        // Hide delete button from canvas
        this.removeOnCanvasDeleteButton();
    }

    objectModified(event) {
        // Show delete button
        this.addOnCanvasDeleteBtn(event.target.oCoords.tr.x, event.target.oCoords.tr.y);
    }

    objectRotating(event) {
        // Hide delete button
        this.removeOnCanvasDeleteButton();
    }

    objectSelected(event) {
        // Show delete button
        this.addOnCanvasDeleteBtn(event.target.oCoords.tr.x, event.target.oCoords.tr.y);

        // Show the user the position tab menu when it selects an object from the canvas
        // except if it's a text type object
        if(event.target.get('type') !== 'text') {
            const positionTabElement = this.editorWrapper.querySelector('#tabs-container .position-tab');
            positionTabElement.click();
        }
    }


    addOnCanvasDeleteBtn(x, y) {
        // Remove the exisent (if any) delete button
        this.removeOnCanvasDeleteButton();
        const deleteButton = this.createDeleteButton(x, y);
        this.editorContainer.appendChild(deleteButton);        
    }

    removeOnCanvasDeleteButton() {
        // Remove current delete button
        const domDeleteButton = this.editorWrapper.querySelector('.delete-button');
        if(domDeleteButton) {
            domDeleteButton.remove();
        }
    }

    createDeleteButton(x, y) {
        let btnLeft = x - 10;
        let btnTop = y - 10;

        let deleteButton = document.createElement('div');
        let iconElement = document.createElement('i');
        
        iconElement.classList.add('fas', 'fa-times', 'delete-button');

        deleteButton.classList.add('delete-button');
        deleteButton.style.left = btnLeft + 'px';
        deleteButton.style.top = btnTop + 'px';

        deleteButton.appendChild(iconElement);

        return deleteButton;
    }

    canvasCleared(event) {
        this.removeOnCanvasDeleteButton();
    }

    addEvents() {
        window.addEventListener('resize', this.resizeCanvas, false);
        document.addEventListener('click', this.closeEverything);
        const browseImageFileButton = this.editorWrapper.querySelector('#image-options-container .browse-image');
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
        const positionArrows = this.editorWrapper.querySelectorAll('.position-arrows-container i');
        const zoomMagnifying = this.editorWrapper.querySelectorAll('.zoom-container i');
        const rotateButtons = this.editorWrapper.querySelectorAll('.rotate-container i');
        const layerButtons = this.editorWrapper.querySelectorAll('.layers-container i');
        const stickerOptionButtons = this.editorWrapper.querySelectorAll('.sticker-options a');
        const stickersCarouselButtons = this.editorWrapper.querySelectorAll('#stickers-carousel i');
        const stickerImages = this.editorWrapper.querySelectorAll('#stickers-carousel img');
        const fontSelect = this.editorWrapper.querySelector('.font-select-wrapper select');
        const colorPickerButton = this.editorWrapper.querySelector(".text-options-wrapper .color-picker-options-wrapper");
        const colorPickerOptionsWrapper = this.editorWrapper.querySelector('.color-picker-options-wrapper');
        const deleteContainer = this.editorWrapper.querySelector('.delete-element-container');
        
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

        if(fontSelect) {
            fontSelect.addEventListener('change', this.changeFont);
        }

        if (addTextInput) {
            addTextInput.addEventListener('keyup', this.addText);
        }

        if(positionArrows) {
            positionArrows.forEach(arrowElement => {
                arrowElement.addEventListener('click', this.changeElementPositionArrows);
            });
        }

        if(zoomMagnifying) {
            zoomMagnifying.forEach(zoomElement => {
                zoomElement.addEventListener('click', this.zoomElementMagnifying);
            });
        }

        if(rotateButtons) {
            rotateButtons.forEach(rotateButton => {
                rotateButton.addEventListener('click', this.rotateElementButton);
            });
        }

        if(layerButtons) {
            layerButtons.forEach(layerButton => {
                layerButton.addEventListener('click', this.changeElementLayer);
            })
        }
        
        if(stickerOptionButtons) {
            stickerOptionButtons.forEach(stickerOption => {
                stickerOption.addEventListener('click', this.showStickerOptions);
            });
        }

        if(stickersCarouselButtons) {
            stickersCarouselButtons.forEach(stickerButtonElement => {
                stickerButtonElement.addEventListener('click', this.stickerCarouselElementButton);
            });
        }

        if(stickerImages) {
            stickerImages.forEach(sticker => {
                sticker.addEventListener('click', this.addSticker);
            });
        }

        if(colorPickerButton) {
            colorPickerButton.addEventListener('click', this.toggleColorPicker);
        }

        if(colorPickerOptionsWrapper) {
            colorPickerOptionsWrapper.addEventListener('click', this.toggleColorPicker);
        }

        if(deleteContainer) {
            deleteContainer.addEventListener('click', this.deleteOption)
        }

        if(this.editorContainer) {
           this.editorContainer.addEventListener('click', this.containerActions);
        }

        document.getElementById('download').addEventListener('click', this.downloadImage);
    }

    downloadImage(event) {
        const imageURL = this.canvas.toDataURL({
            format: 'png',
            width: 405,
            height: 285
          });

        // const imageURL = this.canvas.toDataURL()

          document.getElementById('download-link').href = imageURL;
          document.getElementById('download-link').click();
        
    }

    toggleColorPicker(event) {
        // Open or close the color picker
        if(event.target.classList.contains('color-picker-button') || event.target.classList.contains('close-color-picker')) {
            this.pickerElement.toggle();
            // Show or hide the little close color picker button
            this.editorWrapper.querySelector('.color-picker-options-wrapper .close-color-picker').classList.toggle('hide');
        }        
    }

    updateTextColorInput(picker, color) {
        // Update hidden input with 
        let hexColor = AColorPicker.parseColor(color, "hex")
        this.editorWrapper.querySelector('.color-picker-options-wrapper .text-color').value = hexColor;
        if(this.textElementInCanvas) {
            this.updateTextColor(hexColor);
        }

        // Update open color picker icon color
        const colorPickerButtonIcon = this.editorWrapper.querySelector('.color-picker-options-wrapper .color-picker-button i');
        colorPickerButtonIcon.style.color = hexColor;    
    }

    updateTextColor(color) {
        this.textObject.set({"fill" : color});
        this.canvas.renderAll();
    }

    getCurrentColor() {
        return this.editorWrapper.querySelector('.color-picker-options-wrapper .text-color').value;
    }

    globalOptions(event) {
        const activeObject = this.canvas.getActiveObject();
        if(event.target.classList.contains('delete-element')) {
            this.deleteElement(activeObject);
        }
    }

    deleteOption(event) {
        const activeObject = this.canvas.getActiveObject();

        if(activeObject != undefined) {
            if(event.target.classList.contains('delete-element')) {
                this.deleteElement(activeObject);
            }
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }

    containerActions(event) {
        if(event.target.classList.contains('delete-button')) {
            const activeObject = this.canvas.getActiveObject();
            if(activeObject !== undefined) {
                this.deleteElement(activeObject);
            }
        }
    }

    deleteElement(elementToDelete) {
        if(elementToDelete.get('type') === 'text') {
            this.textElementInCanvas = false;
            this.editorWrapper.querySelector('#custom-text #add-text-input').value = '';
        }
        this.canvas.remove(elementToDelete);
        this.canvas.renderAll();
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

        // If there is any selected objects update the delete button position
        const activeObject = this.canvas.getActiveObject();
        if(activeObject !== undefined) {
            this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y);
        }
 
    }

    closeEverything(event) {
        // If it's inside the canvas
        // Do nothi
              
    }

    addImageFromUrlFacebook(event) {
        const imgUrl = this.editorWrapper.querySelector('#image-url-facebook').value;
        this.removeObjectFromCanvas('initialImage');
        this.addImageFromUrl(imgUrl);
        this.editorWrapper.querySelector('#tabs-container .position-tab').click();

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

    addImageFromUrl(imgURL, type = null) {
        this.removeObjectFromCanvas('initialImage');
        let _localCanvas = this.canvas;
        const _localControlsVisibility = this.hideControls;
        const numberOfObjects = _localCanvas.getObjects().length;
        if (imgURL != '') {
            fabric.Image.fromURL(imgURL, function (oImg) {
                oImg.scaleToWidth(_localCanvas.getWidth() * 0.80);
                oImg.scaleToHeight(_localCanvas.getHeight() * 0.80);
                oImg.setControlsVisibility(_localControlsVisibility);
                if(type === 'sticker') {
                    _localCanvas.insertAt(oImg, 1);
                }
                else {
                    _localCanvas.add(oImg);
                    _localCanvas.sendToBack(oImg);
                }
                _localCanvas.setActiveObject(oImg);
                _localCanvas.renderAll();
            });
        }
    }

    openFileExplorer(event) {
        if(event.target.classList.contains('browse-image-button')) {
            let fileInput = this.editorWrapper.querySelector('#' + event.target.dataset.fileinputid);
            fileInput.click();
        }
    }

    getFileName(event) {
        const displayNameInput = this.editorWrapper.querySelector(`input[data-fileinputid="${event.target.id}"]`);
        if (displayNameInput) {
            displayNameInput.value = event.target.files[0].name;
        }
        this.removeObjectFromCanvas('initialImage');
        this.addImageFile(event);
        this.editorWrapper.querySelector('#tabs-container .position-tab').click();
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
        const numberOfObjects = _localCanvas.getObjects().length;
        let reader = new FileReader();
        reader.onload = function (e) {
            let imgObj = new Image();
            imgObj.src = e.target.result;
            imgObj.onload = function () {
                let image = new fabric.Image(imgObj);
                image.scaleToWidth(_localCanvas.getWidth() * 0.80);
                image.scaleToHeight(_localCanvas.getHeight() * 0.80);
                image.setControlsVisibility(this.hideControls);
                _localCanvas.add(image);
                _localCanvas.sendToBack(image, true);
                _localCanvas.setActiveObject(image);
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
        const _localControlsVisibility = this.hideControls;
        if (this.textElementInCanvas === true ) {
            this.textObject.set('text', event.target.value);
            _localCanvas.bringToFront(this.textObject);
            _localCanvas.renderAll();
        }
        else {
            this.textElementInCanvas = true;
            let inputValue = event.target.value;
            let textElement = new fabric.Text(inputValue, { name: 'textElement' });
            const currentColor = this.getCurrentColor();
            textElement.set('fill', currentColor);
            
            this.textObject = textElement;
            const selectedFont = this.getSelectedFont();
            let font = new FontFaceObserver(selectedFont);

            this.removeObjectFromCanvas('initialImage');

            if(this.checkIfSafeFont(font) === false) {
                font.load()
                .then(function() {
                  // when font is loaded, use it.
                    textElement.set({"fontFamily":selectedFont});
                    textElement.center();
                    textElement.setControlsVisibility(_localControlsVisibility);
                    _localCanvas.bringToFront(textElement);
                    _localCanvas.insertAt(textElement, 0);
                    console.log('En el then');
                    
                    _localCanvas.renderAll();
                }).catch(e => {
                    console.log(e);
                    textElement.setControlsVisibility(_localControlsVisibility);
                    textElement.set("fontFamily", 'Trebuchet MS');
                    textElement.center();
                    _localCanvas.bringToFront(textElement);
                    _localCanvas.insertAt(textElement, 0);
                    console.log('en el catch');

                    _localCanvas.renderAll();
                });
            }
            else {
                textElement.set("fontFamily", font);
                textElement.setControlsVisibility(_localControlsVisibility);
                _localCanvas.insertAt(textElement, 0);
                console.log('en el else');
                _localCanvas.renderAll();
            }
        }
    }

    getSelectedFont() {
        return this.editorWrapper.querySelector('#custom-text #font').value;
    }

    checkIfSafeFont(font) {
        let safeFonts = ["Trebuchet MS"];
        return safeFonts.includes(font);
    }

    changeFont(event) {
        const fontName = event.target.value;
        this.updateFont(fontName);
    }

    updateFont(fontName) {
        let font = new FontFaceObserver(fontName);
        const _localCanvas = this.canvas;
        const _localControlsVisibility = this.hideControls;
        const _localTextElement = this.textObject;
        if(this.textElementInCanvas === true) {
            font.load()
            .then(function() {
              // when font is loaded, use it.
                _localTextElement.set({"fontFamily":fontName});
                _localTextElement.setControlsVisibility(_localControlsVisibility);
                _localCanvas.bringToFront(_localTextElement);
                _localCanvas.insertAt(_localTextElement, 0);
                
                _localCanvas.renderAll();
            }).catch(e => {
                console.log(e);
                _localTextElement.setControlsVisibility(_localControlsVisibility);
                _localTextElement.set("fontFamily", 'Trebuchet MS');
                _localCanvas.bringToFront(_localTextElement);
                _localCanvas.insertAt(_localTextElement, 0);
                
                _localCanvas.renderAll();
            });
        }
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

    changeElementPositionArrows(event) {
        // Remove delete button from canvas
        this.removeOnCanvasDeleteButton()
        const activeObject = this.canvas.getActiveObject();

        if(activeObject != undefined) {
            const currentXCoords = activeObject.left;
            const currentYCoords = activeObject.top;
            const pixelsToMove = 10;
            switch (event.target.dataset.direction) {
                case 'up':
                    this.updateObjectCoords(activeObject, currentXCoords, currentYCoords - pixelsToMove);              
                break;
                case 'down':
                    this.updateObjectCoords(activeObject, currentXCoords, currentYCoords + pixelsToMove);
                break;
                case 'left':
                    this.updateObjectCoords(activeObject, currentXCoords - pixelsToMove, currentYCoords);
                break;
                case 'right':
                    this.updateObjectCoords(activeObject, currentXCoords + pixelsToMove, currentYCoords);
                break;
            
                default:
                break; 
            }
            this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y);
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }

    updateObjectCoords(objectToUpdate, xCoords, yCoords) {
        console.log(objectToUpdate);
        objectToUpdate.left = xCoords;
        objectToUpdate.top = yCoords;
        objectToUpdate.setCoords();
        this.canvas.renderAll();
    }

    showAlert(type, message) {
    const alertElement = this.createAlert(type, message);
    const alertContainer = this.editorWrapper.querySelector('#alert-container');
    alertContainer.classList.add('fade');
    alertContainer.appendChild(alertElement);

    setTimeout(function() {
        alertContainer.classList.remove('fade');
        alertElement.remove();
        }, 5000); 
    }

    createAlert(type, message) {
        let alertContainer = document.createElement('DIV');
        let alertMessage = document.createTextNode(message);
        alertContainer.classList.add('alert', 'fade', type);
        alertContainer.appendChild(alertMessage);

        return alertContainer;
    }

    zoomElementMagnifying(event) {
        // Remove delete button from canvas
        this.removeOnCanvasDeleteButton();
        const activeObject = this.canvas.getActiveObject();

        if(activeObject != undefined) {
            const currentXScale = activeObject.scaleX;
            const currentYScale = activeObject.scaleY;
            const scaleUpFactor = 1.1;
            const scaleDownFactor = 0.1;
            switch (event.target.dataset.zoom) {
                case 'in':
                    this.zoomElement(activeObject, currentXScale * scaleUpFactor, currentYScale * scaleUpFactor);
                break;
                case 'out':
                    this.zoomElement(activeObject, currentXScale - (currentXScale * scaleDownFactor), currentYScale - (currentYScale * scaleDownFactor));
                break;
           
                default:
                break; 
            }

            this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y);
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }

    zoomElement(objectToZoom, scaleX, scaleY) {
        objectToZoom.scaleX = scaleX;
        objectToZoom.scaleY = scaleY;
        objectToZoom.setCoords();
        this.canvas.renderAll();
    }

    rotateElementButton(event) {
        // Remove delete button from canvas
        this.removeOnCanvasDeleteButton();

        const activeObject = this.canvas.getActiveObject();

        if(activeObject != undefined) {
            const currentObjectAngle = activeObject.get('angle');
            const rotateDegrees = 10;
            switch (event.target.dataset.rotate) {
                case 'left':
                    this.rotateElement(activeObject, currentObjectAngle - rotateDegrees);
                break;
                case 'right':
                    this.rotateElement(activeObject, currentObjectAngle + rotateDegrees);
                break;           
                default:
                break; 
            }

            this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y);
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }

    rotateElement(objectToRotate, objectAngle) {
        objectToRotate.rotate(objectAngle);
        objectToRotate.setCoords();
        this.canvas.renderAll();
    }

    showStickerOptions(event) {
        event.preventDefault();
        const currentActiveTab = this.editorWrapper.querySelector(".sticker-options .active");
        const currentActiveOptionID = currentActiveTab.dataset.optionid;

        currentActiveTab.classList.remove('active');
        event.target.classList.add('active');

        this.hideElement('#' + currentActiveOptionID);
        this.showElement('#' + event.target.dataset.optionid);
    }

    stickerCarouselElementButton(event) {
        const stickers = this.editorWrapper.querySelectorAll('.carousel-images-wrapper img');
        const pixelsToMove = 80;
        switch(event.target.dataset.direction) {
            case 'forward':
                if(this.initialStickersPosition >= -480) {
                    this.initialStickersPosition = this.initialStickersPosition - pixelsToMove;
                    stickers.forEach(stickerElement => {
                        stickerElement.style.transform = "translateX(" + this.initialStickersPosition + "px)"
                    });  
                }
             
            break;
            case 'back':
                if(this.initialStickersPosition < 0) {
                    this.initialStickersPosition = this.initialStickersPosition + pixelsToMove;
                    stickers.forEach(stickerElement => {
                        stickerElement.style.transform = "translateX(" + this.initialStickersPosition + "px)"
                    });
                }               
            break;
        }
    }

    addSticker(event) {
        this.animateElement(event.target, 'wiggle');
        this.addImageFromUrl(event.target.src, 'sticker');
        this.editorWrapper.querySelector('#tabs-container .position-tab').click();
    }

    animateElement(elementToAnimate, className) {
        elementToAnimate.classList.add(className);

        setTimeout(function() {
            elementToAnimate.classList.remove(className);
        }, 1000); 
    }

    changeElementLayer(event) {
        const activeObject = this.canvas.getActiveObject();

        if(activeObject != undefined) {
            switch (event.target.dataset.direction) {
                case 'back':
                    this.canvas.sendBackwards(activeObject);
                break;
                case 'forward':
                    this.canvas.bringForward(activeObject);
                break;           
                default:
                break; 
            }
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }
}