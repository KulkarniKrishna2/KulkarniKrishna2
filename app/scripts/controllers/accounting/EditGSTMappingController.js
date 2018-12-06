(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGSTMappingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.entityFormData = {
                locale: scope.optlang.code
            };
            resourceFactory.taxconfigurationsResourcetemplate.get({ entityType: routeParams.entityType }, function (data) {
                scope.taxGroupOptions = data.taxGroupDatas;
            });
            resourceFactory.taxconfigurationsResource.get({ entityType: routeParams.entityType, entityId: routeParams.entityId }, function (data) {
                scope.entity = data;
            });

            scope.submit = function () {
                scope.entityFormData.entityType = routeParams.entityType;
                scope.entityFormData.entityId = scope.entity.id;
                scope.entityFormData.percentage = scope.entity.percentage;
                scope.entityFormData.taxGroupId = scope.entity.taxGroupId;
                resourceFactory.taxconfigurationsResource.update({ entityType: routeParams.entityType, entityId: routeParams.entityId }, scope.entityFormData, function (data) {
                    location.path('/gstmapping');
                });
            };
        }
    });
    mifosX.ng.application.controller('EditGSTMappingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.EditGSTMappingController]).run(function ($log) {
        $log.info("EditGSTMappingController initialized");
    });
}(mifosX.controllers || {}));