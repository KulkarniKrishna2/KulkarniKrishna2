(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTaskController: function (scope, resourceFactory, routeParams, popUpUtilService) {
            scope.taskId = routeParams.taskId;
            scope.taskData = {};
            scope.isWorkflowTask = false;
            scope.isSingleTask = false;
            scope.isOfficeReferenceNumberRequired =scope.response.uiDisplayConfigurations.office.isOfficeReferenceNumberRequired;
   
            function getTaskId(){
                if(routeParams.taskId!=undefined){
                    return routeParams.taskId;
                }else{
                    return scope.commonConfig.taskData.id;
                }
            }

            scope.isEmbedded = function(){
                if(scope.commonConfig!=undefined && scope.commonConfig.taskData!=undefined){
                    return scope.commonConfig.taskData.embedded;
                }else{
                    return false;
                }
            };


            function fetchLoanData() {
                resourceFactory.LoanAccountResource.getLoanAccountDetails({
                    loanId: scope.loanId,
                    exclude: 'guarantors'
                }, function (data) {
                    scope.loanData = data;
                });
            };

            function init() {
                resourceFactory.taskExecutionTemplateResource.get({taskId: getTaskId()}, function (data) {
                    scope.taskData = data;
                    scope.eventType = data.eventType.systemCode;
                    if (scope.taskData != undefined) {
                        if (scope.taskData.taskType.id == 1) {
                            scope.isWorkflowTask = true;
                        } else if (scope.taskData.taskType.id == 2) {
                            scope.isSingleTask = true;
                        }
                        if (scope.taskData.configValues != undefined) {
                            scope.clientId = scope.taskData.configValues.clientId;
                            scope.loanApplicationId = scope.taskData.configValues.loanApplicationId;
                            scope.loanApplicationCoApplicantId = scope.taskData.configValues.loanApplicationCoApplicantId;
                            scope.loanApplicationReferenceId = scope.loanApplicationId;
                            scope.loanId = scope.taskData.configValues.loanId;
                            scope.groupId=scope.taskData.configValues.groupId;
                            scope.centerId=scope.taskData.configValues.centerId;
                            scope.eodProcessId = scope.taskData.configValues.eodProcessId;
                        }
                    }
                    if(scope.loanId!=undefined){
                        fetchLoanData();
                    }
                    if(scope.loanApplicationId){
                        resourceFactory.loanApplicationReferencesResource.getByLoanAppId({
                            loanApplicationReferenceId: scope.loanApplicationId},
                            function (data) {
                            scope.loanApplicationData = data;
                            if(scope.groupId == undefined){
                                if(scope.loanApplicationData.groupId != undefined){
                                   scope.groupId = scope.loanApplicationData.groupId;
                                   resourceFactory.groupResource.get({groupId: scope.groupId, associations: 'all'}, function (data) {
                                        scope.groupData = data;
                                   });
                                }
                            }
                            if(scope.loanApplicationCoApplicantId){
                                resourceFactory.loanCoApplicantsResource.get({loanApplicationReferenceId: scope.loanApplicationId,
                                    coApplicantId: scope.loanApplicationCoApplicantId}, function (data) {
                                    scope.loanApplicationCoApplicantData = data;
                                });
                            }
                        });
                    };

                    if(scope.groupId){
                       resourceFactory.groupResource.get({groupId: scope.groupId, associations: 'all'}, function (data) {
                           scope.groupData = data;
                       });
                   }
                   
                   if(scope.centerId){
                       resourceFactory.centerResource.get({centerId: scope.centerId, associations: 'all'}, function (data) {
                           scope.centerData = data;
                       });
                   }

                   if (scope.eodProcessId) {
                       resourceFactory.eodProcessResource.get({ eodProcessId: scope.eodProcessId}, function (data) {
                            scope.eodData = data;
                        });
                   }
                });
            }

            init();
            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isOfficeReferenceNumberRequired){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            }
            //Center workflow Members steps info 
            scope.getCWFClientsTaskStepsInfo = function(centerId){
                scope.cwfCenterId = centerId;
                scope.popUpHeaderName = "label.heading.members.steps.info"
                scope.includeHTML = 'views/task/popup/membersstepsinfo.html';
                var templateUrl = 'views/common/openpopup.html';
                var controller = 'ViewCWFClientsTaskStepsInfoController';
                var windowClass = 'modalwidth700';
                popUpUtilService.openPopUp(templateUrl, controller, scope, windowClass);
            }
        }
    });
    mifosX.ng.application.controller('ViewTaskController', ['$scope', 'ResourceFactory', '$routeParams', 'PopUpUtilService', mifosX.controllers.ViewTaskController]).run(function ($log) {
        $log.info("ViewTaskController initialized");
    });
}(mifosX.controllers || {}));