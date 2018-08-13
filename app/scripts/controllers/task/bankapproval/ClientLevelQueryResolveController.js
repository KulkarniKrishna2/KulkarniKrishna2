(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientLevelQueryResolveController: function (scope, resourceFactory, location, routeParams, API_VERSION, CommonUtilService, $modal, $rootScope, dateFilter, $http,$upload) {
           
            scope.trackerId = routeParams.trackerId;
            scope.bankApprovalId = routeParams.workflowBankApprovalId;
            scope.resolveFormData = {};
            scope.clientImagePresent = false;
            scope.formData = {};
            scope.file = {};
            scope.entityType = "bank_odu_query";
            scope.isAllowFlieUpload= false;

            //get template
            resourceFactory.taskClientLevelQueryResolveTemplateResource.get({trackerId : scope.trackerId}, function (data) {
                scope.queryResolveTemplateData = data;
                if(scope.queryResolveTemplateData != undefined){
                    scope.cbCriteriaResult = JSON.parse(scope.queryResolveTemplateData.clientLevelCriteriaResultData.ruleResult);     
                }
                if(scope.queryResolveTemplateData.memberData != undefined){
                     getClientImage(scope.queryResolveTemplateData.memberData.id);
                }
            });

            scope.onFileSelect = function ($files) {
                scope.file = $files[0];
                if($files[0].size >0){
                    scope.isAllowFlieUpload= true;
                }
            };


            scope.submit = function () {
                scope.resolveFormData.queryResolutions = []
                for(var i in scope.queryResolveTemplateData.queries){
                    var resolveObj = {};
                    resolveObj.queryId = scope.queryResolveTemplateData.queries[i].id;
                    resolveObj.queryResolution = scope.queryResolveTemplateData.queries[i].queryResolution;
                    scope.resolveFormData.queryResolutions.push(resolveObj);
                }
                scope.activity = "resolvequery";
                resourceFactory.taskClientLevelQueryResource.resolveQuery({bankApproveId:scope.bankApprovalId, activity: scope.activity}, scope.resolveFormData, function (data) {
                    if(scope.isAllowFlieUpload){
                        scope.formData.name = "file";
                        $upload.upload({
                            url: $rootScope.hostUrl + API_VERSION + '/'+scope.entityType+'/' + scope.bankApprovalId + '/documents',
                            data: scope.formData,
                            file: scope.file
                        }).then(function (filedata) {
                            location.path('/workflowbankapprovallist');
                        });
                    }else{
                        location.path('/workflowbankapprovallist');
                    }

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