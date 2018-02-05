(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanUtilizationCheckController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter,API_VERSION, $upload, $rootScope, http) {
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.loanId = routeParams.loanId;
            scope.utilizationCheckId = routeParams.utilizationCheckId;
            scope.formData = {};
            scope.showUploadDocument = false;
            scope.lucEntityType = "loanUtilizationCheck";

            resourceFactory.loanUtilizationCheck.get({
                loanId: scope.loanId,
                utilizationCheckId: scope.utilizationCheckId
             }, function (data) {
                scope.luc = data;
                scope.luc.auditDoneOn = dateFilter(new Date(scope.luc.auditDoneOn),scope.df);
            });

            scope.init=function(){
                resourceFactory.imageResource.get({entityType:scope.lucEntityType,entityId:scope.utilizationCheckId},function (data) {
                        scope.images=data;
                });
            }

            scope.init();

            scope.showEdit = function() {
                location.path('/'+scope.entityType+'/'+scope.entityId+'/loans/'+scope.loanId+'/editloanutilization/'+scope.utilizationCheckId);
            }

            scope.uploadPic = function () {
                $modal.open({
                    templateUrl: 'uploadpic.html',
                    controller: UploadPicCtrl
                });
            };
            var UploadPicCtrl = function ($scope, $modalInstance) {
                $scope.onFileSelect = function ($files) {
                    scope.file = $files[0];
                };
                $scope.upload = function () {
                    if (scope.file) {
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/'+scope.lucEntityType+'/' + scope.utilizationCheckId + '/images',
                            data: {},
                            file: scope.file
                        }).then(function (imageData) {
                            // to fix IE not refreshing the model
                            if (!scope.$$phase) {
                                scope.$apply();
                            }
                            $modalInstance.close('upload');
                            route.reload();
                        });
                    }
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

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
                        url: $rootScope.hostUrl + API_VERSION + '/'+scope.lucEntityType+'/' + scope.utilizationCheckId + '/images/'+scope.imageId+'?maxHeight=400'
                    }).then(function (imageData) {
                        $scope.image = imageData.data;
                });
                $scope.cancel=function(){
                    $modalInstance.dismiss();
                    scope.init();
                }
            }
        }
    });
    mifosX.ng.application.controller('ViewLoanUtilizationCheckController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter','API_VERSION', '$upload', '$rootScope','$http',mifosX.controllers.ViewLoanUtilizationCheckController]).run(function ($log) {
        $log.info("ViewLoanUtilizationCheckController initialized");
    });

}(mifosX.controllers || {}));