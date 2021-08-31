(function (module) {
    mifosX.controllers = _.extend(module, {
        loanpplicationscorecardActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));

            scope.scorekey = scope.taskconfig['scorecard'];
            scope.loanApplicationScoreCardInitBlock = true;
            scope.loanApplicationScoreCardInitNotice = false;
            scope.loanApplicationScoreCardInitError = false;
            scope.loanApplicationReferenceId = scope.taskconfig['loanApplicationId'];
            scope.loanApplicationScoreCardInit = function() {
                fetchScores();
            }

            function checkTaskStatus() {
                if(scope.isTaskCompleted()) {
                    scope.loanApplicationScoreCardInitBlock = false;
                    fetchScores();
                }
            }
            checkTaskStatus();

            
            
            // For Fetching the score card details
            function fetchScores(){
                // resourceFactory.loanAppScoreCardResourceList.getAll({loanAppId:scope.loanApplicationReferenceId}, function (response) {
                //     scope.loanApplicationScoreCardInitError = false;
                //     scope.loanApplicationScoreCardInitNotice = false;
                //     scope.showScore = true;
                //     scope.scoreList = response;
                //     console.log(response);
                //     if(scope.scoreList.length > 0) {
                //         scope.loanApplicationScoreCardInitBlock = false;
                //     } else {
                //         scope.loanApplicationScoreCardInitNotice = true;
                //     }

                //     if(scope.isTaskCompleted()) {
                //         scope.fetchScorecardDetail(scope.scoreList[0].name);
                //     }
                // },function(error) {
                //     scope.loanApplicationScoreCardInitError = true;
                // });
                resourceFactory.loanAppScoreCardResource.post({loanAppId:scope.loanApplicationReferenceId, scoreKey: scope.scorekey}, function (response) {
                    scope.loanApplicationScoreCardInitError = false;
                    scope.loanApplicationScoreCardInitNotice = false;
                    scope.showScore = true;
                    scope.scoreList = [];
                    scope.scoreList.push(scope.scorekey);
                    scope.loanApplicationScoreCardInitBlock = false;
                    scope.fetchScorecardDetail(scope.scoreList[0]);
                },function(error) {
                        scope.loanApplicationScoreCardInitError = true;
                });
            }

            // fetchScores();

            scope.fetchScorecardDetail = function (selctedScoreKey) {
                scope.showScoreDetail = true;
                resourceFactory.loanAppScoreCardResource.get({loanAppId:scope.loanApplicationReferenceId, scoreKey:selctedScoreKey}, function (response) {
                    scope.scoreCardList = response;
                    scope.getScoreCardResult(selctedScoreKey);
                });
            };

            // Score Card Functions

            scope.inputObj;
            scope.outputErrorB = false;
            scope.outputExpand = false;
            scope.listStyleValue = '';
            scope.ruleResultHierarchyLv2LocalInputs = [];
            scope.ruleResultHierarchyLv2 = [];
            scope.ruleResultHierarchyLv2Temp = [];
            scope.localInputsLv2 = true;

            scope.getScoreCardResult = function(scoreCardName) {
                        scope.listStyleValue = scoreCardName;
                        if(scope.scoreCardList.input !== undefined) {
                            scope.inputObj = Object.entries(scope.scoreCardList.input);
                        } else {
                            scope.inputObj = [];
                            scope.inputExpand = false;
                        }

                        if(scope.scoreCardList.output !== undefined) {
                            scope.outputError = false;
                            scope.outputErrorB = true;
                            scope.outputExpand = true;
                            // scope.outputObj = Object.entries(scope.scoreCardList[i].output);
                            scope.outputObj = scope.scoreCardList.ruleResult.output;
                        } else {
                            scope.outputObj = [];
                            scope.outputExpand = true;
                            if(scope.scoreCardList.ruleResult.output.error != undefined) {
                                scope.outputError = true;
                                scope.outputErrorB = false;
                                scope.outputErrorMsg = scope.scoreCardList.ruleResult.output.error;
                            }
                        }

                        // Level 0 Rule Result Hierarchy
                        scope.ruleResultLv0 = scope.scoreCardList.ruleResult;
                        if(scope.ruleResultLv0.localInputs !== undefined) {
                            scope.localInputsLv0 = Object.entries(scope.ruleResultLv0.localInputs);
                        } else {
                            scope.localInputsLv0 = '';
                        }
                        
                        // Level 1 Rule Result Hierarchy
                        scope.ruleResultHierarchy = scope.scoreCardList.ruleResult.ruleResultHierarchy;
                        if(scope.ruleResultHierarchy.length > 0) {
                            for(var j=0; j<scope.ruleResultHierarchy.length; j++) {
                                if(scope.ruleResultHierarchy[j].localInputs !== undefined) {
                                    scope.localInputs = Object.entries(scope.ruleResultHierarchy[j].localInputs);
                                } else {
                                    break;
                                }
                            }
                        }
            }

            scope.getLv2LocalInputs = function(ruleResultLv2Name) {
                if(ruleResultLv2Name !== undefined) {
                   return Object.entries(ruleResultLv2Name); 
                }
                return;
            }

            scope.inputExpand = false;
            scope.outputExpand = true;
            scope.ruleResultExpand = true;
            scope.ruleResultLv0ExpandBtn = false;
            scope.inputResultExpand = function() {
                if(scope.inputExpand == false) {
                    scope.inputExpand = true;
                } else {
                    scope.inputExpand = false;
                }
            }

            scope.outputResultExpand = function() {
                if(scope.outputExpand == true) {
                    scope.outputExpand = false;
                } else {
                    scope.outputExpand = true;
                }
            }

            scope.ruleResultExpandFun = function() {
                if(scope.ruleResultExpand == true) {
                    scope.ruleResultExpand = false;
                } else {
                    scope.ruleResultExpand = true;
                }
            }

            scope.ruleResultLv0Expand = function() {
                if(scope.ruleResultLv0ExpandBtn == false) {
                    scope.ruleResultLv0ExpandBtn = true;
                } else {
                    scope.ruleResultLv0ExpandBtn = false;
                }
            }

            scope.ruleResultExpandValue = '';
            scope.ruleResultExpandValueBoolean = true;
            scope.ruleResultHierarchyContentExpandFun = function(value) {
                if(scope.ruleResultExpandValue != value) {
                    scope.ruleResultExpandValue = value;
                } else {
                    scope.ruleResultExpandValue = '';
                }
            }
        }
    });
    mifosX.ng.application.controller('loanpplicationscorecardActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.loanpplicationscorecardActivityController]).run(function ($log) {
        $log.info("loanpplicationscorecardActivityController initialized");
    });
}(mifosX.controllers || {}));