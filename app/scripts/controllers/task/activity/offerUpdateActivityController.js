(function (module) {
    mifosX.controllers = _.extend(module, {
        offerUpdateActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.clientId = scope.taskconfig['clientId'];
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            console.log(scope.taskconfig);
            scope.minPrincipalLength;
            scope.maxPrincipalLength;
            scope.loanAppDetails = {};
            scope.showErrorBlock = false;
            scope.showModifyBtn = true;
            scope.errorMsg = 'Error!! Please try again.';
            scope.offerUpdateFormData = {
                loanAmountRequested: null,
                rateOfInterest: null,
                tenure: null
            };
            scope.showUpdateOfferForm = false;
            scope.showUpdatedNotice = false;
            scope.toggleUpdateOfferForm = function() {
                if(scope.showUpdateOfferForm) {
                    scope.showUpdateOfferForm = false;
                } else {
                    scope.showUpdateOfferForm = true;
                }
            }

            scope.getLoanAppProductDetails = function(loanProductId) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                scope.inparams.templateType = 'individual';
                scope.inparams.clientId = scope.clientId;
                scope.inparams.staffInSelectedOfficeOnly = true;
                scope.inparams.productApplicableForLoanType = 2;
                scope.inparams.entityType = 1;
                // scope.inparams.entityId = scope.clientId;
                scope.inparams.productId = loanProductId;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    if(data.product.minPrincipal != undefined && data.product.minPrincipal != null ) {
                        scope.minPrincipalLength = data.product.minPrincipal;
                    } else {
                        scope.minPrincipalLength = 0;
                    }
                    
                }, function(error) {
                    console.log(error);
                    scope.showErrorBlock = true;
                    scope.showUpdatedNotice = false;
                });
            }

            scope.getLoanAppDetails = function() {
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                    scope.loanAppDetails = applicationData;
                    scope.getLoanAppProductDetails(scope.loanAppDetails.loanProductId);
                    scope.showErrorBlock = false;
                }, function(error) {
                    console.log(error);
                    scope.showErrorBlock = true;
                    scope.showUpdatedNotice = false;
                });
            }
            scope.getLoanAppDetails();

            scope.submitOfferUpdateDetails = function() {
                scope.showUpdatedNotice = false;
                scope.showErrorBlock = false;
                resourceFactory.offerUpdateResource.update({loanApplicationReferenceId: scope.loanApplicationReferenceId}, scope.offerUpdateFormData, function(response) {
                    scope.getLoanAppDetails();
                    scope.showErrorBlock = false;
                    scope.showUpdateOfferForm = false;
                    scope.showUpdatedNotice = true;
                }, function(error) {
                    console.log(error);
                    scope.showErrorBlock = true;
                    scope.showUpdatedNotice = false;
                });
            }

            function checkTaskStatus() {
                if(scope.isTaskCompleted()) {
                    scope.getLoanAppDetails();
                    scope.showModifyBtn = false;
                }
            }
            checkTaskStatus();

        }
    });
    mifosX.ng.application.controller('offerUpdateActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.offerUpdateActivityController]).run(function ($log) {
        $log.info("offerUpdateActivityController initialized");
    });
}(mifosX.controllers || {}));