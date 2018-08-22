(function (module) {
    mifosX.controllers = _.extend(module, {
        EodCollectionSummaryController: function ($controller,scope, routeParams, resourceFactory,location,dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.eodProcessId = scope.taskconfig.eodProcessId;

            scope.requestBody = {};
            scope.requestBody.locale = scope.optlang.code;
            scope.requestBody.dateFormat = scope.df;

            scope.init =function(){
                resourceFactory.eodSummaryResource.get({eodProcessId:scope.eodProcessId,resourceName:'collections'},
                    function(collectionData){
                      scope.eodCollectionSummary = collectionData;
                      scope.isProcessed = scope.eodCollectionSummary.eodProcessData.isProcessed;
                });
            }
            scope.init();
            scope.submit = function(){
                scope.constructBody(scope.eodCollectionSummary.eodCollectionData);
                resourceFactory.eodSummaryResource.save({eodProcessId:scope.eodProcessId,resourceName:'collections'},scope.requestBody,
                    function(data){
                        scope.init();
                    });
            }

            scope.constructBody = function(collectionData){
                scope.requestBody.collectionData = [];
                for(var i in collectionData){
                    var data = {};
                    data.staffId = collectionData[i].staffData.id;
                    data.dueAmount = collectionData[i].dueAmount;
                    data.collectedAmount = collectionData[i].collectedAmount;
                    data.arrearsAmount = collectionData[i].arrearsAmount;
                    data.advanceAmount = collectionData[i].advanceAmount;
                    data.preclosureAmount = collectionData[i].preclosureAmount;
                    data.note = collectionData[i].note;

                    scope.requestBody.collectionData.push(data);
                }
            };
            scope.cancel = function(){
                location.path('/eodprocess');
            }

        }
    });

    mifosX.ng.application.controller('EodCollectionSummaryController', ['$controller','$scope', '$routeParams', 'ResourceFactory','$location','dateFilter', mifosX.controllers.EodCollectionSummaryController]).run(function ($log) {
        $log.info("EodCollectionSummaryController initialized");
    });
}(mifosX.controllers || {}));
