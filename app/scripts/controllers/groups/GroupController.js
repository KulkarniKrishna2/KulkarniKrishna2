(function (module) {
    mifosX.controllers = _.extend(module, {
        GroupController: function (scope, resourceFactory, location, paginatorUsingOffsetService) {

            scope.isWorkflowEnabled = scope.isSystemGlobalConfigurationEnabled('work-flow');
            scope.hideCreateGroup = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.createGroup;
            scope.isHideCreateEntity = false;
            if(scope.isWorkflowEnabled && scope.hideCreateGroup){
                scope.isHideCreateEntity = true;
            }
            scope.hideGroupName = false;
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewGroup &&
                scope.response.uiDisplayConfigurations.viewGroup.isHiddenField) {
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
                scope.groups = paginatorUsingOffsetService.paginate(fetchFunction, scope.itemsPerPage);
            };
            scope.searchData();

            scope.routeTo = function (id) {
                location.path('/viewgroup/' + id);
            };

            scope.onFilter = function () {
                scope.saveSC();
            };

            scope.newSearch = function(){
                if(!_.isUndefined(scope.searchText) && scope.searchText !== ""){
                    scope.filterText = undefined;
                    var searchString = scope.searchText.replace(/(^"|"$)/g, '');
                    scope.searchConditions.searchString = searchString;
                }else{
                    scope.searchConditions = {};
                }
                scope.searchData();
            };
        }
    });
    mifosX.ng.application.controller('GroupController', ['$scope', 'ResourceFactory', '$location', 'PaginatorUsingOffsetService', mifosX.controllers.GroupController]).run(function ($log) {
        $log.info("GroupController initialized");
    });
}(mifosX.controllers || {}));