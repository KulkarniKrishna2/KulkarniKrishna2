(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateFollowUpController: function (scope, resourceFactory, location, http, dateFilter, routeParams) {
        	scope.offices = [];
            scope.staffs = [];
            scope.first = {};
            scope.first.date = new Date();
            scope.first.nextFollowUpDate = new Date ();
            scope.formData = {};
            scope.urlParam = location.search();
            scope.officeId = scope.urlParam.officeId;
            scope.staffId = scope.urlParam.staffId;
            scope.entityTypeId = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.restrictDate = new Date();
            scope.selectedDefaultOfficeOnly = true;
            scope.cancel = '#/collection/'+scope.officeId+'/'+scope.staffId;

            resourceFactory.followUpTemplateResource.get({officeId:scope.officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,selectedDefaultOfficeOnly:scope.selectedDefaultOfficeOnly}, function (data) {
            	scope.offices = data.officeOptions;
                scope.staffs = data.staffOptions;
                scope.followUpType = data.followUpTypeOptions;
                scope.formData.officeId = scope.offices[0].id;
                if(scope.staffs != undefined && scope.staffs.length >0){
                   scope.formData.staffId = scope.staffs[0].id;
                }
            });
            scope.changeOffice = function (officeId) {
                scope.selectedDefaultOfficeOnly = false;
                resourceFactory.followUpTemplateResource.get({officeId:officeId,staffId: scope.staffId,entityTypeId:scope.entityTypeId,entityId:scope.entityId,selectedDefaultOfficeOnly:scope.selectedDefaultOfficeOnly}, function (data) {
                    scope.staffs = data.staffOptions;
                    scope.formData.staffId = scope.staffs[0].id;
                });
            };
            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.followUpDate = reqDate;
                if (scope.first.nextFollowUpDate) {
                    reqDate = dateFilter(scope.first.nextFollowUpDate, scope.df);
                    this.formData.nextFollowUpDate = reqDate;
                }
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                resourceFactory.followUpResource.save({entityTypeId:scope.entityTypeId,entityId:scope.entityId},this.formData, function (data) {
                    location.path('/collectionfollowup/'+scope.entityTypeId+'/'+scope.entityId).search({officeId:scope.officeId,staffId:scope.staffId});
                });
            };
        }
    });
    mifosX.ng.application.controller('CreateFollowUpController', ['$scope', 'ResourceFactory', '$location','$http','dateFilter', '$routeParams', mifosX.controllers.CreateFollowUpController]).run(function ($log) {
        $log.info("CreateFollowUpController initialized");
    });
}(mifosX.controllers || {}));	