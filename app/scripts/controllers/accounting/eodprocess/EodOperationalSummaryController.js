(function (module) {
    mifosX.controllers = _.extend(module, {
        EodOperationalSummaryController: function ($controller,scope,$modal, routeParams, resourceFactory,location,dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.eodProcessId = scope.taskconfig.eodProcessId;

            scope.requestBody = {};
            scope.requestBody.locale = scope.optlang.code;
            scope.requestBody.dateFormat = scope.df;

            scope.init =function(){
                resourceFactory.eodSummaryResource.get({eodProcessId:scope.eodProcessId,resourceName:'operational'},
                    function(summaryData){
                        scope.eodSummary = summaryData;
                        for(var i in scope.eodSummary.eodOprationalData){
                            var data = scope.eodSummary.eodOprationalData[i].summaryJson;
                            scope.eodSummary.eodOprationalData[i].summary = JSON.parse(data);
                        }
                        scope.isOperationalClosureDone = scope.eodSummary.eodProcessData.isOperationalClosureDone;
                    });
            }
            scope.init();
            scope.submit = function(){
                scope.constructBody(scope.eodSummary.eodOprationalData);
                resourceFactory.eodSummaryResource.save({eodProcessId:scope.eodProcessId,resourceName:'operational'},scope.requestBody,
                    function(data){
                        scope.init();
                    });
            }

            scope.constructBody = function(operationalData){
                scope.requestBody.operationalData = [];
                for(var i in operationalData){
                    var data = {};
                    data.transactionTypeId = operationalData[i].summaryType.id;
                    data.plannedAmount = operationalData[i].plannedAmount;
                    data.actualAmount = operationalData[i].actualAmount;
                    data.summaryJson = operationalData[i].summaryJson;
                    data.note = operationalData[i].note;

                    scope.requestBody.operationalData.push(data);
                }
            };
            scope.showProductSummary = function (eodProcessId,summaryType,data) {
                    $modal.open({
                        templateUrl: 'views/accounting/eodprocess/productwisesummary.html',
                        controller: ProductWiseSummaryCtrl,
                        backdrop: 'static',
                        resolve: {
                            productSummaryInfo: function () {
                                return { 'eodProcessId': eodProcessId,'summaryType':summaryType, 'data': data };
                            }
                        }
                    });
            };

            var ProductWiseSummaryCtrl = function($scope, $modalInstance, productSummaryInfo){
                $scope.transactionType = productSummaryInfo.summaryType;
                $scope.typeId = productSummaryInfo.typeId;
                $scope.dataList = [];
                if(typeof(productSummaryInfo.data)=='string'){
                    $scope.dataList = JSON.parse(productSummaryInfo.data);
                }else{
                    $scope.dataList = productSummaryInfo.data;
                }
                $scope.labelName = "label.heading."+$scope.transactionType;
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };

            }
            scope.cancel = function(){
                location.path('/eodprocess');
            }

        }
    });

    mifosX.ng.application.controller('EodOperationalSummaryController', ['$controller','$scope','$modal', '$routeParams', 'ResourceFactory','$location','dateFilter', mifosX.controllers.EodOperationalSummaryController]).run(function ($log) {
        $log.info("EodOperationalSummaryController initialized");
    });
}(mifosX.controllers || {}));
