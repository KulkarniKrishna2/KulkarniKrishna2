(function (module) {
    mifosX.controllers = _.extend(module, {
        OperationalAccountingController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal) {
            scope.tabs = {
                tab1: true,
                tab2: false,
                tab3: false
            }
            scope.index = 0;
            scope.crDisbursemtsTotal = 0;
            scope.drDisbursemtsTotal = 0;
            scope.crProcessingFeeTotal = 0;
            scope.drProcessingFeeTotal = 0;
            scope.crSingleInsuranceTotal = 0;
            scope.drSingleInsuranceTotal = 0;
            scope.crDoubleInsuranceTotal = 0;
            scope.drDoubleInsuranceTotal = 0;
            scope.crRepaymentsTotal = 0;
            scope.drRepaymentsTotal = 0;
            scope.isProcessingFee = false;
            scope.isSingleInsurance = false;
            scope.isDoubleInsurance = false;
            scope.toTime;
            scope.next = function () {
                scope.index++;
                if (scope.index == 1) {
                    scope.tabs = {
                        tab1: false,
                        tab2: true,
                        tab3: false
                    }
                }
                if (scope.index == 2) {
                    scope.tabs = {
                        tab1: false,
                        tab2: false,
                        tab3: true
                    }
                }
            }
            scope.previous = function () {
                scope.index--;
                if (scope.index == 0) {
                    scope.tabs = {
                        tab1: true,
                        tab2: false,
                        tab3: false
                    }
                }
                if (scope.index == 1) {
                    scope.tabs = {
                        tab1: false,
                        tab2: true,
                        tab3: false
                    }
                }
            }
            resourceFactory.batchAccountingResource.query(function (dataArray) {
                if (dataArray.length == 0) {
                    return;
                }
                var data = dataArray[0];
                scope.officeName = data.officeName
                scope.toTime = data.toTime
                scope.fromTime = data.fromTime;
                scope.disbursements = data.disbursements
                scope.disbursementCharges = data.disbursementCharges
                scope.repayments = data.repayments;

                for (var i = 0; i < scope.disbursements.length; i++) {
                    for (var j = 0; j < scope.disbursements[i].details.length; j++) {
                        if (scope.disbursements[i].details[j].type.value === 'CREDIT') {
                            scope.crDisbursemtsTotal += scope.disbursements[i].details[j].amount;
                        } else {
                            scope.drDisbursemtsTotal += scope.disbursements[i].details[j].amount;
                        }
                    }
                }
                for (var i = 0; i < scope.disbursementCharges.length; i++) {
                    for (var j = 0; j < scope.disbursementCharges[i].details.length; j++) {
                        if (scope.disbursementCharges[i].chargeType == "PROCESSING_FEES") {
                            scope.isProcessingFee = true;
                            if (scope.disbursementCharges[i].details[j].type.value === 'CREDIT') {
                                scope.crProcessingFeeTotal += scope.disbursementCharges[i].details[j].amount;
                            } else {
                                scope.drProcessingFeeTotal += scope.disbursementCharges[i].details[j].amount;
                            }
                        } else if (scope.disbursementCharges[i].chargeType == "SINGLE_INSURANCE_CHARGES") {
                            scope.isSingleInsurance = true;
                            if (scope.disbursementCharges[i].details[j].type.value === 'CREDIT') {
                                scope.crSingleInsuranceTotal += scope.disbursementCharges[i].details[j].amount;
                            } else {
                                scope.drSingleInsuranceTotal += scope.disbursementCharges[i].details[j].amount;
                            }
                        } else if (scope.disbursementCharges[i].chargeType == "DOUBLE_INSURANCE_CHARGES") {
                            scope.isDoubleInsurance = true;
                            if (scope.disbursementCharges[i].details[j].type.value === 'CREDIT') {
                                scope.crDoubleInsuranceTotal += scope.disbursementCharges[i].details[j].amount;
                            } else {
                                scope.drDoubleInsuranceTotal += scope.disbursementCharges[i].details[j].amount;
                            }
                        }
                    }
                }
                for (var i = 0; i < scope.repayments.length; i++) {
                    for (var j = 0; j < scope.repayments[i].details.length; j++) {
                        if (scope.repayments[i].details[j].type.value === 'CREDIT') {
                            scope.crRepaymentsTotal += scope.repayments[i].details[j].amount;
                        } else {
                            scope.drRepaymentsTotal += scope.repayments[i].details[j].amount;
                        }
                    }
                }
            });
            scope.submit = function () {
                if (scope.toTime) {
                    scope.formData = {
                        locale: scope.optlang.code,
                        time: scope.toTime,
                        timeFormat: "yyyy-MM-dd HH:mm:ss"
                    };
                    resourceFactory.batchAccountingResource.save(scope.formData, function (data) {
                        location.path('/bc');
                    });
                } else {
                    location.path('/bc');
                }
            }
        }
    });
    mifosX.ng.application.controller('OperationalAccountingController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', mifosX.controllers.OperationalAccountingController]).run(function ($log) {
        $log.info("OperationalAccountingController initialized");
    });
}(mifosX.controllers || {}));