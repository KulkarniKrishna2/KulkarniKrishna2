/**
 * Created by FinTech on 07-07-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewPDCDetailController: function (scope, routeParams, resourceFactory, $modal, $window, dateFilter) {
            scope.pdcId = routeParams.pdcId;
            scope.editPDC = false;
            scope.getPDCDetails = function () {
                scope.editPDC = false;
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

            scope.CHEQUE_TYPE_REPAYMENT_PDC = 1;
            scope.CHEQUE_TYPE_SECURITY_PDC = 2;

            scope.back = function () {
                $window.history.back();
            };

            scope.isEnableThisAction = function (action) {
                if (action === scope.present && scope.pdcData.presentStatus.id < 2 && scope.pdcData.loanAccountData.status.value === 'Active') {
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

            scope.showActionButtonsForPDC = function () {
                return (scope.pdcData && (scope.pdcData.chequeType.value == 'Repayment PDC' || scope.pdcData.chequeType.value == 'Security PDC') && scope.pdcData.chequeDate && scope.pdcData.chequeAmount);
            };

            scope.isEditPDC = function () {
                return (scope.pdcData && !isCleared(scope.pdcData.presentStatus) && !isReturned(scope.pdcData.presentStatus));
            };

            function isPending(status) {
                return (status.value == 'Pending');
            }

            function isCleared(status) {
                return (status.value == 'Cleared');
            }

            function isReturned(status) {
                return (status.value == 'Returned');
            }

            scope.buildEditPDC = function () {
                var pdc = scope.pdcData;
                scope.editPDC = true;
                scope.editPDCData = {};
                scope.editPDCData.chequeNumber = parseInt(pdc.chequeNumber);
                if (pdc.chequeDate) {
                    scope.editPDCData.chequeDate = new Date(pdc.chequeDate);
                }
                scope.editPDCData.chequeAmount = pdc.chequeAmount;
                scope.editPDCData.bankName = pdc.bankName;
                scope.editPDCData.branchName = pdc.branchName;
                scope.editPDCData.ifscCode = pdc.ifscCode;
            };

            scope.isDeletePDC = function () {
                return (scope.pdcData && isPending(scope.pdcData.presentStatus));
            };

            scope.cancelEditPdc = function () {
                scope.editPDC = false;
            };

            scope.submitEditPDC = function () {
                if (scope.editPDCData.chequeDate) {
                    scope.editPDCData.chequeDate = dateFilter(new Date(scope.editPDCData.chequeDate), scope.df);
                }else{
                    scope.editPDCData.chequeDate = null;
                }
                if (_.isUndefined(scope.editPDCData.chequeAmount)) {
                    scope.editPDCData.chequeAmount = null;
                }
                scope.editPDCData.locale = scope.optlang.code;
                scope.editPDCData.dateFormat = scope.df;
                resourceFactory.pdcOneResource.update({
                    'pdcId': scope.pdcData.id
                }, scope.editPDCData, function (successData) {
                    scope.getPDCDetails();
                });
            };


            scope.deletePDC = function () {
                $modal.open({
                    templateUrl: 'deletepdc.html',
                    controller: DeletePDCCtrl,
                    resolve: {

                    }
                });
            };

            var DeletePDCCtrl = function ($scope, $modalInstance) {
                $scope.viewDelete = function () {
                    resourceFactory.pdcOneResource.delete({
                        'pdcId': scope.pdcData.id,
                        'command': 'delete'
                    }, {}, function (successData) {
                        $modalInstance.close('viewDelete');
                        scope.back();
                    });
                };

                $scope.viewCancel = function () {
                    $modalInstance.dismiss('viewCancel');
                };
            };

        }
    });

    mifosX.ng.application.controller('ViewPDCDetailController', ['$scope', '$routeParams', 'ResourceFactory', '$modal', '$window', 'dateFilter', mifosX.controllers.ViewPDCDetailController]).run(function ($log) {
        $log.info("ViewPDCDetailController initialized");
    });
}(mifosX.controllers || {}));