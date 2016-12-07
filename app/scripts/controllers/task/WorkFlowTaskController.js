(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkFlowTaskController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.datatabledetails = "";
            scope.status = 'CREATE';
            scope.view_tab = "tab1";
            scope.entityType = 1;
            scope.resourceId = routeParams.entityId;
            scope.loanApplicationId = routeParams.entityId;
            scope.entityId = routeParams.entityId;
            resourceFactory.loanApplicationReferencesResource.update({loanApplicationReferenceId: scope.loanApplicationId,command: 'requestforapproval'},{}, function (data) {

            });
            scope.masterconfig = {};
            scope.loanApplicationData = {};
            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationId}, function (data) {
                scope.loanApplicationData = data;
                scope.formData = data;
                scope.loanProductChange(scope.formData.loanProductId);
                resourceFactory.workflowTaskResource.getTaskDetailsByEntityTypeAndEntityId({entityType: scope.entityType,entityId : scope.entityId}, function (data) {
                    var taskExecutionData = data;
                    scope.$broadcast('initworkflow', {"taskExecutionData": taskExecutionData});
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
        }
    });
    mifosX.ng.application.controller('WorkFlowTaskController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.WorkFlowTaskController]).run(function ($log) {
        $log.info("WorkFlowTaskController initialized");
    });
}(mifosX.controllers || {}));