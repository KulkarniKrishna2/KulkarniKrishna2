(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateFinancialYearClosureController: function (scope, location, resourceFactory, dateFilter, localStorageService, $modal) {
            scope.restrictDate = new Date();
            scope.formData = {};
            scope.formData.locale = scope.optlang.code;
            scope.formData.dateFormat = scope.df;
            scope.endDate = localStorageService.getFromLocalStorage("endDate");
            if(scope.endDate){
                scope.formData.closureDate = dateFilter(new Date(scope.endDate),scope.df);
            }else{
                scope.formData.closureDate = new Date();
            }
            scope.submit = function(){
                scope.formData.closureDate = dateFilter(scope.formData.closureDate, scope.df);
                scope.closureconfirm(scope.formData);
            }

            scope.cancel = function(){
                location.path('/financialyearclosures');
            }

            scope.closureconfirm = function (formData) {
                $modal.open({
                    templateUrl: 'closureconfirm.html',
                    controller: CreateClosureCtrl,
                    resolve: {
                        formData: function () {
                            return formData;
                        }
                    }
                });
            };

            var CreateClosureCtrl = function ($scope, $modalInstance, formData) {
                $scope.confirm = function () {
                    $modalInstance.dismiss('confirm');
                    resourceFactory.financialYearClosuresResource.save(formData,function(data){
                    location.path('/financialyearclosures');
                });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
        }
    });

    mifosX.ng.application.controller('CreateFinancialYearClosureController', ['$scope', '$location', 'ResourceFactory', 'dateFilter', 'localStorageService','$modal', mifosX.controllers.CreateFinancialYearClosureController]).run(function ($log) {
        $log.info("CreateFinancialYearClosureController initialized");
    });
}(mifosX.controllers || {}));