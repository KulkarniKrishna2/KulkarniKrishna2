(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewDistrictController: function(scope, resourceFactory, location, routeParams) {
            scope.districtId = routeParams.districtId;
            scope.formData = {};
            scope.districtData = {};
            scope.rejectStatus = 400;
            scope.isAllowTalukaCreation = true;
            scope.getDistrictData = function(){
                resourceFactory.districtsResource.get({districtId: scope.districtId, template:true}, function(data){
                    scope.districtData = data;
                    scope.isAllowTalukaCreation = (data.status.id<scope.rejectStatus);
                });
            }
            scope.getDistrictData();

            scope.activate = function(){
                resourceFactory.districtsResource.save({districtId: scope.districtId, command:'activate'},{}, function(data){
                    scope.getDistrictData();
                });
            }

            scope.rejectDistrict = function(){
                resourceFactory.districtsResource.save({districtId: scope.districtId, command:'reject'},{}, function(data){
                    scope.getDistrictData();
                });
            }

            scope.deleteTaluka = function(talukaId){
                resourceFactory.talukaResource.delete({districtId: scope.districtId, talukaId: talukaId},{}, function(data){
                    scope.getDistrictData();
                });
            }
        }
    });
    mifosX.ng.application.controller('ViewDistrictController', ['$scope', 'ResourceFactory', '$location', '$routeParams', mifosX.controllers.ViewDistrictController]).run(function ($log) {
        $log.info("ViewDistrictController initialized");
    });
}(mifosX.controllers || {}));