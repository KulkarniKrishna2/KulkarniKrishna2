/**
 * Created by FinTech on 07-07-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewPDCDetailController: function (scope, routeParams, resourceFactory, $modal, location) {
            scope.pdcId = routeParams.pdcId;

            scope.getPDCDetails = function () {
                resourceFactory.pdcOneResource.get({
                    'pdcId': scope.pdcId
                }, function (pdcData) {
                    scope.pdcData = pdcData;
                });
            };

            scope.getPDCDetails();

            scope.present = "present";
            scope.bounced = "bounced";
            scope.clear = "clear";
            scope.cancel = "cancel";
            scope.return = "return";
            scope.undo = "undo";

            scope.back = function () {
                if(scope.pdcData.mappingData.entityType.value === 'Loan'){
                    location.path('/viewloanaccount/' + scope.pdcData.mappingData.entityId);
                }
            };

            scope.isEnableThisAction = function (action) {
                if (action === scope.present && scope.pdcData.presentStatus.id < 2) {
                    return true;
                } else if (action === scope.bounced && scope.pdcData.presentStatus.id == 2) {
                    return true;
                } else if (action === scope.clear && scope.pdcData.presentStatus.id == 2) {
                    return true;
                } else if (action === scope.cancel && scope.pdcData.presentStatus.id == 1) {
                    return true;
                } else if (action === scope.return && (scope.pdcData.presentStatus.id == 3 || scope.pdcData.presentStatus.id == 5)) {
                    return true;
                } else if (action === scope.undo && scope.pdcData.presentStatus.id > 1) {
                    return true;
                }
                return false;
            };

            scope.actionToBePerformed = function (action) {
                scope.pdcChequeDetails = [];
                scope.isSingleOperation = true;
                scope.pdcChequeDetails.push(scope.pdcData.id);
                scope.action = action;
                scope.modalInstance = $modal.open({
                    templateUrl: 'actiononpdc.html',
                    controller: 'ActionOnPDCController',
                    size: 'lg',
                    scope: scope,
                    resolve: {}
                });
            };

        }
    });

    mifosX.ng.application.controller('ViewPDCDetailController', ['$scope', '$routeParams', 'ResourceFactory', '$modal', '$location', mifosX.controllers.ViewPDCDetailController]).run(function ($log) {
        $log.info("ViewPDCDetailController initialized");
    });
}(mifosX.controllers || {}));