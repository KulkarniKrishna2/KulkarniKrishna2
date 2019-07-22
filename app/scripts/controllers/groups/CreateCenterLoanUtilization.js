(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateCenterLoanUtilization: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter, http,$upload,$rootScope,API_VERSION) {
            scope.styleHalfScreenWidth = {"width" : parseFloat(window.innerWidth/2).toFixed(0)+"px"};
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.file = [];
            scope.formData = {};
            scope.formData.loanUtilizationCheckDetails = [];
            scope.submitted = false;

            if (scope.entityType === "center") {
                resourceFactory.loanUtilizationCheckCenterTemplate.get({centerId: scope.entityId}, function (data) {
                    var data
                    scope.originalLoanCenterTemplate = data;
                    scope.loanCenterTemplate = data;
                    if (scope.loanCenterTemplate != null && scope.loanCenterTemplate.length > 0) {
                        scope.loanPurposes = data[0].loanPurposeDatas;
                        removeFromListTotalUtilizedLoans();
                    }
                });
            };

            var removeFromListTotalUtilizedLoans = function () {
                if (scope.loanCenterTemplate && scope.loanCenterTemplate != null && scope.loanCenterTemplate.length > 0) {
                    var tempLoanCenterTemplate = [];
                    angular.copy(scope.loanCenterTemplate,tempLoanCenterTemplate);
                    scope.loanCenterTemplate = [];
                    for(var i in tempLoanCenterTemplate){
                        if(tempLoanCenterTemplate[i].principalAmount > tempLoanCenterTemplate[i].totalUtilizedAmount){
                            scope.loanCenterTemplate.push(tempLoanCenterTemplate[i]);
                        }
                    }
                }
            };

            if (scope.entityType === "group") {
                resourceFactory.loanUtilizationCheckGroupTemplate.get({groupId: scope.entityId}, function (data) {
                    scope.originalLoanCenterTemplate = data;
                    scope.loanCenterTemplate = data;
                    if (scope.loanCenterTemplate != null && scope.loanCenterTemplate.length > 0) {
                        scope.loanPurposes = data[0].loanPurposeDatas;
                        removeFromListTotalUtilizedLoans();
                    }
                });
            }

            scope.addLoanPurpose = function (parentIndex) {
                if (scope.loanCenterTemplate[parentIndex] && angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail)) {
                    scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail = {};
                }
                scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.loanId = scope.loanCenterTemplate[parentIndex].loanId;
                if (angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails)) {
                    scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails = [];
                }
                scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails.push({loanPurposeId : scope.loanCenterTemplate[parentIndex].loanPurposeId});
            };

            scope.deleteLoanPurpose = function (parentIndex, index) {
                if (scope.loanCenterTemplate[parentIndex] && !angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail)) {
                    if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails)) {
                        if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index])) {
                            delete scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails.splice(index, 1);
                            if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails)) {
                                if (scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails.length == 0) {
                                    delete scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail;
                                }
                            }
                        }
                    }
                }
                if (scope.loanCenterTemplate[parentIndex] && !angular.isUndefined(scope.loanCenterTemplate[parentIndex].files)) {
                    if (!_.isUndefined(scope.loanCenterTemplate[parentIndex].files)) {
                        if (!_.isUndefined(scope.loanCenterTemplate[parentIndex].files[index])) {
                            delete scope.loanCenterTemplate[parentIndex].files.splice(index, 1);
                            if (!_.isUndefined(scope.loanCenterTemplate[parentIndex].files)) {
                                if (scope.loanCenterTemplate[parentIndex].files.length == 0) {
                                    delete scope.loanCenterTemplate[parentIndex].files;
                                }
                            }
                        }
                    }
                }
            };

            scope.percentail = function (parentIndex, index) {
                if (scope.loanCenterTemplate[parentIndex] && !angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail)) {
                    if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails)) {
                        if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index].amount)) {
                            var principalAmount = scope.loanCenterTemplate[parentIndex].principalAmount;
                            var uamount = scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index].amount;
                            var percentailOfUsage = 0.00;
                            if(principalAmount != undefined && uamount != undefined && principalAmount != "" && uamount != "" && !isNaN(principalAmount) && !isNaN(uamount)){
                                //percentailOfUsage = parseFloat(Math.round(parseFloat(uamount) / parseFloat(principalAmount) * 100.00)).toFixed(2);
                                percentailOfUsage = parseFloat(parseFloat(uamount) / parseFloat(principalAmount) * 100.00).toFixed(2);
                            }
                            scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index].percentailOfUsage = percentailOfUsage;
                        }
                    }
                }
            };

            scope.checkLoanPurpose = function (parentIndex, index) {
                if (scope.loanCenterTemplate[parentIndex] && !angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail)) {
                    if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails)) {
                        if (!angular.isUndefined(scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index].loanPurposeId)) {
                            var loanPurposeId = scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index].loanPurposeId;
                            var isSameAsOriginalPurpose = false;
                            if (loanPurposeId == scope.loanCenterTemplate[parentIndex].loanPurposeId) {
                                isSameAsOriginalPurpose = true;
                            }
                            scope.loanCenterTemplate[parentIndex].loanUtilizationCheckDetail.utilizationDetails[index].isSameAsOriginalPurpose = isSameAsOriginalPurpose;
                        }
                    }
                }
            };

            scope.submit = function () {
                scope.submitted = true;
                scope.formData.loanUtilizationCheckDetails = [];
                scope.formData.auditDoneById = scope.currentSession.user.userId;
                scope.submitData = [];
                delete scope.errorDetails;
                angular.copy(scope.loanCenterTemplate, scope.submitData);
                scope.isSubmitAllow = true;
                for (var i in scope.submitData) {
                    if (scope.submitData[i].loanUtilizationCheckDetail && scope.submitData[i].loanUtilizationCheckDetail.utilizationDetails) {

                        for (var j in scope.submitData[i].loanUtilizationCheckDetail.utilizationDetails) {
                            if (scope.submitData[i].loanUtilizationCheckDetail.utilizationDetails[j]) {
                                delete scope.submitData[i].loanUtilizationCheckDetail.utilizationDetails[j].percentailOfUsage;
                                var loanUtilizationCheckDetail = scope.submitData[i].loanUtilizationCheckDetail;
                                if(scope.submitData[i].auditDoneOn) {
                                    loanUtilizationCheckDetail.auditDoneOn = scope.submitData[i].auditDoneOn;
                                }
                                scope.formData.loanUtilizationCheckDetails.push(loanUtilizationCheckDetail);
                                break;
                            }                            
                        }
                        
                    }
                }
                for(var i in scope.loanCenterTemplate){
                    var uploadedFile = scope.loanCenterTemplate[i].files;
                    if(uploadedFile){
                        var index = scope.formData.loanUtilizationCheckDetails.findIndex(x=>x.loanId == scope.loanCenterTemplate[i].loanId);
                        if(index > -1){
                             scope.formData.loanUtilizationCheckDetails[index].files = uploadedFile;
                        }
                       
                    }
                }

                scope.requestFormData = [];
                scope.fileFormData = [];
                for(var i in scope.formData.loanUtilizationCheckDetails){
                    if(scope.formData.loanUtilizationCheckDetails[i].loanId){
                        var data = {};
                        data.loanId = scope.formData.loanUtilizationCheckDetails[i].loanId;
                        if(scope.formData.auditDoneById){
                            data.auditDoneById = scope.formData.auditDoneById;
                        }
                        if(scope.formData.loanUtilizationCheckDetails[i].auditDoneOn){
                            data.auditDoneOn = dateFilter(scope.formData.loanUtilizationCheckDetails[i].auditDoneOn, scope.df);
                        }
                        if(scope.formData.loanUtilizationCheckDetails[i].utilizationDetails.length > 0){
                            for(var k in scope.formData.loanUtilizationCheckDetails[i].utilizationDetails){
                                if(scope.formData.loanUtilizationCheckDetails[i].utilizationDetails[k]){
                                    data.utilizationDetails = {};
                                    data.utilizationDetails = scope.formData.loanUtilizationCheckDetails[i].utilizationDetails[k];
                                    if(data.utilizationDetails.percentailOfUsage){
                                        delete data.utilizationDetails.percentailOfUsage;
                                    }
                                    data.locale = scope.optlang.code;
                                    data.dateFormat = scope.df;
                                    scope.dataCopy = {};
                                    angular.copy(data, scope.dataCopy);
                                    scope.requestFormData.push(scope.dataCopy);
                                }
                            }
                        }
                        if(!_.isUndefined(scope.formData.loanUtilizationCheckDetails[i].files) && scope.formData.loanUtilizationCheckDetails[i].files.length > 0){
                            if(scope.formData.loanUtilizationCheckDetails[i].utilizationDetails.size === scope.formData.loanUtilizationCheckDetails[i].files.size){
                                for(var n in scope.formData.loanUtilizationCheckDetails[i].files){
                                   if(scope.formData.loanUtilizationCheckDetails[i].files[n]){
                                      scope.fileFormData.push(scope.formData.loanUtilizationCheckDetails[i].files[n]);
                                    }
                                }         
                            }else{
                               errorDetails();       
                            } 
                        }else{
                            errorDetails();
                        }
                    }
                };
                if(scope.isSubmitAllow){
                    scope.formReqData = {};
                    scope.formReqData.loanUtilizationChecks = scope.requestFormData || [];
                    var formData = new FormData();
                    formData.append('formDataJson', JSON.stringify(scope.formReqData));
                    for (var i = 0 ; i < scope.fileFormData.length ; i ++){
                        formData.append('files', scope.fileFormData[i]);
                    }

                    if (scope.entityType === "center") {
                        scope.entityTypeParam = "centers"
                        resourceFactory.multipleFileUploadResource.upload({entityType:scope.entityTypeParam,entityId: scope.entityId}, formData, function (data) {
                            location.path('/viewcenter/' + scope.entityId);
                        });
                    }

                    if (scope.entityType === "group") {
                        scope.entityTypeParam = "groups"
                        resourceFactory.multipleFileUploadResource.upload({entityType:scope.entityTypeParam,entityId: scope.entityId}, formData, function (data) {
                            location.path('/group/' + scope.entityId + '/listgrouploanutillization/');
                        });
                    }
                }
                
            };


            scope.onFileSelect = function ($files,parentIndex,index) {
                if(!_.isUndefined(scope.loanCenterTemplate[parentIndex].files)){
                     scope.loanCenterTemplate[parentIndex].files[index] = $files[0]; 
                }else{
                scope.loanCenterTemplate[parentIndex].files = [];
                scope.loanCenterTemplate[parentIndex].files[index] = $files[0]; 
                }
                    
            };

            function errorDetails(){
                if(_.isUndefined(scope.errorDetails)){
                    scope.errorDetails = [];
                }
                scope.isSubmitAllow = false;
                var errorObj = new Object();
                errorObj.args = {
                    params: []
                };
                errorObj.args.params.push({value: 'error.msg.mandatory.files.not.attached'});
                scope.errorDetails[0] = errorObj;
            }

        }
    });
    mifosX.ng.application.controller('CreateCenterLoanUtilization', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter','$http','$upload','$rootScope','API_VERSION', mifosX.controllers.CreateCenterLoanUtilization]).run(function ($log) {
        $log.info("CreateCenterLoanUtilization initialized");
    });

}(mifosX.controllers || {}));