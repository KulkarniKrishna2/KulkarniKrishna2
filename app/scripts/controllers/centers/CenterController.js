(function (module) {
    mifosX.controllers = _.extend(module, {
        CenterController: function (scope, resourceFactory, location, paginatorUsingOffsetService) {
            scope.itemsPerPage = 15;
            /**
             * Get the record based on the offset limit
             */
            var fetchFunction = function (offset, limit, callback) {
                resourceFactory.centerSearchResource.getAllCenters({
                    searchConditions: scope.searchConditions,
                    orderBy: 'name',
                    sortOrder: 'ASC',
                    offset: offset,
                    limit: limit
                }, callback);
            };

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.centers && 
                scope.response.uiDisplayConfigurations.centers.showRefNo){
                scope.showRefNo =  scope.response.uiDisplayConfigurations.centers.showRefNo;
            }
            scope.searchConditions = {};
            scope.searchData = function () {
                scope.centers = paginatorUsingOffsetService.paginate(fetchFunction, scope.itemsPerPage);
            };
            scope.searchData();

            scope.routeTo = function (id) {
                location.path('/viewcenter/' + id);
            };

            scope.getOfficeName = function (officeName, officeReferenceNumber) {
                if (!scope.isReferenceNumberAsNameEnable) {
                    return officeName;
                } else {
                    return officeName + ' - ' + officeReferenceNumber;
                }
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
            }
        }
    });
    mifosX.ng.application.controller('CenterController', ['$scope', 'ResourceFactory', '$location', 'PaginatorUsingOffsetService', mifosX.controllers.CenterController]).run(function ($log) {
        $log.info("CenterController initialized");
    });
}(mifosX.controllers || {}));