(function (module) {
    mifosX.controllers = _.extend(module, {
        rcPoiUpdateActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){
                scope.loanAppId = scope.taskconfig['loanApplicationId'];
                scope.poiKey = scope.taskconfig['poiKey'] || 'poi-update-1';
            };
            initTask();

            scope.roiGenerateBtn = true;
            scope.roiShowContent = false;
            scope.roiPercentValue = '';
            scope.roiRCValue = '';
            scope.roiErrorText = false;
            scope.roiInitScreen = false;
            scope.rcTitleValue = '';
            scope.roiRetryBtn = false;
            scope.roiRetryText = false;
            scope.roiEvents = {"pointer-events" : "auto"};
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
                console.log(scope.isTaskCompleted());
                resourceFactory.loanAppScoreCardResource.post({loanAppId: scope.loanAppId, scoreKey: 'rcBureauScore'}, function(data) {
                    console.log('rcBureau POST :', data);
                    resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'rcBureauScore'}, function(bureauScoreData) {
                        console.log('rcBureau GET :', bureauScoreData);
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
                        } else if((bureauScoreData.value == undefined) || (bureauScoreData.value == '') || (bureauScoreData.value == null)) {
                            scope.roiErrorHandler(bureauScoreData.value);
                            return;
                        }
                        console.log(bureauScoreData.value);
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
                resourceFactory.loanAppRateOfIntrestResource.post({loanAppId: scope.loanAppId, poiKey: scope.poiKey}, function(data) {
                    console.log('ROI POST : ',data);
                    resourceFactory.loanAppRateOfIntrestResource.get({loanAppId: scope.loanAppId, poiKey: scope.poiKey}, function(roiData) {
                        console.log('ROI Get :',roiData);
                        scope.roiGenerateBtn = false;
                        scope.roiInitScreen = true;
                        scope.roiErrorText = false;
                        if((roiData.value == undefined) || (roiData.value == '') || (roiData.value == null)) {
                            scope.roiErrorHandler(roiData.value);
                            return;
                        }
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

            scope.roiErrorHandlerPostActivity = function() {
                scope.roiRetryBtn = true;
                scope.roiRetryText = true;
                scope.roiInitScreen = false;
                scope.roiShowContent = false;
                return;
            }

            scope.fetchData = function() {
                if(scope.isTaskCompleted()) {
                    console.log(scope.isTaskCompleted());
                    scope.roiPercentValue = '';
                    scope.rcTitleValue = '';
                    resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'rcBureauScore'}, function(bureauScoreData) {
                        console.log('rcBureau GET :', bureauScoreData);
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
                        } else if((bureauScoreData.value == undefined) || (bureauScoreData.value == '') || (bureauScoreData.value == null)) {
                            scope.roiRetryBtn = true;
                            scope.roiRetryText = true;
                            scope.roiInitScreen = false;
                            scope.roiShowContent = false;
                            scope.roiEvents = {"pointer-events" : "none"};
                            return;
                        }
                        resourceFactory.loanAppRateOfIntrestResource.get({loanAppId: scope.loanAppId, poiKey: scope.poiKey}, function(roiData) {
                            if((roiData.value == undefined) || (roiData.value == '') || (roiData.value == null)) {
                                scope.roiRetryBtn = true;
                                scope.roiRetryText = true;
                                scope.roiInitScreen = false;
                                scope.roiShowContent = false;
                                scope.roiEvents = {"pointer-events" : "none"};
                                return;
                            }
                            console.log('ROI Get :',roiData);
                                scope.roiInitScreen = false;
                                scope.roiShowContent = true;
                                scope.roiPercentValue = roiData.value;
                                scope.rcTitleValue = roiObj[0].rcValue;
                                return;
                        },
                        function(error) {
                            scope.roiErrorHandler(error);
                        });
                    },
                    function(error) {
                        scope.scoreCardErrorHandler(error);
                    });
                }
            }
            scope.fetchData();

        }
    });
    mifosX.ng.application.controller('rcPoiUpdateActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.rcPoiUpdateActivityController]).run(function ($log) {
        $log.info("rcPoiUpdateActivityController initialized");
    });
}(mifosX.controllers || {}));