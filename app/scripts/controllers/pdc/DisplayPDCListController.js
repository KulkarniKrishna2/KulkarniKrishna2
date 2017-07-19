/**
 * Created by FinTech on 13-07-2017.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        DisplayPDCListController: function (scope, routeParams, resourceFactory, dateFilter, $modal, location) {

            scope.entityType = "loan";
            scope.entityId = routeParams.id;

            scope.getAllPDC = function () {
                resourceFactory.pdcResource.getAll({
                    'entityType': scope.entityType,
                    'entityId': scope.entityId
                }, function (pdcListData) {
                    scope.pdcListData = pdcListData;
                });
            };

            scope.getAllPDC();

            scope.addPDC = function () {
                scope.modalInstance = $modal.open({
                    templateUrl: 'createpdc.html',
                    controller: 'CreatePDCController',
                    size: 'lg',
                    scope: scope,
                    modal: $modal,
                    resolve: {}
                });
            };

            scope.routeRepaymentPDCTo = function (id, index) {
                if (scope.editRepaymentPDCIndex == undefined || scope.editRepaymentPDCIndex != index) {
                    location.path('pdc/view/' + id);
                }
            };

            scope.buildEditRepaymentPDC = function (index, pdc) {
                scope.editRepaymentPDCIndex = index;
                scope.editRepaymentPDCId = pdc.id;
                scope.editRepaymentPDCData = {};
                scope.editRepaymentPDCData.chequeNumber = parseInt(pdc.chequeNumber);
                scope.editRepaymentPDCData.chequeDate = new Date(pdc.chequeDate);
                scope.editRepaymentPDCData.bankName = pdc.bankName;
                scope.editRepaymentPDCData.branchName = pdc.branchName;
                scope.editRepaymentPDCData.ifscCode = pdc.ifscCode;
            };

            scope.cancelEditRepaymentPDC = function () {
                scope.editRepaymentPDCIndex = undefined;
                scope.editRepaymentPDCId = undefined;
                scope.editRepaymentPDCData = undefined;
            };

            scope.editRepaymentPDC = function () {
                if (scope.editRepaymentPDCData.chequeDate) {
                    scope.editRepaymentPDCData.chequeDate = dateFilter(new Date(scope.editRepaymentPDCData.chequeDate), scope.df);
                }
                scope.editRepaymentPDCData.locale = scope.optlang.code;
                scope.editRepaymentPDCData.dateFormat = scope.df;
                resourceFactory.pdcOneResource.update({
                    'pdcId': scope.editRepaymentPDCId
                }, scope.editRepaymentPDCData, function (successData) {
                    scope.cancelEditRepaymentPDC();
                    scope.getAllPDC();
                });
            };

            scope.deletePDC = function (pdc) {
                $modal.open({
                    templateUrl: 'deletepdc.html',
                    controller: DeletePDCCtrl,
                    resolve: {
                        pdc: function () {
                            return pdc;
                        }
                    }
                });
            };

            var DeletePDCCtrl = function ($scope, $modalInstance, pdc) {
                $scope.delete = function () {
                    resourceFactory.pdcOneResource.delete({
                        'pdcId': pdc.id,
                        'command': 'delete'
                    }, {}, function (successData) {
                        $modalInstance.close('delete');
                        for (var i in scope.pdcListData) {
                            if (scope.pdcListData[i].id == pdc.id) {
                                scope.pdcListData.splice(i, 1);
                                break;
                            }
                        }
                    });
                };

                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.routeSecurityPDCTo = function (id, index) {
                if (scope.editSecurityPDCIndex == undefined || scope.editSecurityPDCIndex != index) {
                    location.path('pdc/view/' + id);
                }
            };

            scope.buildEditSecurityPDC = function (index, pdc) {
                scope.editSecurityPDCIndex = index;
                scope.editSecurityPDCId = pdc.id;
                scope.editSecurityPDCData = {};
                scope.editSecurityPDCData.chequeNumber = parseInt(pdc.chequeNumber);
                if (pdc.chequeDate) {
                    scope.editSecurityPDCData.chequeDate = new Date(pdc.chequeDate);
                }
                scope.editSecurityPDCData.chequeAmount = pdc.chequeAmount;
                scope.editSecurityPDCData.bankName = pdc.bankName;
                scope.editSecurityPDCData.branchName = pdc.branchName;
                scope.editSecurityPDCData.ifscCode = pdc.ifscCode;
            };

            scope.cancelEditSecurityPDC = function () {
                scope.editSecurityPDCIndex = undefined;
                scope.editSecurityPDCId = undefined;
                scope.editSecurityPDCData = undefined;
            };

            scope.editSecurityPDC = function () {
                if (scope.editSecurityPDCData.chequeDate) {
                    scope.editSecurityPDCData.chequeDate = dateFilter(new Date(scope.editSecurityPDCData.chequeDate), scope.df);
                }
                scope.editSecurityPDCData.locale = scope.optlang.code;
                scope.editSecurityPDCData.dateFormat = scope.df;
                resourceFactory.pdcOneResource.update({
                    'pdcId': scope.editSecurityPDCId
                }, scope.editSecurityPDCData, function (successData) {
                    scope.cancelEditSecurityPDC();
                    scope.getAllPDC();
                });
            };

            scope.isEditRepaymentPDC = function (index, pdc) {
                if (scope.editRepaymentPDCIndex != index && !isCleared(pdc.presentStatus) && !isReturned(pdc.presentStatus)) {
                    return true;
                }
                return false;
            };

            function isPending(status) {
                if (status.value == 'Pending') {
                    return true;
                }
                return false;
            }

            function isCleared(status) {
                if (status.value == 'Cleared') {
                    return true;
                }
                return false;
            }

            function isReturned(status) {
                if (status.value == 'Returned') {
                    return true;
                }
                return false;
            }

            scope.isEditSecurityPDC = function (index, pdc) {
                if (scope.editSecurityPDCIndex != index && !isCleared(pdc.presentStatus) && !isReturned(pdc.presentStatus)) {
                    return true;
                }
                return false;
            };

            scope.isDeleteRepaymentPDC = function (index, pdc) {
                if (scope.editRepaymentPDCIndex != index && isPending(pdc.presentStatus)) {
                    return true;
                }
                return false;
            };

            scope.isDeleteSecurityPDC = function (index, pdc) {
                if (scope.editSecurityPDCIndex != index && isPending(pdc.presentStatus)) {
                    return true;
                }
                return false;
            };
        }
    });

    mifosX.ng.application.controller('DisplayPDCListController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', '$modal', '$location', mifosX.controllers.DisplayPDCListController]).run(function ($log) {
        $log.info("DisplayPDCListController initialized");
    });
}(mifosX.controllers || {}));