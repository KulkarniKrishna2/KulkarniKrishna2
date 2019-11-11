(function (module) {
    mifosX.controllers = _.extend(module, {
        InsuranceDetailsController: function ($controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope,CommonUtilService, $modal) {
            scope.claimStatusForNavigate;
            scope.formdata = {};
            routeParams.status;
            scope.dateFormat = scope.df;

            switch(routeParams.status) {
                case 'intimationapprovalpending': scope.intimationapprovalpending = true;
                break;
                case 'documentsupload' : scope.documentsupload = true;
                break;
                case 'claimverificationpending': scope.claimverificationpending = true;
                break;
                case 'verifiedClaims' : scope.verifiedClaims = true;
                break;
                case 'settledClaims': scope.settledClaims = true;
                break;
                case 'settlementpending' : scope.settlementpending = true;
                break;
            }

            scope.fetchInsuranceData = function (cliamStatus) {
                scope.claimStatusForNavigate = cliamStatus;
                scope.fromDate = undefined;
                scope.toDate = undefined;
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
                var searchConditions = {};
                searchConditions.active = true;
                resourceFactory.getInsuranceDetailsResource.getActiveInuranceData({ claimStatus: cliamStatus, searchConditions: searchConditions }, {},
                    function (data) {
                        scope.insuranceData = data;
                    });
            }

            scope.getFilteredData = function () {
                var searchConditions = {};
                searchConditions.active = true;
                searchConditions.dateFormat = scope.dateFormat;
                if(scope.officeId != undefined) {
                    searchConditions.officeId = scope.officeId;
                }
                if(scope.centerId != undefined) {
                    searchConditions.centerId = scope.centerId;
                }
                if(scope.fromDate != undefined) {
                    searchConditions.fromDate = dateFilter(new Date(scope.fromDate), scope.df);
                }
                if(scope.toDate != undefined) {
                    searchConditions.toDate = dateFilter(new Date(scope.toDate), scope.df);
                }
                resourceFactory.getInsuranceDetailsResource.getActiveInuranceData({ claimStatus: scope.claimStatusForNavigate, searchConditions: searchConditions }, {},
                    function (data) {
                        scope.insuranceData = data;
                    });
            }

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                if (scope.currentSession.user.officeId) {
                    for (var i = 0; i < scope.offices.length; i++) {
                        if (scope.offices[i].id === scope.currentSession.user.officeId) {
                            scope.officeId = scope.offices[i].id;
                            break;
                        }
                    }
                    scope.officeSelected(scope.officeId);
                }
            });

            scope.officeSelected = function (officeId) {
                scope.officeId = officeId;
                if (officeId) {
                    var searchConditions = {};
                    searchConditions.officeId = officeId;
                    resourceFactory.centerSearchResource.getAllCenters({searchConditions: searchConditions, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (centersData) {
                        scope.centers = centersData;
                    });
                }
            };

            scope.fetchRejectedInsuranceData = function (cliamStatus) {
                var searchConditions = {};
                searchConditions.active = false;
                resourceFactory.getInsuranceDetailsResource.getRejectedInuranceData({ claimStatus: cliamStatus, searchConditions: searchConditions }, {},
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
                        location.path('/insurancedetails/settlementpending');
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