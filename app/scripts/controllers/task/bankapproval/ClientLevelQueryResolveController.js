(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientLevelQueryResolveController: function (scope, resourceFactory, location, routeParams, API_VERSION, CommonUtilService, $modal, $rootScope, dateFilter, $http,$upload) {
           
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

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
            };


            scope.submit = function (approveId) {
                $upload.upload({
                    url: $rootScope.hostUrl + API_VERSION + '/tasktracking/bankapproval/' + scope.bankApprovalId + '/query/' + scope.queryId,
                    data: {'data' : scope.resolveFormData} ,
                    file: scope.file
                }).then(function (data) {
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
    mifosX.ng.application.controller('ClientLevelQueryResolveController', ['$scope', 'ResourceFactory','$location', '$routeParams', 'API_VERSION', 'CommonUtilService', '$modal', '$rootScope', 'dateFilter', '$http','$upload', mifosX.controllers.ClientLevelQueryResolveController]).run(function ($log) {
        $log.info("ClientLevelQueryResolveController initialized");
    });
}(mifosX.controllers || {}));