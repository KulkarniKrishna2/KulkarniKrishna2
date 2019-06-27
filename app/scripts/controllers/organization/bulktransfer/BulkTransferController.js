(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkTransferController: function (scope, resourceFactory, location, dateFilter, routeParams) {
            scope.bulkTransfers  = [];
            scope.showBulkTransfer = true;
            if(scope.response.uiDisplayConfigurations.organization && scope.response.uiDisplayConfigurations.organization.isHiddenField){
                if(scope.response.uiDisplayConfigurations.organization.isHiddenField.initiateBulkTransfer){
                    scope.showBulkTransfer = !scope.response.uiDisplayConfigurations.organization.isHiddenField.initiateBulkTransfer;
                }
            }
            scope.initPage = function () {
            	resourceFactory.bulkTransferResource.getAll({},function (data) {
                    scope.bulkTransfers = data;
                });
            }
            scope.initPage();

            scope.routeTo = function(id){
                var uri = '/viewbulktransfer/'+id;
                location.path(uri);
            }
        }
    });
    mifosX.ng.application.controller('BulkTransferController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', mifosX.controllers.BulkTransferController]).run(function ($log) {
        $log.info("BulkTransferController initialized");
    });
}(mifosX.controllers || {}));