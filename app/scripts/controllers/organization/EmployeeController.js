(function (module) {
    mifosX.controllers = _.extend(module, {
        EmployeeController: function (scope, resourceFactory, location) {
            scope.employees = [];
            scope.staffPerPage = 15;
            scope.actualEmployees = [];

            scope.getResultsPage = function (pageNumber) {
                if(scope.searchText){
                    var startPosition = (pageNumber - 1) * scope.staffPerPage;
                    scope.employees = scope.actualEmployees.slice(startPosition, startPosition + scope.staffPerPage);
                    return;
                }
                var items = resourceFactory.employeeResource.getAllEmployees({
                    offset: ((pageNumber - 1) * scope.staffPerPage),
                    limit: scope.staffPerPage
                }, function (data) {
                    scope.employees = data.pageItems;
                });
            }

            scope.initPage = function () {

                var items = resourceFactory.employeeResource.getAllEmployees({
                    offset: 0,
                    limit: scope.staffPerPage
                }, function (data) {
                    scope.totalStaff = data.totalFilteredRecords;
                    scope.employees = data.pageItems;
                });
            }

            scope.initPage();

            scope.routeTo = function (id) {
                location.path('/viewemployee/' + id);
            };

            if (!scope.searchCriteria.employees) {
                scope.searchCriteria.employees = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.employees;

            scope.onFilter = function () {
                scope.searchCriteria.employees = scope.filterText;
                scope.saveSC();
            };

            scope.search = function () {
                scope.actualEmployees = [];
                scope.searchResults = [];
                scope.filterText = "";
                var searchString = scope.searchText;
                searchString = searchString.replace(/(^"|"$)/g, '');
                var exactMatch=false;
                var n = searchString.localeCompare(scope.searchText);
                if(n!=0)
                {
                    exactMatch=true;
                }

                if(!scope.searchText){
                    scope.initPage();
                } else {
                    searchString = searchString.trim().replace(" ", "%")
                    resourceFactory.globalSearch.search({query: searchString , resource: "staff",exactMatch: exactMatch}, function (data) {
                        var arrayLength = data.length;
                        for (var i = 0; i < arrayLength; i++) {
                            var result = data[i];
                            var employee = {};
                            employee.displayName = result.entityName;
                            employee.id = result.entityId;
                            employee.officeName = result.officeName;
                            employee.externalId = result.entityExternalId;
                            employee.isActive = result.isActive;
                            employee.isLoanOfficer = result.isLoanOfficer;
                            scope.actualEmployees.push(employee);
                        }
                        var numberOfStaffs = scope.actualEmployees.length;
                        scope.totalStaff = numberOfStaffs;
                        scope.employees = scope.actualEmployees.slice(0, scope.staffPerPage);
                    });
                }
            }
        }
    });
    mifosX.ng.application.controller('EmployeeController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.EmployeeController]).run(function ($log) {
        $log.info("EmployeeController initialized");
    });
}(mifosX.controllers || {}));