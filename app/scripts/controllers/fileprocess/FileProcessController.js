(function (module) {
    mifosX.controllers = _.extend(module, {
        FileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {

            scope.recordsPerPage = 15;

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
                    fileprocess.createdDate = data.createdDate;
                });
            };
            scope.attachedFileURL = function(){
                for (var i = 0; i < scope.fileProcesses.length; i++) {
                        var url = {};
                        url = API_VERSION + '/fileprocess/' + scope.fileProcesses[i].id + '/attachment';
                        scope.fileProcesses[i].docUrl = url;
                    }
            }
        }
    });
    mifosX.ng.application.controller('FileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope','CommonUtilService', mifosX.controllers.FileProcessController]).run(function ($log) {
        $log.info("FileProcessController initialized");
    });
}(mifosX.controllers || {}));