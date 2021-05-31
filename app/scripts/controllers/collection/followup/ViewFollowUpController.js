(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFollowUpController: function (scope, resourceFactory, location, dateFilter, http, routeParams,$modal) {
            scope.urlParam = location.search();
            scope.officeId = scope.urlParam.officeId;
            scope.staffId = scope.urlParam.staffId;
            scope.entityTypeId = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.followUpId = routeParams.followUpId;
            scope.followUpData =[];
            scope.reportData = [];
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            resourceFactory.followUpResource.get({officeId:scope.officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,followUpId:scope.followUpId}, function (data) {
                scope.followUpData = data;
            });

            scope.editfollowup = function(){
                
                 location.path('/collectionfollowup/'+scope.entityTypeId+'/'+scope.entityId+'/editfollowup/'+scope.followUpId);
            };
            scope.deletefollowup = function (id) {
                $modal.open({
                    templateUrl: 'deletefollowup.html',
                    controller: FollowUpDeleteCtrl,
                    resolve: {
                        followUpid: function () {
                            return id;
                        }
                    }
                });
            };

            var FollowUpDeleteCtrl = function ($scope, $modalInstance, followUpid) {
                $scope.delete = function () {
                    resourceFactory.followUpResource.delete({officeId:scope.officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,followUpId:followUpid}, {}, function (data) {
                        $modalInstance.close('delete');
                        //route.reload();
                        location.path('/collectionfollowup/'+scope.entityTypeId+'/'+scope.entityId).search({officeId:scope.officeId,staffId:scope.staffId});
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
               
        }
    });
    mifosX.ng.application.controller('ViewFollowUpController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams','$modal', mifosX.controllers.ViewFollowUpController]).run(function ($log) {
        $log.info("ViewFollowUpController initialized");
    });
}(mifosX.controllers || {}));