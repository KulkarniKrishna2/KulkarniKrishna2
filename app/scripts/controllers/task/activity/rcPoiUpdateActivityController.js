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
            scope.viewRuleResult = false;
            scope.viewRuleResultContent = false;
            scope.cleanScoreLinkClass = 'roi-link';
            scope.ruleResultText = 'View Rule Result';
            scope.roiEvents = {"pointer-events" : "auto"};
            var roiBucketObj = ['RC-A', 'RC-B', 'RC-C', 'RC-D'];
            var roiTextObj = ['Low Risk', 'Medium Risk', 'High Risk', 'Highest Risk'];
            var count = 0;

            if (scope.response && scope.response.uiDisplayConfigurations) {
                scope.scoreCardRange = scope.response.uiDisplayConfigurations.scoreCardRange;
            }

            // new code
            scope.roiActivity = function() {
                console.log(scope.isTaskCompleted());
                scope.roiGenerateBtn = false;
                scope.roiInitScreen = true;
                scope.roiErrorText = false;
                resourceFactory.loanAppScoreCardResource.post({loanAppId: scope.loanAppId, scoreKey: 'rcBureauScore'}, function(data) {
                    console.log('rcBureau POST :', data);
                    resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'rcBureauScore'}, function(bureauScoreData) {
                        console.log('rcBureau GET :', bureauScoreData);
                        if((bureauScoreData.value == undefined) || (bureauScoreData.value == '') || (bureauScoreData.value == null)) {
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
                        if((roiData.value == undefined) || (roiData.value == '') || (roiData.value == null)) {
                            scope.roiErrorHandler(roiData.value);
                            return;
                        }
                        for(var i=0; i<roiBucketObj.length; i++) {
                            if(roiBucketObj[i] == roiData.ruleResult.output.bucket) {
                                count = i;
                            }
                        }
                            scope.roiInitScreen = false;
                            scope.roiShowContent = true;
                            scope.viewRuleResult = true;
                            scope.bureauScoreDetail = roiData;
                            scope.roiPercentValue = roiData.value;
                            // scope.rcTitleValue = roiObj[count].rcValue;
                            scope.rcTitleValue = roiTextObj[count] + ' ' + ' ( ' + roiData.ruleResult.output.bucket + ' ) ' ;
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
                scope.roiRetryBtn = false;
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
                        if((bureauScoreData.value == undefined) || (bureauScoreData.value == '') || (bureauScoreData.value == null)) {
                            scope.roiRetryBtn = false;
                            scope.roiRetryText = true;
                            scope.roiInitScreen = false;
                            scope.roiShowContent = false;
                            scope.roiEvents = {"pointer-events" : "none"};
                            return;
                        }
                        resourceFactory.loanAppRateOfIntrestResource.get({loanAppId: scope.loanAppId, poiKey: scope.poiKey}, function(roiData) {
                            if((roiData.value == undefined) || (roiData.value == '') || (roiData.value == null)) {
                                scope.roiRetryBtn = false;
                                scope.roiRetryText = true;
                                scope.roiInitScreen = false;
                                scope.roiShowContent = false;
                                scope.roiEvents = {"pointer-events" : "none"};
                                return;
                            }
                            for(var i=0; i<roiBucketObj.length; i++) {
                                if(roiBucketObj[i] == roiData.ruleResult.output.bucket) {
                                    count = i;
                                }
                                if((roiData.ruleResult.output.bucket == 'Default') || (roiData.ruleResult.output.bucket == '') || (roiData.ruleResult.output.bucket == null)) {
                                    count = 3;
                                }
                            }
                            scope.bureauScoreDetail = roiData;
                            console.log('ROI Get :',roiData);
                                scope.roiInitScreen = false;
                                scope.roiShowContent = true;
                                scope.viewRuleResult = true;
                                scope.roiPercentValue = roiData.value;
                                // scope.rcTitleValue = roiObj[count].rcValue;
                                scope.rcTitleValue = roiTextObj[count] + ' ' + ' ( ' + roiData.ruleResult.output.bucket + ' ) ' ;
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

            scope.viewRuleResultToggleBtn = function() {
                scope.roiScoreLinkClass = 'roi-link';
                scope.detailScore = scope.bureauScoreDetail;
                if(scope.ruleResultText == 'Close') {
                    scope.ruleResultText = 'View Rule Result';
                    scope.viewRuleResultContent = false;
                    scope.roiShowContent = true;
                } else {
                    scope.ruleResultText = 'Close';
                    scope.viewRuleResultContent = true;
                    scope.roiShowContent = false;
                }
            }

            scope.cleanScoreLinkToggle = function(value) {
                    scope.roiScoreLinkClass = 'roi-link';
                    scope.detailScore = scope.bureauScoreDetail;
            }

        }
    });
    mifosX.ng.application.controller('rcPoiUpdateActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.rcPoiUpdateActivityController]).run(function ($log) {
        $log.info("rcPoiUpdateActivityController initialized");
    });
}(mifosX.controllers || {}));