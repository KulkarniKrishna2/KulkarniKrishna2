(function (module) {
    mifosX.controllers = _.extend(module, {
        BSSWorkFlowStepDashboardController: function (scope, $rootScope, resourceFactory, location) {
            scope.officeId = scope.currentSession.user.officeId;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });
            scope.getWorkFlowTaskSummary = function() {
                resourceFactory.runReportsResource.get({reportSource: 'BSSWorkflowDashboardReport', R_officeId: scope.officeId, genericResultSet: false}, function (bssWorkflowDashboardReport) {
                    scope.bssWorkflowDashboardReport = [];
                    if(bssWorkflowDashboardReport && bssWorkflowDashboardReport.length > 0){
                        var tempWorkFlowId = undefined;
                        var workFlowData = {};
    
                        var tempCenterId = undefined;
                        var centerData = {};
    
                        for(var i in bssWorkflowDashboardReport){
                            var data = bssWorkflowDashboardReport[i];
                            if(tempWorkFlowId == undefined || tempWorkFlowId != data.workFlowId){
                                tempWorkFlowId = data.workFlowId;
                                workFlowData = {};
                                workFlowData.workFlowId = data.workFlowId;
                                workFlowData.workFlowName = data.workFlowName;
                                workFlowData.taskConfigs = [];
                                workFlowData.centerDatas = [];
                                if(data.workFlowId){
                                    scope.bssWorkflowDashboardReport.push(workFlowData);
                                }
                            }
                            var istaskConfigFound = false;
                            for(var j in workFlowData.taskConfigs){
                                if(data.taskConfigId ==  workFlowData.taskConfigs[j].taskConfigId){
                                    istaskConfigFound = true;
                                    break;
                                }
                            }
                            if(!istaskConfigFound){
                                var taskConfig = {};
                                taskConfig.taskConfigId = data.taskConfigId;
                                taskConfig.taskConfigName = data.taskConfigName;
                                if(data.taskConfigId){
                                    workFlowData.taskConfigs.push(taskConfig);
                                }
                                
                            }
                            
                            if(tempCenterId == undefined || tempCenterId != data.centerId){
                                tempCenterId = data.centerId;
                                centerData = {};
                                centerData.centerId = data.centerId;
                                centerData.centerName = data.centerName;
                                centerData.taskConfigDatas = [];
                                if(data.centerId){
                                    workFlowData.centerDatas.push(centerData);
                                }
                            }
    
                            var taskConfigData = {};
                            var taskConfig = {};
                            if(data.taskConfigId){
                                taskConfig.taskConfigId = data.taskConfigId;
                                taskConfig.taskConfigName = data.taskConfigName;
                                taskConfigData.taskConfig = taskConfig;
    
                                taskConfigData.clientCount = data.clientCount;
                                centerData.taskConfigDatas.push(taskConfigData);
                            }
                        }
                        //console.log(JSON.stringify(scope.bssWorkflowDashboardReport));
                    }     
                });
            };
            scope.getWorkFlowTaskSummary();

            scope.viewWorkFlow = function(center, task) {
                //console.log(JSON.stringify((task)));
                $rootScope.defaultLandingStepId = task.taskConfig.taskId;
                location.path('/centeronboarding/create/'+ center.centerId+'/workflow');
            };
        }
    });
    mifosX.ng.application.controller('BSSWorkFlowStepDashboardController', ['$scope', '$rootScope', 'ResourceFactory','$location', mifosX.controllers.BSSWorkFlowStepDashboardController]).run(function ($log) {
        $log.info("BSSWorkFlowStepDashboardController initialized");
    });
}(mifosX.controllers || {}));