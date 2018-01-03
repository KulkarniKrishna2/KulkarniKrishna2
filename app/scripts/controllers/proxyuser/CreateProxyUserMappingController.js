(function(module) {
    mifosX.controllers = _.extend(module, {
        CreateProxyUserMappingController: function(scope, resourceFactory, location, dateFilter) {
            scope.users = [];
            scope.formData = {};
            scope.first = {};
            scope.first.fromDate = new Date();
            scope.first.toDate = new Date();

            resourceFactory.proxyUserMappingTemplateResource.get({}, function(data) {
                scope.users = data.userOptions;
            });

            scope.submit = function() {

                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;

                var fromDate = dateFilter(scope.first.fromDate, scope.df);
                scope.formData.fromDate = fromDate;

                var toDate = dateFilter(scope.first.toDate, scope.df);
                scope.formData.toDate = toDate;

                resourceFactory.proxyUserMappingResource.save(scope.formData, function(data) {
                    location.path('/admin/viewproxyusermapping/' + data.resourceId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateProxyUserMappingController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateProxyUserMappingController]).run(function($log) {
        $log.info("CreateProxyUserMappingController initialized");
    });
}(mifosX.controllers || {}));