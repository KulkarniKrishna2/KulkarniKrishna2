(function (module) {
    mifosX.controllers = _.extend(module, {
        criteriacheckActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){

            };

            initTask();

            scope.submit = function () {
                scope.activityDone();
            };

            scope.runCriteriaCheck = function(){
                scope.taskCriteriaCheck();
            };
        }
    });
    mifosX.ng.application.controller('criteriacheckActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.criteriacheckActivityController]).run(function ($log) {
        $log.info("criteriacheckActivityController initialized");
    });
}(mifosX.controllers || {}));
