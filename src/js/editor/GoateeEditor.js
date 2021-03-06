import { fabric } from 'fabric';
import Swiper, { Navigation, Pagination  } from 'swiper';
import axios from 'axios';
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
        this.loadedImages = 0;
        this.totalStickerImages = 0;
        this.mySwiper = null;
        this.minimumFileSize = (1 * 1024) * 1024;

        this.hideControlsRight = {
            'tl':true,
            'tr':true,
            'bl':true,
            'br':true,
            'ml':true,
            'mt':true,
            'mr':true,
            'mb':true,
            'mtr':true
        };

        this.hideControlsLeft = {
            'tl':true,
            'tr':true,
            'bl':true,
            'br':true,
            'ml':true,
            'mt':true,
            'mr':true,
            'mb':true,
            'mtr':true
        }

        this.lowQualityImagesArray = [];
        this.alertOnScreen = false;
        this.boundingBox = null;

        // Main canvas DOM element
        this.canvasElement = null;
        // Main canvas object
        this.canvas = null;

        // Bind functions
        this.init = this.init.bind(this);
        this.resizeCanvas = this.resizeCanvas.bind(this);
        this.updateSwiper = this.updateSwiper.bind(this);
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
        this.closeColorPicker = this.closeColorPicker.bind(this);
        this.clearCanvasSelection = this.clearCanvasSelection.bind(this);
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
        this.checkFileSize = this.checkFileSize.bind(this);
        this.handleAlertClick = this.handleAlertClick.bind(this);
        this.pushTextToTop = this.pushTextToTop.bind(this);
        this.updateNumberOfObjects = this.updateNumberOfObjects.bind(this);
        this.allowObjectSelectionByType = this.allowObjectSelectionByType.bind(this);
        this.keepInsideCanvas = this.keepInsideCanvas.bind(this);


        // Canvas event handlers
        this.objectSelected = this.objectSelected.bind(this);
        this.objectRotating = this.objectRotating.bind(this);
        this.objectModified = this.objectModified.bind(this);
        this.objectScaled = this.objectScaled.bind(this);
        this.objectMoving = this.objectMoving.bind(this);
        this.canvasCleared = this.canvasCleared.bind(this);
        this.textChanged = this.textChanged.bind(this);

        this.init();
        this.addEvents();
        this.initSwiper();
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
            cornerColor: '#88008B',
            cornerSize: 25,

        });
        // Plug the fabricjs plugin
        this.canvas = new fabric.Canvas('goatee-editor', {
            backgroundColor: '#FFFFFF'
        });
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
        // Add event handler when elements type text are changed by the user
        this.canvas.on('text:changed', this.textChanged);
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

        fabric.Image.prototype.getSvgSrc = function() {
            return this.toDataURLforSVG();
          };
          
        fabric.Image.prototype.toDataURLforSVG = function(options) {
        var el = fabric.util.createCanvasElement();
                el.width  = this._element.naturalWidth || this._element.width;
                el.height = this._element.naturalHeight || this._element.height;
        el.getContext("2d").drawImage(this._element, 0, 0);
        var data = el.toDataURL(options);
        return data;
        };

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

    addBoundingBox() {
        let boundingBox = new fabric.Rect({
            fill: '#ffffff',
            width: this.canvas.getWidth(),
            height: this.canvas.getHeight(),
            hasBorders: false,
            hasControls: false,
            lockMovementX: true,
            lockMovementY: true,
            evented: false,
            selectable: false,
          });
          
          this.canvas.add(boundingBox);
          this.canvas.renderAll();
          this.boundingBox = boundingBox;
    }

    /**
     * Initialize Swiper element (stickers)
     */
    initSwiper() {
        const _this = this;
        // configure Swiper to use modules
        Swiper.use([Navigation, Pagination]);
        this.mySwiper = new Swiper('.swiper-container', {
            slidesPerView: 4,
            spaceBetween : 5,
            direction: 'horizontal',
            loopFillGroupWithBlank: false,
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
          });

          setTimeout(() => {
            this.mySwiper.update();
        }, 5000);
         
        this.mySwiper.on('click', function (swiper, event) {
        if(event.target.tagName === 'IMG') {
            _this.addImageFromUrl(event.target.src, 'sticker');
        }
        });
    }

    /**
     * Update DOM element that holds the current number of elements in the canvas.
     * This is used to validate if the user has added any elements to the canvas or is it empty.
     * 
     */
    updateNumberOfObjects() {
        const canvasObjects = this.canvas.getObjects();
        let numberOfObjects = canvasObjects.length;
        canvasObjects.forEach(element => {
            if (element.name && element.name === 'initialImage') {
                numberOfObjects = numberOfObjects - 1;
            }
        });
        document.getElementById('objects-in-canvas').value = numberOfObjects;
        return numberOfObjects;
    }


    /**
     * Checks if the just uploaded file is in a valid format
     * @param {File} fileElement 
     */
    checkifCorrectFileType(fileElement) {
        const fileName = fileElement.name;
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')+1, fileName.length) || fileName;
        const allowedExtensions = ["jpg", "JPG", "png", "PNG", "svg", "SVG", "gif", "GIF", "jpeg", "JPEG"];
        const searchResult = allowedExtensions.indexOf(fileExtension);
        console.log(searchResult);
        console.log(fileExtension);
        if(searchResult != -1) {            
            return true;
        }
        return false;
    }

    /**
     * Updates the stickers Swiper element
     */
    updateSwiper() {
        this.mySwiper.update();
    }
    /**
     * Used to perform action everytime any object in the canvas is beign moved
     * @param {fabricJS Event} event 
     */
    objectMoving(event) {
        // Hide delete button from canvas
        this.removeOnCanvasDeleteButton();
        // Constantly check if the object that is beign moved is inside the canvas
        this.keepInsideCanvas(event.target);
    }
    /**
     * Used to perform action everytime any object in the canvas is beign scaled
     * @param {fabricJS Event} event 
     */
    objectScaled(event) {
        // Hide delete button from canvas
        this.removeOnCanvasDeleteButton();
    }

    /**
     * Used to perform action everytime any object in the canvas is modified
     * @param {fabricJS Event} event 
     */
    objectModified(event) {

        // Check if the object is not out from the rigth side of the canvas
        const checkObjectRightBoundarie = this.checkObjectRightBoundarie(event.target);
        // Show delete button
        if(checkObjectRightBoundarie) {
            this.addOnCanvasDeleteBtn(event.target.oCoords.tl.x, event.target.oCoords.tl.y, 'tl');
        }
        else {
            this.addOnCanvasDeleteBtn(event.target.oCoords.tr.x, event.target.oCoords.tr.y, 'tr');
        }      
    }

    /**
     * Checks if an object has crossed the right boundary of the canvas
     * 
     * @param {fabricJS object} object Object to check if it has crossed the right boundary of the canvas
     * @return {boolean}
     */
    checkObjectRightBoundarie(object) {
        let boundingRect = object.getBoundingRect(true);
        if(boundingRect.left + boundingRect.width > this.canvas.getWidth()) {
            return true;
        }

        return false;
    }

    /**
     * Keeps the moving object inside the canvas
     * @param {fabricJS Object} object 
     */
    keepInsideCanvas(object) {
        let obj = object;

        // if object is too big ignore
        if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
            return;
        }        
  
        // set offset for moving out the canvas (20 % of object persists in canvas)
        let offsetWidth = obj.getBoundingRect().width * 0.8;
        let offsetHeight = obj.getBoundingRect().height * 0.8;
  
        obj.setCoords();        
  
        // top-left  corner
        if(obj.getBoundingRect().top < -offsetHeight || obj.getBoundingRect().left < -offsetWidth){
            obj.top = Math.max(obj.top, obj.top-(obj.getBoundingRect().top+offsetHeight));
            obj.left = Math.max(obj.left, obj.left-(obj.getBoundingRect().left+offsetWidth));
        }
        // bottom-right corner
        if(obj.getBoundingRect().top+obj.getBoundingRect().height  > obj.canvas.height + offsetHeight || obj.getBoundingRect().left+obj.getBoundingRect().width  > obj.canvas.width + offsetWidth){
            obj.top = Math.min(obj.top, obj.canvas.height-obj.getBoundingRect().height+obj.top-obj.getBoundingRect().top+offsetHeight);
            obj.left = Math.min(obj.left, obj.canvas.width-obj.getBoundingRect().width+obj.left-obj.getBoundingRect().left+offsetWidth);
        }

    }
    /**
     * Hides or shows an object's controls/handles visibility
     * (Not used at the moment)
     * 
     * @param {fabricJS object} object Element to set the controls visibility
     * @param {string} direction Directin of which set of controls to show 
     */

    adjustControlsVisibility(object, direction) {
        switch (direction) {
            case 'left':
                object.setControlsVisibility(this.hideControlsLeft);
                break;
            case 'right':
                object.setControlsVisibility(this.hideControlsRight);
                break;
        }
    }

    /**
     * Used to perform action everytime any object in the canvas is beign rotated
     * @param {fabricJS Event} event 
     */
    objectRotating(event) {
        // Hide delete button
        this.removeOnCanvasDeleteButton();
    }
    /**
     * Used to perform action everytime any object in the canvas is selected by the user
     * @param {fabricJS Event} event 
     */
    objectSelected(event) {
      // Show delete button
        this.addOnCanvasDeleteBtn(event.target.oCoords.tr.x, event.target.oCoords.tr.y, 'tr');
    }

    /**
     * Used to perform action everytime the text element in the canvas is modified
     * @param {fabricJS Event} event 
     */
    textChanged(event) {
        // Set the text element as active so the user can see the textbox
        this.canvas.setActiveObject(this.textObject);

        const addTextInput = this.editorWrapper.querySelector('#add-text-input');
        // Update the text input with the text that user is adding directly to the canvas
        addTextInput.value = event.target.text;
    }

    /**
     * Adds a delete button given an object's coordinates
     * 
     * @param {float} x X coordinates of the object that the delete button belongs to
     * @param {float} y Y coordinates of the object that the delete button belongs to
     * @param {string} direction If the coordinates are from the top-right or top-left 
     */
    addOnCanvasDeleteBtn(x, y, direction = null) {
        // Remove the exisent (if any) delete button
        this.removeOnCanvasDeleteButton();
        const deleteButton = this.createDeleteButton(x, y, direction);
        this.editorContainer.appendChild(deleteButton);        
    }

    /**
     * Removes the current delete button from the canvas
     */
    removeOnCanvasDeleteButton() {
        // Remove current delete button
        const domDeleteButton = this.editorWrapper.querySelector('.delete-button');
        if(domDeleteButton) {
            domDeleteButton.remove();
        }
    }

    /**
     * Creates a delete button element given an object coordinates
     * 
     * @param {float} x X coordinates of the object that the delete button belongs to  
     * @param {*} y Y coordinates of the object that the delete button belongs to
     * @param {string} direction If the coordinates are from the top-right or top-left 
     * 
     * @return {DOM element} 
     */
    createDeleteButton(x, y, direction = null) {
        let btnHorizontal = x;        
        let btnTop = y - 20;

        let deleteButton = document.createElement('div');
        deleteButton.innerHTML = "×";
        deleteButton.classList.add('delete-button');

        if(direction == 'tr') {
            btnHorizontal = btnHorizontal - 80;
        }
        else if(direction == 'tl') {
            btnHorizontal = btnHorizontal + 40;
        }
        deleteButton.style.left = btnHorizontal + 'px';
        deleteButton.style.top = btnTop + 'px';

        return deleteButton;
    }
    /**
     * Used to perform action everytime the canvas in empty
     * @param {fabricJS Event} event 
     */
    canvasCleared(event) {
        this.removeOnCanvasDeleteButton();
        this.closeColorPicker();
    }

    /**
     * Add event handlers
     */

    addEvents() {
        window.addEventListener('resize', this.resizeCanvas, false);
        //document.addEventListener('click', this.closeEverything);
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
        const positionArrows = this.editorWrapper.querySelectorAll('.position-arrows-container .direction-arrow');
        const zoomMagnifying = this.editorWrapper.querySelectorAll('.zoom-container div');
        const rotateButtons = this.editorWrapper.querySelectorAll('.rotate-container div');
        const layerButtons = this.editorWrapper.querySelectorAll('.layers-container i');
        const stickerOptionButtons = this.editorWrapper.querySelectorAll('.sticker-options a');
        const stickersCarouselButtons = this.editorWrapper.querySelectorAll('#stickers-carousel');
        const stickerImages = this.editorWrapper.querySelectorAll('#stickers-carousel img');
        const fontSelect = this.editorWrapper.querySelector('.font-select-wrapper select');
        const colorPickerButton = this.editorWrapper.querySelector(".text-options-wrapper .color-picker-options-wrapper");
        const colorPickerOptionsWrapper = this.editorWrapper.querySelector('.color-picker-options-wrapper');
        const deleteContainer = this.editorWrapper.querySelector('.delete-element-container');
        const downloadImage = this.editorWrapper.querySelector('.download-image');
        const alertContainer = this.editorWrapper.querySelector('#alert-container');
        
       
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

        if(downloadImage) {
            downloadImage.addEventListener('click',  this.downloadImage);
        }

        if(alertContainer) {
            alertContainer.addEventListener('click', this.handleAlertClick)
        }
    }
    /**
     * When programmaticaly the download button is clicked to export the image
     * @param {Event} event 
     */
    downloadImage(event) {
        this.resizeAndExport();
      }
      
      /**
       * Creates a bigger (hidden) canvas so the image created by the user
       * is exported in a bigger size. Also this method exports the image and appends
       * the DaraURL to a DOM element.
       */
      resizeAndExport() {
        let hiddenCanvasWrapper = document.getElementById('hidden-canvas');
        hiddenCanvasWrapper.append(this.canvas.toCanvasElement(6));
        let hiddenCanvas = hiddenCanvasWrapper.querySelector('canvas');
        let exportedImage = new Image();
        exportedImage.src = hiddenCanvas.toDataURL('image/jpeg', 1.0);
        document.getElementById('hidden-exported-image').appendChild(exportedImage);
      }

    /**
     * Open/Close color picker
     * @param {Event} event 
     */
    toggleColorPicker(event) {
        // Open or close the color picker
        if(event.target.classList.contains('color-picker-button') || event.target.classList.contains('close-color-picker')) {
            this.pickerElement.toggle();
            // Show or hide the little close color picker button
            this.editorWrapper.querySelector('.color-picker-options-wrapper .close-color-picker').classList.toggle('hide');
        }        
    }

    /**
     * Enable a type of object to be selectable by the user. The rest is disabled. Of
     * the objectType parameter is null the all the bjects in the canvas are enabled.
     * 
     * @param {String} objectType What type of object to allow selection by the user 
     */
    allowObjectSelectionByType(objectType = null) {
        let canvasObjects = this.canvas.getObjects();
        console.log
        canvasObjects.forEach(object => {
            if(objectType === null){
                object.set('selectable', true);
            }
            else {
                if(object.get('name') == objectType) {
                    object.set('selectable', true);
                }
                else {
                    object.set('selectable', false);
                }
            }
            this.canvas.renderAll();
        });
        
    }

    closeColorPicker() {
        this.editorWrapper.querySelector('.color-picker-options-wrapper .close-color-picker').classList.add('hide');
        this.pickerElement.hide();
    }

    clearCanvasSelection() {
        this.canvas.discardActiveObject();
    }

    updateTextColorInput(picker, color) {
        // Update hidden input with 
        let hexColor = AColorPicker.parseColor(color, "hex")
        this.editorWrapper.querySelector('.color-picker-options-wrapper .text-color').value = hexColor;
        if(this.textElementInCanvas) {
            this.updateTextColor(hexColor);
        }

        // Update open color picker icon color
        //COMMENTING THIS FOR PRODUCTION
        // const colorPickerButtonIcon = this.editorWrapper.querySelector('.color-picker-options-wrapper .color-picker-button i');
        // colorPickerButtonIcon.style.borderBottomColor = hexColor;    
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
        if(elementToDelete.get('type') === 'textbox') {
            this.textElementInCanvas = false;
            this.editorWrapper.querySelector('#custom-text #add-text-input').value = '';
        }
        else if( elementToDelete.get('type') === 'image') {
            
            const index = this.lowQualityImagesArray.indexOf(elementToDelete.get('filename'));
            if(index > -1) {
                this.lowQualityImagesArray.splice(index, 1);
                if(this.lowQualityImagesArray.length === 0) {
                    const closeAlertButton = this.editorWrapper.querySelector('#alert-container .close-alert');
                    if(closeAlertButton) {
                        closeAlertButton.click();
                    }
                    this.alertOnScreen = false;
                }
            }
        }
        this.canvas.remove(elementToDelete);
        this.canvas.renderAll();
        const numberOfObjects = this.updateNumberOfObjects();
        if(numberOfObjects <= 0) {
            const uploadImageTab = this.editorWrapper.querySelector('#tabs-container .choose-image-tab');
            uploadImageTab.click();
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

        // If there is any selected objects update the delete button position
        const activeObject = this.canvas.getActiveObject();
        if(activeObject !== undefined) {
            this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y, 'tr');
        }
 
    }

    closeEverything(event) {
       if(!event.target.classList.contains('clickable')) {
           this.closeColorPicker();
           this.clearCanvasSelection();
       }              
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
        const _this = this;
        let _localCanvas = this.canvas;
        

        if (imgURL != '') {
            fabric.Image.fromURL(imgURL, function (oImg) {
                oImg.scaleToWidth(_localCanvas.getWidth() * 0.80);
                oImg.scaleToHeight(_localCanvas.getHeight() * 0.80);                
                
                if(type === 'sticker') {
                    oImg.set('name', 'sticker');
                    _localCanvas.add(oImg);
                }
                else {
                    _localCanvas.add(oImg);
                    _localCanvas.sendToBack(oImg);
                }
                _localCanvas.setActiveObject(oImg);
                if(_this.textElementInCanvas) {
                    _this.pushTextToTop();
                }
                _localCanvas.renderAll();
                _this.updateNumberOfObjects();
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
        const _this = this;
        const _localControlsVisibility = this.hideControlsRight; 
        let reader = new FileReader();
        const fileElement = event.target.files[0];
        //Show alert if file type is not image
        const fileTypeCheck = this.checkifCorrectFileType(fileElement);
        console.log(fileTypeCheck);
        if(fileTypeCheck === true) {
            this.removeObjectFromCanvas('initialImage');
            this.editorWrapper.querySelector('#tabs-container .position-tab').click();
           // Show alert if the image uploaded by the user has the minimum file size
            // If not then show an alert
            this.checkFileSize(fileElement);

            reader.onload = function (e) {
                let imgObj = new Image();
                imgObj.src = e.target.result;
                imgObj.onload = function () {
                    let image = new fabric.Image(imgObj);
                    image.scaleToWidth(_localCanvas.getWidth() * 0.80);
                    image.scaleToHeight(_localCanvas.getHeight() * 0.80);                    
                    image.set('filename', fileElement.name);
                    image.set('name', 'image');
                    _localCanvas.add(image);
                    _localCanvas.setActiveObject(image);
                    _localCanvas.renderAll();
                    _this.pushStickersForward();
                    _this.updateNumberOfObjects(); 
                }
            }
            reader.readAsDataURL(event.target.files[0]);
        }
        else {
            this.showAlert('warning', 'Please upload a file in any of these formats: jpg, png, gif or svg', null, true);
            this.alertOnScreen = true; 
        }

    }

    checkFileSize(fileElement) {
        // Check if file's size is higher than the minimum accepted
        // The show an alert
        if(fileElement.size < this.minimumFileSize) {
            // Check if there is already beign showed an alert
            if(this.alertOnScreen === false) {
                this.showAlert('warning', 'One or more of your uploaded images are too small. The resolution of this image(s) will lead to a poor print quality. Try to upload images that are at least 1 MB or larger.', null, true);
                this.alertOnScreen = true;
            }
           
            // Push to the aray with the names of the file that do not meet the minimum size requirement
            this.lowQualityImagesArray.push(fileElement.name);
            console.log('%c' + this.lowQualityImagesArray, 'background: #222; color: #bada55');
        }
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

        // Disable object types in the canvas according to the tab that the user clicked
        switch(optionID) {
            case 'add-image-container':
                // Enable all type "image" objects
                this.allowObjectSelectionByType("image");
                break;
            case 'change-position-container':
                // Enable all objects
                this.allowObjectSelectionByType();
                break;
            case 'text-container':
                // Enable textbox type object
                this.allowObjectSelectionByType("textElement");
                break;
            case 'add-stickers-container':
                this.updateSwiper();
                // Enable sticker type object
                this.allowObjectSelectionByType("sticker");
                break;
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
        const _this = this;
        const _localControlsVisibility = this.hideControlsRight;
        if (this.textElementInCanvas === true ) {
            _localCanvas.setActiveObject(this.textObject);
            this.addOnCanvasDeleteBtn(this.textObject.oCoords.tr.x, this.textObject.oCoords.tr.y, 'tr');
            this.textObject.set('text', event.target.value);
            _this.pushTextToTop();
            _localCanvas.renderAll();
            _this.updateNumberOfObjects();
        }
        else {
            this.textElementInCanvas = true;
            let inputValue = event.target.value;
            let textElement = new fabric.Textbox(inputValue, { name: 'textElement' });
            const currentColor = this.getCurrentColor();
            textElement.set({"fontSize" : 50, "fill" : currentColor, "cornerSize" : 15})
            
            this.textObject = textElement;
            const selectedFont = this.getSelectedFont();
            let font = new FontFaceObserver(selectedFont);

            this.removeObjectFromCanvas('initialImage');

            this.showElement('#custom-text .loader');

            if(this.checkIfSafeFont(font) === false) {                
                font.load()
                .then(function() {
                    _this.hideElement('#custom-text .loader');
                  // when font is loaded, use it.
                    textElement.set({"fontFamily":selectedFont});                    
                    _this.canvas.add(textElement);
                   _this.pushTextToTop();
                    textElement.centerV();
                    _localCanvas.setActiveObject(_this.textObject);
                    _this.addOnCanvasDeleteBtn(_this.textObject.oCoords.tr.x, _this.textObject.oCoords.tr.y, 'tr');
                    
                    _localCanvas.renderAll();
                    _this.updateNumberOfObjects();
                }).catch(e => {
                    _this.hideElement('#custom-text .loader');                    
                    textElement.set("fontFamily", 'Trebuchet MS');
                    _this.canvas.add(textElement);
                   _this.pushTextToTop();
                    textElement.centerV();
                    _localCanvas.setActiveObject(_this.textObject);
                    _this.addOnCanvasDeleteBtn(_this.textObject.oCoords.tr.x, _this.textObject.oCoords.tr.y, 'tr');

                    _localCanvas.renderAll();
                    _this.updateNumberOfObjects();
                });
            }
            else {
                _this.hideElement('#custom-text .loader');
                textElement.set("fontFamily", font);                
                _this.canvas.add(textElement);
                _this.pushTextToTop();
                textElement.centerV();
                _localCanvas.setActiveObject(_this.textObject);
                _this.addOnCanvasDeleteBtn(_this.textObject.oCoords.tr.x, _this.textObject.oCoords.tr.y, 'tr');

                _localCanvas.renderAll();
                _this.updateNumberOfObjects();
            }
        }
    }

    pushTextToTop() {
        this.textObject.bringToFront();
        this.canvas.renderAll();
    }

    pushStickersForward() {
        const canvasObjects = this.canvas.getObjects();
        canvasObjects.forEach(object => {
            if(object.name === 'sticker') {
                object.bringToFront();
            }
        });

        this.canvas.renderAll();
        
        if(this.textElementInCanvas) {
            this.pushTextToTop();
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
        const _localControlsVisibility = this.hideControlsRight;
        const _localTextElement = this.textObject;
        const _this = this;

        if(this.textElementInCanvas === true) {
            this.showElement('#custom-text .loader');
            font.load()
            .then(function() {
                _this.hideElement('#custom-text .loader');
              // when font is loaded, use it.
                _localTextElement.set({"fontFamily":fontName});               
                _this.pushTextToTop();
    
            }).catch(e => {               
                _localTextElement.set("fontFamily", 'Trebuchet MS');
                _this.pushTextToTop();
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
            // Check if the object is not out from the rigth side of the canvas
            const checkObjectRightBoundarie = this.checkObjectRightBoundarie(activeObject);
            // Show delete button
            if(checkObjectRightBoundarie) {
                this.addOnCanvasDeleteBtn(activeObject.oCoords.tl.x, activeObject.oCoords.tl.y, 'tl');
            }
            else {
                this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y, 'tr');
            }  
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }

    updateObjectCoords(objectToUpdate, xCoords, yCoords) {
        objectToUpdate.left = xCoords;
        objectToUpdate.top = yCoords;
        objectToUpdate.setCoords();
        this.canvas.renderAll();
    }

    showAlert(type, message, duration = null, dismissable = null) {
        const alertElement = this.createAlert(type, message, dismissable);
        const alertContainer = this.editorWrapper.querySelector('#alert-container');

        if(duration === null && dismissable === null) {
            duration = 5000;
        }
        if(dismissable === null) {
            alertContainer.style.transitionDelay = `${duration / 1000}s`;
        }

        alertContainer.appendChild(alertElement);
        
        if(dismissable === null) {
            setTimeout(() => {
                alertContainer.classList.remove('fade');
                alertElement.remove();
                }, duration); 
        }

    }

    createAlert(type, message, dismissable = null) {
        let alertContainer = document.createElement('DIV');
        let alertMessage = document.createTextNode(message);
        alertContainer.classList.add('alert', type, 'flex');
        alertContainer.setAttribute('key', `alert-id-${Math.ceil(Math.random() * 10)}`);
        alertContainer.appendChild(alertMessage);

        if(dismissable === null) {
            //alertContainer.classList.add('fade');
        }
        else {
            let closeButtonElement = document.createElement('span');
            closeButtonElement.classList.add('close-alert', 'dismissable-alert-button');
            closeButtonElement.innerHTML = "×";
            alertContainer.appendChild(closeButtonElement);
        }
        return alertContainer;
    }

    handleAlertClick(event) {
        if(event.target.classList.contains('close-alert')) {
            this.closeAlert(event);
        } 
    }

    closeAlert(event) {
        const alertContainer = event.target.parentElement;
        alertContainer.remove();        
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

            // Check if the object is not out from the rigth side of the canvas
            const checkObjectRightBoundarie = this.checkObjectRightBoundarie(activeObject);
            // Show delete button
            if(checkObjectRightBoundarie) {
                this.addOnCanvasDeleteBtn(activeObject.oCoords.tl.x, activeObject.oCoords.tl.y, 'tl');
            }
            else {
                this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y, 'tr');
            }    
        }
        else {
            this.showAlert('error', 'Please select an element from the editor first.')
        }
    }

    zoomElement(objectToZoom, scaleX, scaleY) {
        objectToZoom.scaleX = scaleX;
        objectToZoom.scaleY = scaleY;
        objectToZoom.setCoords();

        // Check if the right boundarie of the object, if this one exceeds the right
        // boundarie of the canvas then move the delete button from right to left

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
            // Check if the object is not out from the rigth side of the canvas
            const checkObjectRightBoundarie = this.checkObjectRightBoundarie(activeObject);
            // Show delete button
            if(checkObjectRightBoundarie) {
                this.addOnCanvasDeleteBtn(activeObject.oCoords.tl.x, activeObject.oCoords.tl.y, 'tl');
            }
            else {
                this.addOnCanvasDeleteBtn(activeObject.oCoords.tr.x, activeObject.oCoords.tr.y, 'tr');
            }  
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