(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFinancialOfficeMappingController: function (scope, routeParams, resourceFactory, location, route, $modal) {
            scope.mappingId = routeParams.mappingId;
            scope.id = routeParams.id;
            scope.data = {};
            scope.financialActivityData = "";

            scope.getData = function(){
                resourceFactory.financialOfficeMappingResource.get({mappingId:scope.mappingId,id:scope.id},function (data) {
                    scope.data = data;
                    scope.financialActivityData = data.financialActivityData;
                    
                });
            }

            scope.getData();            
            
            scope.routeTo = function (){
                location.path('/viewfinancialactivitymapping/' + scope.mappingId);
            };

            scope.update = function (){
                location.path('/updatefinancialofficemapping/' + scope.mappingId+"/officemapping/"+scope.id);
            };

            scope.deleteMapping = function () {
                $modal.open({
                    templateUrl: 'deleteofficemapping.html',
                    controller: DeleteCtrl
                });
            };


            var DeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.financialOfficeMappingResource.delete({mappingId:scope.mappingId,id:scope.id},function (data) {
                        scope.routeTo();
                        $modalInstance.close('delete');
                    });

                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });
    mifosX.ng.application.controller('ViewFinancialOfficeMappingController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$modal', mifosX.controllers.ViewFinancialOfficeMappingController]).run(function ($log) {
        $log.info("ViewFinancialOfficeMappingController initialized");
    });
}(mifosX.controllers || {}));
