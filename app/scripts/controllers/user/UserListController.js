(function (module) {
    mifosX.controllers = _.extend(module, { 
        UserListController: function (scope, resourceFactory, location,paginatorUsingOffsetService) {
            scope.users = [];
            scope.isSearchData = true;
            scope.usersPerPage = 15;
            scope.isHideCreateEntity = false;
            scope.isSelfServiceUser = 0;

            scope.routeTo = function (id) {
                location.path('/viewuser/' + id);
            };

            scope.fetchUsers = function (userType){
                scope.usersPerPage = 15;
                if(userType == 'users')
                {
                    scope.isSelfServiceUser = 0;
                    scope.searchData();
                }
                else if(userType == 'selfServiceUser'){
                scope.isSelfServiceUser = 1;
                scope.searchData();
                }
                
            }

            /* -----Throws error on test-----
             if (!scope.searchCriteria.users) {
             scope.searchCriteria.users = null;
             scope.saveSC();
             }
             scope.filterText = scope.searchCriteria.users;

             scope.onFilter = function () {
             scope.searchCriteria.users = scope.filterText;
             scope.saveSC();
             };*/

            /**
             * Get the record based on the offset limit
             */
            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.userListResource.getAllUsers({
                    isSelfServiceUser : scope.isSelfServiceUser,
                    offset: offset,
                    limit: limit,
                    searchString:scope.filterText
                }, callback);
            };

            scope.searchConditions = {};
            scope.searchData = function () {
                scope.users = paginatorUsingOffsetService.paginate(fetchFunction, scope.usersPerPage);
                scope.isSearchData = true;
            };
            scope.searchData();
        }
    });
    mifosX.ng.application.controller('UserListController', ['$scope', 'ResourceFactory', '$location','PaginatorUsingOffsetService', mifosX.controllers.UserListController]).run(function ($log) {
        $log.info("UserListController initialized");
    });
}(mifosX.controllers || {}));