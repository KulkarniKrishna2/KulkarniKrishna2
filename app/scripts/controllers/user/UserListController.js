(function (module) {
    mifosX.controllers = _.extend(module, { 
        UserListController: function (scope, resourceFactory, location,paginatorUsingOffsetService) {
            scope.users = [];
            scope.isSearchData = true;
            scope.usersPerPage = 15;
            scope.isHideCreateEntity = false;
            scope.isSelfServiceUser = 0;
            scope.currentUserType= 'users';

            scope.routeTo = function (id) {
                if (scope.currentUserType != 'deactivatedUser') {
                    location.path('/viewuser/' + id);
                }
            };

            scope.activateUser = function (userId) {
                if (scope.currentUserType == 'deactivatedUser') {
                    location.path('/reactivateuser/' + userId);
                }
            }

            scope.fetchUsers = function (userType) {
                scope.usersPerPage = 15;
                if (userType == 'users') {
                    scope.currentUserType = 'users';
                    scope.isSelfServiceUser = 0;
                    scope.searchData();
                }
                else if (userType == 'selfServiceUser') {
                    scope.currentUserType = 'selfServiceUser';
                    scope.isSelfServiceUser = 1;
                    scope.searchData();
                }
                else if (userType == 'deactivatedUser') {
                    scope.currentUserType = 'deactivatedUser';
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

            var fetchDeactivatedUser = function (offset, limit, callback) {
                resourceFactory.deactivatedUserResource.query({
                    offset: offset,
                    limit: limit,
                    searchString: scope.filterText
                }, callback);
            };

            scope.searchConditions = {};
            scope.searchData = function () {
                var fetchMethod = fetchFunction;
                if (scope.currentUserType == 'deactivatedUser') {
                    fetchMethod = fetchDeactivatedUser;
                }
                scope.users = paginatorUsingOffsetService.paginate(fetchMethod, scope.usersPerPage);
                scope.isSearchData = true;
            };

            /* searchData() function is getting called twice on page load
            scope.searchData();
            */
        }
    });
    mifosX.ng.application.controller('UserListController', ['$scope', 'ResourceFactory', '$location','PaginatorUsingOffsetService', mifosX.controllers.UserListController]).run(function ($log) {
        $log.info("UserListController initialized");
    });
}(mifosX.controllers || {}));