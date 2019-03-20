(function (module) {
    mifosX.controllers = _.extend(module, {
        CollectionSheetTransactionsController: function (scope, resourceFactory, location, dateFilter, http, routeParams, paginatorService, API_VERSION, $upload, $rootScope, CommonUtilService) {
            
            resourceFactory.collectionSheetResource.get({collectionSheetId : routeParams.collectionSheetId}, function(data){
                scope.collectionSheetData = data;
                    scope.collectionSheetData.meetingDate = dateFilter(new Date(data.meetingDate),scope.df);
            });

        }

    });
    mifosX.ng.application.controller('CollectionSheetTransactionsController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams','PaginatorService', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.CollectionSheetTransactionsController]).run(function ($log) {
        $log.info("CollectionSheetTransactionsController initialized");
    });
}(mifosX.controllers || {}));