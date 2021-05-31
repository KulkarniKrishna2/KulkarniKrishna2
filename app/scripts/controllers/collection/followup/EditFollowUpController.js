(function (module) {
    mifosX.controllers = _.extend(module, {
        EditFollowUpController: function (scope, resourceFactory, location, http, dateFilter, routeParams) {
            scope.offices = [];
            scope.staffs = [];
            scope.formData = {};
            scope.urlParam = location.search();
            scope.officeId = scope.urlParam.officeId;
            scope.staffId = scope.urlParam.staffId;
            scope.entityTypeId = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.followUpId = routeParams.followUpId;
            scope.restrictDate = new Date();
            scope.selectedDefaultOfficeOnly = true;
            scope.cancel = '#/collection/'+scope.officeId+'/'+scope.staffId;

            resourceFactory.followUpTemplateResource.get({officeId:scope.officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,selectedDefaultOfficeOnly:scope.selectedDefaultOfficeOnly}, function (data) {
                scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.followUpType = data.followUpTypeOptions;
            });
            resourceFactory.followUpResource.get({officeId:scope.officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,followUpId:scope.followUpId}, function (data) {
                scope.formData.officeId = data.officeId;
                scope.formData.staffId= data.staffId;
                scope.formData.followupTypeId = data.followUpType.id;
                scope.formData.callsummary = data.callSummary;
                scope.formData.nextFollowUpDate = new Date(data.nextFollowUpDate);
                scope.formData.followUpDate = new Date(data.followUpDate);
                scope.formData.note = data.nextFollowUpNote;
                scope.changeOffice(scope.formData.officeId);
            });
            scope.changeOffice = function (officeId) {
                scope.selectedDefaultOfficeOnly = false;
                resourceFactory.followUpTemplateResource.get({officeId:officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,selectedDefaultOfficeOnly:scope.selectedDefaultOfficeOnly}, function (data) {
                    scope.staffs = data.staffOptions;
                });
            };
            scope.submit = function () {
                this.formData.followUpDate = dateFilter(this.formData.followUpDate, scope.df);
                if (this.formData.nextFollowUpDate) {
                    this.formData.nextFollowUpDate = dateFilter(this.formData.nextFollowUpDate, scope.df);
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                resourceFactory.followUpResource.update({officeId:scope.officeId,staffId:scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,followUpId: scope.followUpId},this.formData, function (data) {
                    location.path('/collectionfollowup/'+scope.entityTypeId+'/'+scope.entityId).search({officeId:scope.officeId,staffId:scope.staffId});
                });
            };
        }
    });
    mifosX.ng.application.controller('EditFollowUpController', ['$scope', 'ResourceFactory', '$location','$http','dateFilter', '$routeParams', mifosX.controllers.EditFollowUpController]).run(function ($log) {
        $log.info("EditFollowUpController initialized");
    });
}(mifosX.controllers || {}));   