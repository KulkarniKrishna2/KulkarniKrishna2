(function(module) {
    mifosX.controllers = _.extend(module, {
        ViewProxyUserMappingsController: function(scope, resourceFactory, location, dateFilter, routeParams) {
            scope.users = [];
            scope.formData = {};
            scope.first = {};
            scope.first.fromDate = new Date();
            scope.first.toDate = new Date();

            scope.proxyUserMappingId = routeParams.id;

            resourceFactory.proxyUserMappingResource.get({proxyUserMappingId: routeParams.id, template: 'true'}, function(data) {
                scope.proxyUserMapping = data;
                scope.formData.proxyUserId = data.proxyUser.id;
                scope.formData.targetUserId = data.targetUser.id;

                var fromDate = dateFilter(data.fromDate, scope.df);
                scope.first.fromDate = new Date(fromDate);

                var toDate = dateFilter(data.toDate, scope.df);
                scope.first.toDate = toDate;

                scope.users = data.userOptions;
            });
        }
    });
    mifosX.ng.application.controller('ViewProxyUserMappingsController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.ViewProxyUserMappingsController]).run(function($log) {
        $log.info("ViewProxyUserMappingsController initialized");
    });
}(mifosX.controllers || {}));