/**
 * Created by CT on 23-01-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateWorkflowTasksConfigController: function (scope, resourceFactory, location) {
            scope.formData = {};
            resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
                scope.productOptions = data;
            });

            scope.getWorkflowTaskTemplate = function () {
                /*scope.formData.entityType = "loanproduct";
                resourceFactory.tasksConfigResourceTemplate.get({
                    entityType: scope.formData.entityType,
                    entityId: scope.formData.entityId
                }, function (response) {
                    scope.taskActivityDatas = response.taskActivityDatas;
                    scope.criteriaOptions = response.criteriaOptions;
                });*/
            };

            scope.formData.tasks = [];

            scope.addNewTask = function () {
                scope.formData.tasks.push({});
            };

            scope.submit = function () {
                //console.log(JSON.stringify(scope.formData));
                this.formData.locale = "en";
                resourceFactory.tasksConfigResource.create({
                    entityType: scope.formData.entityType,
                    entityId: scope.formData.entityId
                }, this.formData, function (response) {
                    location.path('/viewprofileratingconfigs')
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateWorkflowTasksConfigController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CreateWorkflowTasksConfigController]).run(function ($log) {
        $log.info("CreateWorkflowTasksConfigController initialized");
    });
}(mifosX.controllers || {}));