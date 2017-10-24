(function (module) {
    mifosX.controllers = _.extend(module, {
        groupActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.restrictDate = new Date();
            scope.groupId = scope.taskconfig['groupId'];
            scope.formData = {};

            scope.isActiveGroup = false;
            function populateDetails() {
                resourceFactory.groupResource.get({groupId: scope.groupId}, function (data) {
                    scope.isActiveGroup = data.active;
                });
            }
            populateDetails();
            scope.submit = function () {
                var reqDate = dateFilter(scope.firstdate, scope.df);
                scope.formData.activationDate = reqDate;
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;

                resourceFactory.groupResource.save({groupId: scope.groupId, command: 'activate'}, scope.formData, function (data) {
                    populateDetails();
                });
            };

            /*overriding doPreTaskActionStep method of defaultActivityController*/
            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.isActiveGroup) {
                        scope.setTaskActionExecutionError("error.message.group.activation.activity.cannot.complete.before.group.activation");
                        return;
                    } else {
                        scope.doActionAndRefresh(actionName);
                    }
                }

            };

        }

    });
    mifosX.ng.application.controller('groupActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.groupActivationActivityController]).run(function ($log) {
        $log.info("groupActivationActivityController initialized");
    });
}(mifosX.controllers || {}));