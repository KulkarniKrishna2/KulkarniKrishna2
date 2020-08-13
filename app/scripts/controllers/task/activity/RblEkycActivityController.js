(function (module) {
    mifosX.controllers = _.extend(module, {
        RblEkycActivityController: function ($controller, scope) {
            
            angular.extend(this, $controller('defaultActivityController', {
                $scope: scope
            }));
            function initTask() {
            };

            initTask();

            scope.doPreTaskActionStep = function (actionName) {
                if (actionName === 'activitycomplete') {
                        scope.setTaskActionExecutionError("lable.msg.task.can.perfomed.in.mobile.app");
                } else {
                    scope.doActionAndRefresh(actionName);
                }
            };
        }
    });
    mifosX.ng.application.controller('RblEkycActivityController', ['$controller','$scope', mifosX.controllers.RblEkycActivityController]).run(function ($log) {
        $log.info("RblEkycActivityController initialized");
    });
}(mifosX.controllers || {}));
