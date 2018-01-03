(function (module) {
    mifosX.controllers = _.extend(module, {
        officeActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.officeId = scope.taskconfig['officeId'];
            scope.formData = {};
            scope.isOfficeActive = false;

            resourceFactory.officeResource.get({officeId: scope.officeId}, function(data){
                scope.office = data;
                if(data.status.id == 300){
                    scope.isOfficeActive = true; 
                }
            });

            scope.submit = function () {
                resourceFactory.officeResource.save({ officeId: scope.officeId, command: 'activate' }, scope.formData, function (data) {
                    if(data.changes.status.id == 300){
                       scope.isOfficeActive = true; 
                    }
                    location.path('/offices');
                });
            };
            /*overriding doPreTaskActionStep method of defaultActivityController*/
            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.isOfficeActive) {
                        scope.setTaskActionExecutionError("error.message.office.activation.activity.cannot.complete.before.office.activation");
                        return;
                    } else {
                        scope.doActionAndRefresh(actionName);
                    }
                }
                else{
                    scope.doActionAndRefresh(actionName);
                }
            };
        }

    });
    mifosX.ng.application.controller('officeActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.officeActivationActivityController]).run(function ($log) {
        $log.info("officeActivationActivityController initialized");
    });
}(mifosX.controllers || {}));