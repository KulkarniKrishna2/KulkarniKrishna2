(function (module) {
    mifosX.controllers = _.extend(module, {
        EditTaskConfigTemplateController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            function init() {
                scope.formdata={};
                resourceFactory.taskConfigTemplateResource.get({templateId: routeParams.id},function (data1) {
                    scope.formdata=
                                {
                                    id:data1.id,
                                    taskName:data1.taskName,
                                    shortName:data1.shortName,
                                    entity:data1.entity,
                                    taskConfig:data1.taskConfigId
                                };
                    console.log(scope.formdata,data1);
                });
                resourceFactory.taskConfigTemplateCreateResource.get(function (data) {
                    scope.activityType = data.activityType;
                    scope.entityOptions=data.entityOptions;
                });
            }
            init();
            scope.submit = function () 
            {
                resourceFactory.taskConfigTemplateResource.update({templateId: routeParams.id},
                            scope.formdata, function (response){
                    location.path('/taskconfigtemplate')
                });
            };

        }

    });
    mifosX.ng.application.controller('EditTaskConfigTemplateController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.EditTaskConfigTemplateController]).run(function ($log) {
        $log.info("EditTaskConfigTemplateController initialized");
    });
}(mifosX.controllers || {}));