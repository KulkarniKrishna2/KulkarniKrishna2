(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewFileProcessController: function (scope, resourceFactory, location, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {

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
                    limit: scope.recordsPerPage,
                    fileProcessType : routeParams.fileProcessIdentifier
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
            scope.download = function (file) {
                var url =$rootScope.hostUrl + file.docUrl;
                var fileType = file.fileName.substr(file.fileName.lastIndexOf('.') + 1);
                commonUtilService.downloadFile(url,fileType);
            }
        }
    });
    mifosX.ng.application.controller('ViewFileProcessController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'API_VERSION', '$upload', '$rootScope','CommonUtilService', mifosX.controllers.ViewFileProcessController]).run(function ($log) {
        $log.info("ViewFileProcessController initialized");
    });
}(mifosX.controllers || {}));