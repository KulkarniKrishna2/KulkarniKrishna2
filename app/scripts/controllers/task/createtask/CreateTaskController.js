(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateTaskController: function (scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, dateFilter) {
            function init() 
            {
                resourceFactory.taskAssignTemplateResource.get(function (data) {
                scope.tasks=data.taskConfigTemplateObject;
                scope.users=data.user;
                scope.first={};
                scope.restrictDate = new Date();
                });
            }
            scope.formData={};
            init();
            scope.onselect=function() 
            {
                resourceFactory.taskConfigTemplateEntityResource.get({templateId:scope.formData.templateId},function(data1)
                    {
                        scope.entity=data1.entity;
                        scope.idAndNames=data1.idAndName;
                    });
            };
            scope.submit=function() 
            {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.duedate = reqDate;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                resourceFactory.taskAssignResource.save(this.formData, function (response) {
                    location.path('/tasklist')
                });
            }; 
        }
    });
    mifosX.ng.application.controller('CreateTaskController', ['$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope' ,'dateFilter', mifosX.controllers.CreateTaskController]).run(function ($log) {
        $log.info("CreateTaskController initialized");
    });
}(mifosX.controllers || {}));
