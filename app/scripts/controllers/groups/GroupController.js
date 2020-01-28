(function (module) {
    mifosX.controllers = _.extend(module, {
        GroupController: function (scope, resourceFactory, location, paginatorUsingOffsetService) {
            scope.showSearch = true;
            scope.isWorkflowEnabled = scope.isSystemGlobalConfigurationEnabled('work-flow');
            scope.hideCreateGroup = false;
            scope.isHideCreateEntity = false;
            if(scope.isWorkflowEnabled && scope.hideCreateGroup){
                scope.isHideCreateEntity = true;
            }
            scope.hideGroupName = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewGroup &&
                scope.response.uiDisplayConfigurations.viewGroup.isHiddenField) {
                    scope.hideCreateGroup = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.createGroup;
                if (scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.groupName) {
                    scope.hideGroupName = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.groupName;
                }
                if (scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.referenceNo) {
                    scope.showRefNo =  !scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.referenceNo;
                }
            }

            scope.itemsPerPage = 15;
            /**
             * Get the record based on the offset limit
             */
            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.groupSearchResource.getAllGroups({
                    searchConditions: scope.searchConditions,
                    orderBy: 'name',
                    sortOrder: 'ASC',
                    offset: offset,
                    limit: limit
                }, callback);
            };

            scope.searchConditions = {};
            scope.searchData = function () {
                scope.showSearch = false;
                if(scope.searchConditions.officeId == null){
                    delete scope.searchConditions.officeId;
                }
                if(scope.searchConditions.staffId == null){
                    delete scope.searchConditions.staffId;
                }
                scope.groups = paginatorUsingOffsetService.paginate(fetchFunction, scope.itemsPerPage);
            };

            scope.routeTo = function (id) {
                location.path('/viewgroup/' + id);
            };

            scope.showSearchForm = function () {
                scope.showSearch = scope.showSearch ? false: true;
            };

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getOfficeStaff = function () {
                if(scope.searchConditions.officeId){
                    resourceFactory.loanOfficerDropdownResource.getAll({ officeId: scope.searchConditions.officeId }, function (data) {
                        scope.staffs = data;
                    });
                }
            };

            scope.resetSearchData = function () {
                scope.searchConditions = {};
                delete scope.groups;
            };
        }
    });
    mifosX.ng.application.controller('GroupController', ['$scope', 'ResourceFactory', '$location', 'PaginatorUsingOffsetService', mifosX.controllers.GroupController]).run(function ($log) {
        $log.info("GroupController initialized");
    });
}(mifosX.controllers || {}));