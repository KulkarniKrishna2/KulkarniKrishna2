(function (module) {
    mifosX.controllers = _.extend(module, {
        CodeController: function (scope, resourceFactory, location) {
            scope.codes = [];
            scope.actualCodes = [];

            scope.routeTo = function (id) {
                location.path('/viewcode/' + id);
            }
            scope.codesPerPage = 15;
            scope.getResultsPage = function (pageNumber) {
                var offset=((pageNumber - 1) * scope.codesPerPage);
                var limit=scope.codesPerPage;
                scope.getCodeDetails(offset,limit);
            }
            scope.initPage = function () {
                var offset=0;
                var limit=scope.codesPerPage;
                scope.getCodeDetails(offset,limit);
            }
            scope.getCodeDetails = function(offset,limit){
                var items = resourceFactory.codeResources.getAllCodes({
                    offset: offset,
                    limit: limit
                }, function (data) {
                    scope.totalCodes = data.totalFilteredRecords;
                    scope.codes = data.pageItems;
                });
            }
            scope.initPage();
        }
    });
    mifosX.ng.application.controller('CodeController', ['$scope', 'ResourceFactory', '$location', mifosX.controllers.CodeController]).run(function ($log) {
        $log.info("CodeController initialized");
    });
}(mifosX.controllers || {}));