(function (module) {
    mifosX.controllers = _.extend(module, {
        TaskConfigTemplateController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            function init() {
                resourceFactory.taskConfigTemplateResource.getAll(function (data) {
                scope.taskconfigtemplates=data;
                scope.isEmpty=false;
                if(scope.taskconfigtemplates==undefined || scope.taskconfigtemplates.length==0)
                {
                    scope.isEmpty=true;
                }
                });
            }
            init();
            scope.showEdit = function (id) {
                location.path('/taskconfigtemplate/edittemplate/' + id);
            };

        }

    });
    mifosX.ng.application.controller('TaskConfigTemplateController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.TaskConfigTemplateController]).run(function ($log) {
        $log.info("TaskConfigTemplateController initialized");
    });
}(mifosX.controllers || {}));