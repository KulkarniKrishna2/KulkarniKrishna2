(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanController: function (scope, resourceFactory, dateFilter) {
            scope.df = scope.df;
            scope.showLoanAccountForm = true;
            scope.scope = {};
            scope.editLoanAccountdata = {};
            scope.clientId = scope.loanAccountBasicData.clientId;
            scope.groupId = scope.groupId;
            scope.restrictDate = new Date();
            scope.loanAccountFormData = {};
            scope.temp = {};
            scope.chargeFormData = {}; //For charges
            scope.date = {};
            scope.loanAccountFormData.isSubsidyApplicable = false;
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.slabBasedCharge = "Slab Based";
            scope.flatCharge = "Flat";
            scope.upfrontFee = "Upfront Fee";
            scope.interestRatesListPerPeriod = [];
            scope.interestRatesListAvailable = false;
            scope.isCenter = false;
            scope.installmentAmountSlabChargeType = 1;
            scope.showIsDeferPaymentsForHalfTheLoanTerm = scope.response.uiDisplayConfigurations.loanAccount.isShowField.isDeferPaymentsForHalfTheLoanTerm;
            scope.isLoanPurposeRequired = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.loanPurposeId;
            var SLAB_BASED = 'slabBasedCharge';
            var UPFRONT_FEE = 'upfrontFee';
            scope.paymentModeOptions = [];
            scope.repaymentTypeOption = [];
            scope.disbursementTypeOption = [];
            scope.applicableOnRepayment = 1;
            scope.applicableOnDisbursement = 2;
            scope.canDisburseToGroupBankAccounts = false;
            scope.allowBankAccountsForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.allowDisbursalToGroupBankAccounts = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-disbursal');
            scope.parentGroups = [];
            scope.loanAccountData = scope.loanAccountBasicData;
            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }

            scope.date.first = new Date();//submittedOnDate
            scope.date.second = new Date();//expectedDisbursementDate
            scope.inparams = { resourceType: 'template', activeOnly: 'true' };
            scope.inparams.clientId = scope.clientId;
            scope.loanAccountFormData.clientId = scope.clientId;
            scope.inparams.groupId = scope.groupId;
            scope.loanAccountFormData.groupId = scope.groupId;
            scope.inparams.templateType = 'jlg';
            scope.inparams.staffInSelectedOfficeOnly = true;
            scope.inparams.productApplicableForLoanType = 2;
            scope.inparams.entityType = 1;
            scope.inparams.entityId = scope.clientId;
            scope.formData = {};
            scope.isEmiAmountEditable = true;
            scope.isLoanProductReadOnly = true;

            if (scope.response && scope.response.uiDisplayConfigurations.loanAccount) {

                scope.showExternalId = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.externalId;
                scope.extenalIdReadOnlyType = scope.response.uiDisplayConfigurations.loanAccount.isReadOnlyField.externalId;
                scope.showRepaymentFrequencyNthDayType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyNthDayType;
                scope.showRepaymentFrequencyDayOfWeekType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.repaymentFrequencyDayOfWeekType;
                scope.showBrokenPeriodType = !scope.response.uiDisplayConfigurations.loanAccount.isHiddenField.brokenPeriodMethodType;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                scope.response.uiDisplayConfigurations.workflow.isReadOnlyField) {
                scope.isLoanProductReadOnly = scope.response.uiDisplayConfigurations.workflow.isReadOnlyField.loanProduct;
            }

            resourceFactory.loanResource.get(scope.inparams, function (data) {
                scope.paymentModeOptions = data.paymentModeOptions;
                scope.products = data.productOptions;
                if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                    scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                    scope.interestRatesListAvailable = true;
                }
            });

            scope.previewClientLoanAccInfo = function (refreshLoanCharges) {
                if (_.isUndefined(refreshLoanCharges)) {
                    refreshLoanCharges = false;
                }
                scope.previewRepayment = false;
                for (var i in scope.loanaccountinfo.charges) {
                    if (scope.loanaccountinfo.charges[i].dueDate) {
                        if (scope.loanaccountinfo.charges[i].chargeTimeType.value == "Disbursement" ||
                            scope.loanaccountinfo.charges[i].chargeTimeType.value == "Tranche Disbursement") {
                            scope.loanaccountinfo.charges[i].dueDate = null;
                        } else {
                            scope.loanaccountinfo.charges[i].dueDate = new Date(scope.loanaccountinfo.charges[i].dueDate);
                        }

                    }
                    if (scope.loanaccountinfo.charges[i].chargeCalculationType.value == scope.slabBasedCharge) {
                        scope.loanaccountinfo.charges[i] = scope.updateChargeForSlab(scope.loanaccountinfo.charges[i]);
                    }
                }
                scope.charges = scope.loanaccountinfo.charges || [];
                if (refreshLoanCharges) {
                    scope.charges = [];
                }
                scope.productLoanCharges = scope.loanaccountinfo.product.charges || [];

                if (scope.productLoanCharges && scope.productLoanCharges.length > 0) {
                    for (var i in scope.productLoanCharges) {
                        if (scope.productLoanCharges[i].chargeData && !scope.productLoanCharges[i].chargeData.penalty) {
                            var isChargeAdded = false;
                            var loanChargeAmount = 0;
                            for (var j in scope.charges) {
                                if (scope.productLoanCharges[i].chargeData.id == scope.charges[j].chargeId) {
                                    scope.charges[j].isMandatory = scope.productLoanCharges[i].isMandatory;
                                    scope.charges[j].isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                                    isChargeAdded = true;
                                    loanChargeAmount = scope.charges[j].amountOrPercentage;
                                    break;
                                }
                            }

                            if ((refreshLoanCharges && scope.productLoanCharges[i].chargeData.penalty == false) || (isChargeAdded == false && scope.productLoanCharges[i].isMandatory == true)) {
                                var charge = scope.productLoanCharges[i].chargeData;
                                charge.chargeId = charge.id;
                                charge.id = null;
                                if (isChargeAdded) {
                                    charge.amountOrPercentage = loanChargeAmount;
                                } else {
                                    charge.amountOrPercentage = charge.amount;
                                }
                                charge.isMandatory = scope.productLoanCharges[i].isMandatory;
                                charge.isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                                if (charge.chargeCalculationType.value == scope.slabBasedCharge) {
                                    for (var i in charge.slabs) {
                                        var slabBasedValue = scope.getSlabBasedAmount(charge.slabs[i], scope.editLoanAccountdata.principal, scope.editLoanAccountdata.numberOfRepayments);
                                        if (slabBasedValue != null) {
                                            charge.amountOrPercentage = slabBasedValue;
                                        }
                                    }
                                }
                                scope.charges.push(charge);
                            }

                        }

                    }

                }

            }

            scope.inRange = function (min, max, value) {
                return (value >= min && value <= max);
            };

            scope.getSlabBasedAmount = function (slab, amount, repayment) {
                var slabValue = amount;
                if (slab.type.id != 1) {
                    slabValue = repayment;
                }
                var subSlabvalue = 0;
                if (slab.type.id != scope.installmentAmountSlabChargeType) {
                    subSlabvalue = amount;
                } else {
                    subSlabvalue = repayment;
                }
                //check for if value fall in slabs
                if (scope.inRange(slab.minValue, slab.maxValue, slabValue)) {
                    if (slab.subSlabs != undefined && slab.subSlabs.length > 0) {
                        for (var i in slab.subSlabs) {
                            //check for sub slabs range
                            if (scope.inRange(slab.subSlabs[i].minValue, slab.subSlabs[i].maxValue, subSlabvalue)) {
                                return slab.subSlabs[i].amount;
                            }
                        }

                    }
                    return slab.amount;
                }
                return null;

            };

            scope.updateSlabBasedCharges = function () {
                if (scope.editLoanAccountdata.principal != '' && scope.editLoanAccountdata.principal != undefined) {
                    for (var i in scope.charges) {
                        if (scope.charges[i].chargeCalculationType.value == scope.slabBasedCharge || scope.charges[i].isSlabBased) {
                            scope.charges[i] = scope.updateChargeForSlab(scope.charges[i]);
                        }
                    }
                }
            };

            scope.deleteCharge = function (index) {
                scope.charges.splice(index, 1);
            }

            scope.$watch('editLoanAccountdata.principal', function () {
                scope.updateSlabBasedCharges();
            });

            scope.updateChargeForSlab = function (data) {
                if (data.isSlabBased || data.chargeCalculationType.value == scope.slabBasedCharge) {
                    for (var j in data.slabs) {
                        var slabBasedValue = scope.getSlabBasedAmount(data.slabs[j], scope.editLoanAccountdata.principal, scope.editLoanAccountdata.numberOfRepayments);
                        if (slabBasedValue != null) {
                            data.amountOrPercentage = slabBasedValue;
                            return data;
                        } else {
                            data.amountOrPercentage = undefined;
                        }
                    }
                }
                return data;
            }

            scope.addCharge = function () {
                if (scope.chargeFormData.chargeId) {
                    resourceFactory.chargeResource.get({ chargeId: scope.chargeFormData.chargeId, template: 'true' }, function (data) {
                        data.chargeId = data.id;
                        data.id = null;
                        data.amountOrPercentage = data.amount;
                        data.isMandatory = false;
                        data = scope.updateChargeForSlab(data);
                        scope.charges.push(data);

                        scope.chargeFormData.chargeId = undefined;
                    });
                }
            }
            scope.isChargeAmountNonEditable = function (charge) {
                if ((charge.chargeCalculationType.value == scope.slabBasedCharge) || charge.isAmountNonEditable || charge.isSlabBased) {
                    return true;
                }
                return false;
            };
            //on loan product change
            scope.loanProductChange = function (loanProductId) {
                scope.inparams.productId = loanProductId;
                scope.interestRatesListPerPeriod = [];
                scope.interestRatesListAvailable = false;
                scope.charges = [];
                scope.inparams.fetchRDAccountOnly = scope.response.uiDisplayConfigurations.loanAccount.savingsAccountLinkage.reStrictLinkingToRDAccount;
                scope.editLoanAccountdata.loanPurposeId = null;
                scope.formData.loanPurposeGroupId = null;
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    var refreshLoanCharges = true;
                    scope.previewClientLoanAccInfo(refreshLoanCharges);
                    scope.updateSlabBasedCharges();
                    scope.canDisburseToGroupBankAccounts = data.product.allowDisbursementToGroupBankAccounts;
                    scope.productLoanCharges = data.product.charges || [];
                    if (scope.productLoanCharges && scope.productLoanCharges.length > 0) {
                        for (var i in scope.productLoanCharges) {
                            if (scope.productLoanCharges[i].chargeData) {
                                for (var j in scope.loanaccountinfo.chargeOptions) {
                                    if (scope.productLoanCharges[i].chargeData.id == scope.loanaccountinfo.chargeOptions[j].id) {
                                        var charge = scope.productLoanCharges[i].chargeData;
                                        charge.chargeId = charge.id;
                                        charge.isMandatory = scope.productLoanCharges[i].isMandatory;
                                        charge.isAmountNonEditable = scope.productLoanCharges[i].isAmountNonEditable;
                                        if ((charge.chargeCalculationType.value == scope.slabBasedCharge || charge.isSlabBased) && charge.slabs.length > 0) {
                                            for (var i in charge.slabs) {
                                                var slabBasedValue = scope.getSlabBasedAmount(charge.slabs[i], scope.loanAccountFormData.principal, scope.loanAccountFormData.numberOfRepayments);
                                                if (slabBasedValue != null) {
                                                    charge.amount = slabBasedValue;
                                                }
                                            }
                                        }
                                        scope.charges.push(charge);
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (scope.loanaccountinfo.loanOfficerOptions != undefined && scope.loanaccountinfo.loanOfficerOptions.length > 0 && !scope.loanAccountFormData.loanOfficerId) {
                        resourceFactory.clientResource.get({ clientId: scope.clientId }, function (data) {
                            if (data.staffId != null) {
                                for (var i in scope.loanaccountinfo.loanOfficerOptions) {
                                    if (scope.loanaccountinfo.loanOfficerOptions[i].id == data.staffId) {
                                        scope.loanAccountFormData.loanOfficerId = data.staffId;
                                        break;
                                    }
                                }
                            }
                        });
                    }

                    if (data.interestRatesListPerPeriod != undefined && data.interestRatesListPerPeriod.length > 0) {
                        scope.interestRatesListPerPeriod = data.interestRatesListPerPeriod;
                        scope.interestRatesListAvailable = true;
                    }
                });
            }

            scope.updateDataFromEmiPack = function (loanEMIPacks) {
                for (var i in loanEMIPacks) {
                    if (loanEMIPacks[i].id == parseInt(scope.editLoanAccountdata.loanEMIPackId)) {
                        scope.editLoanAccountdata.fixedEmiAmount = loanEMIPacks[i].fixedEmi;
                        scope.editLoanAccountdata.principal = loanEMIPacks[i].sanctionAmount;
                        scope.editLoanAccountdata.repaymentEvery = loanEMIPacks[i].repaymentEvery;
                        scope.editLoanAccountdata.repaymentFrequencyType = loanEMIPacks[i].repaymentFrequencyType.id;
                        scope.editLoanAccountdata.numberOfRepayments = loanEMIPacks[i].numberOfRepayments;
                        scope.editLoanAccountdata.repaymentEvery = loanEMIPacks[i].repaymentEvery;
                        scope.editLoanAccountdata.loanTermFrequencyType = loanEMIPacks[i].repaymentFrequencyType.id;
                        scope.editLoanAccountdata.loanTermFrequencyType = loanEMIPacks[i].repaymentFrequencyType.id;
                        scope.editLoanAccountdata.loanTermFrequency = parseInt(loanEMIPacks[i].repaymentEvery * scope.editLoanAccountdata.numberOfRepayments);
                        scope.editLoanAccountdata.loanEMIPackId = parseInt(scope.editLoanAccountdata.loanEMIPackId);
                    }
                }
            }

            scope.updateChargesForEdit = function () {
                if (scope.charges && scope.charges.length > 0) {
                    scope.editLoanAccountdata.charges = [];
                    for (var i in scope.charges) {
                        if (scope.charges[i].amountOrPercentage > 0 || scope.charges[i].isSlabBased) {
                            scope.editLoanAccountdata.charges.push({
                                id: scope.charges[i].id,
                                chargeId: scope.charges[i].chargeId,
                                amount: scope.charges[i].amountOrPercentage,
                                dueDate: dateFilter(scope.charges[i].dueDate, scope.df)
                            });
                        }
                    }
                } else {
                    scope.editLoanAccountdata.charges = undefined;
                }
            };

            scope.constructDataFromLoanAccountInfo = function () {
                scope.editLoanAccountdata.createStandingInstructionAtDisbursement = false;
                scope.editLoanAccountdata.transactionProcessingStrategyId = scope.loanaccountinfo.transactionProcessingStrategyId;
                if (!_.isUndefined(scope.loanaccountinfo.calendarOptions)) {
                    scope.editLoanAccountdata.calendarId = scope.loanaccountinfo.calendarOptions[0].id;
                }


                scope.editLoanAccountdata.amortizationType = scope.loanaccountinfo.amortizationType.id;
                scope.editLoanAccountdata.isTopup = scope.loanaccountinfo.isTopup;
                scope.editLoanAccountdata.deferPaymentsForHalfTheLoanTerm = scope.loanaccountinfo.deferPaymentsForHalfTheLoanTerm;
                scope.editLoanAccountdata.interestType = scope.loanaccountinfo.interestType.id;

                scope.editLoanAccountdata.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.editLoanAccountdata.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;
                if (scope.loanaccountinfo.clientId) {
                    scope.editLoanAccountdata.clientId = scope.loanaccountinfo.clientId;
                }
                scope.editLoanAccountdata.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;

                scope.editLoanAccountdata.interestCalculationPeriodType = scope.loanaccountinfo.interestCalculationPeriodType.id;
                scope.editLoanAccountdata.allowPartialPeriodInterestCalcualtion = scope.loanaccountinfo.allowPartialPeriodInterestCalcualtion;

                scope.editLoanAccountdata.interestRatePerPeriod = scope.loanaccountinfo.interestRatePerPeriod;
            };

            scope.constructSubmitData = function () {
                scope.updateChargesForEdit();
                if (scope.editLoanAccountdata.loanEMIPackId) {
                    scope.updateDataFromEmiPack(scope.loanaccountinfo.loanEMIPacks);
                }
                scope.constructDataFromLoanAccountInfo();
            }

            scope.EditLoanAccountSubmit = function () {
                scope.editLoanAccountdata.dateFormat = scope.df;
                scope.editLoanAccountdata.locale = scope.optlang.code;
                scope.editLoanAccountdata.loanType = scope.inparams.templateType = 'jlg';
                scope.editLoanAccountdata.expectedDisbursementDate = dateFilter(new Date(dateFilter(scope.loanAccountData.expectedDisbursementOnDate, scope.df)), scope.df);
                scope.editLoanAccountdata.disbursementData = [];
                scope.constructSubmitData();
                resourceFactory.loanResource.put({ loanId: scope.loanAccountBasicData.id }, scope.editLoanAccountdata, function (data) {
                    scope.closeLoanAccountForm();
                    scope.refreshTask();
                });
            };

            scope.closeLoanAccountForm = function () {
                scope.showLoanAccountForm = false;
                scope.close();
            }

            scope.getLoanData = function (loanId) {
                resourceFactory.loanResource.get({ loanId: loanId, template: true, associations: 'charges,meeting', staffInSelectedOfficeOnly: true }, function (data) {
                    scope.loanaccountinfo = data;
                    scope.charges = data.charges;
                });
            }

            scope.constructFormData = function (data) {
                scope.editLoanAccountdata.productId = data.loanProductId;
                //since loan product change disabled
                //  scope.loanProductChange(scope.editLoanAccountdata.productId);
                scope.editLoanAccountdata.loanPurposeId = data.loanPurposeId;
                if (data.loanEMIPackData) {
                    scope.editLoanAccountdata.loanEMIPackId = data.loanEMIPackData.id;
                    scope.editLoanAccountdata.principal = data.loanEMIPackData.sanctionAmount;
                    scope.editLoanAccountdata.numberOfRepayments = data.loanEMIPackData.numberOfRepayments;
                }
                if (scope.editLoanAccountdata.loanPurposeId) {
                    resourceFactory.loanPurposeGroupResource.getAll({ isFetchLoanPurposeDatas: 'true' }, function (loanPurposeGroupsdata) {
                        scope.loanPurposeGroups = loanPurposeGroupsdata;
                        scope.getParentLoanPurpose(scope.editLoanAccountdata.loanPurposeId);
                    });
                }
                scope.getLoanData(data.id);

            }

            scope.updateSlabBasedChargeForEmiPack = function (loanEMIPackData) {
                scope.editLoanAccountdata.numberOfRepayments = loanEMIPackData.numberOfRepayments;
                scope.editLoanAccountdata.principal = loanEMIPackData.sanctionAmount;
                scope.updateSlabBasedCharges();
            };

            scope.constructFormData(scope.loanAccountBasicData);

            scope.getParentLoanPurpose = function (loanPurposeId) {
                if (scope.loanPurposeGroups && scope.loanPurposeGroups.length > 0) {
                    for (var i = 0; i < scope.loanPurposeGroups.length; i++) {
                        if (scope.loanPurposeGroups[i].loanPurposeDatas && scope.loanPurposeGroups[i].loanPurposeDatas.length > 0) {

                            for (var j = 0; j < scope.loanPurposeGroups[i].loanPurposeDatas.length; j++) {
                                if (scope.loanPurposeGroups[i].loanPurposeDatas[j].id == loanPurposeId) {
                                    scope.formData.loanPurposeGroupId = scope.loanPurposeGroups[i].id;
                                    scope.isLoanPurposeEditable = false;
                                    scope.onLoanPurposeGroupChange(scope.formData.loanPurposeGroupId, scope.isLoanPurposeEditable);
                                    break;
                                }
                            }
                        }
                    }
                }
            };
            scope.onLoanPurposeGroupChange = function (loanPurposegroupId, isLoanPurposeEditable) {
                if (isLoanPurposeEditable != false) {
                    scope.editLoanAccountdata.loanPurposeId = undefined;
                }
                if (loanPurposegroupId) {
                    resourceFactory.loanPurposeGroupResource.get({
                        loanPurposeGroupsId: loanPurposegroupId, isFetchLoanPurposeDatas: 'true'
                    }, function (data) {
                        scope.loanPurposeOptions = data.loanPurposeDatas;
                    });
                } else {
                    scope.loanPurposeOptions = [];
                }
            }

        }

    });
    mifosX.ng.application.controller('EditLoanController', ['$scope', 'ResourceFactory', 'dateFilter', mifosX.controllers.EditLoanController]).run(function ($log) {
        $log.info("EditLoanController initialized");
    });
}(mifosX.controllers || {}));