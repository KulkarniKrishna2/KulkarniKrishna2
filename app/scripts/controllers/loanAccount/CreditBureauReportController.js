(function (module) {
    mifosX.controllers = _.extend(module, {
        CreditBureauReportController: function (scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json) {

            scope.viewCreditBureauReport = false;
            scope.errorMessage = [];
            scope.cbResponseError = false;
            scope.cbLoanEnqResponseError = false;
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (data) {
                scope.formData = data;
                scope.loanProductChange(scope.formData.loanProductId);
                resourceFactory.loanProductResource.getCreditbureauLoanProducts({loanProductId: scope.formData.loanProductId,associations: 'creditBureaus'},function (data) {
                    scope.creditbureauLoanProduct = data;
                });
            });
            scope.loanProductChange = function (loanProductId) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                if (scope.formData.clientId && scope.formData.groupId) {
                    scope.inparams.templateType = 'jlg';
                } else if (scope.formData.groupId) {
                    scope.inparams.templateType = 'group';
                } else if (scope.formData.clientId) {
                    scope.inparams.templateType = 'individual';
                }
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;
                scope.inparams.productId = loanProductId;
                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                });
            };

            resourceFactory.loanApplicationReferencesCreditBureauReportOtherInstituteLoansSummaryResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (loansSummary) {
                scope.loansSummary = loansSummary;
                //scope.viewCreditBureauReport = true;
            });

            scope.creditBureauReport = function(){
                resourceFactory.loanApplicationReferencesCreditBureauReportResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (loansSummary) {
                    scope.loansSummary = loansSummary;
                });
            }

            scope.creditBureauReportView = function () {
                resourceFactory.loanApplicationReferencesCreditBureauReportFileContentResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (fileContentData) {
                   if(fileContentData.reportFileType.value == 'HTML'){
                        var result = "";
                        for(var i = 0; i < fileContentData.fileContent.length; ++i){
                            result+= (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var popupWin = window.open('', '_blank', 'width=1000,height=500');
                        popupWin.document.open();
                        popupWin.document.write(result);
                        popupWin.document.close();
                    }
                });

            };

            scope.convertByteToString = function (content, status) {
                var result = "";
                if(content != undefined && content != null){
                    for(var i = 0; i < content.length; ++i){
                        result+= (String.fromCharCode(content[i]));
                    }
                }
                if(status) {
                    var jsonObj = ngXml2json.parser(result);
                    if(jsonObj.indvreportfile){
                        if(jsonObj.indvreportfile.inquirystatus.inquiry.errors.error.lenght > 1){
                            scope.errorMessage = jsonObj.indvreportfile.inquirystatus.inquiry.errors.error
                        }else{
                            scope.errorMessage = jsonObj.indvreportfile.inquirystatus.inquiry.errors.error.description;
                            scope.cbLoanEnqResponseError = true;
                        }
                    }else{
                        if(jsonObj.reportfile.inquirystatus.inquiry.errors.error.length > 1){
                            scope.errorMessage = jsonObj.reportfile.inquirystatus.inquiry.errors.error;
                        }else{
                            scope.errorMessage = jsonObj.reportfile.inquirystatus.inquiry.errors.error.description;
                            scope.cbResponseError = true;
                        }

                    }
                    return scope.errorMessage;
                }
                return result;
            };

            scope.proceedToNext = function () {
                resourceFactory.loanApplicationReferencesResource.update({loanApplicationReferenceId: scope.loanApplicationReferenceId,command: 'requestforapproval'},{}, function (data) {
                    //location.path('/approveloanapplicationreference/' + scope.loanApplicationReferenceId);
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

            scope.rejectApprovalLoanAppRef = function () {
                resourceFactory.loanApplicationReferencesResource.update({
                    loanApplicationReferenceId: scope.loanApplicationReferenceId,
                    command: 'reject'
                }, {}, function (data) {
                    location.path('/viewclient/' + scope.formData.clientId);
                });
            };

        }
    });
    mifosX.ng.application.controller('CreditBureauReportController', ['$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter','ngXml2json', mifosX.controllers.CreditBureauReportController]).run(function ($log) {
        $log.info("CreditBureauReportController initialized");
    });
}(mifosX.controllers || {}));