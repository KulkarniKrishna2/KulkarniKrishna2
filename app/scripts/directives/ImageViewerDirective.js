/**
 * Created by dhirendra on 12/09/16.
 */
(function (module) {
    mifosX.directives = _.extend(module, {
        ImageViewerDirective: function ($compile) {
            return {
                restrict: 'E',
                templateUrl: 'views/common/imageviewer.html',
                scope: {
                    image: "="
                },

                link: function(scope,element,attr){
                    scope.noImage = false;

                    //options for the zoom and rotate
                    var canvas = document.getElementById('canvas');
                    var image = document.getElementById('image');
                    var element = canvas.getContext("2d");
                    var angleInDegrees = 0;
                    var zoomDelta = 0.1;
                    var currentScale = 1;
                    var currentAngle = 0;
                    var canvasWidth = 600;
                    var novosDadosTRBL;
                    var novosDadosWH;
                    var novosDadosW;
                    var novosDadosH;
                    var startX, startY, isDown = false;
                    scope.flag=1;



                    scope.$watch('image', function (newValue) {
                        resetImage();
                    }, true);
                    //set the width of the canvas
                    setTimeout(function(){
                        canvas.width = angular.element('#image-zoom').width();

                        //append the image in canvas
                        document.getElementById('carregar').click();
                    },0);

                    //method to reset the image to its original position
                    angular.element('#carregar').click(function () {

                        //check the image load
                        angular.element('#image').on('load',resetImage())

                        //if the image is not loaded
                            .on('error', function() {
                                //hide the canvas
                                angular.element('#canvas').hide();

                                //disable the buttons
                                scope.noImage = true;

                                //display the image not loaded text
                                angular.element('#error-message').show();
                                console.log("error loading image"); });

                    });

                    //method to reset the image
                    function resetImage(){
                        //load the  image in canvas if the image is loaded successfully
                        image = document.getElementById('image');
                        element = canvas.getContext("2d");
                        angleInDegrees = 0;
                        currentScale = 1;
                        currentAngle = 0;

                        //for initial loading
                        if(scope.flag){
                            scope.flag = 0;
                            drawImage();
                            element.translate(canvas.width / 2, canvas.height / 2);
                            setTimeout(function(){
                                angular.element('#canvas').attr('data-girar', 0);
                                drawImage();
                            },1000);
                        }
                        else{
                            element.translate(0,0);
                            angular.element('#canvas').attr('data-girar', 0);
                            drawImage();
                        }
                    };

                    //method to rotate the image in clockwise
                    angular.element('#giraresq').click(function () {
                        //set the rotate angle for clockwise rotation
                        angleInDegrees = 5;
                        currentAngle += angleInDegrees;
                        drawImage();
                    });


                    //method to rotate the image in anti clockwise
                    angular.element('#girardir').click(function () {
                        //set the rotate angle for anti clockwise rotation
                        angleInDegrees = -5;
                        currentAngle += angleInDegrees;
                        drawImage();
                    });


                    //method to zoom in the image
                    angular.element('#zoomIn').click(function () {
                        currentScale += zoomDelta;
                        drawImage();
                    });


                    //method to zoom in and zoom out the image on mouse wheel scroll
                    angular.element('#canvas').bind('mousewheel DOMMouseScroll', function(event){
                        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                            // scroll up
                            currentScale += zoomDelta;
                            drawImage();
                        }
                        else {
                            // scroll down
                            if(currentScale-zoomDelta - 0.1 > 0){
                                currentScale -= zoomDelta;
                                drawImage();
                            }
                        }
                    });

                    //method to zoom out the image
                    angular.element('#zoomOut').click(function () {
                        currentScale -= zoomDelta;
                        drawImage();
                    });

                    //method to get the mouse position when mouse button is down
                    canvas.onmousedown = function (e) {
                        var pos = getMousePos(canvas, e);
                        startX = pos.x;
                        startY = pos.y;
                        isDown = true;
                    }

                    //method to update the image position in the canvas when it is dragged
                    canvas.onmousemove = function (e) {
                        if (isDown === true) {
                            var pos = getMousePos(canvas, e);
                            var x = pos.x;
                            var y = pos.y;

                            element.translate(x - startX, y - startY);
                            drawImage();

                            startX = x;
                            startY = y;
                        }
                    }

                    //method to detect the mouse up for image dragging
                    window.onmouseup = function (e) {
                        isDown = false;
                    }

                    //method to draw the image in the canvas from image element
                    function drawImage() {
                        clear();
                        element.save();
                        element.scale(currentScale, currentScale);
                        element.rotate(currentAngle * Math.PI / 180);
                        element.drawImage(image, 0, 0);
                        element.restore();
                    }

                    //method to clear the canvas
                    function clear() {
                        element.clearRect(-2000,-2000,5000,5000);
                    }

                    //method to get the mouse position
                    function getMousePos(canvas, evt) {
                        var rect = canvas.getBoundingClientRect();
                        return {
                            x: evt.clientX - rect.left,
                            y: evt.clientY - rect.top
                        };
                    }


                }
            }
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("imageViewer", ['$compile', mifosX.directives.ImageViewerDirective]).run(function ($log) {
    $log.info("ImageViewerDirective initialized $$$$$$");
});