(function (module) {
    mifosX.controllers = _.extend(module, {
        TransactionTypeMappingJournalEntryController: function (scope, resourceFactory, location, dateFilter, routeParams, localStorageService) {

            scope.formData = {};
            scope.first = {};
            scope.restrictDate = new Date();
            scope.showPaymentDetails = false;
            scope.transactionnumber = routeParams.transactionId;
            scope.resourceId = routeParams.resourceId;
            scope.showTransactionDetails = false;
            scope.first.date = new Date();
            scope.transactionTypes = [];

            resourceFactory.paymentTypeResource.getAll(function (data) {
                scope.paymentTypes = data;
            });

            resourceFactory.transactionTypeMappingResource.query(function (data) {
                scope.transactionTypes = data;
            });

            resourceFactory.currencyConfigResource.get({
                fields: 'selectedCurrencyOptions'
            }, function (data) {
                scope.currencyOptions = data.selectedCurrencyOptions;
                scope.formData.currencyCode = localStorageService.getFromCookies('currencyCode') || scope.currencyOptions[0].code;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData.officeId = parseInt(localStorageService.getFromCookies('officeId')) || scope.offices[0].id;
            });

            if (scope.transactionnumber != null) {
                scope.showTransactionDetails = true;
            }

            scope.viewTransaction = function () {
                location.path('/viewtransactions/' + scope.resourceId);
            }

            scope.submit = function () {
                var jeTransaction = {};
                var reqDate = dateFilter(scope.first.date, scope.df);
                jeTransaction.locale = scope.optlang.code;
                jeTransaction.dateFormat = scope.df;
                jeTransaction.officeId = this.formData.officeId;
                jeTransaction.transactionDate = reqDate;
                jeTransaction.referenceNumber = this.formData.referenceNumber;
                jeTransaction.comments = this.formData.comments;
                jeTransaction.currencyCode = this.formData.currencyCode;
                jeTransaction.paymentTypeId = this.formData.paymentTypeId;
                jeTransaction.accountNumber = this.formData.accountNumber;
                jeTransaction.checkNumber = this.formData.checkNumber;
                jeTransaction.routingCode = this.formData.routingCode;
                jeTransaction.receiptNumber = this.formData.receiptNumber;
                jeTransaction.bankNumber = this.formData.bankNumber;

                jeTransaction.credits = [];
                jeTransaction.debits = [];
                if (this.formData.transactionTypeId) {

                    var selectedTxnType = _.find(scope.transactionTypes, function (type) {
                        return type.id === scope.formData.transactionTypeId;
                    });
                    jeTransaction.credits.push({
                        glAccountId: selectedTxnType.fromCreditAccount.id,
                        amount: this.formData.transactionAmount
                    });
                    jeTransaction.credits.push({
                        glAccountId: selectedTxnType.toCreditAccount.id,
                        amount: this.formData.transactionAmount
                    });
                    jeTransaction.debits.push({
                        glAccountId: selectedTxnType.fromDebitAccount.id,
                        amount: this.formData.transactionAmount
                    });
                    jeTransaction.debits.push({
                        glAccountId: selectedTxnType.toDebitAccount.id,
                        amount: this.formData.transactionAmount
                    });
                    jeTransaction.transactionTypeId = selectedTxnType.transactionType.id;
                }

                localStorageService.addToCookies('officeId', this.formData.officeId);
                localStorageService.addToCookies('currencyCode', this.formData.currencyCode);

                resourceFactory.journalEntriesResource.save(jeTransaction, function (data) {
                    location.path('/journalentry/' + data.transactionId + "/" + data.resourceId);
                });
            }
        }
    });
    mifosX.ng.application.controller('TransactionTypeMappingJournalEntryController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'localStorageService', mifosX.controllers.TransactionTypeMappingJournalEntryController]).run(function ($log) {
        $log.info("TransactionTypeMappingJournalEntryController initialized");
    });
}(mifosX.controllers || {}));