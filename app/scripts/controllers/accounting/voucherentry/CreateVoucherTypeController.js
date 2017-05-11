(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateVoucherTypeController: function (scope, routeParams, resourceFactory) {
            scope.voucherTypeId = routeParams.voucherTypeId;
            /**
             * To find the Voucher Type and Voucher Code
             * Based on the Voucher Type Id
             */
            resourceFactory.voucherTemplateResource.get(function (data) {
                scope.voucherTypeOptions = data.templateData.voucherTypeOptions;
                for (var i in scope.voucherTypeOptions) {
                    if (scope.voucherTypeOptions[i].id == scope.voucherTypeId) {
                        scope.voucherCode = scope.voucherTypeOptions[i].code;
                        scope.voucherType = scope.voucherTypeOptions[i].value;
                        formSettingBasedOnTheVoucherType();
                        break;
                    }
                }
            });

            function formSettingBasedOnTheVoucherType() {
                /**
                 * Based on the voucher type enable Create Form
                 * @type {[*]}
                 */
                var commonCreateFormForVoucherTypes = ["cashpayment", "cashreceipt", "bankpayment", "bankreceipt", "jventry", "contraentry"];
                scope.isCommonCreateForm = false;
                if (commonCreateFormForVoucherTypes.indexOf(scope.voucherCode) >= 0) {
                    scope.isCommonCreateForm = true;
                }

                /**
                 * Based on the voucher type Capture Instrument Information
                 */
                var captureInstrumentInformationForVoucherTypes = ["bankpayment", "bankreceipt", "contraentry", "interbranchbanktransfer"];
                scope.isCaptureInstrumentInformation = false;
                if (captureInstrumentInformationForVoucherTypes.indexOf(scope.voucherCode) >= 0) {
                    scope.isCaptureInstrumentInformation = true;
                }

                /**
                 * Based on the voucher type enable upload documents
                 */
                var hideUploadDocumentsForVoucherTypes = ["jventry", "contraentry", "interbranchcashtransfer", "interbranchbanktransfer"];
                scope.isUploadDocuments = true;
                if (hideUploadDocumentsForVoucherTypes.indexOf(scope.voucherCode) >= 0) {
                    scope.isUploadDocuments = false;
                }
            }
        }
    });
    mifosX.ng.application.controller('CreateVoucherTypeController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.CreateVoucherTypeController]).run(function ($log) {
        $log.info("CreateVoucherTypeController initialized");
    });
}(mifosX.controllers || {}));