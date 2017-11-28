(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkBankAccountVerificationFileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope) {

            scope.recordsPerPage = 15000;

            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.fileProcessResource.getAllFiles({
                    offset: ((pageNumber - 1) * scope.recordsPerPage),
                    limit: scope.recordsPerPage
                }, function (data) {
                    scope.fileProcesses = data.pageItems;
                    scope.attachedFileURL();
                });
            };

            scope.initPage = function() {
                var items = resourceFactory.fileProcessResource.getAllFiles({
                    offset: 0,
                    limit: scope.recordsPerPage
                }, function(data) {
                    scope.totalRecords = data.totalFilteredRecords;
                    scope.fileProcesses = data.pageItems || [];
                    scope.attachedFileURL();
                });
            };

            scope.initPage();

            scope.routeTo = function (id) {
                location.path('/viewfileprocess/' + id);
            };

            scope.fetchUpdatedData = function(fileprocess){
                resourceFactory.fileProcessResource.get({fileProcessId:fileprocess.id},function(data){
                    fileprocess.status = data.status;
                    fileprocess.totalRecords = data.totalRecords;
                    fileprocess.totalPendingRecords = data.totalPendingRecords;
                    fileprocess.totalSuccessRecords = data.totalSuccessRecords;
                    fileprocess.totalFailureRecords = data.totalFailureRecords;
                });
            };
            scope.attachedFileURL = function(){
                for (var i = 0; i < scope.fileProcesses.length; i++) {
                    var url = {};
                    url = API_VERSION + '/fileprocess/' + scope.fileProcesses[i].id + '/attachment?tenantIdentifier=' + $rootScope.tenantIdentifier;
                    scope.fileProcesses[i].docUrl = url;
                }
            }
        }
    });
    mifosX.ng.application.controller('BulkBankAccountVerificationFileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.BulkBankAccountVerificationFileProcessController]).run(function ($log) {
        $log.info("BulkBankAccountVerificationFileProcessController initialized");
    });
}(mifosX.controllers || {}));