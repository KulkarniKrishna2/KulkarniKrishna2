(function (module) {
    mifosX.controllers = _.extend(module, {
        villageActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.restrictDate = new Date();
            scope.villageId = scope.taskconfig['villageId'];
            scope.formData = {};
            scope.isVillageActive = false;

            scope.init = function(){
              resourceFactory.villageResource.get({
                    villageId: scope.villageId
                }, scope.formData, function (data) {
                    if(data.status.id == 300){
                      scope.isVillageActive = true;  
                    }
                    
                }); 
            };
            scope.init();
            scope.submit = function () {
                var reqDate = dateFilter(scope.firstdate, scope.df);
                scope.formData.activatedOnDate = reqDate;
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                resourceFactory.villageResource.save({
                    villageId: scope.villageId,
                    command: 'activate'
                }, scope.formData, function (data) {
                    scope.init();
                });
            };
            /*overriding doPreTaskActionStep method of defaultActivityController*/
            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                    if (!scope.isVillageActive) {
                        scope.setTaskActionExecutionError("error.message.village.activation.activity.cannot.complete.before.village.activation");
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
    mifosX.ng.application.controller('villageActivationActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.villageActivationActivityController]).run(function ($log) {
        $log.info("villageActivationActivityController initialized");
    });
}(mifosX.controllers || {}));