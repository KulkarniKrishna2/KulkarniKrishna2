(function (module) {
    mifosX.controllers = _.extend(module, {
        SearchController: function (scope, routeParams, resourceFactory) {

            scope.searchResults = [];
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });
            
            
            if (routeParams.query == 'undefined') {
                routeParams.query = '';
            }
            resourceFactory.globalSearch.search({query: routeParams.query, resource: routeParams.resource, exactMatch: routeParams.exactMatch}, function (data) {
            	
                if (data.length > 200) {
                    scope.searchResults = data.slice(0, 201);
                    scope.showMsg = true;
                } else {
                    scope.searchResults = data;
                }
                ;

               
                if (scope.searchResults.length <= 0) {
                    scope.flag = true;
                }
            });
            scope.getClientDetails = function (clientId) {

                scope.selected = clientId;
                resourceFactory.clientResource.get({clientId: clientId}, function (data) {
                    scope.group = '';
                    scope.client = data;
                    scope.center = '';
                    scope.entityStatus = '';
                    scope.reason = '';
                });
                resourceFactory.clientAccountResource.get({clientId: clientId}, function (data) {
                    scope.clientAccounts = data;
                });
            };

           scope.getGroupDetails = function (groupId) {

                scope.selected = groupId;

                resourceFactory.groupResource.get({groupId: groupId}, function (data) {
                    scope.client = '';
                    scope.center = '';
                    scope.group = data;
                    scope.entityStatus = '';
                    scope.reason = '';
                });
                resourceFactory.groupAccountResource.get({groupId: groupId}, function (data) {
                    scope.groupAccounts = data;
                });
            };

            scope.getCenterDetails = function (centerId) {

                scope.selected = centerId;

                resourceFactory.centerResource.get({centerId: centerId, associations: 'groupMembers'}, function (data) {
                    scope.client = '';
                    scope.group = '';
                    scope.center = data;
                    scope.entityStatus = '';
                    scope.reason = '';
                });
                resourceFactory.centerAccountResource.get({centerId: centerId}, function (data) {
                    scope.centerAccounts = data;
                });
            };
            
            scope.search = function () {
            	scope.flag = false;
                scope.searchResults = [];
                scope.searchText;
                scope.officeId;
                var searchString = scope.searchText;
                searchString = searchString.replace(/(^"|"$)/g, '');
                resourceFactory.globalSearch.search({query: searchString, resource: "clients,clientIdentifiers,groups,savings,loans,branch", exactMatch: "false", officeId: scope.officeId}, function (data) {
                	
                    if (data.length > 200) {
                        scope.searchResults = data.slice(0, 201);
                        scope.showMsg = true;
                    } else {
                        scope.searchResults = data;
                    };

                   
                    if (scope.searchResults.length <= 0) {
                        scope.flag = true;
                    }
                });

            }
        }
    });
    mifosX.ng.application.controller('SearchController', ['$scope', '$routeParams', 'ResourceFactory', mifosX.controllers.SearchController]).run(function ($log) {
        $log.info("SearchController initialized");
    });
}(mifosX.controllers || {}));
