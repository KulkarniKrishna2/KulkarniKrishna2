'use strict';
/*global _ */
/*global mifosX */

(function (module) {
    mifosX.controllers = _.extend(module, {
        IndividualCollectionSheetController: function (scope, resourceFactory, location, routeParams, dateFilter, localStorageService, route, $timeout) {
            scope.offices = [];
            scope.centers = [];
            scope.groups = [];
            scope.clientsAttendance = [];
            scope.calendarId = '';
            scope.formData = {};
            scope.centerId = '';
            scope.groupId = '';
            scope.date = {};
            scope.newGroupTotal = {};
            scope.savingsGroupsTotal = [];
            scope.date.transactionDate = new Date();

            if(scope.response){
                    scope.paymentDetails = !scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.paymentDetails;
            }
            if(scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.paymentTypeId) {
                scope.paymentTypeId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.paymentTypeId;
            }
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });


            scope.officeSelected = function (officeId) {
                scope.officeId = officeId;
                if (officeId) {
                    resourceFactory.employeeResource.getAllEmployees({officeId: officeId}, function (data) {
                        scope.loanOfficers = data.pageItems;
                    });
                }
            };

            scope.showLoanPaymentDetails = function (parentindex, index) {
                var client = scope.collectionsheetdata.clients[parentindex];
                var loandetail = client.loans[index];
                loandetail.showPaymentDetails = true;
                if(!_.isUndefined(scope.paymentTypeId)){
                    loandetail.paymentTypeId = scope.paymentTypeId;
                }else{
                    loandetail.paymentTypeId = "";
                }
                loandetail.accountNumber = "";
                loandetail.checkNumber = "";
                loandetail.routingCode = "";
                loandetail.receiptNumber = "";
                loandetail.bankNumber = "";
            };
            scope.removeLoanPaymentDetails = function (parentindex, index) {
                var client = scope.collectionsheetdata.clients[parentindex];
                var loandetail = client.loans[index];
                loandetail.showPaymentDetails = false;
                loandetail.paymentTypeId = "";
                loandetail.accountNumber = "";
                loandetail.checkNumber = "";
                loandetail.routingCode = "";
                loandetail.receiptNumber = "";
                loandetail.bankNumber = "";
            };

            scope.showSavingsPaymentDetails = function (parentindex, index) {
                var client = scope.collectionsheetdata.clients[parentindex];
                var savings = client.savings[index];
                savings.showPaymentDetails = true;
                savings.paymentTypeId = "";
                savings.accountNumber = "";
                savings.checkNumber = "";
                savings.routingCode = "";
                savings.receiptNumber = "";
                savings.bankNumber = "";
            };

            scope.removeSavingsPaymentDetails = function (parentindex, index) {
                var client = scope.collectionsheetdata.clients[parentindex];
                var savings = client.savings[index];
                savings.showPaymentDetails = false;
                savings.paymentTypeId = "";
                savings.accountNumber = "";
                savings.checkNumber = "";
                savings.routingCode = "";
                savings.receiptNumber = "";
                savings.bankNumber = "";
            };

            scope.previewCollectionSheet = function () {
                scope.formData = {};
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                if (scope.date.transactionDate) {
                    scope.formData.transactionDate = dateFilter(scope.date.transactionDate, scope.df);
                }
                scope.formData.staffId = scope.loanOfficerId;
                scope.formData.officeId = scope.officeId;

                scope.collectionsheetdata = null;

                resourceFactory.collectionSheetResource.save({command: 'generateCollectionSheet'}, scope.formData, function (data) {
                    if (data.clients.length > 0) {
                        scope.collectionsheetdata = data;
                        scope.clients = data.clients;
                    } else {
                        scope.noData = true;
                        $timeout(function () {
                            scope.noData = false;
                        }, 3000);
                    }

                });

            };

            if (localStorageService.getFromLocalStorage('Success') === 'true') {
                scope.savesuccess = true;
                localStorageService.removeFromLocalStorage('Success');
                scope.val = true;
                $timeout(function () {
                    scope.val = false;
                }, 3000);
            }
            scope.getLoanTotalDueAmount = function (loan) {
                var principalInterestDue = loan.totalDue;
                if (isNaN(principalInterestDue)) {
                    principalInterestDue = parseInt(0);
                }
                return Math.ceil((Number(principalInterestDue)) * 100) / 100;
            };

            scope.constructBulkLoanAndSavingsRepaymentTransactions = function () {
                scope.bulkRepaymentTransactions = [];
                scope.bulkSavingsDueTransactions = [];
                _.each(scope.clients, function (client) {
                        _.each(client.savings, function (saving) {
                            var dueAmount = saving.dueAmount;
                            if (isNaN(dueAmount)) {
                                dueAmount = parseInt(0);
                            }
                            var savingsTransaction = {
                                savingsId: saving.savingsId,
                                transactionAmount: dueAmount
                            };
                            if(saving.showPaymentDetails && saving.paymentTypeId != ""){
                                savingsTransaction.paymentTypeId = saving.paymentTypeId;
                                savingsTransaction.accountNumber = saving.accountNumber;
                                savingsTransaction.checkNumber = saving.checkNumber;
                                savingsTransaction.routingCode =saving.routingCode;
                                savingsTransaction.receiptNumber = saving.receiptNumber;
                                savingsTransaction.bankNumber = saving.bankNumber;
                            }
                            scope.bulkSavingsDueTransactions.push(savingsTransaction);
                        });

                        _.each(client.loans, function (loan) {
                            var totalDue = scope.getLoanTotalDueAmount(loan);
                            if (totalDue != "") {
                                var loanTransaction = {
                                    loanId: loan.loanId,
                                    transactionAmount: totalDue
                                };
                            }
                            if (loan.showPaymentDetails && loan.paymentTypeId != "") {
                                loanTransaction.paymentTypeId = loan.paymentTypeId;
                                loanTransaction.accountNumber = loan.accountNumber;
                                loanTransaction.checkNumber = loan.checkNumber;
                                loanTransaction.routingCode = loan.routingCode;
                                loanTransaction.receiptNumber = loan.receiptNumber;
                                loanTransaction.bankNumber = loan.bankNumber;
                            }else{
                               if(!_.isUndefined(scope.paymentTypeId)){
                                    loanTransaction.paymentTypeId = scope.paymentTypeId;
                                }    
                            }
                            if (loanTransaction != null) {
                            scope.bulkRepaymentTransactions.push(loanTransaction);
                        }
                        });
                    }
                );
            };

            scope.cancel = function () {
                location.path("#/home")
            }
            scope.submit = function () {
                var data = {};
                data.dateFormat = scope.df;
                data.locale = scope.optlang.code;
                data.transactionDate = scope.formData.transactionDate;

                if (scope.loanOfficerId){
                    data.staffId = scope.loanOfficerId;

                }
                data.actualDisbursementDate = scope.formData.transactionDate;
                data.bulkDisbursementTransactions = [];
                //construct loan repayment and savings due transactions
                scope.constructBulkLoanAndSavingsRepaymentTransactions();
                data.bulkRepaymentTransactions = scope.bulkRepaymentTransactions;
                data.bulkSavingsTransactions = scope.bulkSavingsDueTransactions;
                data.officeId = scope.officeId;
                resourceFactory.collectionSheetV2Resource.save({command: 'saveCollectionSheet'}, data, function (data) {
                    localStorageService.addToLocalStorage('Success', true);
                    location.path('/viewallcollections');
                });
            };

        }
    })
    ;
    mifosX.ng.application.controller('IndividualCollectionSheetController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', 'localStorageService',
        '$route', '$timeout', mifosX.controllers.IndividualCollectionSheetController]).run(function ($log) {
        $log.info("IndividualCollectionSheetController initialized");
    });
}
(mifosX.controllers || {})
    )
;
