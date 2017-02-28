(function (module) {
    mifosX.controllers = _.extend(module, {
        clientActivationActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.restrictDate = new Date();
            scope.formData = {};
            scope.clientId = scope.taskconfig['clientId'];

            scope.submit=function() 
                {
                    var queryParams = {clientId: scope.clientId, command: 'forceActivate'};
                    var reqDate = dateFilter(scope.firstdate, scope.df);
                    scope.formData.activationDate = reqDate;
                    scope.formData.dateFormat = scope.df;
                    scope.formData.locale = scope.optlang.code;
                    resourceFactory.clientResource.save(queryParams,scope.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                };
            scope.cancel=function()
            {
                location.path('/clients/');
            };
        }

    });
    mifosX.ng.application.controller('clientActivationActivityController', ['$controller','$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.clientActivationActivityController]).run(function ($log) {
        $log.info("clientActivationActivityController initialized");
    });
}(mifosX.controllers || {}));