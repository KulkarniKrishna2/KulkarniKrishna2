(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskAnalyticsController: function (scope, resourceFactory, location) {

            scope.taskDataList = [];
            scope.chartTypeList = ['MONTHLY','WEEKLY','DAILY'];
            scope.chartType = scope.chartTypeList[0];
            scope.barChartType = scope.chartTypeList[0];
            scope.series = [{key:'totalCount' ,value:'Total Count'},{key:'onTimeCount' ,value:'Ontime Count'},{key:'tatCount' ,value:'TAT Count'},{key:'escalatedCount' ,value:'Escalated Count'}];


            scope.tableChart = function () {
                resourceFactory.taskAnalyticsResource.get({chartType:scope.chartType},{}, function (data) {
                    scope.taskDataList = data;
                });
            };

            scope.tableChart();

            scope.getBarChart = function () {
                resourceFactory.taskAnalyticsResource.get({chartType:scope.barChartType},{}, function (data) {
                    scope.barDataList = data;
                    scope.constructData(scope.barDataList);
                });
            };

            scope.getBarChart();

            scope.constructData = function(data){
                scope.barData = [];
                for(var j in scope.series){
                    var property = scope.series[j].key;
                    var key = scope.series[j].value;
                    var barValue = {};
                    barValue.key = key;
                    barValue.values = [];                    
                        for(var i in data){
                            if(data[i].name){
                                var vals =[];
                                vals.push(data[i].name);
                                vals.push(data[i][property]);
                                barValue.values.push(vals);
                            }
                        }
                       scope.barData.push(barValue); 
                }
            };

            var colorArray = ['#0070C0', '#70AD46', '#FFC000', '#FF0000'];
            scope.colorFunction = function () {
                return function (d, i) {
                    return colorArray[i];
                };
            };

        }
    });
    mifosX.ng.application.controller('TaskAnalyticsController', ['$scope', 'ResourceFactory','$location', mifosX.controllers.TaskAnalyticsController]).run(function ($log) {
        $log.info("TaskAnalyticsController initialized");
    });
}(mifosX.controllers || {}));