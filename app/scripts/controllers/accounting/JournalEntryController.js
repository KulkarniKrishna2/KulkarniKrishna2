(function (module) {
    mifosX.controllers = _.extend(module, {
        JournalEntryController: function (scope, resourceFactory, location, dateFilter, routeParams, localStorageService) {

            scope.formData = {};
            scope.formData.crAccounts = [{}];
            scope.formData.dbAccounts = [{}];
            scope.first = {};
            scope.errorcreditevent = false;
            scope.errordebitevent = false;
            scope.creditaccounttemplate = false;
            scope.debitaccounttemplate = false;
            scope.restrictDate = new Date();
            scope.showPaymentDetails = false;
            scope.transactionnumber = routeParams.transactionId;
            scope.resourceId = routeParams.resourceId;
            scope.showTransactionDetails = false;
            scope.first.date = new Date();
            scope.numberOfCredits = 1;
            scope.numberOfDebits = 1;
            scope.error = null;

            if(scope.response){           
                scope.isCompanyCodeMandatory = scope.response.uiDisplayConfigurations.addJournalEntry.isMandatoryField.companyCode;            
            }

            resourceFactory.accountCoaResource.getAllAccountCoas({manualEntriesAllowed: true, usage: 1, disabled: false, companyCode:0}, function (data) {
                scope.glAccounts = data;
            });

            resourceFactory.codeValueByCodeNameResources.get({codeName: 'company code for gl accounts',searchConditions:'{"codeValueIsActive":true}'}, function (data) {
               scope.companyCodeForGlaccountCodeValues = data;
               if (data != null) {
                if (data.length > 0) {
                    scope.formData.companyCodeForGlaccountCodeValues = data[0].id;
                }
            }
            });

            resourceFactory.paymentTypeResource.getAll( function (data) {
                scope.paymentTypes = data;
            });

            resourceFactory.currencyConfigResource.get({fields: 'selectedCurrencyOptions'}, function (data) {
                scope.currencyOptions = data.selectedCurrencyOptions;
                scope.formData.currencyCode = localStorageService.getFromCookies('currencyCode') || scope.currencyOptions[0].code;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData.officeId = parseInt(localStorageService.getFromCookies('officeId')) || scope.offices[0].id;
            });

            if(scope.transactionnumber != null){
                scope.showTransactionDetails = true;
            }
            //events for credits
            scope.addCrAccount = function () {
                scope.limitingCreditToOne();
            }

            scope.removeCrAccount = function (index) {
                scope.formData.crAccounts.splice(index, 1);
                scope.numberOfCredits = scope.numberOfCredits - 1;
                scope.error = null;
            }

            //events for debits
            scope.addDebitAccount = function () {
                scope.limitingDebitToOne();
            }


            scope.removeDebitAccount = function (index) {
                scope.formData.dbAccounts.splice(index, 1);
                scope.numberOfDebits = scope.numberOfDebits - 1;
                scope.error = null;
            }

            scope.viewTransaction = function(){
                location.path('/viewtransactions/' +scope.resourceId );
            }

            scope.limitingCreditToOne = function (){
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.journalEntryConfiguration.allowMultipleCreditAndDebitEntries) {
                    scope.formData.crAccounts.push({});
                     scope.numberOfCredits = scope.numberOfCredits + 1;
                }else {
                        scope.formData.crAccounts.push({});
                        scope.numberOfCredits = scope.numberOfCredits + 1;
                }
            }

            scope.limitingDebitToOne = function() {
                if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.journalEntryConfiguration.allowMultipleCreditAndDebitEntries) {
                    scope.formData.dbAccounts.push({});
                    scope.numberOfDebits = scope.numberOfDebits + 1;
                }else {
                        scope.formData.dbAccounts.push({});
                        scope.numberOfDebits = scope.numberOfDebits + 1;
                }
            }

            scope.changeAccountsAsPerCompanyCodes = function(companyCodeForGlaccountCode){
                resourceFactory.accountCoaResource.getAllAccountCoas({manualEntriesAllowed: true, usage: 1, disabled: false, companyCode:companyCodeForGlaccountCode}, function (data) {
                    scope.glAccounts = data;
                });
            }

            scope.submit = function () {
                var jeTransaction = new Object();
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
                jeTransaction.companyCode = this.formData.companyCodeForGlaccountCodeValues;

                //Construct credits array
                jeTransaction.credits = [];
                for (var i = 0; i < this.formData.crAccounts.length; i++) {
                    var temp = new Object();
                    if(this.formData.crAccounts[i].select){
                    	temp.glAccountId = this.formData.crAccounts[i].select.id;
                    }
                    temp.amount = this.formData.crAccounts[i].crAmount;
                    jeTransaction.credits.push(temp);
                }
                //construct debits array
                jeTransaction.debits = [];
                for (var i = 0; i < this.formData.dbAccounts.length; i++) {
                    var temp = new Object();
                    if(this.formData.dbAccounts[i].select){
                    	temp.glAccountId = this.formData.dbAccounts[i].select.id;
                    }
                    temp.amount = this.formData.dbAccounts[i].debitAmount;
                    jeTransaction.debits.push(temp);
                }

                localStorageService.addToCookies('officeId', this.formData.officeId);
                localStorageService.addToCookies('currencyCode', this.formData.currencyCode);

                resourceFactory.journalEntriesResource.save(jeTransaction, function (data) {
                    location.path('/journalentry/' + data.transactionId+"/"+data.resourceId);
                });
            }
        }
    });
    mifosX.ng.application.controller('JournalEntryController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'localStorageService', mifosX.controllers.JournalEntryController]).run(function ($log) {
        $log.info("JournalEntryController initialized");
    });
}(mifosX.controllers || {}));