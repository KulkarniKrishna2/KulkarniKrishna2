(function (module) {
    mifosX.controllers = _.extend(module, {
        AssignStaffController: function (scope, resourceFactory, location, routeParams) {
            scope.group = [];
            scope.staff = [];
            scope.formData = {};
            if(scope.response && scope.response.uiDisplayConfigurations){
                scope.loanOfficersOnly = scope.response.uiDisplayConfigurations.createCenter.loanOfficersOnly;
            }
            if(routeParams.entityType==='centers') {
                resourceFactory.assignStaffToCenterResource.get({groupOrCenter: routeParams.entityType, CenterId: routeParams.id, template: 'true',staffInSelectedOfficeOnly:true,loanOfficersOnly:scope.loanOfficersOnly}, function (data) {
                scope.group = data;
                scope.staffs = data.staffOptions;
                scope.formData.staffId = data.staffOptions[0].id;
                });
            }
            else {
                resourceFactory.assignStaffResource.get({groupOrCenter: routeParams.entityType, groupOrCenterId: routeParams.id, template: 'true',staffInSelectedOfficeOnly:true}, function (data) {
                scope.group = data;
                scope.staffs = data.staffOptions;
                scope.formData.staffId = data.staffOptions[0].id;
                });
            }
            scope.assignStaff = function () {
                if (routeParams.entityType == "groups") {
                    scope.r = "viewgroup/";
                }
                else if (routeParams.entityType == "centers") {
                    scope.r = "viewcenter/";
                }
                resourceFactory.assignStaffResource.save({groupOrCenterId: routeParams.id, command: 'assignStaff'}, this.formData, function (data) {
                    location.path(scope.r + data.groupId);
                });
            };
            scope.cancel = function () {
                if (routeParams.entityType == "groups") {
                    location.path("viewgroup/" + routeParams.id);
                }
                else if (routeParams.entityType == "centers") {
                    location.path("viewcenter/" + routeParams.id);
                }
            };
        }
    });
    mifosX.ng.application.controller('AssignStaffController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.AssignStaffController]).run(function ($log) {
        $log.info("AssignStaffController initialized");
    });
}(mifosX.controllers || {}));