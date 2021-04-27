(function (module) {
    mifosX.controllers = _.extend(module, {
        EditGroupController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.first = {};
            scope.managecode = routeParams.managecode;
            scope.restrictDate = new Date();
            scope.isGroupNameReadOnly = false;
            scope.isActivationReadOnly = false;
            scope.isExternalIdReadOnly = false;

            if(scope.response && scope.response.uiDisplayConfigurations){
                scope.isGroupNameReadOnly = scope.response.uiDisplayConfigurations.viewGroup.isReadOnlyField.groupName;
                scope.isActivationReadOnly = scope.response.uiDisplayConfigurations.viewGroup.isReadOnlyField.activationDate;
                scope.isExternalIdReadOnly = scope.response.uiDisplayConfigurations.createGroup.isReadOnlyField.externalId; 
            }
            resourceFactory.groupResource.get({groupId: routeParams.id, associations: 'clientMembers', template: 'true',staffInSelectedOfficeOnly:true}, function (data) {
                scope.editGroup = data;
                scope.isWorkflowEnabled = (data.isWorkflowEnabled && data.isWorkflowEnableForBranch);
                scope.formData = {
                    name: data.name,
                    externalId: data.externalId,
                    staffId: data.staffId
                };
                if (!scope.isWorkflowEnabled && data.activationDate) {
                    var actDate = dateFilter(data.activationDate, scope.df);
                    scope.first.date = new Date(actDate);
                }

            });

            resourceFactory.groupResource.get({groupId: routeParams.id}, function (data) {
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
                resourceFactory.groupResource.update({groupId: routeParams.id}, this.formData, function (data) {
                    location.path('/viewgroup/' + routeParams.id);
                });
            };

            scope.activate = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                var newActivation = new Object();
                newActivation.activationDate = reqDate;
                newActivation.locale = scope.optlang.code;
                newActivation.dateFormat = scope.df;
                resourceFactory.groupResource.save({groupId: routeParams.id, command: 'activate'}, newActivation, function (data) {
                    location.path('/viewgroup/' + routeParams.id);
                });
            };
        }
    });
    mifosX.ng.application.controller('EditGroupController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditGroupController]).run(function ($log) {
        $log.info("EditGroupController initialized");
    });
}(mifosX.controllers || {}));

