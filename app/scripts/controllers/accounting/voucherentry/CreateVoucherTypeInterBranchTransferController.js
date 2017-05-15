/**
 * Created by CT on 11-05-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateVoucherTypeInterBranchTransferController: function (scope, routeParams, resourceFactory, dateFilter, API_VERSION, $upload, $rootScope, location, $window, localStorageService) {
            scope.isCreateForm = true;
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.formData.transactionDate = new Date();
            scope.debitAccounts = [{}];
            scope.creditAccounts = [{}];
            scope.numberOfCredits = 1;
            scope.numberOfDebits = 1;
            
            resourceFactory.voucherTemplateResource.get({"voucherType": scope.voucherCode}, function (data) {
                scope.officeOptions = data.templateData.officeOptions;
                scope.currencyOptions = data.templateData.currencyOptions;
                scope.debitAccountingOptions = data.templateData.debitAccountingOptions;
                scope.creditAccountingOptions = data.templateData.creditAccountingOptions;
                scope.paymentOptions = data.templateData.paymentOptions;
                scope.formData.currencyCode = localStorageService.getFromCookies('currencyCode') || scope.currencyOptions[0].code;
                scope.formData.fromOfficeId = parseInt(localStorageService.getFromCookies('fromOfficeId')) || scope.officeOptions[0].id;
                scope.formData.toOfficeId = parseInt(localStorageService.getFromCookies('toOfficeId')) || scope.officeOptions[0].id;
            });


            scope.addDebitAccount = function () {
                scope.limitingDebitToOne();
            };

            scope.limitingCreditToOne = function (){
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.journalEntryConfiguration.allowMultipleCreditAndDebitEntries) {
                    scope.creditAccounts.push({});
                    scope.numberOfCredits = scope.numberOfCredits + 1;
                }else {
                    if (scope.numberOfDebits <= 1) {
                        scope.creditAccounts.push({});
                        scope.numberOfCredits = scope.numberOfCredits + 1;
                    }
                    else {
                        scope.error = "validation.msg.journal.entry.limit.credit.to.one";
                    }
                }
            }

            scope.limitingDebitToOne = function() {
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.journalEntryConfiguration.allowMultipleCreditAndDebitEntries) {
                    scope.debitAccounts.push({});
                    scope.numberOfDebits = scope.numberOfDebits + 1;
                }else {
                    if (scope.numberOfCredits <= 1) {
                        scope.debitAccounts.push({});

                        scope.numberOfDebits = scope.numberOfDebits + 1;
                    }
                    else {
                        scope.error = "validation.msg.journal.entry.limit.debit.to.one";
                    }
                }
            }
            scope.addCreditAccount = function () {
                scope.limitingCreditToOne();
            };

            scope.deleteDebitAccount = function (index) {
                scope.debitAccounts.splice(index, 1);
                scope.numberOfDebits = scope.numberOfDebits - 1;
                scope.error = null;

            };

            scope.deleteCreditAccount = function (index) {
                scope.creditAccounts.splice(index, 1);
                scope.numberOfCredits = scope.numberOfCredits - 1;
                scope.error = null;
            };

            scope.setDebitAccountRunningBalance = function (index) {
                for (var i in scope.debitAccountingOptions) {
                    if (scope.debitAccountingOptions[i].id == scope.debitAccounts[index].glAccountId) {
                        scope.debitAccounts[index].organizationRunningBalance = scope.debitAccountingOptions[i].organizationRunningBalance;
                        break;
                    }
                }
            };

            scope.showDebitAccountRunningBalance = function (index) {
                for (var i in scope.debitAccountingOptions) {
                    if (scope.debitAccountingOptions[i].id == scope.debitAccounts[index].glAccountId) {
                        scope.debitAccounts[index].isShowRunningBalance = true;
                        break;
                    }
                }
            };

            scope.setCreditAccountRunningBalance = function (index) {
                for (var i in scope.creditAccountingOptions) {
                    if (scope.creditAccountingOptions[i].id == scope.creditAccounts[index].glAccountId) {
                        scope.creditAccounts[index].organizationRunningBalance = scope.creditAccountingOptions[i].organizationRunningBalance;
                        break;
                    }
                }
            };

            scope.showCreditAccountRunningBalance = function (index) {
                for (var i in scope.creditAccountingOptions) {
                    if (scope.creditAccountingOptions[i].id == scope.creditAccounts[index].glAccountId) {
                        scope.creditAccounts[index].isShowRunningBalance = true;
                        break;
                    }
                }
            };

            scope.submit = function () {
                scope.formData.transactionDate = dateFilter(scope.formData.transactionDate, scope.df);
                scope.formData.debitAccounts = scope.debitAccounts;
                scope.formData.creditAccounts = scope.creditAccounts;
                if (scope.formData.paymentDetails) {
                    scope.formData.paymentDetails.instrumentationDate = dateFilter(scope.formData.paymentDetails.instrumentationDate, scope.df);
                    scope.formData.paymentDetails.dateFormat = scope.df;
                    scope.formData.paymentDetails.locale = "en";
                }
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = "en";
                localStorageService.addToCookies('fromOfficeId', scope.formData.fromOfficeId);
                localStorageService.addToCookies('toOfficeId', scope.formData.toOfficeId);
                localStorageService.addToCookies('currencyCode', scope.formData.currencyCode);
                resourceFactory.voucherResource.create({'voucherType': scope.voucherCode}, scope.formData, function (data) {
                    scope.responseData = data;
                    scope.isCreateForm = false;
                });
            };

            scope.routeTo = function (vocuher) {
                $window.open('#/accounting/view/voucherentry/' + scope.voucherCode + '/' + vocuher.voucherId, '_blank');
            };

        }
    });
    mifosX.ng.application.controller('CreateVoucherTypeInterBranchTransferController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', '$location', '$window', 'localStorageService', mifosX.controllers.CreateVoucherTypeInterBranchTransferController]).run(function ($log) {
        $log.info("CreateVoucherTypeInterBranchTransferController initialized");
    });
}(mifosX.controllers || {}));