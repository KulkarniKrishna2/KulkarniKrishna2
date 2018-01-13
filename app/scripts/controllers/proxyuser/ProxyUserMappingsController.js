(function(module) {
    mifosX.controllers = _.extend(module, {
        ProxyUserMappingsController: function(scope, resourceFactory, location) {
            scope.proxyUserMappings = [];
            resourceFactory.proxyUserMappingResource.query({}, function(data) {
                scope.proxyUserMappings = data;
            });
            scope.routeTo = function(id) {
                location.path('/admin/viewproxyusermapping/' + id);
            };
        }
    });
    mifosX.ng.application.controller('ProxyUserMappingsController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.ProxyUserMappingsController]).run(function($log) {
        $log.info("ProxyUserMappingsController initialized");
    });
}(mifosX.controllers || {}));