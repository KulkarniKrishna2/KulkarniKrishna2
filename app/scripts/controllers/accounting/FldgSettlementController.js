(function (module) {
    mifosX.controllers = _.extend(module, {
        FldgSettlementController: function (scope, routeParams, paginatorService, resourceFactory, location, $modal, route) {
            scope.trancheDetails = {};
            scope.overdueLoans = [{}];
            scope.bulksettlementId = undefined;
            scope.trancheId = routeParams.trancheId;
            resourceFactory.createTranche.get({ trancheId: routeParams.trancheId }, function (data) {
                scope.trancheDetails = data;
            });
            resourceFactory.fldgSettlement.get({ trancheId: routeParams.trancheId }, function (data) {
                scope.overdueLoans = data.overdueLoans;
                scope.settlementOptions = data.settlementOptions;
                scope.settledLoans = data.settledLoans;
            });
            scope.changeSettlement = function (settlementId) {
                for (var i in scope.overdueLoans) {
                    scope.overdueLoans[i].settlementTypeId = settlementId;
                }
            };
            scope.submit = function () {
                var overDueLoanDetails = {};
                overDueLoanDetails.locale = scope.optlang.code;
                overDueLoanDetails.fldgSettlements = [];
                for (var i = 0; i <= scope.overdueLoans.length; i++) {
                    if (scope.overdueLoans[i] && scope.overdueLoans[i].settlementTypeId) {
                        var temp = {};
                        temp.loanId = scope.overdueLoans[i].loanId;
                        temp.principalOverdue = scope.overdueLoans[i].principalOverdue;
                        temp.principalFutureDue = scope.overdueLoans[i].principalFutureDue;
                        temp.interestOverdue = scope.overdueLoans[i].interestOverdue;
                        temp.amount = scope.overdueLoans[i].totalAmount;
                        temp.feesOverdue = scope.overdueLoans[i].feesOverdue;
                        temp.penaltyOverdue = scope.overdueLoans[i].penaltyOverdue;
                        temp.settledById = scope.overdueLoans[i].settlementTypeId;
                        overDueLoanDetails.fldgSettlements.push(temp);
                    }
                };
                if (overDueLoanDetails.fldgSettlements.length > 0) {
                    resourceFactory.fldgSettlement.save({ trancheId: routeParams.trancheId }, overDueLoanDetails, function (data) {
                        route.reload();
                        // location.path('/viewtranche');
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('FldgSettlementController', ['$scope', '$routeParams', 'PaginatorService', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.FldgSettlementController]).run(function ($log) {
        $log.info("FldgSettlementController initialized");
    });
}(mifosX.controllers || {}));
