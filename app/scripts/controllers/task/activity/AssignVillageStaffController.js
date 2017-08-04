(function (module) {
    mifosX.controllers = _.extend(module, {
        AssignVillageStaffController: function (scope, resourceFactory, location, http, routeParams, $rootScope) {  
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
                    var id = routeParams.villageId;
                    scope.isSuccess = false;
                    scope.staffName = ""
                    scope.getVillage = function(){
                        resourceFactory.villageResource.get({villageId: id, associations: 'setOfCenters,hierarchy,staffOptions'}, function (data) {
                            if(data.staff != undefined){
                                scope.staffId = data.staff.id
                                scope.staffName = data.staff.displayName;
                            }                        
                            scope.staffOptions = data.staffOptions;
                        });
                    };
                    
                    scope.getVillage();

                    scope.submit = function(){
                        resourceFactory.villageResource.save({villageId: id, command: 'assignstaff'}, {'staffId' : scope.staffId}, function (data) {
                            scope.getVillage();
                            scope.isSuccess = true;
                        });
                    }
        }
    });
    mifosX.ng.application.controller('AssignVillageStaffController', ['$scope', 'ResourceFactory', '$location', '$http', '$routeParams', '$rootScope', mifosX.controllers.AssignVillageStaffController]).run(function ($log) {
        $log.info("AssignVillageStaffController initialized");
    });
}(mifosX.controllers || {}));