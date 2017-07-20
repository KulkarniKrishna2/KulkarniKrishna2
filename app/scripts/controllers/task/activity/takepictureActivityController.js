(function (module) {
    mifosX.controllers = _.extend(module, {
        takepictureActivityController: function ($controller, scope, resourceFactory, API_VERSION, $modal, location, dateFilter, http, routeParams, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.taskId=scope.getTaskId();
            scope.images=[];
            scope.status='SUMMARY';
            scope.init=function(){
                resourceFactory.imageResource.get({entityType:'tasks',entityId:scope.taskId},function (data) {
                    scope.images=data;
                    scope.status='SUMMARY';
                });
                
            };
            scope.init();

            scope.routeToImage=function(id){
                scope.imageId=id;
                $modal.open({
                    templateUrl: 'viewpic.html',
                    controller: ViewPicCtrl,
                    windowClass: 'modalwidth700'
                });
            };

            var ViewPicCtrl = function($scope,$modalInstance){
                scope.status='VIEW';
                http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/tasks/' + scope.taskId + '/images/'+scope.imageId+'?maxHeight=400'
                    }).then(function (imageData) {
                        $scope.image = imageData.data;
                });
                $scope.cancel=function(){
                    $modalInstance.dismiss();
                    scope.init();
                }
            }

            scope.capturePic = function () {
                $modal.open({
                    templateUrl: 'capturepic.html',
                    controller: CapturePicCtrl,
                    windowClass: 'modalwidth700'
                });
            };
            var CapturePicCtrl = function ($scope, $modalInstance) {
                scope.status='VIEW';
                $scope.video = null;
                $scope.picture = null;
                $scope.error = null;
                $scope.channel={};

                $scope.onVideoSuccess = function () {
                        $scope.video = $scope.channel.video;
                        $scope.error = null;
                };

                $scope.onVideoError = function (err) {
                    if(typeof err != "undefined")
                        $scope.error = err.message + '(' + err.name + ')';
                };

                $scope.takeScreenshot = function () {
                    var picCanvas = document.createElement('canvas');
                    var width = $scope.video.width;
                    var height = $scope.video.height;

                    picCanvas.width = width;
                    picCanvas.height = height;
                    var ctx = picCanvas.getContext("2d");
                    ctx.drawImage($scope.video, 0, 0, width, height);
                    var imageData = ctx.getImageData(0, 0, width, height);
                    document.querySelector('#clientSnapshot').getContext("2d").putImageData(imageData, 0, 0);
                    $scope.picture = picCanvas.toDataURL();
                };
                $scope.uploadscreenshot = function () {
                    if($scope.picture != null) {
                        http({
                            method: 'POST',
                            url: $rootScope.hostUrl + API_VERSION + '/tasks/' + scope.taskId + '/images',
                            data: $scope.picture
                        }).then(function (imageData) {
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            scope.init();
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                    scope.init();
                };
                $scope.reset = function () {
                    $scope.picture = null;
                }
            };
        }
    });
    mifosX.ng.application.controller('takepictureActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$modal', '$location', 'dateFilter','$http', '$routeParams', '$upload', '$rootScope', mifosX.controllers.takepictureActivityController]).run(function ($log) {
        $log.info("takepictureActivityController initialized");
    });
}(mifosX.controllers || {}));