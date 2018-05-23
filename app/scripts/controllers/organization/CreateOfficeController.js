(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateOfficeController: function (scope, resourceFactory, location, dateFilter) {
            scope.offices = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.restrictDate = new Date();
            scope.isSelfActive = scope.response.uiDisplayConfigurations.createOffice.selfActive;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.formData = {
                    parentId: scope.offices[0].id
                }
            });

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.dateFormat = scope.df;
                this.formData.openingDate = reqDate;
                resourceFactory.officeResource.save(this.formData, function (data) {
                    if(scope.isSelfActive && data.resourceId){
                        activateoffice(data.resourceId);
                    }else{
                        location.path('/viewoffice/' + data.resourceId); 
                    }
                });
            };

            var activateoffice = function(officeId) {
                resourceFactory.officeResource.save({ officeId: officeId, command: 'activate' }, {}, function (data) {
                    if(data.changes.status.id == 300){
                       scope.isOfficeActive = true;
                       location.path('/viewoffice/' + data.resourceId); 
                    }
                });
            }
        }
    });
    mifosX.ng.application.controller('CreateOfficeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', mifosX.controllers.CreateOfficeController]).run(function ($log) {
        $log.info("CreateOfficeController initialized");
    });
}(mifosX.controllers || {}));
