(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewReportController: function (scope, routeParams, resourceFactory, location, $modal) {
            scope.reportCategories = '' ;
            resourceFactory.reportsResource.getReportDetails({id: routeParams.id}, function (data) {
                scope.report = data;
                scope.noncoreReport = data.coreReport == true ? false : true;
                if(scope.report.selectedCategories) {
                    for(var i = 0 ; i < scope.report.selectedCategories.length; i++) {
                        if(i< scope.report.selectedCategories.length && i != 0) {
                            scope.reportCategories = scope.reportCategories.concat(',') ;
                        }
                        scope.reportCategories = scope.reportCategories.concat(scope.report.selectedCategories[i].name) ;
                    }
                }
            });
            scope.deletereport = function () {
                $modal.open({
                    templateUrl: 'deletenoncorereport.html',
                    controller: NoncoreReportDeleteCtrl
                });
            };
            var NoncoreReportDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.reportsResource.delete({id: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/reports');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.activateReport = function () {
                resourceFactory.reportsResourceCommands.activate({id: routeParams.id}, {}, function (data) {
                    scope.report.isActive = true ;
                });
            }
            scope.deActivateReport = function () {
                resourceFactory.reportsResourceCommands.deActivate({id: routeParams.id}, {}, function (data) {
                    scope.report.isActive = false ;
                });
            }
        }
    });
    mifosX.ng.application.controller('ViewReportController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', mifosX.controllers.ViewReportController]).run(function ($log) {
        $log.info("ViewReportController initialized");
    });
}(mifosX.controllers || {}));
