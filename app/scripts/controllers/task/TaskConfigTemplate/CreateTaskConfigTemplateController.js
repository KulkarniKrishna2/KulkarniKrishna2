(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateTaskConfigTemplateController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            function init() {
                resourceFactory.taskConfigTemplateCreateResource.get(function (data) {
                    scope.activityType = data.activityType;
                    scope.entityOptions=data.entityOptions;
                });
            }
            scope.formData={};
            init();
            scope.submit = function () 
            {
                angular.forEach(scope.activityType,function(activity){
                    if(activity.identifier=='adhoc'){
                        scope.formData.activity_id=activity.id;
                    }
                });
                resourceFactory.taskConfigTemplateResource.save(scope.formData, function (response) {
                    location.path('/taskconfigtemplate')
                });
            };

        }

    });
    mifosX.ng.application.controller('CreateTaskConfigTemplateController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.CreateTaskConfigTemplateController]).run(function ($log) {
        $log.info("CreateTaskConfigTemplateController initialized");
    });
}(mifosX.controllers || {}));