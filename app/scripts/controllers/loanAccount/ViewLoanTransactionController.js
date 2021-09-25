(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanTransactionController: function (scope, resourceFactory, location, routeParams, dateFilter, $modal, route, $rootScope, API_VERSION, $upload, commonUtilService) {

            scope.glimTransactions = [];
            scope.groupBankAccountDetails = {};
            scope.reversalReasons = [];
            scope.isRejectReasonRequired = false;
            scope.isValuedateUpdateRequired = false;
            scope.isRefundTransaction = false;
            scope.isWriteOff = false;
            scope.isGlimLoan = false;
            scope.backDatedTxn = false;
            scope.backDatedTxnError = false;
            scope.isDisplayReverse = true;
            scope.viewConfig = {};
            scope.viewConfig.data = false;
            scope.viewConfig.viewDocument = false;
            scope.backDatedReasonMandatory = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.backDatedReason;
            
            function init(){
                resourceFactory.loanTrxnsResource.get({loanId: routeParams.accountId, transactionId: routeParams.id}, function (data) {
                    scope.transaction = data;
                    scope.isWriteOff = (data.type.code=='loanTransactionType.writeOff');
                    scope.isGlimLoan = data.isGlimLoan;
                    if(scope.transaction.type.code === "loanTransactionType.refund"){
                        scope.isRefundTransaction = true;
                    }
                    
                    if(data.isGlimLoan){
                        scope.glimTransactions = data.glimTransactions;
                        if(scope.isGlimPaymentAsGroupEnabled){
                            scope.isGlimWriteOffTransaction = true;
                        }
                    }                    
                    scope.transaction.accountId = routeParams.accountId;
                    scope.transaction.createdDate = new Date(scope.transaction.createdDate.iLocalMillis);
                    scope.transaction.updatedDate = new Date(scope.transaction.updatedDate.iLocalMillis);
                    scope.groupBankAccountDetails = data.bankAccountDetailsData;
                    if (scope.transaction.txnValueDateStatus && scope.transaction.txnValueDateStatus.id==1 && !scope.transaction.manuallyReversed) {
                        scope.isValuedateUpdateRequired = true;
                    }
                    scope.isValueDateEnabled = scope.isSystemGlobalConfigurationEnabled('enable-value-date-for-loan-transaction');
                    scope.isUndoEditTrxnEnabled();
                    scope.getReversalReasonCodes();
                    scope.isBackDatedTxn(data.date);
                });
            };

            scope.isBackDatedTxn = function(transactionDate){
                var txndate = dateFilter(transactionDate, scope.df) ;
                txndate = txndate+"";
                var date = dateFilter(new Date(), scope.df) ;
                date = date+"";
                if(!(txndate==date) && scope.backDatedReasonMandatory==true){
                    scope.backDatedTxn = true;
                }
            }

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.loanAccount &&
                scope.response.uiDisplayConfigurations.loanAccount.isMandatory){
                if(scope.response.uiDisplayConfigurations.loanAccount.isMandatory.undoTransactionReason){
                   scope.isRejectReasonRequired = scope.response.uiDisplayConfigurations.loanAccount.isMandatory.undoTransactionReason; 
                }
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewLoanAccountDetails &&
                scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild){
                   scope.hideEditTransactions = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.editTransactions;
            }

            scope.getReversalReasonCodes = function(){
                resourceFactory.codeValueByCodeNameResources.get({codeName: "Transaction Reversal Reason"}, function (data) {
                    scope.reversalReasons = data;
                 });
            };

            scope.getReversalReasonCodes();

            scope.isUndoEditTrxnEnabled = function () {
                scope.hideEditUndoTrxnButton = false;
                scope.hideEditTrxnButton = false;
                if (scope.transaction.type.contra || scope.transaction.type.revokeSubsidy || scope.transaction.type.addSubsidy || scope.transaction.type.disbursement) {
                    scope.hideEditUndoTrxnButton = true;
                }
                if(scope.transaction.transfer || scope.isValueDateEnabled){
                    scope.hideEditTrxnButton = true;    
                }
            }

            scope.undo = function (accountId, transactionId) {
                $modal.open({
                    templateUrl: 'undotransaction.html',
                    controller: UndoTransactionModel,
                    resolve: {
                        accountId: function () {
                          return accountId;
                        },
                        transactionId: function () {
                          return transactionId;
                        }
                    }
                });
            };

            scope.downloadReceipt = function (accountId, transactionId) {
                resourceFactory.loanTrxnsReceiptDownloadResource.post({ loanId: accountId, transactionId: transactionId }, function (data) {
                    fileId = data.resourceId;
                    resourceFactory.fileUrlResource.get({ fileId: fileId }, function (data) {
                        var url = data.locationPath;
                        url = $rootScope.hostUrl + API_VERSION + '/' + url;
                        commonUtilService.downloadFile(url, data.contentType.toLowerCase(), "Receipt");
                    });
                });
            };

            scope.download = function(file){
                var url =$rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url,fileType,file.fileName);
            }

            scope.isDisplayReverseButton = function () {
                if (scope.isDisplayReverse) {
                    scope.isDisplayReverse = false;
                } else {
                    scope.isDisplayReverse = true;
                }
            }

            scope.newDocuments = [];
            scope.docData = {};
            scope.files = [];
            scope.onFileSelect = function ($files) {
                scope.docData.fName = $files[0].name;
                scope.files.push($files[0]);
            };
            scope.addDocument = function () {
                scope.newDocuments.push(scope.docData);
                scope.docData = {};
            };
            scope.deleteDocument = function (documentId, index) {
                resourceFactory.documentsResource.delete({ 'entityType': 'loantransaction', 'entityId': scope.transaction.id, 'documentId': documentId })
                scope.documents.splice(index, 1);
            };
            scope.deleteSingleDocument = function (index) {
                scope.newDocuments.splice(index, 1);
            };

            scope.openViewDocument = function (documentDetail) {
                $modal.open({
                    templateUrl: 'viewDocument.html',
                    controller: viewDocumentCtrl,
                    resolve: {
                        documentDetail: function () {
                            return documentDetail;
                        }
                    }
                });
            };

            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
            };

            var docResponse = 0;
            var uploadURL = null;
            scope.uploadDocuments = function () {
                docResponse = 0;
                uploadURL = $rootScope.hostUrl + API_VERSION + '/loantransaction/' + scope.transaction.id + '/documents';
                if (!_.isUndefined(scope.newDocuments) && scope.newDocuments.length > 0) {
                    uploadProcessDocumets();
                }
            };

            scope.$on('attachmentsUpload', function (event) {
                uploadProcessDocumets();
            });

            function uploadProcessDocumets() {
                $upload.upload({
                    url: uploadURL,
                    data: scope.newDocuments[docResponse],
                    file: scope.files[docResponse]
                }).then(function (data) {
                    // to fix IE not refreshing the model
                    if (!scope.$$phase) {
                        scope.$apply();
                    }
                    docResponse++;
                    if (docResponse == scope.newDocuments.length) {
                        scope.getDocuments();
                    } else {
                        if ($rootScope.requestsInProgressAPIs["POST" + uploadURL]) {
                            delete $rootScope.requestsInProgressAPIs["POST" + uploadURL];
                        }
                        scope.$emit("attachmentsUpload");
                    }
                });
            };

            scope.uploadNewDocuments = function () {
                scope.newDocuments = [];
                scope.docData = {};
                scope.files = [];
                scope.isUploadNewDocuments = true;
            };

            scope.cancelDocuments = function () {
                scope.isUploadNewDocuments = false;
            };

            scope.isUploadNewDocuments = false;
            scope.getDocuments = function () {
                scope.isDisplayReverseButton();
                resourceFactory.documentsResource.getAllDocuments({
                    entityType: 'loantransaction',
                    entityId: scope.transaction.id
                }, function (data) {
                    for (var l in data) {
                        var loandocs = {};
                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                        data[l].docUrl = loandocs;
                    }
                    scope.documents = data;
                    scope.isUploadNewDocuments = false;
                });
            };
            
            var UndoTransactionModel = function ($scope, $modalInstance, accountId, transactionId) {
                $scope.reasons = scope.reversalReasons;
                $scope.isError = false;
                $scope.isRejectReasonRequired = scope.isRejectReasonRequired;
                $scope.backDatedTxn = scope.backDatedTxn;
                $scope.backDatedTxnError = false;
                $scope.undoTransaction = function (reason,note) {
                    var params = {loanId: accountId};
                    if(scope.isWriteOff && (scope.isGlimWriteOffTransaction || !scope.isGlimLoan)){
                        params.command = 'undowriteoff';
                    }else{
                        params.transactionId = transactionId;
                        params.command = 'undo';
                     }
                     if($scope.backDatedTxn==true && (note==undefined || note=="")){
                        $scope.backDatedTxnError = true;
                        return false;
                    }
                    
                    var formData = {dateFormat: scope.df, locale: scope.optlang.code, transactionAmount: 0};
                    if(note){
                        formData.note = note;
                    }
                    if(reason){
                        formData.reason = reason;
                    }else{
                        if($scope.isRejectReasonRequired==true){
                            $scope.isError = true;
                            return false;
                        }
                        
                    }
                    formData.transactionDate = dateFilter(new Date(), scope.df);
                    resourceFactory.loanTrxnsResource.save(params, formData, function (data) {
                        $modalInstance.close('delete');
                        location.path('/viewloanaccount/' + data.loanId);
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };


            scope.editUtrNumber = function () {
                $modal.open({
                    templateUrl: 'utrNumber.html',
                    controller: UtrnCtrl,
                    windowClass: 'modalwidth700'
                });
            };

            var UtrnCtrl = function ($scope, $modalInstance) {
                
                $scope.utrFormData =  {};
                

                $scope.submitUtrn = function () {

                    resourceFactory.loanTrxnForUtrNumberResource.update({loanId: routeParams.accountId, transactionId: routeParams.id},$scope.utrFormData, function (data) {
                        $modalInstance.close('utrNumber');
                        init();
                    });
                };

                 $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.updateValueDate = function (accountId, transactionId) {
                $modal.open({
                    templateUrl: 'updatevaluedate.html',
                    controller: UpdateValueDateCtrl,
                    resolve: {
                        accountId: function () {
                          return accountId;
                        },
                        transactionId: function () {
                          return transactionId;
                        }
                    }
                });
            };
            
            var UpdateValueDateCtrl = function ($scope, $modalInstance, accountId, transactionId) {
                $scope.formRequestData = {dateFormat: scope.df, locale: scope.optlang.code};
                $scope.formRequestData.valueDate = new Date();
                $scope.updateTransaction = function (reason) {
                    var params = {loanId: accountId, transactionId: transactionId};
                    $scope.formRequestData.valueDate = dateFilter($scope.formRequestData.valueDate, scope.df);
                    resourceFactory.loanTransactionValueDateResource.update(params, $scope.formRequestData, function (data) {
                        $modalInstance.close('updatevaluedate');
                        scope.isValuedateUpdateRequired = false;
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            init();
        }
    });
    mifosX.ng.application.controller('ViewLoanTransactionController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', '$modal', '$route', '$rootScope', 'API_VERSION','$upload', 'CommonUtilService', mifosX.controllers.ViewLoanTransactionController]).run(function ($log) {
        $log.info("ViewLoanTransactionController initialized");
    });
}(mifosX.controllers || {}));
