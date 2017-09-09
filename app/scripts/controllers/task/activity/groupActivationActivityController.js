(function (module) {
    mifosX.controllers = _.extend(module, {
        groupActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.restrictDate = new Date();
            scope.groupId = scope.taskconfig['groupId'];
            scope.formData = {};
            scope.submit = function () {
                var reqDate = dateFilter(scope.firstdate, scope.df);
                scope.formData.activatedOnDate = reqDate;
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;

                resourceFactory.groupResource.save({groupId: scope.groupId, command: 'activate'}, scope.formData, function (data) {
                    location.path('/viewgroup/' + scope.groupId);
                });
            };
        }

    });
    mifosX.ng.application.controller('groupActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.groupActivationActivityController]).run(function ($log) {
        $log.info("groupActivationActivityController initialized");
    });
}(mifosX.controllers || {}));