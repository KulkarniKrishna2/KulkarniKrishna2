(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateJournalVoucherController: function ($scope, resourceFactory, dateFilter,$modalInstance,route,$upload,$rootScope,API_VERSION) {

            $scope.formData = {};
            $scope.formData.crAccounts = [];
            $scope.formData.dbAccounts = [];
            $scope.first = {};
            $scope.allowCreditEntries = true;
            $scope.allowDebitEntries = true;
            $scope.errorcreditevent = false;
            $scope.errordebitevent = false;
            $scope.restrictDate = new Date();
            $scope.showPaymentDetails = false;

            resourceFactory.paymentTypeResource.getAll(function (data) {
                $scope.paymentTypes = data;
            });
            resourceFactory.currencyConfigResource.get({fields: 'selectedCurrencyOptions'}, function (data) {
                $scope.currencyOptions = data.selectedCurrencyOptions;
                $scope.formData.currencyCode = $scope.currencyOptions[0].code;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                $scope.offices = data;
                if($scope.officeId){
                    $scope.formData.officeId = $scope.officeId;
                }else{
                    $scope.formData.officeId = $scope.offices[0].id;
                }                
                $scope.getAccountingRules();
            });

            $scope.getAccountingRules = function () {
                resourceFactory.accountingRulesResource.get({
                    officeId: $scope.formData.officeId,
                    includeInheritedRules: true
                }, function (data) {
                    $scope.rules = data;
                });
            }

            //event for rule change
            $scope.resetCrAndDb = function (rule) {
                $scope.rule = rule;
                $scope.formData.crAccounts = [{}];
                $scope.formData.dbAccounts = [{}];

                if (rule.allowMultipleDebitEntries) {
                    $scope.allowDebitEntries = true;
                } else {
                    $scope.allowDebitEntries = false;
                }
                if (rule.allowMultipleCreditEntries) {
                    $scope.allowCreditEntries = true;
                } else {
                    $scope.allowCreditEntries = false;
                }
            }

            //events for credits
            $scope.addCrAccount = function () {
                $scope.errorcreditevent = false;
                $scope.formData.crAccounts.push({});
                $scope.formData.crAmountTemplate = undefined;
                if ($scope.formData.rule) {
                    if (!$scope.formData.rule.allowMultipleCreditEntries) {
                        $scope.allowCreditEntries = false;
                    }
                }
            }

            $scope.removeCrAccount = function (index) {
                $scope.formData.crAccounts.splice(index, 1);
                if ($scope.formData.crAccounts.length == 0) {
                    $scope.allowCreditEntries = true;
                }
            }

            //events for debits
            $scope.addDebitAccount = function () {
                $scope.errordebitevent = false;
                $scope.formData.dbAccounts.push({});
                $scope.formData.debitAmountTemplate = undefined;
                if ($scope.formData.rule) {
                    if (!$scope.formData.rule.allowMultipleDebitEntries) {
                        $scope.allowDebitEntries = false;
                    }
                }
            }

            $scope.removeDebitAccount = function (index) {
                $scope.formData.dbAccounts.splice(index, 1);
                if ($scope.formData.dbAccounts.length == 0) {
                    $scope.allowDebitEntries = true;
                }
            }

            $scope.submit = function () {
                var jeTransaction = new Object();
                var reqDate = dateFilter($scope.first.date, $scope.df);
                jeTransaction.locale = $scope.optlang.code;
                jeTransaction.dateFormat = $scope.df;
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

                resourceFactory.journalEntriesResource.save(jeTransaction, function (data) {
                    $modalInstance.dismiss('cancel');
                    route.reload();
                    $scope.eodProcessData=data;
                    if ($scope.documents && $scope.documents.length > 0) {
                        uploadDocumets(data);
                    } else {
                        relaunch();
                    }
                });
            }
            function relaunch() {
                route.reload();
            }

            function uploadDocumets(eodProcessData) {
                for (var i in $scope.documents) {
                    uploadProcessDocumets(i, eodProcessData);
                }
            }

            var docResponse = 0;

            function uploadProcessDocumets(index, eodProcessData) {
                var documentData = {};
                angular.copy($scope.documents[index], documentData);
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/eodsummary/' + $scope.eodProcessId + '/documents',
                    data: documentData,
                    file: $scope.files[index],
                    progress: function(e){}
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                    docResponse++;
                    if (docResponse == $scope.documents.length) {
                        relaunch();
                    }
                });
            }
            $scope.documents = [];
            $scope.docData = {};
            $scope.files = [];
            $scope.onFileSelect = function ($files) {
                $scope.docData.fName = $files[0].name;
                $scope.files.push($files[0]);
                $scope.documents.push($scope.docData);
                $scope.docData = {};
            };
            $scope.deleteDocument = function (index) {
                $scope.documents.splice(index, 1);
            };
            $scope.viewDocument = function (index) {

            };
            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };

        }
    });

    mifosX.ng.application.controller('CreateJournalVoucherController', ['$scope', 'ResourceFactory', 'dateFilter','$modalInstance','$route','$upload','$rootScope','API_VERSION', mifosX.controllers.CreateJournalVoucherController]).run(function ($log) {
        $log.info("CreateJournalVoucherController initialized");
    });
}(mifosX.controllers || {}));
