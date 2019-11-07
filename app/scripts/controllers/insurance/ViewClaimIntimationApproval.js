(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewClaimIntimationApproval: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            
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

            scope.approve = function () {
                resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'intimationapprovalpending', command : 'approve' }, {deceasedId : scope.deceasedId},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails');
                    });
            }

            scope.reject = function () {
                resourceFactory.insuranceClaimStatusDetailsResource.approveClaimIntimationApproval({ claimStatus: 'intimationapprovalpending', command : 'reject' }, {deceasedId : scope.deceasedId},
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails');
                    });
            }
 
        }
    });
    mifosX.ng.application.controller('ViewClaimIntimationApproval', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.ViewClaimIntimationApproval]).run(function ($log) {
        $log.info("ViewClaimIntimationApproval initialized");
    });
}(mifosX.controllers || {}));