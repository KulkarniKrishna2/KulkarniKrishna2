(function (module) {
    mifosX.controllers = _.extend(module, {
        OperationalAccountingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.tabs = { tab1: true, tab2: false, tab3: false }
            scope.index = 0;
            scope.disbursemtsTotal = 0;
            scope.processingFeeTotal = 0;
            scope.singleInsuranceTotal = 0;
            scope.doubleInsuranceTotal = 0;
            scope.repaymentsTotal = 0;
            scope.isProcessingFee = false;
            scope.isSingleInsurance = false;
            scope.isDoubleInsurance = false;
            scope.toTime;
            scope.next = function () {
                scope.index++;
                if (scope.index == 1) {
                    scope.tabs = { tab1: false, tab2: true, tab3: false }
                }
                if (scope.index == 2) {
                    scope.tabs = { tab1: false, tab2: false, tab3: true }
                }
            }
            scope.previous = function () {
                scope.index--;
                if (scope.index == 0) {
                    scope.tabs = { tab1: true, tab2: false, tab3: false }
                }
                if (scope.index == 1) {
                    scope.tabs = { tab1: false, tab2: true, tab3: false }
                }
            }
            resourceFactory.batchAccountingResource.get(function (data) {
                scope.officeName = data.officeName
                scope.toTime = data.toTime
                scope.fromTime = data.fromTime;
                scope.disbursements = data.disbursements
                scope.disbursementCharges = data.disbursementCharges
                scope.repayments = data.repayments;

                for (var i = 0; i < scope.disbursements.length; i++) {
                    for (var j = 0; j < scope.disbursements[i].details.length; j++) {
                        scope.disbursemtsTotal = scope.disbursemtsTotal + scope.disbursements[i].details[j].amount;
                    }
                }
                for (var i = 0; i < scope.disbursementCharges.length; i++) {
                    for (var j = 0; j < scope.disbursementCharges[i].details.length; j++) {
                        if (scope.disbursementCharges[i].chargeType == "PROCESSING_FEES") {
                            scope.isProcessingFee = true;
                            scope.processingFeeTotal = scope.processingFeeTotal + scope.disbursementCharges[i].details[j].amount;
                        }
                        else if (scope.disbursementCharges[i].chargeType == "SINGLE_INSURANCE_CHARGES") {
                            scope.isSingleInsurance = true;
                            scope.singleInsuranceTotal = scope.singleInsuranceTotal + scope.disbursementCharges[i].details[j].amount;
                        }
                        else if (scope.disbursementCharges[i].chargeType == "DOUBLE_INSURANCE_CHARGES") {
                            scope.isDoubleInsurance = true;
                            scope.doubleInsuranceTotal = scope.doubleInsuranceTotal + scope.disbursementCharges[i].details[j].amount;
                        }
                    }
                }
                for (var i = 0; i < scope.repayments.length; i++) {
                    for (var j = 0; j < scope.repayments[i].details.length; j++) {
                        scope.repaymentsTotal = scope.repaymentsTotal + scope.repayments[i].details[j].amount;
                    }
                }
            });
            scope.submit = function () {
                scope.formData = {
                    locale: scope.optlang.code,
                    time: scope.toTime,
                    dateTimeFormat: "yyyy-MM-dd HH:mm:ss"
                };
                resourceFactory.batchAccountingResource.save(scope.formData, function (data) {
                });
            }


        }


    });
    mifosX.ng.application.controller('OperationalAccountingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.OperationalAccountingController]).run(function ($log) {
        $log.info("OperationalAccountingController initialized");
    });
}(mifosX.controllers || {}));
