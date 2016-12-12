(function (module) {
    mifosX.controllers = _.extend(module, {
        LoanApplicationWorkflowController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.datatabledetails = "";
            scope.status = 'CREATE';
            scope.view_tab = "tab1";
            scope.resourceId = routeParams.loanApplicationId;
            scope.loanApplicationId = routeParams.loanApplicationId;
            scope.loanApplicationReferenceId = scope.loanApplicationId;
            resourceFactory.loanApplicationReferencesResource.update({loanApplicationReferenceId: scope.loanApplicationId,command: 'requestforapproval'},{}, function (data) {

            });
            scope.masterconfig = {};
            scope.loanApplicationData = {};

            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationId}, function (data) {
                scope.loanApplicationData = data;
                scope.formData = data;
                scope.loanProductChange(scope.formData.loanProductId);

                resourceFactory.entityTaskExecutionResource.get({entityType: "loanApplication",entityId:scope.loanApplicationId}, function (data) {
                    scope.taskData = data;
                    //scope.$broadcast('initTask', {"taskData": data});
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
    mifosX.ng.application.controller('LoanApplicationWorkflowController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.LoanApplicationWorkflowController]).run(function ($log) {
        $log.info("LoanApplicationWorkflowController initialized");
    });
}(mifosX.controllers || {}));
