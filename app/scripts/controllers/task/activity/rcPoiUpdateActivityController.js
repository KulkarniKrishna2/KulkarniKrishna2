(function (module) {
    mifosX.controllers = _.extend(module, {
        rcPoiUpdateActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){
                scope.loanAppId = scope.taskconfig['loanApplicationId'];
            };
            initTask();

            scope.roiGenerateBtn = true;
            scope.roiShowContent = false;
            scope.roiPercentValue = '';
            scope.roiRCValue = '';
            scope.roiErrorText = false;
            scope.roiInitScreen = false;
            scope.rcTitleValue = '';
            var roiObj = [
                {
                    rcValue: 'Low Risk ( RC-A )'
                },
                {
                    rcValue: 'Medium Risk ( RC-B )'
                },
                {
                    rcValue: 'High Risk ( RC-C )'
                },
                {
                    rcValue: 'Highest Risk ( RC-D )'
                }
            ];
            var count = 0;

            if (scope.response && scope.response.uiDisplayConfigurations) {
                scope.scoreCardRange = scope.response.uiDisplayConfigurations.scoreCardRange;
            }

            // new code
            scope.roiActivity = function() {
                scope.roiGenerateBtn = false;
                scope.roiInitScreen = true;
                scope.roiErrorText = false;
                resourceFactory.loanAppRcBureauScore.post({loanAppId: scope.loanAppId}, function(data) {
                    console.log('rcBureau POST :', data);
                    resourceFactory.loanAppRcBureauScore.get({loanAppId: scope.loanAppId}, function(bureauScoreData) {
                        console.log('rcBureau GET :', data);
                        // based on the count value, we will display the rcValue.
                        if(bureauScoreData.value < scope.scoreCardRange.sc1) {
                            count = 3;
                        } else if((bureauScoreData.value >= scope.scoreCardRange.sc1) && (bureauScoreData.value < scope.scoreCardRange.sc2)) {
                            count = 2;
                        } else if((bureauScoreData.value >= scope.scoreCardRange.sc2) && (bureauScoreData.value < scope.scoreCardRange.sc3)) {
                            count = 1;
                        } else if((bureauScoreData.value >= scope.scoreCardRange.sc3) && (bureauScoreData.value < scope.scoreCardRange.sc4)) {
                            count = 0;
                        } else if(bureauScoreData.value > scope.scoreCardRange.sc4) {
                            count = 0;
                        }
                        scope.showRoi();
                    },
                    function(error) {
                        scope.roiErrorHandler(error);
                    });
                },
                function(error) {
                    scope.roiErrorHandler(error);
                });
                
            }

            scope.showRoi = function() {
                resourceFactory.loanAppRateOfIntrestResource.post({loanAppId: scope.loanAppId}, function(data) {
                    console.log('ROI POST : ',data);
                    resourceFactory.loanAppRateOfIntrestResource.get({loanAppId: scope.loanAppId}, function(roiData) {
                        console.log('ROI Get :',roiData);
                        setTimeout(() => {
                            scope.roiInitScreen = false;
                            scope.roiShowContent = true;
                            scope.roiPercentValue = roiData.value;
                            scope.rcTitleValue = roiObj[0].rcValue;
                            scope.$apply();
                            return;
                        }, 5000);
                    },
                    function(error) {
                        scope.roiErrorHandler(error);
                    });
                },
                function(error) {
                    scope.roiErrorHandler(error);
                });
            }

            scope.roiErrorHandler = function(error) {
                console.log('Error Logged :', error);
                scope.roiGenerateBtn = true;
                scope.roiShowContent = false;
                scope.roiErrorText = true;
                scope.roiInitScreen = false;
                return;
            }

        }
    });
    mifosX.ng.application.controller('rcPoiUpdateActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.rcPoiUpdateActivityController]).run(function ($log) {
        $log.info("rcPoiUpdateActivityController initialized");
    });
}(mifosX.controllers || {}));