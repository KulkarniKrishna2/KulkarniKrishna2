(function (module) {
    mifosX.controllers = _.extend(module, {
        EditRoleController: function (scope, routeParams, location, resourceFactory) {
            scope.formData = {};
            scope.roleId = routeParams.id;
            scope.showRoleBasedLimits = true;
            resourceFactory.roleResource.get({roleId: scope.roleId}, function (data) {
                scope.formData = data;
                scope.formData.disabled = undefined;
            });
            scope.submit = function (){
                if(scope.formData.roleBasedLimit != undefined){
                    scope.formData.roleBasedLimit.locale = scope.optlang.code;
                }
                resourceFactory.roleResource.update({roleId: scope.roleId}, scope.formData, function (data) {
                    location.path("/admin/viewrole/" + scope.roleId);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditRoleController', ['$scope', '$routeParams', '$location', 'ResourceFactory', mifosX.controllers.EditRoleController]).run(function ($log) {
        $log.info("EditRoleController initialized");
    });
}(mifosX.controllers || {}));
