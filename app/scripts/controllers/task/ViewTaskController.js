(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.taskId = routeParams.taskId;
            scope.taskData = {};
            scope.isWorkflowTask = false;
            scope.isSingleTask = false;

            function fetchLoanData() {
                resourceFactory.LoanAccountResource.getLoanAccountDetails({
                    loanId: scope.loanId,
                    exclude: 'guarantors'
                }, function (data) {
                    scope.loanData = data;
                });
            };

            function init() {
                resourceFactory.taskExecutionTemplateResource.get({taskId: scope.taskId}, function (data) {
                    scope.taskData = data;
                    if (scope.taskData != undefined) {
                        if (scope.taskData.taskType.id == 1) {
                            scope.isWorkflowTask = true;
                        } else if (scope.taskData.taskType.id == 2) {
                            scope.isSingleTask = true;
                        }
                        if (scope.taskData.configValues != undefined) {
                            scope.clientId = scope.taskData.configValues.clientId;
                            scope.loanApplicationId = scope.taskData.configValues.loanApplicationId;
                            scope.loanApplicationReferenceId = scope.loanApplicationId;
                            scope.loanId = scope.taskData.configValues.loanId;
                        }
                    }
                    if(scope.loanId!=undefined){
                        fetchLoanData();
                    }
                    if(scope.loanApplicationId){
                        resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.taskData.entityId}, function (data) {
                            scope.loanApplicationData = data;
                            scope.loanProductChange(scope.loanApplicationData.loanProductId);
                        });
                        scope.loanProductChange = function (loanProductId) {
                            scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                            if (scope.loanApplicationData.clientId && scope.loanApplicationData.groupId) {
                                scope.inparams.templateType = 'jlg';
                            } else if (scope.loanApplicationData.groupId) {
                                scope.inparams.templateType = 'group';
                            } else if (scope.loanApplicationData.clientId) {
                                scope.inparams.templateType = 'individual';
                            }
                            if (scope.loanApplicationData.clientId) {
                                scope.inparams.clientId = scope.loanApplicationData.clientId;
                            }
                            if (scope.loanApplicationData.groupId) {
                                scope.inparams.groupId = scope.loanApplicationData.groupId;
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
                    };
                });
            }

            init();
        }
    });
    mifosX.ng.application.controller('ViewTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ViewTaskController]).run(function ($log) {
        $log.info("ViewTaskController initialized");
    });
}(mifosX.controllers || {}));