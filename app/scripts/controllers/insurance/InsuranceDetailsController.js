(function (module) {
    mifosX.controllers = _.extend(module, {
        InsuranceDetailsController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            scope.claimStatusForNavigate;
            scope.formdata = {};

            scope.fetchInsuranceData = function (cliamStatus) {
                scope.claimStatusForNavigate = cliamStatus;
                if(scope.claimStatusForNavigate == 'verifiedClaims') {
                    scope.selectAllOption = true;
                }  else {
                    scope.selectAllOption = false;
                }
                if(scope.claimStatusForNavigate == 'intimationapprovalpending') {
                    scope.rejectTabToBeshown = true;
                } else {
                    scope.rejectTabToBeshown = false;
                }
                resourceFactory.getInsuranceDetailsResource.getActiveInuranceData({ claimStatus: cliamStatus }, {},
                    function (data) {
                        scope.insuranceData = data;
                    });
            }

            scope.fetchRejectedInsuranceData = function (cliamStatus) {
                resourceFactory.getInsuranceDetailsResource.getRejectedInuranceData({ claimStatus: cliamStatus }, {},
                    function (data) {
                        scope.insuranceData = data;
                    });
            }

            scope.selectAllDeceased = function(isAllChecked){
                    for(var i = 0; i< scope.insuranceData.length; i++){
                        if(isAllChecked){
                            scope.insuranceData[i].isMemberChecked = true;
                        } else {
                            scope.insuranceData[i].isMemberChecked = false;
                        }
                    }
            }

            scope.submit = function(){
                scope.deceasedMemberArray = [];
                for(var i = 0; i< scope.insuranceData.length; i++){
                    if(scope.insuranceData[i].isMemberChecked){
                        scope.deceasedMemberArray.push(
                            {'deceasedId' : scope.insuranceData[i].deceasedId
                            })
                    }

                }
                scope.formdata.deceasedMemberArray = scope.deceasedMemberArray;
                resourceFactory.insuranceClaimStatusDetailsResource.submitVerifiedClaim({ claimStatus: 'verifiedClaims', command : 'submit' }, scope.formdata,
                    function (data) {
                        scope.insuranceCliamDetials = data;
                        location.path('/insurancedetails');
                    });
            }

            scope.routeTo = function(id) {
                location.path('/insurance/' + scope.claimStatusForNavigate + '/' + id);
            };

            scope.routeToReject = function(id) {
                location.path('/insurance/rejectedclaiminsurance/' + id);
            };
 
        }
    });
    mifosX.ng.application.controller('InsuranceDetailsController', ['$controller', '$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', '$modal', mifosX.controllers.InsuranceDetailsController]).run(function ($log) {
        $log.info("InsuranceDetailsController initialized");
    });
}(mifosX.controllers || {}));