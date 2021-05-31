(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateHookEventController: function (scope, resourceFactory, location,routeParams) {
            
            scope.hookId = routeParams.id
            scope.groupings = [];
            scope.events = [];
            scope.data = {};
            
            
            resourceFactory.hookTemplateResource.get(function (data) { 
                scope.groupings = data.groupings;
            });

            scope.resetActions = function () {
                scope.action = {};
            };

            scope.addEvent = function () {
                scope.events.push({ entityName : scope.entity.name, actionName : scope.action});
            };

            scope.deleteEvent = function (index) {
                scope.events.splice(index, 1);
            }

            scope.submit = function () { 
                 
                scope.data.events = scope.events;
                resourceFactory.hookEventResources.save({hookId : scope.hookId},this.data, function (data) {
                    location.path('/viewhook/' + scope.hookId);
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateHookEventController', ['$scope', 'ResourceFactory', '$location','$routeParams', mifosX.controllers.CreateHookEventController]).run(function ($log) {
        $log.info("CreateHookEventController initialized");
    });
}(mifosX.controllers || {}));