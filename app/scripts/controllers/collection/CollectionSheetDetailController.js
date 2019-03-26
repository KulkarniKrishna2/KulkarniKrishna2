(function (module) {
    mifosX.controllers = _.extend(module, {
        CollectionSheetDetailController: function (scope, resourceFactory, route, dateFilter, routeParams) {
            
            resourceFactory.collectionSheetResource.get({collectionSheetId : routeParams.collectionSheetId}, function(data){
                scope.collectionSheetData = data;
                    scope.collectionSheetData.meetingDate = dateFilter(new Date(data.meetingDate),scope.df);
            });
            
            scope.refresh = function () {
                route.reload();
            };
        }

    });
    mifosX.ng.application.controller('CollectionSheetDetailController', ['$scope', 'ResourceFactory', '$route', 'dateFilter', '$routeParams', mifosX.controllers.CollectionSheetDetailController]).run(function ($log) {
        $log.info("CollectionSheetDetailController initialized");
    });
}(mifosX.controllers || {}));