(function (module) {
    mifosX.controllers = _.extend(module, {
        CenterController: function (scope, resourceFactory, location) {
            scope.centers = [];
            scope.actualCenters = [];
            scope.searchText = "";
            scope.searchResults = [];
            scope.searchRule=false;
            scope.isOfficeReferenceNumberRequired =scope.response.uiDisplayConfigurations.office.isOfficeReferenceNumberRequired;
            scope.routeTo = function (id) {
                location.path('/viewcenter/' + id);
            };

            if (!scope.searchCriteria.centers) {
                scope.searchCriteria.centers = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.centers;

            scope.onFilter = function () {
                scope.searchCriteria.centers = scope.filterText;
                scope.saveSC();
            };


            scope.centersPerPage = 15;
            scope.getResultsPage = function (pageNumber) {
                if(scope.searchText){
                    var startPosition = (pageNumber - 1) * scope.centersPerPage;
                    scope.centers = scope.actualCenters.slice(startPosition, startPosition + scope.centersPerPage);
                    return;
                }
                var items = resourceFactory.centerResource.get({
                    offset: ((pageNumber - 1) * scope.centersPerPage),
                    limit: scope.centersPerPage,
                    paged: 'true',
                    orderBy: 'name',
                    sortOrder: 'ASC'
                }, function (data) {
                    scope.centers = data.pageItems;
                });
            }
            
            scope.getOfficeName=function(officeName,officeReferenceNumber){
                if(!scope.isOfficeReferenceNumberRequired){
                    return officeName;
                }else{
                    return officeName+ ' - ' + officeReferenceNumber;
                }
            }
            scope.initPage = function () {
                var items = resourceFactory.centerResource.get({
                    offset: 0,
                    limit: scope.centersPerPage,
                    paged: 'true',
                    orderBy: 'name',
                    sortOrder: 'ASC'
                }, function (data) {
                    scope.totalCenters = data.totalFilteredRecords;
                    scope.centers = data.pageItems;
                });
            }
            scope.initPage();

            scope.search = function () {
                scope.actualCenters = [];
                scope.searchResults = [];
                scope.filterText = "";
                var searchString = scope.searchText;
                searchString = searchString.replace(/(^"|"$)/g, '');
                var exactMatch= scope.searchRule;
                var n = searchString.localeCompare(scope.searchText);
                if(n!=0)
                {
                    exactMatch=true;
                }
                if(!scope.searchText){
                    scope.initPage();
                } else {
                    resourceFactory.globalSearch.search({query: searchString ,  resource: "groups",exactMatch: exactMatch}, function (data) {
                        var arrayLength = data.length;
                        for (var i = 0; i < arrayLength; i++) {
                            var result = data[i];
                            var center = {};
                            center.status = {};
                            center.subStatus = {};
                            if(result.entityType  == 'CENTER') {
                                center.name = result.entityName;
                                center.id = result.entityId;
                                center.accountNo = result.entityAccountNo;
                                center.officeName = result.parentName;
                                center.status.value = result.entityStatus.value;
                                center.status.code = result.entityStatus.code;
                                center.externalId = result.entityExternalId;
                                center.referenceNumber = result.entityReferenceNumber;
                                scope.actualCenters.push(center);
                            }
                        }
                        var numberOfCenters = scope.actualCenters.length;
                        scope.totalCenters = numberOfCenters;
                        scope.centers = scope.actualCenters.slice(0, scope.centersPerPage);
                    });
                }
            }

        }
    });
    mifosX.ng.application.controller('CenterController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CenterController]).run(function ($log) {
        $log.info("CenterController initialized");
    });
}(mifosX.controllers || {}));