(function (module) {
    mifosX.controllers = _.extend(module, {
        GlimLoanProductMappingsController: function (scope, resourceFactory, location) {
            scope.glimLoanProductMappings = [];
            scope.getAllGlimLoanProductMappings = function () {
                resourceFactory.glimLoanProductMappingResource.getAll({}, function (data) {
                    scope.glimLoanProductMappings = data;
                });
            };
            scope.getAllGlimLoanProductMappings();
            scope.deleteGlimLoanProductMapping = function (id) {
                resourceFactory.glimLoanProductMappingResource.delete({ glimloanproductmappingId: id }, function (data) {
                    scope.getAllGlimLoanProductMappings();
                });
            };

            scope.routeTo = function (id) {
                var uri = '/editglimloanproductmapping/' + id;
                location.path(uri);
            }
        }
    });
    mifosX.ng.application.controller('GlimLoanProductMappingsController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.GlimLoanProductMappingsController]).run(function ($log) {
        $log.info("GlimLoanProductMappingsController initialized");
    });
}(mifosX.controllers || {}));