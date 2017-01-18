(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanEMIPacksController: function (scope, routeParams, resourceFactory, location, $modal, route, $filter) {
            scope.loanProductId = routeParams.loanProductId;
            scope.loanTemplate = {};
            scope.loanEMIPacks = [];

            if (!scope.searchCriteria.viewLoanEMIPacks) {
                scope.searchCriteria.viewLoanEMIPacks = null;
                scope.saveSC();
            }
            scope.filterText = scope.searchCriteria.viewLoanEMIPacks;

            scope.onFilter = function () {
                scope.searchCriteria.viewLoanEMIPacks = scope.filterText;
                scope.saveSC();
            };

            resourceFactory.loanemipacktemplate.getEmiPackTemplate({loanProductId:scope.loanProductId}, function (data) {
                scope.loanTemplate = data;
            });

            resourceFactory.loanemipack.getEmiPacks({loanProductId:scope.loanProductId}, function (data) {
                scope.loanEMIPacks = data;
                var len = scope.loanEMIPacks.length;
                for(var i = 0; i < len; i++){
                    scope.loanEMIPacks[i].combinedRepayEvery = scope.loanEMIPacks[i].repaymentEvery
                        + ' - ' + $filter('translate')(scope.loanEMIPacks[i].repaymentFrequencyType.value);
                }
            });

            scope.showEdit = function(id){
                location.path('/editloanemipacks/' +scope.loanProductId+'/'+ id);
            }

            var DeleteCtrl = function ($scope, $modalInstance,loanProductId,loanEMIPackId) {
                $scope.delete = function () {
                    resourceFactory.loanemipack.delete({loanProductId: loanProductId, loanEMIPackId:loanEMIPackId}, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            }
            scope.delete = function (id) {
                $modal.open({
                    templateUrl: 'delete.html',
                    controller: DeleteCtrl,
                    resolve: {
                        loanEMIPackId: function () {
                            return id;
                        },
                        loanProductId:function() {
                            return scope.loanProductId;
                        }
                    }
                });
            };

        }
    });
    mifosX.ng.application.controller('ViewLoanEMIPacksController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', '$filter', mifosX.controllers.ViewLoanEMIPacksController]).run(function ($log) {
        $log.info("ViewLoanEMIPacksController initialized");
    });
}(mifosX.controllers || {}));
