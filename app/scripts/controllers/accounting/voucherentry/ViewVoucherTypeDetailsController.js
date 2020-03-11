/**
 * Created by CT on 03-05-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewVoucherTypeDetailsController: function (scope, routeParams, resourceFactory, dateFilter, API_VERSION, $upload, $rootScope, location, route, $modal, CommonUtilService, $sce,http) {
            /**
             * Based on the voucher type change the labels
             */
            scope.isUpdatePaymentDetails = false;
            scope.reportName = 'Voucher Entry';
            scope.reportOutputType = 'PDF';
            scope.transactionId=routeParams.transactionId;
            scope.hidePentahoReport = true;
            scope.debitLabel = 'label.input.paid.to';
            scope.creditLabel = 'label.input.paid.from';
            scope.isDisplayReverse = true;
            if (scope.voucherCode === 'cashreceipt' || scope.voucherCode === 'bankreceipt') {
                scope.debitLabel = 'label.input.received.by';
                scope.creditLabel = 'label.input.received.from';
            } else if (scope.voucherCode === 'jventry' || scope.voucherCode === 'contraentry') {
                scope.debitLabel = 'label.input.gl.accounts';
                scope.creditLabel = 'label.input.gl.accounts';
            }
            /*************************************************************************/

            resourceFactory.voucherTemplateResource.get({
                "voucherType": scope.voucherCode
            }, function (data) {
                scope.officeOptions = data.templateData.officeOptions;
                scope.currencyOptions = data.templateData.currencyOptions;
                scope.debitAccountingOptions = data.templateData.debitAccountingOptions;
                scope.creditAccountingOptions = data.templateData.creditAccountingOptions;
                scope.paymentOptions = data.templateData.paymentOptions;
            });

            scope.isReversed = true;
            resourceFactory.voucherResource.get({
                'voucherId': scope.voucherId,
                'voucherType': scope.voucherCode
            }, function (data) {
                scope.voucherData = data;
                scope.totalTransactionData = {};
                scope.totalTransactionData.totalDebitAmount = 0;
                scope.totalTransactionData.totalCreditAmount = 0;
                scope.isReversed = scope.voucherData.isReversed ;
                if (!_.isUndefined(scope.voucherData.journalEntryData.journalEntryDetails)) {
                    if (scope.voucherData.journalEntryData.journalEntryDetails.length > 0) {
                        scope.journalEntryDetails = scope.voucherData.journalEntryData.journalEntryDetails;
                        if(!scope.voucherData.isReversed) {
                            for (var i in scope.journalEntryDetails) {
                                var journalEntryDetail = scope.journalEntryDetails[i];
                                if (journalEntryDetail.entryType.code == 'journalEntrytType.debit') {
                                    scope.totalTransactionData.totalDebitAmount += journalEntryDetail.amount;
                                } else if (journalEntryDetail.entryType.code == 'journalEntryType.credit') {
                                    scope.totalTransactionData.totalCreditAmount += journalEntryDetail.amount;
                                }
                            }
                        }
                    }
                }
                if (!_.isUndefined(scope.voucherData.journalEntryData.transactionDetails.paymentDetails) && !_.isUndefined(scope.voucherData.journalEntryData.transactionDetails.paymentDetails.id)) {
                    scope.paymentDetails = scope.voucherData.journalEntryData.transactionDetails.paymentDetails;
                }
            });
            
            scope.isUploadNewDocuments = false;
            scope.getDocuments = function () {
                scope.isDisplayReverseButton();
                resourceFactory.documentsResource.getAllDocuments({
                    entityType: 'vouchers',
                    entityId: scope.voucherId
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
               
            scope.isDisplayReverseButton = function(){
                if(scope.isDisplayReverse){
                    scope.isDisplayReverse = false;
                }else{
                    scope.isDisplayReverse = true;
                }
            }
            /**
             * Payment Details Related Code
             */
            scope.enableEditPaymentDetails = function () {
                scope.formData = {};
                scope.isUpdatePaymentDetails = true;
                scope.formData.paymentDetails = {};
                scope.formData.paymentDetails.paymentType = scope.paymentDetails.paymentType.id;
                scope.formData.paymentDetails.instrumentionNumber = scope.paymentDetails.checkNumber;
                scope.formData.paymentDetails.instrumentationDate = new Date(scope.paymentDetails.transactionDate);
                scope.formData.paymentDetails.bankName = scope.paymentDetails.bankNumber;
                scope.formData.paymentDetails.branchName = scope.paymentDetails.branchName;

            };

            scope.reverseTransaction = function () {
                $modal.open({
                    templateUrl: 'reverseTransaction.html',
                    controller: ReverseJournalEntriesCtrl,
                    resolve: {
                        voucherId: function () {
                            return scope.voucherId;
                        },
                        voucherType: function () {
                            return scope.voucherCode ;
                        }
                    }
                });
            }

            var ReverseJournalEntriesCtrl = function ($scope, $modalInstance, voucherId, voucherType) {
                $scope.data = {
                    reverseComments:""
                };
                $scope.reverse = function () {
                    var reverseData = {voucherId: voucherId, voucherType: voucherType, command:'ReverseVoucher'} ;
                    resourceFactory.voucherResource.update(reverseData,$scope.data, function (data) {
                        route.reload();
                    });
                    $scope.cancel() ;
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.submitPaymentDetails = function () {
                if (scope.formData.paymentDetails) {
                    scope.formData.paymentDetails.instrumentationDate = dateFilter(scope.formData.paymentDetails.instrumentationDate, scope.df);
                    scope.formData.paymentDetails.dateFormat = scope.df;
                    scope.formData.paymentDetails.locale = "en";
                    resourceFactory.voucherResource.update({
                        'voucherId': scope.voucherId,
                        'voucherType': scope.voucherCode,
                        'command':'UpdateVoucher'
                    }, scope.formData.paymentDetails, function (data) {
                        scope.paymentDetails.paymentType = {}
                        scope.paymentDetails.paymentType.id = scope.formData.paymentDetails.paymentType;
                        for (var i in scope.paymentOptions) {
                            if (scope.paymentOptions[i].id == scope.paymentDetails.paymentType.id) {
                                scope.paymentDetails.paymentType.name = scope.paymentOptions[i].name;
                                break;
                            }
                        }
                        scope.paymentDetails.checkNumber = scope.formData.paymentDetails.instrumentionNumber;
                        scope.paymentDetails.transactionDate = scope.formData.paymentDetails.instrumentationDate;
                        scope.paymentDetails.bankNumber = scope.formData.paymentDetails.bankName;
                        scope.paymentDetails.branchName = scope.formData.paymentDetails.branchName;
                        scope.isUpdatePaymentDetails = false;
                    });
                }

            };

            scope.cancelPaymentDetails = function () {
                scope.isUpdatePaymentDetails = false;
            };

            /**
             * Upload Documents Related Code
             */
            scope.newDocuments = [];
            scope.docData = {};
            scope.files = [];
            scope.onFileSelect = function ($files) {
                scope.docData.fName = $files[0].name;
                scope.files.push($files[0]);
            };
            scope.addDocument = function(){
                scope.newDocuments.push(scope.docData);
                scope.docData = {};
            };
            scope.deleteDocument = function (documentId,index) {
                resourceFactory.documentsResource.delete({'entityType':'vouchers','entityId':scope.voucherId,'documentId':documentId})
                scope.documents.splice(index, 1);
            };
            scope.deleteSingleDocument = function(index){
                scope.newDocuments.splice(index,1);
            };
            scope.viewDocument = function (index) {

            };

            var docResponse = 0;
            var uploadURL = null;
            scope.uploadDocuments = function () {
                docResponse = 0;
                uploadURL = $rootScope.hostUrl + API_VERSION + '/vouchers/' + scope.voucherId + '/documents';
                if(!_.isUndefined(scope.newDocuments) && scope.newDocuments.length > 0){
                        uploadProcessDocumets();
                }
            };

            scope.$on('attachmentsUpload', function(event) {
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
                    }else{
                        if($rootScope.requestsInProgressAPIs["POST" + uploadURL]){
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

            scope.download = function(file){
                var url =$rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url,fileType,file.fileName);
            }

            scope.runReport = function () {
                scope.hidePentahoReport = false;

                var reportURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent(scope.reportName);
                reportURL += "?output-type=" + encodeURIComponent(scope.reportOutputType) + "&locale="
                + scope.optlang.code + "&dateFormat=" + scope.df + "&R_transactionId=" + scope.voucherData.journalEntryData.transactionId;

                reportURL = $sce.trustAsResourceUrl(reportURL);

                http.get(reportURL, {responseType: 'arraybuffer'}).
                    success(function (data, status, headers, config) {
                        var contentType = headers('Content-Type');
                        var file = new Blob([data], {type: contentType});
                        var fileContent = URL.createObjectURL(file);

                        scope.baseURL = $sce.trustAsResourceUrl(fileContent);
                    });
            }
        }
    });
    mifosX.ng.application.controller('ViewVoucherTypeDetailsController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', 'API_VERSION', '$upload', '$rootScope', '$location', '$route', '$modal', 'CommonUtilService', '$sce','$http' , mifosX.controllers.ViewVoucherTypeDetailsController]).run(function ($log) {
        $log.info("ViewVoucherTypeDetailsController initialized");
    });
}(mifosX.controllers || {}));