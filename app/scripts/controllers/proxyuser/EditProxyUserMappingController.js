(function(module) {
    mifosX.controllers = _.extend(module, {
        EditProxyUserMappingController: function(scope, resourceFactory, location, dateFilter, routeParams) {
            scope.users = [];
            scope.formData = {};
            scope.first = {};
            scope.first.fromDate = new Date();
            scope.first.toDate = new Date();

            scope.proxyUserMappingId = routeParams.id;

            resourceFactory.proxyUserMappingResource.get({proxyUserMappingId: routeParams.id, template: 'true'}, function(data) {
                scope.users = data.userOptions;
                scope.formData.proxyUserId = data.proxyUser.id;
                scope.formData.targetUserId = data.targetUser.id;

                var fromDate = dateFilter(data.fromDate, scope.df);
                scope.first.fromDate = new Date(fromDate);

                var toDate = dateFilter(data.toDate, scope.df);
                scope.first.toDate = new Date(toDate);

                scope.users = data.userOptions;
            });

            scope.submit = function() {

                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;

                var fromDate = dateFilter(scope.first.fromDate, scope.df);
                scope.formData.fromDate = fromDate;

                var toDate = dateFilter(scope.first.toDate, scope.df);
                scope.formData.toDate = toDate;

                resourceFactory.proxyUserMappingResource.update({proxyUserMappingId: scope.proxyUserMappingId}, scope.formData, function(data) {
                    location.path('/admin/viewproxyusermapping/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditProxyUserMappingController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.EditProxyUserMappingController]).run(function($log) {
        $log.info("EditProxyUserMappingController initialized");
    });
}(mifosX.controllers || {}));