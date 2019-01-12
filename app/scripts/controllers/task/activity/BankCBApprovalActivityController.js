(function (module) {
    mifosX.controllers = _.extend(module, {
        BankCBApprovalActivityController: function ($controller, scope, routeParams, $modal, resourceFactory, location, dateFilter, ngXml2json, route, $http, $rootScope, $sce, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.isEnquiryPresentAndSuccess = false;
            scope.enquiryInfo = null;

            function initTask() {
                scope.clientId = scope.taskconfig['clientId'];
                scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
                getEnquiryInfo();
            };

            function enquireCBApproval() {
                resourceFactory.bankCBApprovalEnquiry.post({
                    loanApplicationId: scope.loanApplicationReferenceId
                }, {}, function (data) {
                    scope.enquiryInfo = null;
                    getEnquiryInfo();
                });
            };

            function getEnquiryInfo() {
                resourceFactory.bankCBApprovalEnquiry.get({
                    loanApplicationId: scope.loanApplicationReferenceId
                }, function (data) {
                    scope.enquiryInfo = data;
                    if(scope.enquiryInfo!=undefined){
                        if(scope.enquiryInfo.status.id == 1){
                            scope.isEnquiryPresentAndSuccess = true;
                        }
                    }
                });
            }

            scope.fetchFreshEnquiry = function(){
                if(!scope.isEnquiryPresentAndSuccess){
                    enquireCBApproval();
                }
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('BankCBApprovalActivityController', ['$controller','$scope', '$routeParams', '$modal', 'ResourceFactory', '$location', 'dateFilter', 'ngXml2json','$route','$http', '$rootScope', '$sce', 'CommonUtilService', mifosX.controllers.BankCBApprovalActivityController]).run(function ($log) {
        $log.info("BankCBApprovalActivityController initialized");
    });
}(mifosX.controllers || {}));