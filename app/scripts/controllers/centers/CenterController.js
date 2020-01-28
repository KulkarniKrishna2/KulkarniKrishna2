(function (module) {
    mifosX.controllers = _.extend(module, {
        CenterController: function (scope, resourceFactory, location, paginatorUsingOffsetService) {
            scope.itemsPerPage = 15;
            scope.showSearch = true;
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
                scope.showSearch = false;
                if(scope.searchConditions.officeId == null){
                    delete scope.searchConditions.officeId;
                }
                if(scope.searchConditions.staffId == null){
                    delete scope.searchConditions.staffId;
                }
                scope.centers = paginatorUsingOffsetService.paginate(fetchFunction, scope.itemsPerPage);
            };

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

            scope.showSearchForm = function () {
                scope.showSearch = scope.showSearch ? false: true;
            };

            scope.resetSearchData = function () {
                scope.searchConditions = {};
                delete scope.centers;
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
        }
    });
    mifosX.ng.application.controller('CenterController', ['$scope', 'ResourceFactory', '$location', 'PaginatorUsingOffsetService', mifosX.controllers.CenterController]).run(function ($log) {
        $log.info("CenterController initialized");
    });
}(mifosX.controllers || {}));