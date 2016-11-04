(function (module) {
    mifosX.controllers = _.extend(module, {
        EmployeeController: function (scope, resourceFactory, location) {
            scope.employees = [];
            scope.staffPerPage = 15;
            scope.actualEmployees = [];

            scope.getResultsPage = function (pageNumber) {
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
        }
    });
    mifosX.ng.application.controller('EmployeeController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.EmployeeController]).run(function ($log) {
        $log.info("EmployeeController initialized");
    });
}(mifosX.controllers || {}));