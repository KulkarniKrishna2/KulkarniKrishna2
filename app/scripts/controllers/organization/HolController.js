(function (module) {
    mifosX.controllers = _.extend(module, {
        HolController: function (scope, resourceFactory, location) {
            scope.holidays = [];
            scope.offices = [];
            scope.formData = {};
            scope.showDeletedRecords = false;
            scope.showPastRecords = false;

            scope.routeTo = function (id) {
                location.path('/viewholiday/' + id);
            };

            if (!scope.searchCriteria.holidays) {
                scope.searchCriteria.holidays = [null, null];
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.holidays[0];
            scope.formData.officeId = scope.searchCriteria.holidays[1];

            scope.onFilter = function () {
                scope.searchCriteria.holidays[0] = scope.filterText;
                scope.saveSC();
            };

            resourceFactory.holResource.getAllHols({officeId: scope.formData.officeId, pastRecords:scope.showPastRecords, deletedRecords : scope.showDeletedRecords}, function (data) {
                scope.holidays = data;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getHolidays = function (pastrecords, deletedRecords) {
                scope.searchCriteria.holidays[1] = scope.formData.officeId;
                scope.saveSC();
                resourceFactory.holResource.getAllHols({officeId: scope.formData.officeId, pastRecords:pastrecords, deletedRecords : deletedRecords}, function (data) {
                    scope.holidays = data;
                });
            };

            scope.getPastHolidaysData = function(){
                if(scope.showPastRecords){
                    scope.showPastRecords = false;
                }else{
                    scope.showPastRecords = true;
                }
                scope.showDeletedRecords = false;
                scope.getHolidays(scope.showPastRecords, scope.showDeletedRecords);
            };

            scope.getDeletedHolidaysData = function(){
                if(scope.showDeletedRecords){
                    scope.showDeletedRecords = false;
                }else{
                    scope.showDeletedRecords = true;
                }
                scope.showPastRecords = false;
                scope.getHolidays(scope.showPastRecords, scope.showDeletedRecords);
            };
        }
    });
    mifosX.ng.application.controller('HolController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.HolController]).run(function ($log) {
        $log.info("HolController initialized");
    });
}(mifosX.controllers || {}));