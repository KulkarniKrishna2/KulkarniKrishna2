(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateAccountingMappingDetailsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code,
            };
            scope.mappingId = routeParams.mappingId;
            scope.displayPaymentType = false;
            resourceFactory.AdvancedAccountingMappingDetailsTemplate.get(function (data) {
                scope.bcAccountingTypeOptions = data.bcAccountingTypeOptions;
                scope.paymentTypeOptions = data.paymentTypeOptions;
            });
            scope.isPaymentType = function (bcAccountingTypeId) {
                scope.displayPaymentType = false;
                for (var i in scope.bcAccountingTypeOptions) {
                    if (scope.bcAccountingTypeOptions[i].id == bcAccountingTypeId && scope.bcAccountingTypeOptions[i].code == 'bcAccountingType.paymentType') {
                        scope.displayPaymentType = true;
                    }
                }
            };
            scope.submit = function () {
                if (!scope.displayPaymentType) {
                    delete scope.formData.accStateSubTypeId;
                }
                scope.formData.accMappingId = routeParams.mappingId;
                resourceFactory.AdvancedAccountingMappingDetails.save(scope.formData, function (data) {
                    location.path('/viewaccountingmappingsdetails/' + routeParams.mappingId);
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateAccountingMappingDetailsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.CreateAccountingMappingDetailsController]).run(function ($log) {
        $log.info("CreateAccountingMappingDetailsController initialized");
    });
}(mifosX.controllers || {}));
