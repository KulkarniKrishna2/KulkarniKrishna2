(function (module) {
    mifosX.controllers = _.extend(module, {
        creditbureauActivityController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };

            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
            };

            initTask();

            scope.viewCreditBureauReport = false;
            scope.loanApplicationReferenceId = routeParams.loanApplicationId;
            resourceFactory.loanApplicationReferencesCreditBureauReportOtherInstituteLoansSummaryResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (loansSummary) {
                scope.loansSummary = loansSummary;
                //scope.viewCreditBureauReport = true;
                if(scope.loansSummary && scope.loansSummary.cbStatus && scope.loansSummary.cbStatus.value == 'SUCCESS'){
                    scope.viewCreditBureauReport = true;
                    scope.$emit("activityDone",{});
                }
            });

            scope.creditBureauReport = function(){
                resourceFactory.loanApplicationReferencesCreditBureauReportResource.get({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (loansSummary) {
                    scope.loansSummary = loansSummary;
                    if(scope.loansSummary && scope.loansSummary.cbStatus && scope.loansSummary.cbStatus.value == 'SUCCESS'){
                        scope.viewCreditBureauReport = true;
                        scope.$emit("activityDone",{});
                    }
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

            scope.convertByteToString = function (content) {
                var result = "";
                if(content != undefined && content != null){
                    for(var i = 0; i < content.length; ++i){
                        result+= (String.fromCharCode(content[i]));
                    }
                }
                return result
            };

            scope.proceedToNext = function () {
                location.path('/approveloanapplicationreference/' + scope.loanApplicationReferenceId);
            };
        }
    });
    mifosX.ng.application.controller('creditbureauActivityController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.creditbureauActivityController]).run(function ($log) {
        $log.info("creditbureauActivityController initialized");
    });
}(mifosX.controllers || {}));