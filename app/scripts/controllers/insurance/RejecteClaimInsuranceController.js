(function (module) {
    mifosX.controllers = _.extend(module, {
        RejecteClaimInsuranceController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            
            scope.deceasedId = routeParams.id;

            function fetchInsuranceData() {
                resourceFactory.getInsuranceClaimStatusDetailsResource.getClaimIntimationApproval({ claimStatus: 'intimationapprovalpending', deceasedId : scope.deceasedId }, {},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        calculateClientAge(scope.insuranceCliamDetials.dateOfBirth);
                    });
            };

            fetchInsuranceData();

            function calculateClientAge(dateOfBirth){
                dateOfBirth = new Date(dateFilter(dateOfBirth, scope.df));
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDifMs = Date.now() - dateOfBirth.getTime();
                var ageDate = new Date(ageDifMs); // miliseconds from epoch
                scope.age = Math.abs(ageDate.getUTCFullYear() - 1970);
            }

            scope.delete = function () {
                resourceFactory.deleteDeceasedDetailsResource.getDeceasedDetails({ deceasedId: scope.deceasedId}, {deceasedId : scope.deceasedId},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails');
                    });
            }
 
        }
    });
    mifosX.ng.application.controller('RejecteClaimInsuranceController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.RejecteClaimInsuranceController]).run(function ($log) {
        $log.info("RejecteClaimInsuranceController initialized");
    });
}(mifosX.controllers || {}));