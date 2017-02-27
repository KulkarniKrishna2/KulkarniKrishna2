(function (module) {
    mifosX.controllers = _.extend(module, {
        defaultActivityController: function (scope) {
            scope.$on('preTaskAction',function (event,data) {
                scope.doPreTaskActionStep(data.actionName);
            });
            scope.doPreTaskActionStep = function(actionName){
                scope.doActionAndRefresh(actionName);
            };
            scope.$on('postTaskAction',function (event,data) {
            });
        }
    });
    mifosX.ng.application.controller('defaultActivityController', ['$scope', mifosX.controllers.defaultActivityController]).run(function ($log) {
        $log.info("defaultActivityController initialized");
    });
}(mifosX.controllers || {}));
