(function (module) {
    mifosX.controllers = _.extend(module, {
        ReactivateUserController: function (scope, resourceFactory, routeParams, commonUtilService, location) {
            scope.formData = {};
            resourceFactory.deactivatedUserListResource.get({ userId: routeParams.id }, function (data) {
                scope.formData = data;
            });
            scope.submit = function () {
                var activateFormdata = {
                    username: scope.formData.username,
                    firstname: scope.formData.firstname,
                    lastname: scope.formData.lastname,
                    email: scope.formData.email,
                    sendPasswordToEmail: scope.formData.sendPasswordToEmail
                };
                if (scope.formData.password) {
                    activateFormdata.password = commonUtilService.encrypt(scope.formData.password);
                }
                if (scope.formData.repeatPassword) {
                    activateFormdata.repeatPassword = commonUtilService.encrypt(scope.formData.repeatPassword);
                }
                resourceFactory.userListResource.post({ userId: routeParams.id, command: 'reactivate' }, activateFormdata, function (data) {
                    location.path('/users');
                });
            }
        }
    });
    mifosX.ng.application.controller('ReactivateUserController', ['$scope', 'ResourceFactory', '$routeParams', 'CommonUtilService', '$location', mifosX.controllers.ReactivateUserController]).run(function ($log) {
        $log.info("ReactivateUserController initialized");
    });
}(mifosX.controllers || {}));