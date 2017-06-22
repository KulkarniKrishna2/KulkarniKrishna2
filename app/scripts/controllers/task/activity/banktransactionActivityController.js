(function (module) {
    mifosX.controllers = _.extend(module, {
        banktransactionActivityController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.formData = {};
            scope.createDetail = true;

            function populateDetails(){
                resourceFactory.bankAccountTransferTemplateResource.get({bankTransferId: scope.bankTransferId}, function (data) {
                    scope.transferData = data;
                    scope.formData.transferType = scope.transferData.transferType.value;
                });
            }

            scope.initiate = function (actionName) {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: scope.bankTransferId, command: 'initiate'}, function (data) {
                    scope.doActionAndRefresh(actionName);
                    scope.cancel();
                });
            };

            scope.reject = function (actionName) {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: scope.bankTransferId, command: 'reject'}, function (data) {
                    scope.doActionAndRefresh(actionName);
                    scope.cancel();
                });
            };

            scope.submit = function () {
                resourceFactory.bankAccountTransferResource.save({bankTransferId: scope.bankTransferId, command: 'submit'},scope.formData, function (data) {
                    scope.cancel();
                });
            };

            scope.cancel = function (){
                populateDetails();
            };

            scope.doPreTaskActionStep = function(actionName){
                if(actionName==='approve'){
                    if (scope.transferData.status.id == 2) {
                        scope.initiate(actionName);
                    }else{
                        scope.setTaskActionExecutionError('label.error.banktransaction.notsubmitted');
                    }
                }else if(actionName==='activitycomplete'){
                    if (scope.transferData.status.id == 2) {
                        scope.doActionAndRefresh(actionName);
                    }else{
                        scope.setTaskActionExecutionError('label.error.banktransaction.notsubmitted');
                    }
                }else if(actionName==='reject'){
                    if (scope.transferData.status.id == 2) {
                        scope.reject(actionName);
                    }else{
                        scope.setTaskActionExecutionError('label.error.banktransaction.notsubmitted');
                    }
                } else {
                    scope.doActionAndRefresh(actionName);
                }
            };

            function initTask() {
                scope.bankTransferId = scope.taskconfig['bankTransactionId'];
                populateDetails();
                scope.transferTypes = [{key:"neft",display:""}]
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('banktransactionActivityController', ['$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.banktransactionActivityController]).run(function ($log) {
        $log.info("banktransactionActivityController initialized");
    });
}(mifosX.controllers || {}));
