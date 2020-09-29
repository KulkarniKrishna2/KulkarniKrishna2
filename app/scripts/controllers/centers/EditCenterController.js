(function (module) {
    mifosX.controllers = _.extend(module, {
        EditCenterController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.managecode = routeParams.managecode;
            scope.first = {};
            scope.first.date = new Date();
            scope.centerId = routeParams.id;
            scope.restrictDate = new Date();
            scope.isHiddenVillageOption = true;
            scope.villages = [];
            scope.isActivationDateReadOnly = false;
            if(scope.response != undefined){
                scope.isHiddenVillageOption = scope.response.uiDisplayConfigurations.editCenter.isHiddenField.villageOptions;                
                scope.isNameAutoPopulate = scope.response.uiDisplayConfigurations.createCenter.isAutoPopulate.name;
                scope.isHiddenStaffOption = scope.response.uiDisplayConfigurations.editCenter.isHiddenField.staffOptions;
            }
            if(scope.response && scope.response.uiDisplayConfigurations.createCenter.isValidateName) {
                scope.namePattern = scope.response.uiDisplayConfigurations.createCenter.isValidateName.namePattern;
            }
            if(scope.response && scope.response.uiDisplayConfigurations.editCenter.isReadOnlyField.activationDate != undefined) {
                scope.isActivationDateReadOnly = scope.response.uiDisplayConfigurations.editCenter.isReadOnlyField.activationDate;
            }
            if(scope.response && scope.response.uiDisplayConfigurations){
                scope.loanOfficersOnly = scope.response.uiDisplayConfigurations.createCenter.loanOfficersOnly;
            }
            resourceFactory.centerResource.get({centerId: routeParams.id, template: 'true',staffInSelectedOfficeOnly:true,loanOfficersOnly:scope.loanOfficersOnly, associations:'hierarchyLookup'}, function (data) {
                scope.edit = data;
                scope.staffs = data.staffOptions;                
                scope.villages = data.villageOptions;
                scope.isWorkflowEnabled = (data.isWorkflowEnabled && data.isWorkflowEnableForBranch);
                scope.formData = {
                    name: data.name,
                    externalId: data.externalId,
                    staffId: data.staffId
                };
                if(data.villageCounter){
                    scope.formData.villageId = data.villageCounter.villageId
                }

                if (data.activationDate) {
                    var newDate = dateFilter(data.activationDate, scope.df);
                    scope.first.date = new Date(newDate);
                }

                if (data.timeline.submittedOnDate) {
                    scope.mindate = new Date(data.timeline.submittedOnDate);
                }
            });

            scope.updateGroup = function () {
                if (!scope.isWorkflowEnabled) {
                    var reqDate = dateFilter(scope.first.date, scope.df);
                    this.formData.activationDate = reqDate;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if(scope.isNameAutoPopulate){
                    this.formData.villageId = undefined;
                }
                resourceFactory.centerResource.update({centerId: routeParams.id}, this.formData, function (data) {
                    location.url('/viewcenter/' + routeParams.id);
                });
            };
            scope.activate = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                var newActivation = new Object();
                newActivation.activationDate = reqDate;
                newActivation.locale = scope.optlang.code;
                newActivation.dateFormat = scope.df;
                resourceFactory.centerResource.save({centerId: routeParams.id, command: 'activate'}, newActivation, function (data) {
                    location.path('/viewcenter/' + routeParams.id);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditCenterController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditCenterController]).run(function ($log) {
        $log.info("EditCenterController initialized");
    });
}(mifosX.controllers || {}));