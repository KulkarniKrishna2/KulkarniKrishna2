(function (module) {
    mifosX.controllers = _.extend(module, {
        CreatePDCController: function ($scope, routeParams, resourceFactory, dateFilter) {

            $scope.pdcFormData = {};
            $scope.pdcDetail = {};
            $scope.pdcDetail.isIncrementChequeNumber = false;
            $scope.pdcDetail.chequeNumbers = [];

            resourceFactory.pdcTemplateResource.get({
                'entityType': $scope.entityType,
                'entityId': $scope.entityId
            }, function (data) {
                $scope.templateData = data;
            });

            $scope.range = function (min, max, step) {
                step = step || 1;
                var input = [];
                for (var i = min; i <= max; i += step) {
                    if ($scope.pdcDetail.isIncrementChequeNumber == false || i == 0) {
                        input.push(i);
                    }
                }
                return input;
            };

            $scope.rangeForChequeDates = function (min, max, step) {
                step = step || 1;
                var input = [];
                for (var i = min; i <= max; i += step) {
                    input.push(i);
                }
                return input;
            };

            $scope.pdcSubmit = function () {
                $scope.pdcFormData.locale = $scope.optlang.code;
                $scope.pdcFormData.dateFormat = $scope.df;
                $scope.pdcFormData.pdcDetails = [];
                var pdcDetail = {};
                angular.copy($scope.pdcDetail, pdcDetail);
                if (pdcDetail.periodNumber) {
                    pdcDetail.chequeDates = [];
                    pdcDetail.amounts = [];
                    if (!isNaN(pdcDetail.numberOfPDC)) {
                        if ($scope.pdcDetail.isIncrementChequeNumber === true) {
                            for (var i in pdcDetail.chequeNumbers) {
                                if (pdcDetail.chequeNumbers[i] && i == 0) {
                                    pdcDetail.chequeNumbers = [];
                                    pdcDetail.chequeNumbers.push($scope.pdcDetail.chequeNumbers[i]);
                                }
                            }
                        }
                        ;
                        var n = parseInt(pdcDetail.numberOfPDC);
                        var isPeriodNumberMatchWithSeceledFromDate = false;
                        for (var j = 0; j < $scope.templateData.loanSchedulePeriods.length; j++) {
                            if ((pdcDetail.periodNumber == $scope.templateData.loanSchedulePeriods[j].period || isPeriodNumberMatchWithSeceledFromDate == true) && n > 0) {
                                isPeriodNumberMatchWithSeceledFromDate = true;
                                var chequeDate = dateFilter(new Date($scope.templateData.loanSchedulePeriods[j].dueDate), $scope.df);
                                var amount = $scope.templateData.loanSchedulePeriods[j].totalDueForPeriod;
                                pdcDetail.chequeDates.push(chequeDate);
                                pdcDetail.amounts.push(amount);
                                n--;
                            }
                        }
                    }
                    delete pdcDetail.periodNumber;
                }
                $scope.pdcFormData.pdcDetails.push(pdcDetail);

                resourceFactory.pdcResource.create({
                    'entityType': $scope.entityType,
                    'entityId': $scope.entityId
                }, $scope.pdcFormData, function (successData) {
                    $scope.modalInstance.close('pdcSubmit');
                    $scope.getAllPDC();
                });
            };

            $scope.pdcCancel = function () {
                $scope.modalInstance.dismiss('pdcCancel');
            };
        }
    });

    mifosX.ng.application.controller('CreatePDCController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', mifosX.controllers.CreatePDCController]).run(function ($log) {
        $log.info("CreatePDCController initialized");
    });
}(mifosX.controllers || {}));
