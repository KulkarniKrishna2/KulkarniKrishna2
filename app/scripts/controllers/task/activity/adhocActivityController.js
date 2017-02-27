(function (module) {
    mifosX.controllers = _.extend(module, {
        adhocActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.taskId = routeParams.taskId;
            scope.activityData = {};
            function initTask()
            {
                    if (scope.taskData != undefined) 
                    {
                        
                        scope.activityData.assignedTo=scope.taskData.assignedTo;
                        var reqDate = dateFilter(scope.taskData.dueDate, scope.df);
                        scope.activityData.dueDate=reqDate;
                        if (scope.taskData.entityType.value=='TEMPLATE_TASK_OFFICE') 
                        {
                            resourceFactory.officeResource.getOffice({officeId: scope.taskData.entityId}, function (data) {
                            scope.activityData.officeData = data;
                            scope.activityData.entityType='Office';
                            scope.activityData.entityName=scope.activityData.officeData.name;
                            });
                        }
                         if (scope.taskData.entityType.value=='TEMPLATE_TASK_VILLAGE') 
                        {
                            resourceFactory.villageResource.get({villageId: scope.taskData.entityId}, function (data) {
                            scope.activityData.villageData = data;
                            scope.activityData.entityType='Village';
                            scope.activityData.entityName=scope.activityData.villageData.villageName;
                            });
                        }
                         if (scope.taskData.entityType.value=='TEMPLATE_TASK_CENTER') 
                        {
                            resourceFactory.centerResource.get({centerId: scope.taskData.entityId}, function (data) {
                            scope.activityData.centerData = data;
                            scope.activityData.entityType='Center';
                            scope.activityData.entityName=scope.activityData.centerData.name;
                            });
                        }
                         if (scope.taskData.entityType.value=='TEMPLATE_TASK_CLIENT') 
                        {
                            resourceFactory.clientResource.get({clientId: scope.taskData.entityId}, function (data) {
                            scope.activityData.clientData = data;
                            scope.activityData.entityType='Client';
                            scope.activityData.entityName=scope.activityData.clientData.firstname+" "+scope.activityData.clientData.lastname;
                            });
                        }
                         if (scope.taskData.entityType.value=='TEMPLATE_TASK_BANK') 
                        {
                            resourceFactory.bankResource.get({bankId: scope.taskData.entityId}, function (data) {
                            scope.activityData.bankData = data;
                            scope.activityData.entityType='Bank';
                            scope.activityData.entityName=scope.activityData.bankData.name;
                            });
                        }
                    }
            };

            initTask();

            scope.submit = function () {
                scope.activityDone();
            }
        }
    });
    mifosX.ng.application.controller('adhocActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.adhocActivityController]).run(function ($log) {
        $log.info("adhocActivityController initialized");
    });
}(mifosX.controllers || {}));
