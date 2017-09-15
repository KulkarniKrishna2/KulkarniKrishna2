(function (module) {
    mifosX.controllers = _.extend(module, {
        UserActivityController: function (scope, resourceFactory, location, route) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.users = [];
            scope.isCreateuser = false;
            resourceFactory.userListResource.getAllUsers(function (data) {
                scope.users = data;
            });
            scope.showCreateUser = function(){
            	scope.isCreateuser=true
            };

            scope.$on('submitPerformed', function (event, data) {
                route.reload();
            });
            scope.$on('cancelPerformed', function (event, data) {
                scope.isCreateuser = false;
            });
        }
    });
    mifosX.ng.application.controller('UserActivityController', ['$scope', 'ResourceFactory', '$location', '$route', mifosX.controllers.UserActivityController]).run(function ($log) {
        $log.info("UserActivityController initialized");
    });
}(mifosX.controllers || {}));