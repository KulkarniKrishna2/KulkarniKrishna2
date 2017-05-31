/**
 * Created by CT on 11-05-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateVoucherTypeFormController: function (scope, routeParams, resourceFactory, dateFilter, API_VERSION, $upload, $rootScope, location, localStorageService) {

            scope.numberOfCredits = 1;
            scope.numberOfDebits = 1;
            scope.debitAccounts = [{}];
            scope.creditAccounts = [{}];
            scope.formData = {};
            scope.formData.transactionDate = new Date();
            scope.restrictDate = new Date();
            scope.showTransactionDetails = false;
            /**
             * Based on the voucher type change the labels
             */
            scope.debitLabel = 'label.input.paid.to';
            scope.creditLabel = 'label.input.paid.from';
            if (scope.voucherCode === 'cashreceipt' || scope.voucherCode === 'bankreceipt') {
                scope.debitLabel = 'label.input.received.by';
                scope.creditLabel = 'label.input.received.from';
            } else if (scope.voucherCode === 'jventry' || scope.voucherCode === 'contraentry') {
                scope.debitLabel = 'label.input.gl.accounts';
                scope.creditLabel = 'label.input.gl.accounts';
            }
            /****************************************************************************************/

            if (!_.isUndefined(routeParams.voucherNumber)) {
                scope.showTransactionDetails = true;
                scope.voucherData = {
                    voucherNumber: routeParams.voucherNumber,
                    voucherId: routeParams.voucherId,
                    transactionId: routeParams.transactionId
                };
            }

            /**
             * Getting Voucher Template Data based on the voucher code
             */
            resourceFactory.voucherTemplateResource.get({"voucherType": scope.voucherCode}, function (data) {
                scope.officeOptions = data.templateData.officeOptions;
                scope.currencyOptions = data.templateData.currencyOptions;
                scope.debitAccountingOptions = data.templateData.debitAccountingOptions;
                scope.creditAccountingOptions = data.templateData.creditAccountingOptions;
                if (!_.isUndefined(data.templateData.paymentOptions)) {
                    scope.paymentOptions = data.templateData.paymentOptions;
                }
                scope.formData.currencyCode = localStorageService.getFromCookies('currencyCode') || scope.currencyOptions[0].code;
                scope.formData.officeId = parseInt(localStorageService.getFromCookies('officeId')) || scope.officeOptions[0].id;
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

            scope.showDebitAccountRunningBalance = function (index) {
                resourceFactory.accountCoaResource.get({
                        glAccountId: scope.debitAccounts[index].glAccountId,
                        template: 'true', officeId: scope.formData.officeId, officeRunningBalance: true
                    },
                    function (data) {
                        scope.debitAccounts[index].officeRunningBalance = data.officeRunningBalance;

                    });
                for (var i in scope.debitAccountingOptions) {
                    if (scope.debitAccountingOptions[i].id == scope.debitAccounts[index].glAccountId) {
                        scope.debitAccounts[index].isShowRunningBalance = true;
                        break;
                    }
                }
            };

            scope.showCreditAccountRunningBalance = function (index) {
                resourceFactory.accountCoaResource.get({
                        glAccountId: scope.creditAccounts[index].glAccountId,
                        template: 'true', officeId: scope.formData.officeId, officeRunningBalance: true
                    },
                    function (data) {
                        scope.creditAccounts[index].officeRunningBalance = data.officeRunningBalance;

                    });
                for (var i in scope.creditAccountingOptions) {
                    if (scope.creditAccountingOptions[i].id == scope.creditAccounts[index].glAccountId) {
                        scope.creditAccounts[index].isShowRunningBalance = true;
                        break;
                    }
                }
            };

            /**
             * Documents Related Code
             */
            scope.documents = [];
            scope.docData = {};
            scope.files = [];
            scope.onFileSelect = function ($files) {
                scope.docData.fName = $files[0].name;
                scope.files.push($files[0]);
                scope.documents.push(scope.docData);
                scope.docData = {};
            };
            scope.deleteDocument = function (index) {
                scope.documents.splice(index, 1);
            };
            scope.viewDocument = function (index) {

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
                localStorageService.addToCookies('officeId', scope.formData.officeId);
                localStorageService.addToCookies('currencyCode', scope.formData.currencyCode);
                resourceFactory.voucherResource.create({'voucherType': scope.voucherCode}, scope.formData, function (data) {
                    scope.voucherData = data;
                    if (scope.documents && scope.documents.length > 0) {
                        uploadDocumets(data);
                    } else {
                        relaunch();
                    }
                });
            };

            scope.viewTransaction = function () {
                location.path('/accounting/view/voucherentry/' + scope.voucherCode + '/' + scope.voucherData.voucherId);

            };

            function relaunch() {
                location.path('/accounting/voucherentry/' + scope.voucherData.subResourceId).search({
                    voucherNumber: scope.voucherData.resourceIdentifier,
                    voucherId: scope.voucherData.resourceId,
                    transactionId: scope.voucherData.transactionId
                });
            }

            function uploadDocumets(voucherData) {
                for (var i in scope.documents) {
                    uploadProcessDocumets(i, voucherData);
                }
            }

            var docResponse = 0;

            function uploadProcessDocumets(index, voucherData) {
                var documentData = {};
                angular.copy(scope.documents[index], documentData);
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/vouchers/' + voucherData.resourceId + '/documents',
                    data: documentData,
                    file: scope.files[index]
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    docResponse++;
                    if (docResponse == scope.documents.length) {
                        relaunch();
                    }
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateVoucherTypeFormController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', '$location', 'localStorageService', mifosX.controllers.CreateVoucherTypeFormController]).run(function ($log) {
        $log.info("CreateVoucherTypeFormController initialized");
    });
}(mifosX.controllers || {}));