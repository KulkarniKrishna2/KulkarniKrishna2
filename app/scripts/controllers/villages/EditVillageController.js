(function (module) {
    mifosX.controllers = _.extend(module, {
        EditVillageController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.managecode = routeParams.managecode;
            scope.first = {};
            scope.submittedOn = {};

            scope.villageId = routeParams.id;
            scope.restrictDate = new Date();

            resourceFactory.villageResource.get({villageId: routeParams.id, template:'true'}, function (data) {
                scope.edit = data;
                scope.isWorkflowEnabled = data.isWorkflowEnabled;
                scope.formData = {
                    villageName: data.villageName,
                    externalId: data.externalId,
                };

                if (data.timeline.activatedOnDate) {
                    var newDate = dateFilter(data.timeline.activatedOnDate, scope.df);
                    scope.first.date = new Date(newDate);
                }else{
                    scope.first.date = new Date();
                }

                if (data.timeline.submittedOnDate) {
                    scope.submittedOn.first = new Date(dateFilter(data.timeline.submittedOnDate, scope.df));
                }
            });

            scope.updateVillage = function () {
                if (!scope.isWorkflowEnabled) {
                    var reqDate = dateFilter(scope.first.date, scope.df);
                    this.formData.activatedOnDate = reqDate;
                }
                if(scope.submittedOn.first){
                    this.formData.submittedOnDate = dateFilter(scope.submittedOn.first, scope.df);
                }                
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                resourceFactory.villageResource.update({villageId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewvillage/' + routeParams.id);
                });
            };

            scope.setChoice = function () {
                if (this.formData.active) {
                    scope.choice = 1;
                }
                else if (!this.formData.active) {
                    scope.choice = 0;
                }
            };

            scope.activate = function () {
                if(!scope.isWorkflowEnabled){
                    var reqDate = dateFilter(scope.first.date, scope.df);
                    var newActivation = new Object();
                    newActivation.activatedOnDate = reqDate;
                    newActivation.locale = scope.optlang.code;
                    newActivation.dateFormat = scope.df;
                    resourceFactory.villageResource.save({villageId: routeParams.id, command: 'activate'}, newActivation, function (data) {
                        location.path('/viewvillage/' + routeParams.id);
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('EditVillageController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditVillageController]).run(function ($log) {
        $log.info("EditVillageController initialized");
    });
}(mifosX.controllers || {}));