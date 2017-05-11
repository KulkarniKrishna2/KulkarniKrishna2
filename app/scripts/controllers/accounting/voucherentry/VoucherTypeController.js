(function (module) {
    mifosX.controllers = _.extend(module, {
        VoucherTypeController: function (scope, resourceFactory, location, dateFilter, routeParams, localStorageService) {

            resourceFactory.voucherTemplateResource.get(function (data) {
                scope.voucherTypeOptions = data.templateData.voucherTypeOptions;
            });

            scope.submit = function () {
                location.path('/accounting/voucherentry/' + scope.voucherTypeId);
            };
        }

    });
    mifosX.ng.application.controller('VoucherTypeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'localStorageService', mifosX.controllers.VoucherTypeController]).run(function ($log) {
        $log.info("VoucherTypeController initialized");
    });
}(mifosX.controllers || {}));