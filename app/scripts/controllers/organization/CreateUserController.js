(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateUserController: function (scope, resourceFactory, location, dateFilter, route) {

            scope.$on('submitPerformed', function (event, data) {
                location.path('/viewuser/' + data.resourceId);
            });

            scope.$on('cancelPerformed', function (event, data) {
                location.path('/users/');
            });
        }
    });
    mifosX.ng.application.controller('CreateUserController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$route', mifosX.controllers.CreateUserController]).run(function ($log) {
        $log.info("CreateUserController initialized");
    });
}(mifosX.controllers || {}));
