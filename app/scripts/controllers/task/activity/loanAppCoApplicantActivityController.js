(function (module) {
    mifosX.controllers = _.extend(module, {
        loanAppCoApplicantActivityController: function ($q,$modal, $controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.formData = {};
            scope.viewSummary=true;
            scope.viewAddCoApplicant = false;


            function populateDetails(){
                populateApplicant();
                populateCoApplicants();
            };

            function populateApplicant(){
                resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationId}, function (data) {
                    scope.loanApplicationData = data;
                    populateApplicantWorkflow();
                });
            };

            function populateCoApplicants(){
                resourceFactory.loanCoApplicantsResource.getAll(
                    {loanApplicationReferenceId: scope.loanApplicationId},
                    function (data) {
                        scope.coapplicants = data;
                        populateCoApplicantWorkflows();
                    });
            };


            function populateApplicantWorkflow(){
                resourceFactory.entityTaskExecutionResource.get({entityType: "loanApplicationApplicant",
                    entityId:scope.loanApplicationId}, function (data) {
                    scope.applicantWorkflowData = data;
                    if(scope.applicantWorkflowData!=undefined &&
                        scope.applicantWorkflowData.status.id < 7 && scope.applicantWorkflowData.status.id > 1){
                        resourceFactory.taskExecutionChildrenResource.getAll(
                            {taskId: scope.applicantWorkflowData.id}, function (children) {
                                scope.applicantWorkflowData.activeChildTask = getActiveChildTask(children);
                            });
                    }
                    //scope.$broadcast('initTask', {"taskData": data});
                });
            };
            function populateCoApplicantWorkflows(){
                scope.coapplicants.forEach(function (coapplicant) {
                    resourceFactory.entityTaskExecutionResource.get({entityType: "loanApplicationCoApplicant",
                        entityId:coapplicant.id}, function (data) {
                        coapplicant.workflowData = data;
                        if(coapplicant.workflowData!=undefined && coapplicant.workflowData.status!=undefined &&
                            coapplicant.workflowData.status.id < 7 && coapplicant.workflowData.status.id > 1){
                            resourceFactory.taskExecutionChildrenResource.getAll(
                                {taskId: coapplicant.workflowData.id}, function (children) {
                                    coapplicant.workflowData.activeChildTask = getActiveChildTask(children);
                            });
                        }
                        //scope.$broadcast('initTask', {"taskData": data});
                    });
                });
            };

            function getActiveChildTask(childTasks) {
                if (childTasks != undefined && childTasks.length > 0) {
                    for (index in childTasks) {
                        var task = childTasks[index];
                        if (task.status!= undefined && task.status.id > 1 && task.status.id < 7) {
                            return task;
                        }
                    }
                }
                return null;
            };

            scope.goToTask = function (task) {

                    location.path('/viewtask/' + task.id);
            };

            scope.showAddCoApplicantView = function () {
                scope.viewSummary=false;
                scope.viewAddCoApplicant = true;
            };

            function showSummaryView() {
                scope.viewSummary=true;
                scope.viewAddCoApplicant = false;
            }

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName',
                    sortOrder : 'ASC', orphansOnly : false}, function (data) {
                    removeExistingClients(data.pageItems);
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            removeExistingClients = function(data){
                var len = data.length;
                for(var i=0; i < len; i++){
                    var client = data[i];
                    var clientPresent = false;
                    var coApplicantsLen = scope.coapplicants.length;
                    for(var j=0; j < coApplicantsLen; j++){
                        if(client.id === scope.coapplicants[j].clientId){
                            clientPresent = true;
                            break;
                        }
                    }
                    if(clientPresent){
                        data.splice(i,1);
                        i--;
                        len = data.length;
                    }
                }
            };

            scope.addCoApplicant = function () {
                if(scope.client != undefined){
                    resourceFactory.loanCoApplicantsResource.add({loanApplicationReferenceId: scope.loanApplicationId,
                        clientId: scope.client.id}, function (data) {
                        scope.available = "";
                        scope.client = undefined;
                        showSummaryView();
                        populateCoApplicants()
                    });
                }
            };

            scope.remove = function (id) {
                scope.idToBeDeleted = id;
                $modal.open({
                    templateUrl: 'delete.html',
                    controller: MemberDeleteCtrl
                });
            };

            var MemberDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.loanCoApplicantsResource.delete({loanApplicationReferenceId: scope.loanApplicationId,
                        coApplicantId: scope.idToBeDeleted}, function (data) {
                        showSummaryView();
                        populateCoApplicants();
                        $modalInstance.close('delete');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.cancel = function (){
                showSummaryView();
            };

            scope.routeToMem = function (id) {
                location.path('/viewclient/' + id + '/' + scope.loanApplicationReferenceId);
            };

            scope.routeToClient = function (id) {
                location.path('/viewclient/' + id) ;
            };

            scope.viewClient = function (item) {
                scope.client = item;
            };

            function initTask() {
                scope.loanApplicationId = scope.taskconfig['loanApplicationId'];
                populateDetails();
                showSummaryView();
            };

            initTask();

            scope.doPreTaskActionStep = function(actionName){
                if(actionName === 'activitycomplete'){
                    if(allworkflowsCompleted()){
                        scope.doActionAndRefresh(actionName);
                    }else{
                        scope.setTaskActionExecutionError("lable.error.activity.coapplicant.not.completed");
                    }
                }else{
                    scope.doActionAndRefresh(actionName);
                }
            };

            function allworkflowsCompleted(){
                var workflowCompleted   = true;
                scope.coapplicants.forEach(function (coapplicant) {
                        if(coapplicant.workflowData!=undefined &&
                            coapplicant.workflowData.status.id < 7 ){
                            workflowCompleted = false;
                        }
                });

                if(scope.applicantWorkflowData!=undefined &&
                    scope.applicantWorkflowData.status.id < 7 ){
                    workflowCompleted = false;
                }

                return workflowCompleted;
            };

        }
    });
    mifosX.ng.application.controller('loanAppCoApplicantActivityController', ['$q','$modal','$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.loanAppCoApplicantActivityController]).run(function ($log) {
        $log.info("loanAppCoApplicantActivityController initialized");
    });
}(mifosX.controllers || {}));
