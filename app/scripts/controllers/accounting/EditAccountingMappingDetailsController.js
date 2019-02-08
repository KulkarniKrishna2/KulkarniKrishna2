(function (module) {
    mifosX.controllers = _.extend(module, {
        EditAccountingMappingDetailsController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.formData = {
                locale: scope.optlang.code,
            };
            scope.mappingId = routeParams.mappingId;
            scope.displayPaymentType = false;
            var queryParams = { accStateSubTypeId: routeParams.subTypeId, template: true };
            resourceFactory.AdvancedAccountingMappingDetails.get(queryParams, { accountingMappingId: routeParams.mappingId, accountingStateId: routeParams.accStateId }, function (data) {
                scope.bcAccountingTypeOptions = data.templateData.bcAccountingTypeOptions;
                scope.paymentTypeOptions = data.templateData.paymentTypeOptions;
                scope.accStateMappingDetailsId = data.accStateMappingDetailsId;
                scope.formData.accStateId = data.bcAccTypeEnum.id;
                if (data.paymentType) {
                    scope.formData.accStateSubTypeId = data.paymentType.id;
                }
                scope.isPaymentType(data.bcAccTypeEnum.id);
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
                resourceFactory.AdvancedAccountingMappingDetails.update({ accountingMappingId: scope.accStateMappingDetailsId }, scope.formData, function (data) {
                    location.path('/viewaccountingmappingsdetails/' + routeParams.mappingId);
                });
            }
        }
    });
    mifosX.ng.application.controller('EditAccountingMappingDetailsController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.EditAccountingMappingDetailsController]).run(function ($log) {
        $log.info("EditAccountingMappingDetailsController initialized");
    });
}(mifosX.controllers || {}));
