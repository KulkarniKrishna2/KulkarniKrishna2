(function (module) {
    mifosX.controllers = _.extend(module, {
        ListLoanUtilizationCheckController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {

            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;

            resourceFactory.groupLoanUtilizationCheck.getAll({groupId: scope.entityId}, function (data) {
                scope.loanUtilizationChecks = data;
            });

            scope.viewLoanUtilizationCheck = function(loanId, utilizationCheckId){
                location.path("/"+scope.entityType+"/"+scope.entityId+"/loans/"+loanId+"/viewloanutilization/"+utilizationCheckId);
            }


        }
    });
    mifosX.ng.application.controller('ListLoanUtilizationCheckController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.ListLoanUtilizationCheckController]).run(function ($log) {
        $log.info("ListLoanUtilizationCheckController initialized");
    });

}(mifosX.controllers || {}));