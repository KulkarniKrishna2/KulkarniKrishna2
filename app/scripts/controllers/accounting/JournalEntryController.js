(function (module) {
    mifosX.controllers = _.extend(module, {
        JournalEntryController: function (scope, resourceFactory, location, dateFilter, routeParams, localStorageService, $rootScope, API_VERSION, $upload) {

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
            scope.isCompanyCodeMandatory = false;

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.addJournalEntry) {
                if (scope.response.uiDisplayConfigurations.addJournalEntry.isMandatoryField.companyCode) {
                    scope.isCompanyCodeMandatory = scope.response.uiDisplayConfigurations.addJournalEntry.isMandatoryField.companyCode;
                }
                if (scope.response.uiDisplayConfigurations.addJournalEntry.isDefaultCompanyCode) {
                    scope.isDefaultCompanyCode = scope.response.uiDisplayConfigurations.addJournalEntry.isDefaultCompanyCode;
                }
                if (scope.response.uiDisplayConfigurations.addJournalEntry.defaultCompanyCode) {
                    scope.defaultCompanyCode = scope.response.uiDisplayConfigurations.addJournalEntry.defaultCompanyCode;
                }
            }
            resourceFactory.accountCoaResource.getAllAccountCoas({ manualEntriesAllowed: true, usage: 1, disabled: false }, function (data) {
                scope.originalGlAccounts = data;
                if(!scope.isCompanyCodeMandatory){
                    scope.glAccounts = scope.originalGlAccounts;
                }
                resourceFactory.codeValueByCodeNameResources.get({ codeName: 'company code for gl accounts', searchConditions: '{"codeValueIsActive":true}' }, function (data) {
                    scope.companyCodeForGlaccountCodeValues = data;
                    if (data != null && data.length > 0) {
                        if (scope.isDefaultCompanyCode) {
                            for (var i = 0; i < data.length; i++) {
                                if (data[i].name == scope.defaultCompanyCode) {
                                    scope.formData.companyCodeForGlaccountCodeValues = data[i].id;
                                    scope.glAccounts = _.filter(scope.originalGlAccounts, function (glAccount) {
                                        return glAccount.companyCode.name === scope.defaultCompanyCode;
                                    });
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        scope.glAccounts = scope.originalGlAccounts;
                    }
                });
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

            scope.changeAccountsAsPerCompanyCodes = function (companyCodeForGlaccountCode) {
                if (companyCodeForGlaccountCode != undefined && companyCodeForGlaccountCode != 0) {
                    scope.glAccounts = _.filter(scope.originalGlAccounts, function (glAccount) {
                        return glAccount.companyCode.id === companyCodeForGlaccountCode;
                    });
                }
                else {
                    scope.glAccounts = scope.originalGlAccounts;
                }
            }

            /** Documents Related Code **/
 
            scope.documents = [];
            scope.docData = {};
            scope.files = [];
            scope.onFileSelect = function ($files) {
                scope.docData.fName = $files[0].name;
                scope.files.push($files[0]);
            };

            scope.addDocument = function () {
                scope.documents.push(scope.docData);
                scope.docData = {};
            };

            scope.deleteDocument = function (index) {
                scope.documents.splice(index, 1);
            };

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
                    scope.resourceId = data.resourceId;
                    if (scope.documents && scope.documents.length > 0) {
                        uploadDocumets(data);
                    } else {
                        scope.viewTransaction();
                    }
                });

                var docResponse = 0;
                var uploadURL = null;
                function uploadDocumets(data) {
                    docResponse = 0;
                    uploadURL = $rootScope.hostUrl + API_VERSION + '/journal_entry/' + data.resourceId + '/documents';
                    if (!_.isUndefined(scope.documents) && scope.documents.length > 0) {
                        uploadProcessDocumets();
                    }
                }

                scope.$on('createJournalDocUpload', function (event) {
                    uploadProcessDocumets();
                });

                function uploadProcessDocumets() {
                    $upload.upload({
                        url: uploadURL,
                        data: scope.documents[docResponse],
                        file: scope.files[docResponse]
                    }).then(function (data) {
                        // to fix IE not refreshing the model
                        if (!scope.$$phase) {
                            scope.$apply();
                        }
                        docResponse++;
                        if (docResponse == scope.documents.length) {
                            scope.viewTransaction();
                        } else {
                            if ($rootScope.requestsInProgressAPIs["POST" + uploadURL]) {
                                delete $rootScope.requestsInProgressAPIs["POST" + uploadURL];
                            }
                            scope.$emit("createJournalDocUpload");
                        }
                    });
                }

            }
        }
    });
    mifosX.ng.application.controller('JournalEntryController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', 'localStorageService', '$rootScope', 'API_VERSION', '$upload', mifosX.controllers.JournalEntryController]).run(function ($log) {
        $log.info("JournalEntryController initialized");
    });
}(mifosX.controllers || {}));