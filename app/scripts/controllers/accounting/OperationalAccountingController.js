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
            scope.crSavingsTotal = 0;
            scope.drSavingsTotal = 0;
            scope.toTime;
            scope.crOverDueRepaymentsTotal = 0;
            scope.drOverDueRepaymentsTotal = 0;
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
            resourceFactory.batchAccountingResource.get(function (data) {
                if (data.disbursementAndRepaymentsData && data.disbursementAndRepaymentsData.length > 0) {
                    scope.officeName = data.disbursementAndRepaymentsData[0].officeName;
                    scope.toTime = data.disbursementAndRepaymentsData[0].toTime;
                    scope.fromTime = data.disbursementAndRepaymentsData[0].fromTime;
                    scope.disbursements = data.disbursementAndRepaymentsData[0].disbursements
                    scope.disbursementCharges = data.disbursementAndRepaymentsData[0].disbursementCharges
                    scope.repayments = data.disbursementAndRepaymentsData[0].repayments;
                    scope.overDueRepayments = data.disbursementAndRepaymentsData[0].overDueRepayments;
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
                    for (var i = 0; i < scope.overDueRepayments.length; i++) {
                        for (var j = 0; j < scope.overDueRepayments[i].details.length; j++) {
                            if (scope.overDueRepayments[i].details[j].type.value === 'CREDIT') {
                                scope.crOverDueRepaymentsTotal += scope.overDueRepayments[i].details[j].amount;
                            } else {
                                scope.drOverDueRepaymentsTotal += scope.overDueRepayments[i].details[j].amount;
                            }
                        }
                    }
                }
                if (data.savingsDetailsData && data.savingsDetailsData.length > 0) {
                    scope.savingsOfficeName = data.savingsDetailsData[0].officeName;
                    scope.savingsToTime = data.savingsDetailsData[0].toTime;
                    scope.savingsFromTime = data.savingsDetailsData[0].fromTime;
                    scope.savings = data.savingsDetailsData[0].savings;
                    for (var i = 0; i < scope.savings.length; i++) {
                        for (var j = 0; j < scope.savings[i].details.length; j++) {
                            if (scope.savings[i].details[j].type.value === 'CREDIT') {
                                scope.crSavingsTotal += scope.savings[i].details[j].amount;
                            } else {
                                scope.drSavingsTotal += scope.savings[i].details[j].amount;
                            }
                        }
                    }
                }
            });
            scope.submit = function () {
                if (scope.toTime || scope.savingsToTime) {
                    var time = scope.toTime || scope.savingsToTime;
                    scope.formData = {
                        locale: scope.optlang.code,
                        time: time,
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