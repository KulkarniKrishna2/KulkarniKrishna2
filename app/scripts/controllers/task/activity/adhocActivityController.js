(function (module) {
    mifosX.controllers = _.extend(module, {
        adhocActivityController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {

            function initTask(){
                scope.title = scope.taskconfig['title'];
                scope.body = scope.taskconfig['body'];
            };

            initTask();

            scope.submit = function () {
                scope.$emit("activityDone",{});
            }
        }
    });
    mifosX.ng.application.controller('adhocActivityController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.adhocActivityController]).run(function ($log) {
        $log.info("adhocActivityController initialized");
    });
}(mifosX.controllers || {}));
