(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientPolicyDetailsController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.fetchClientDetails = function () {
                scope.isPolicyExist = false;
                resourceFactory.clientResource.get({ clientId: scope.clientId, isFetchCoApplicant: true, isFetchPolicyDetails: true },
                    function (data) {
                        scope.clientData = data;
                        if(data.policyData){
                            scope.policyData = data.policyData;
                            scope.isPolicyExist = true;
                        }
                    });
            };
            scope.fetchClientDetails();
        }
    });
    mifosX.ng.application.controller('ClientPolicyDetailsController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.ClientPolicyDetailsController]).run(function ($log) {
        $log.info("ClientPolicyDetailsController initialized");
    });
}(mifosX.controllers || {}));