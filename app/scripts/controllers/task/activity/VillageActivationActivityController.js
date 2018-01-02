(function (module) {
    mifosX.controllers = _.extend(module, {
        villageActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.restrictDate = new Date();
            scope.villageId = scope.taskconfig['villageId'];
            scope.formData = {};
            scope.isActivate = false;
            scope.submit = function () {
                var reqDate = dateFilter(scope.firstdate, scope.df);
                scope.formData.activatedOnDate = reqDate;
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                resourceFactory.villageResource.save({
                    villageId: scope.villageId,
                    command: 'activate'
                }, scope.formData, function (data) {
                    //location.path('/viewvillage/' + data.resourceId);
                    scope.isActivate = true;
                });
            };
        }

    });
    mifosX.ng.application.controller('villageActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.villageActivationActivityController]).run(function ($log) {
        $log.info("villageActivationActivityController initialized");
    });
}(mifosX.controllers || {}));