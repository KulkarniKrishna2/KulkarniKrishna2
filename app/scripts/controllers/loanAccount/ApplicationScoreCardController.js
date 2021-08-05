(function (module) {
    mifosX.controllers = _.extend(module, {
        ApplicationScoreCardController: function (scope, routeParams, resourceFactory, location, $q, $modal) {

            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;
            scope.formData = {};

            resourceFactory.loanApplicationReferencesResource.getByLoanAppId({loanApplicationReferenceId: scope.loanApplicationReferenceId}, function (applicationData) {
                scope.applicationData = applicationData;
                scope.formData.clientId = applicationData.clientId;
                scope.formData.groupId = applicationData.groupId;
                if(scope.applicationData.expectedDisbursalPaymentType){
                    scope.formData.expectedDisbursalPaymentType = scope.applicationData.expectedDisbursalPaymentType.id;
                }
                if(scope.applicationData.expectedRepaymentPaymentType){
                    scope.formData.expectedRepaymentPaymentType = scope.applicationData.expectedRepaymentPaymentType.id;
                }
                scope.loanProductChange(applicationData.loanProductId, false);
            });

            scope.loanProductChange = function (loanProductId, isNewCall) {
                scope.inparams = {resourceType: 'template', activeOnly: 'true'};
                if (scope.formData.clientId && scope.formData.groupId) {
                    scope.inparams.templateType = 'jlg';
                } else if (scope.formData.groupId) {
                    scope.inparams.templateType = 'group';
                } else if (scope.formData.clientId) {
                    scope.inparams.templateType = 'individual';
                }
                if (scope.formData.clientId) {
                    scope.inparams.clientId = scope.formData.clientId;
                }
                if (scope.formData.groupId) {
                    scope.inparams.groupId = scope.formData.groupId;
                }
                scope.inparams.staffInSelectedOfficeOnly = true;


                scope.inparams.productId = loanProductId;

                resourceFactory.loanResource.get(scope.inparams, function (data) {
                    scope.loanaccountinfo = data;
                    if (data.clientName) {
                        scope.clientName = data.clientName;
                    }
                    if (data.group) {
                        scope.groupName = data.group.name;
                    }
                });
            };


            // For Fetching the score card details
            function fetchScores(){
                resourceFactory.loanAppScoreCardResourceList.getAll({loanAppId:scope.loanApplicationReferenceId}, function (response) {
                    scope.showScore = true;
                    scope.scoreList = response;
                    console.log(response);
                });
            }

            fetchScores();

            scope.fetchScorecardDetail = function (selctedScoreKey) {
                console.log(selctedScoreKey);
                scope.showScoreDetail = true;
                resourceFactory.loanAppScoreCardResource.get({loanAppId:scope.loanApplicationReferenceId, scoreKey:selctedScoreKey}, function (response) {
                    // scope.detailScore = response;
                    scope.scoreCardList = response;
                    console.log(response);
                    scope.getScoreCardResult(selctedScoreKey);
                });
            };

            // Score Card Functions

            // scope.getScoreCardList = function() {
            //     resourceFactory.scoreCardsListResource.get({clientId: routeParams.id}, function (data) {
            //         scope.scoreCardList = data;
            //     });
            // }
            // scope.getScoreCardList();

            scope.inputObj;
            scope.outputErrorB = false;
            scope.outputExpand = false;
            scope.listStyleValue = '';
            scope.ruleResultHierarchyLv2LocalInputs = [];
            scope.ruleResultHierarchyLv2 = [];
            scope.ruleResultHierarchyLv2Temp = [];
            scope.localInputsLv2 = true;
            // scope.getScoreCardResult = function(scoreCardName) {
            //     for(var i=0; i<scope.scoreCardList.length; i++) {
            //         if(scope.scoreCardList[i].name == scoreCardName) {
            //             scope.listStyleValue = scoreCardName;
            //             if(scope.scoreCardList[i].input !== undefined) {
            //                 scope.inputObj = Object.entries(scope.scoreCardList[i].input);
            //             } else {
            //                 scope.inputObj = [];
            //                 scope.inputExpand = false;
            //             }

            //             if(scope.scoreCardList[i].output !== undefined) {
            //                 scope.outputError = false;
            //                 scope.outputErrorB = true;
            //                 scope.outputExpand = true;
            //                 // scope.outputObj = Object.entries(scope.scoreCardList[i].output);
            //                 scope.outputObj = scope.scoreCardList[i].ruleResult.output;
            //             } else {
            //                 scope.outputObj = [];
            //                 scope.outputExpand = true;
            //                 if(scope.scoreCardList[i].ruleResult.output.error != undefined) {
            //                     scope.outputError = true;
            //                     scope.outputErrorB = false;
            //                     scope.outputErrorMsg = scope.scoreCardList[i].ruleResult.output.error;
            //                 }
            //             }
                        
            //             // Level 1 Rule Result Hierarchy
            //             scope.ruleResultHierarchy = scope.scoreCardList[i].ruleResult.ruleResultHierarchy;
            //             if(scope.ruleResultHierarchy.length > 0) {
            //                 for(var j=0; j<scope.ruleResultHierarchy.length; j++) {
            //                     if(scope.ruleResultHierarchy[j].localInputs !== undefined) {
            //                         scope.localInputs = Object.entries(scope.ruleResultHierarchy[j].localInputs);
            //                     } else {
            //                         break;
            //                     }
            //                 }
            //             }
            //         }
            //     }
            // }

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
    mifosX.ng.application.controller('ApplicationScoreCardController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$q', '$modal', mifosX.controllers.ApplicationScoreCardController]).run(function ($log) {
        $log.info("ApplicationScoreCardController initialized");
    });
}(mifosX.controllers || {}));
