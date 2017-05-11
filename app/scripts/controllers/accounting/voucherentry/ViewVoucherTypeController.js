(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewVoucherTypeController: function (scope, routeParams, resourceFactory, location) {
            scope.voucherCode = routeParams.voucherCode;
            scope.voucherId = routeParams.voucherId;

            resourceFactory.voucherTemplateResource.get(function (data) {
                scope.voucherTypeOptions = data.templateData.voucherTypeOptions;
                for (var i in scope.voucherTypeOptions) {
                    if (scope.voucherTypeOptions[i].code == scope.voucherCode) {
                        scope.voucherTypeId = scope.voucherTypeOptions[i].id;
                        scope.voucherType = scope.voucherTypeOptions[i].value;
                        formSettingBasedOnTheVoucherType();
                        break;
                    }
                }
            });

            function formSettingBasedOnTheVoucherType() {
                scope.isDisplayView = true;

                /**
                 * Based on the voucher type enable upload documents
                 */
                scope.isUploadDocuments = true;
                var hideUploadDocumentsForVoucherTypes = ["jventry", "contraentry", "interbranchcashtransfer", "interbranchbanktransfer"];
                if (hideUploadDocumentsForVoucherTypes.indexOf(scope.voucherCode) >= 0) {
                    scope.isUploadDocuments = false;
                }
            };
        }
    });
    mifosX.ng.application.controller('ViewVoucherTypeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', mifosX.controllers.ViewVoucherTypeController]).run(function ($log) {
        $log.info("ViewVoucherTypeController initialized");
    });
}(mifosX.controllers || {}));