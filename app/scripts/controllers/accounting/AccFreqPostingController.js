(function (module) {
    mifosX.controllers = _.extend(module, {
        AccFreqPostingController: function (scope, resourceFactory, location, dateFilter,$upload,$rootScope,API_VERSION) {

            scope.formData = {};
            scope.formData.crAccounts = [];
            scope.formData.dbAccounts = [];
            scope.first = {date:new Date()};
            scope.allowCreditEntries = true;
            scope.allowDebitEntries = true;
            scope.errorcreditevent = false;
            scope.errordebitevent = false;
            scope.restrictDate = new Date();
            scope.showPaymentDetails = false;
            scope.resourceId;



            resourceFactory.paymentTypeResource.getAll( function (data) {
                scope.paymentTypes = data;
            });
            resourceFactory.currencyConfigResource.get({fields: 'selectedCurrencyOptions'}, function (data) {
                scope.currencyOptions = data.selectedCurrencyOptions;
                scope.formData.currencyCode = scope.currencyOptions[0].code;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData.officeId = scope.offices[0].id;
                scope.getAccountingRules();
            });

            scope.getAccountingRules = function(){
                resourceFactory.accountingRulesResource.get({officeId: scope.formData.officeId,includeInheritedRules:true}, function(data){
                    scope.rules = data;
                });
            }

            //event for rule change
            scope.resetCrAndDb = function (rule) {
            	  scope.rule = rule;
                scope.formData.crAccounts = [{}];
                scope.formData.dbAccounts = [{}];
                
                if(rule.allowMultipleDebitEntries) {
                  scope.allowDebitEntries = true;
                }else{
                  scope.allowDebitEntries = false;
                }
                if(rule.allowMultipleCreditEntries) {
                  scope.allowCreditEntries = true;
                }else{
                  scope.allowCreditEntries = false;
                }
            }
        
            //events for credits
            scope.addCrAccount = function () {
                scope.errorcreditevent = false;
                scope.formData.crAccounts.push({});
                scope.formData.crAmountTemplate = undefined;
                if (scope.formData.rule) {
                    if (!scope.formData.rule.allowMultipleCreditEntries) {
                        scope.allowCreditEntries = false;
                    }
                }
            }

            scope.removeCrAccount = function (index) {
                scope.formData.crAccounts.splice(index, 1);
                if (scope.formData.crAccounts.length == 0) {
                    scope.allowCreditEntries = true;
                }
            }

            //events for debits
            scope.addDebitAccount = function () {
                scope.errordebitevent = false;
                scope.formData.dbAccounts.push({});
                scope.formData.debitAmountTemplate = undefined;
                if (scope.formData.rule) {
                    if (!scope.formData.rule.allowMultipleDebitEntries) {
                        scope.allowDebitEntries = false;
                    }
                }
            }

            scope.removeDebitAccount = function (index) {
                scope.formData.dbAccounts.splice(index, 1);
                if (scope.formData.dbAccounts.length == 0) {
                    scope.allowDebitEntries = true;
                }
            }

               /**
             * Documents Related Code
             */
            scope.documents = [];
            scope.docData = {};
            scope.files = [];
            scope.onFileSelect = function ($files) {
                scope.docData.fName = $files[0].name;
                scope.files.push($files[0]);
            };

            scope.addDocument = function(){
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
                if (this.formData.rule) {
                    jeTransaction.accountingRule = this.formData.rule.id;
                }
                jeTransaction.currencyCode = this.formData.currencyCode;
                jeTransaction.paymentTypeId = this.formData.paymentTypeId;
                jeTransaction.accountNumber = this.formData.accountNumber;
                jeTransaction.checkNumber = this.formData.checkNumber;
                jeTransaction.routingCode = this.formData.routingCode;
                jeTransaction.receiptNumber = this.formData.receiptNumber;
                jeTransaction.bankNumber = this.formData.bankNumber;

                //Construct credits array
                jeTransaction.credits = [];
                for (var i = 0; i < this.formData.crAccounts.length; i++) {
                    var temp = new Object();
                    temp.glAccountId = this.formData.crAccounts[i].select.id;
                    temp.amount = this.formData.crAccounts[i].crAmount;
                    jeTransaction.credits.push(temp);
                }

                //construct debits array
                jeTransaction.debits = [];
                for (var i = 0; i < this.formData.dbAccounts.length; i++) {
                    var temp = new Object();
                    temp.glAccountId = this.formData.dbAccounts[i].select.id;
                    temp.amount = this.formData.dbAccounts[i].debitAmount;
                    jeTransaction.debits.push(temp);
                }

                resourceFactory.frequentPostingResource.save(jeTransaction, function (data) {
                    scope.resourceId = data.resourceId;
                    if (scope.documents && scope.documents.length > 0) {
                        uploadDocumets(data);
                    } else {
                        scope.routeTO();
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

                scope.routeTO = function () {
                    location.path('/viewtransactions/' + scope.resourceId);
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
                            scope.routeTO();
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
    mifosX.ng.application.controller('AccFreqPostingController', ['$scope', 'ResourceFactory', '$location', 'dateFilter','$upload','$rootScope','API_VERSION', mifosX.controllers.AccFreqPostingController]).run(function ($log) {
        $log.info("AccFreqPostingController initialized");
    });
}(mifosX.controllers || {}));
