(function (module) {
    mifosX.controllers = _.extend(module, {
        criteriacheckActivityController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {

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
    mifosX.ng.application.controller('criteriacheckActivityController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.criteriacheckActivityController]).run(function ($log) {
        $log.info("criteriacheckActivityController initialized");
    });
}(mifosX.controllers || {}));
