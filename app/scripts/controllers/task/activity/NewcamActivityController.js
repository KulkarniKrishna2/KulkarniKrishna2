(function (module) {
    mifosX.controllers = _.extend(module, {
        NewcamActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, dateFilter, http, routeParams, API_VERSION, $rootScope,localStorageService,$modal, $sce, CommonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.approveloanapplicationdetails = "";
            scope.status = 'SUMMARY';
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            scope.clientId = scope.taskconfig['clientId'];
            scope.approvalType = scope.taskconfig['approvalType'];
            scope.identitydocuments = [];
            scope.formValidationData = {};
            scope.clientdocuments = {};
            scope.loandocuments = {};
            scope.showViewCBHistoryReport = true;

            scope.ruleScore = -1;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.creditBureau){
                scope.showViewCBHistoryReport = !scope.response.uiDisplayConfigurations.creditBureau.isHiddenField.viewHistoryCBReportButton;
            }
            function initTask() {
                scope.clientId = scope.taskconfig['clientId'];
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
                scope.entityType = "loanapplication";
                scope.entityId = scope.loanApplicationReferenceId;
            };
            initTask();

            scope.restrictDate = new Date();

            scope.formRequestData = {};
            scope.formRequestData.approvedOnDate = dateFilter(new Date(scope.restrictDate), scope.df);

            scope.charges = [];
            scope.existingCharges = [];
            var curIndex = 0;

            function fetchClientData(){
                resourceFactory.clientResource.get({clientId: scope.clientId}, function (data) {
                    scope.clientData = data;
                    if (data.staffId != null) {
                        scope.formValidationData.loanOfficerId = data.staffId;
                    }
                    if (data.imagePresent) {
                        http({
                            method: 'GET',
                            url: $rootScope.hostUrl + API_VERSION + '/client/' + scope.clientId + '/images?maxHeight=150'
                        }).then(function (imageData) {
                            scope.imageData = imageData.data[0];
                            http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + scope.clientId + '/images/'+scope.imageData.imageId+'?maxHeight=150'
                            }).then(function (imageData) {
                                scope.image = imageData.data;
                            });
                        });
                    }
                });


                resourceFactory.clientResource.getAllClientDocuments({clientId: scope.clientId, anotherresource: 'identifiers'}, function (data) {
                    scope.identitydocuments = data;
                    for (var i = 0; i < scope.identitydocuments.length; i++) {
                        resourceFactory.clientIdentifierResource.get({clientIdentityId: scope.identitydocuments[i].id}, function (data) {
                            for (var j = 0; j < scope.identitydocuments.length; j++) {
                                if (data.length > 0 && scope.identitydocuments[j].id == data[0].parentEntityId) {
                                    for (var l in data) {

                                        var loandocs = {};
                                        loandocs = API_VERSION + '/' + data[l].parentEntityType + '/' + data[l].parentEntityId + '/documents/' + data[l].id + '/attachment';
                                        data[l].docUrl = loandocs;
    
                                    }
                                    scope.identitydocuments[j].documents = data;
                                }
                            }
                        });
                    }
                    
                });                

                resourceFactory.familyDetails.getAll({clientId: scope.clientId}, function (data) {
                    scope.familyMembers = data;
                });
   
            }
            scope.incomeAndexpense = function(){
                resourceFactory.incomeExpenseAndHouseHoldExpense.getAll({clientId: scope.clientId},function(data){
                    scope.incomeAndExpenses = data;
                    scope.totalIncomeOcc = scope.calculateOccupationTotal();
                    scope.totalIncomeAsset = scope.calculateTotalAsset();
                    scope.totalHouseholdExpense = scope.calculateTotalExpense();
                });
            };

            scope.viewIdentityDocument = function(document){
                var url = $rootScope.hostUrl + document.docUrl;
                url = $sce.trustAsResourceUrl(url);
                http.get(url, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', 'text/plain'];
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    if (supportedContentTypes.indexOf(contentType) > -1) {
                        var docData = $sce.trustAsResourceUrl(fileContent);
                        window.open(docData);
                    }
                });
            };

            scope.showSummary = function () {
                fetchClientData();
                scope.incomeAndexpense();
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                    scope.formData = applicationData;
                });

            }

            function documentsURL(document){
                return API_VERSION + '/' + document.parentEntityType + '/' + document.parentEntityId + '/documents/' + document.id + '/attachment';
            };

            scope.getLoanDocuments = function() {
                resourceFactory.documentsResource.getAllDocuments({entityType: "loanapplication", entityId:  scope.loanApplicationReferenceId}, function (data) {
                    scope.loandocuments = {};
                    for (var l = 0; l < data.length; l++) {
                        if (data[l].id) {
                            data[l].docUrl = documentsURL(data[l]);
                        }
                        if (data[l].tagValue && !scope.restrictTaggedDocuments) {
                            scope.pushLoanDocumentToTag(data[l], data[l].tagValue);
                        } else if (!data[l].tagValue) {
                            scope.pushLoanDocumentToTag(data[l], 'uploadedDocuments');
                        }
                    }
                });
            };


            scope.pushLoanDocumentToTag = function (document, tagValue) {
                if (scope.loandocuments.hasOwnProperty(tagValue)) {
                    scope.loandocuments[tagValue].push(document);
                } else {
                    scope.loandocuments[tagValue] = [];
                    scope.loandocuments[tagValue].push(document);
                }
            }

            scope.clientDocumentsLoaded = false;
            scope.getClientDocuments = function () {
                if(!scope.clientDocumentsLoaded) {
                    resourceFactory.clientDocumentsResource.getAllClientDocuments({clientId:  scope.clientId}, function (data) {
                        scope.clientdocuments = {};
                        for (var l = 0; l < data.length; l++) {
                            if (data[l].id) {
                                data[l].docUrl = documentsURL(data[l]);
                            }
                            if(data[l].tagValue){
                                scope.pushClientDocumentToTag(data[l], data[l].tagValue);
                            } else {
                                scope.pushClientDocumentToTag(data[l], 'uploadedDocuments');
                            }
                        }
                    });
                    scope.clientDocumentsLoaded = true;
                }
            };

            scope.pushClientDocumentToTag = function(document, tagValue){
                if (scope.clientdocuments.hasOwnProperty(tagValue)) {
                    scope.clientdocuments[tagValue].push(document);
                } else {
                    scope.clientdocuments[tagValue] = [];
                    scope.clientdocuments[tagValue].push(document);
                }
            };

            var viewDocumentCtrl= function ($scope, $modalInstance, documentDetail) {
                $scope.data = documentDetail;
                $scope.close = function () {
                    $modalInstance.close('close');
                };
               
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

            scope.download = function(file){
                var url = $rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url,fileType,file.fileName);
            };

            scope.showSummary();

            scope.report = false;

            scope.calculateOccupationTotal = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(data){
                    if(!_.isUndefined(data.incomeExpenseData.cashFlowCategoryData.categoryEnum) && data.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 1){
                        if(!_.isUndefined(data.totalIncome) && !_.isNull(data.totalIncome)){
                            total = total + data.totalIncome;
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalAsset = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(data){
                    if(!_.isUndefined(data.incomeExpenseData.cashFlowCategoryData.categoryEnum) && data.incomeExpenseData.cashFlowCategoryData.categoryEnum.id == 2){
                        if(!_.isUndefined(data.totalIncome) && !_.isNull(data.totalIncome)){
                            total = total + data.totalIncome;
                        }
                    }
                });
                return total;
            };

            scope.calculateTotalExpense = function(){
                var total = 0;
                angular.forEach(scope.incomeAndExpenses, function(data){
                    if(!_.isUndefined(data.incomeExpenseData.cashFlowCategoryData.typeEnum) && data.incomeExpenseData.cashFlowCategoryData.typeEnum.id == 2){
                        if(!_.isUndefined(data.totalExpense) && !_.isNull(data.totalExpense)){
                            total = total + data.totalExpense;
                        }
                    }
                });
                return total;
            };

            scope.viewCreditBureauReport = false;
            scope.errorMessage = [];
            scope.cbResponseError = false;
            scope.cbLoanEnqResponseError = false;

            scope.trancheDisbursalId = routeParams.trancheDisbursalId;
            scope.cbStatusPending="PENDING";
            scope.cbStatusSuccess="SUCCESS";
            scope.cbStatusError="ERROR";

            scope.isReportPresent = false;

            scope.routeToViewCBReport = function (id) {
                location.path('/clients/'+scope.clientId+'/view/creditbureau/'+id+'/summary');
             };
 
             scope.routeToViewCBReportHistory = function (id) {
                 scope.fetchType = "history";
                 location.path('/clients/'+scope.clientId+'/view/creditbureau/'+id+'/summary').search({
                         fetchType:scope.fetchType});
             };

            scope.clientCreditBureauReportSummaryLoaded = false;
            scope.getCreditBureauReportSummary = function () {
                if(!scope.clientCreditBureauReportSummaryLoaded){
                    scope.clientCreditBureauReportSummaryLoaded = true;
                    scope.limitForCB = scope.response.uiDisplayConfigurations.creditBureau.getlimit;
                    resourceFactory.creditBureauEnquiriesResource.getAll({"limit":scope.limitForCB},{
                        entityType: "client",
                        entityId: scope.clientId
                    }, function (data) {
                        scope.creditBureauEnquiries = data;
                        scope.checkIfStalePeriodExpired();
                    });
                }
            }
            scope.checkIfStalePeriodExpired = function () {
                var lastInitiatedDate = new Date('10/15/1800');
                if (scope.creditBureauEnquiries.length > 0) {
                    for (var i = 0; i < scope.creditBureauEnquiries.length; i++) {
                        if (scope.creditBureauEnquiries[i].status.code != "ERROR") {
                            var tempDate = new Date(scope.creditBureauEnquiries[i].createdDate);
                            if (tempDate > lastInitiatedDate) {
                                var lastInitiatedDate = tempDate;
                                var j = i;
                            }
                        }
                    }
                    if (j != undefined) {
                        scope.isStalePeriodExceeded = scope.creditBureauEnquiries[j].isStalePeriodExceeded;
                    }
                }
            }

            var viewCBEnquiryHistory = function(offset,limit,callback){
                resourceFactory.creditBureauEnquiriesResource.getAll({limit:limit,offset:offset,fetchType:scope.fetchType},{
                    entityType: "client",
                    entityId: scope.clientId
                }, callback);
            }
            scope.viewCreditBureauEnquiryHistory = function () {
                scope.showHistoryHeading = true;
                scope.creditBureauEnquiriesHistory = paginatorUsingOffsetService.paginate(viewCBEnquiryHistory, scope.limitForCBHistory);
            };

            scope.download = function(file){
                var url =$rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                CommonUtilService.downloadFile(url,fileType,file.fileName);
            }

            scope.viewEnquiryDocument = function(enquiryId, reportEntityType) {
                var reportEntityType = "CreditBureau";
                var url = $rootScope.hostUrl + '/fineract-provider/api/v1/enquiry/creditbureau/' + reportEntityType + '/' +
                    enquiryId + '/attachment';
                url = $sce.trustAsResourceUrl(url);
                http.get(url, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var supportedContentTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/html', 'application/xml', 'text/plain'];
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    if (supportedContentTypes.indexOf(contentType) > -1) {
                        var docData = $sce.trustAsResourceUrl(fileContent);
                        window.open(docData);
                    }
                });
            };

            scope.isReportPresent = false;

            scope.getNumberArray = function(num) {
                return new Array(num);
            };

            scope.showImageModal = function (name, imageUrl) {
                scope.selectedImageName = name;
                scope.selectedImageUrl = imageUrl;
                $modal.open({
                    templateUrl: 'views/common/imagepopup.html',
                    controller: ViewImageCtrl,
                    windowClass: 'modalwidth800'
                });
            };
            var ViewImageCtrl = function ($scope, $modalInstance) {
                $scope.selectedImageName = scope.selectedImageName;
                $scope.selectedImageUrl = scope.selectedImageUrl;
                $scope.cancelImageModal = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.viewCamReport = function () {
                //scope.printbtn = true;
                scope.report = true;
                scope.viewLoanReport = false;
                scope.viewReport = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'PDF';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("TW CAM Report");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType)+"&locale="+scope.optlang.code;
                var reportParams = "";
                var paramName = "R_loanApplicationId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.loanApplicationReferenceId);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                baseURL = $sce.trustAsResourceUrl(scope.baseURL);
                http.get(baseURL, { responseType: 'arraybuffer' }).
                success(function(data, status, headers, config) {
                    var contentType = headers('Content-Type');
                    var file = new Blob([data], { type: contentType });
                    var fileContent = URL.createObjectURL(file);
                    scope.viewReportDetails = $sce.trustAsResourceUrl(fileContent);
                    window.open(scope.viewReportDetails);
                });

            };
            
        }
    });
    mifosX.ng.application.controller('NewcamActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', 'dateFilter','$http', '$routeParams', 'API_VERSION', '$rootScope','localStorageService','$modal', '$sce', 'CommonUtilService', mifosX.controllers.NewcamActivityController]).run(function ($log) {
        $log.info("NewcamActivityController initialized");
    });
}(mifosX.controllers || {}));