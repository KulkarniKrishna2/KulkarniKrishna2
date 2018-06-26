(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientLevelQueryResolveController: function (scope, resourceFactory, location, routeParams, API_VERSION, CommonUtilService, $modal, $rootScope, dateFilter, $http) {
           
            scope.trackerId = routeParams.trackerId;
            scope.bankApprovalId = routeParams.workflowBankApprovalId;
            scope.resolveFormData = {};
            scope.resolveFormData.queryResolution = null;
            scope.clientImagePresent = false;

            //get template
            resourceFactory.taskClientLevelQueryResolveTemplateResource.get({trackerId : scope.trackerId}, function (data) {
                scope.queryResolveTemplateData = data;
                scope.queryId = scope.queryResolveTemplateData.queryId;
                if(scope.queryResolveTemplateData != undefined){
                    scope.cbCriteriaResult = JSON.parse(scope.queryResolveTemplateData.clientLevelCriteriaResultData.ruleResult);     
                }
                if(scope.queryResolveTemplateData.memberData != undefined){
                     getClientImage(scope.queryResolveTemplateData.memberData.id);
                }
            });

            scope.submit = function (approveId) {

                resourceFactory.taskClientLevelQueryResource.resolveQuery({bankApproveId:scope.bankApprovalId, queryId: scope.queryId}, scope.resolveFormData, function (data) {
                        location.path('/workflowbankapprovallist');
               });
                
            }    

            scope.viewMoreDetails = function(trackerId, workflowBankApprovalId){
                location.path("/workflowbankapprovalaction/"+ trackerId +'/'+workflowBankApprovalId);
            }
            
            function getClientImage(clientId){
                $http({
                        method: 'GET',
                        url: $rootScope.hostUrl + API_VERSION + '/client/' + clientId + '/images?maxHeight=150'
                    }).then(function (imageData) {
                        scope.imageData = imageData.data[0];
                        if(scope.imageData){
                            $http({
                                method: 'GET',
                                url: $rootScope.hostUrl + API_VERSION + '/client/' + clientId+ '/images/'+scope.imageData.imageId+'?maxHeight=150'
                            }).then(function (imageData) {
                                scope.image = imageData.data;
                                scope.clientImagePresent = true;
                            });
                        }       
                });
            }


        }
    });
    mifosX.ng.application.controller('ClientLevelQueryResolveController', ['$scope', 'ResourceFactory','$location', '$routeParams', 'API_VERSION', 'CommonUtilService', '$modal', '$rootScope', 'dateFilter', '$http', mifosX.controllers.ClientLevelQueryResolveController]).run(function ($log) {
        $log.info("ClientLevelQueryResolveController initialized");
    });
}(mifosX.controllers || {}));