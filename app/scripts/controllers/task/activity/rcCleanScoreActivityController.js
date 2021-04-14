(function (module) {
    mifosX.controllers = _.extend(module, {
        rcCleanScoreActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){
                scope.loanAppId = scope.taskconfig['loanApplicationId'];
            };
            initTask();

            scope.formData = {};
            scope.documenttypes = [];
            scope.statusTypes =[];
            scope.scoreCardRange = {};
            scope.scordCardDisplay = true;
            scope.scoreCardViewButton = true; 
            scope.scoreCardInitialScreen = false;
            scope.scoreCardFinalScreen = false; 
            scope.scoreCardScreen = false;
            scope.scoreCardHeading = ''; 
            scope.scoreCardSubHeading = '';
            scope.scoreCardErrorText = false;
            scope.scoreCardRetryBtn = false;
            scope.scoreCardRetryText = false;
            scope.scoreCardEvents = {"pointer-events" : "auto"};
            scope.scoreCardBorderStyle = {"border-left" : "6px solid #649729"};
            var scoreCardObj = [
                {
                    scImg: '../../../images/relax.png',
                    scBorderLeft: '6px solid roaylblue',
                    scHeading: 'Sit back and relax',
                    scSubHeading: 'System is doing all the hard for you, we are analysing all the data points to generate the risk score, you will have result in any moment!'
                },
                {
                    scImg: '../../../images/rc1.png',
                    scBorderLeft: '6px solid #33ba7c',
                    scHeading: 'Grade',
                    scSubHeading: 'Based available data system has analysis and classified this loan application as low risk prospect. Based on the acceptable level of risk-reward trade-off, good to proceed further'
                },
                {
                    scImg: '../../../images/rc5.png',
                    scBorderLeft: '6px solid #19cd40',
                    scHeading: 'Grade',
                    scSubHeading: 'Based available data system has analysis and classified this loan application as medium risk prospect. Based on the acceptable level of risk-reward trade-off, good to proceed further'
                },
                {
                    scImg: '../../../images/rc7.png',
                    scBorderLeft: '6px solid orange',
                    scHeading: 'Grade',
                    scSubHeading: 'Based available data system has analysis and classified this loan application as high risk prospect. Based on the acceptable level of risk-reward trade-off, good to proceed further'
                },
                {
                    scImg: '../../../images/rc8.png',
                    scBorderLeft: '6px solid red',
                    scHeading: 'Grade',
                    scSubHeading: 'Based available data system has analysis and classified this loan application as highest risk prospect. Based on the acceptable level of risk-reward trade-off, recommending to reject the application'
                }
            ];
            var count = 0;
            if(!scope.isTaskCompleted()) {
                scope.scoreCardUpdateImageSrc = scoreCardObj[count].scImg;
                scope.scoreCardHeading = scoreCardObj[count].scHeading; 
                scope.scoreCardSubHeading = scoreCardObj[count].scSubHeading;
            }

            if (scope.response && scope.response.uiDisplayConfigurations) {
                scope.scoreCardRange = scope.response.uiDisplayConfigurations.scoreCardRange;
            }
            
            scope.getScoreCardDetails = function() {
                console.log(scope.loanAppId);
            }

            scope.getScoreCardDetails();

             scope.scoreCardActivity = function() {
                 console.log(scope.isTaskCompleted());
                scope.scoreCardViewButton = false;
                scope.scoreCardErrorText = false;
                scope.scoreCardScreen = true;
                scope.scoreCardBorderStyle = {"border-left" : scoreCardObj[count].scBorderLeft};
                resourceFactory.loanAppScoreCardResource.post({loanAppId: scope.loanAppId, scoreKey: 'cleanScore'}, function(cleanScorePostData) {
                    console.log('cleanScore Post', cleanScorePostData);
                    resourceFactory.loanAppScoreCardResource.post({loanAppId: scope.loanAppId, scoreKey: 'cleanScoreTag'}, function(cleanScoreTagPostData) {
                        console.log('cleanScoreTag Post', cleanScoreTagPostData);
                        scope.showScore();
                    },
                    function(error) {
                        scope.scoreCardErrorHandler(error);
                    });
                },
                function(error) {
                    scope.scoreCardErrorHandler(error);
                });
            }
            
            scope.showScore = function() {
                count = 1;
                resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'cleanScore'}, function(cleanScoreData) {
                    console.log('cleanScore Get', cleanScoreData);
                    if(cleanScoreData.value < scope.scoreCardRange.sc1) {
                        count = 4;
                    } else if((cleanScoreData.value >= scope.scoreCardRange.sc1) && (cleanScoreData.value < scope.scoreCardRange.sc2)) {
                        count = 3;
                    } else if((cleanScoreData.value >= scope.scoreCardRange.sc2) && (cleanScoreData.value < scope.scoreCardRange.sc3)) {
                        count = 2;
                    } else if((cleanScoreData.value >= scope.scoreCardRange.sc3) && (cleanScoreData.value < scope.scoreCardRange.sc4)) {
                        count = 1;
                    } else if(cleanScoreData.value > scope.scoreCardRange.sc4) {
                        count = 1;
                    } else if((cleanScoreData.value == undefined) || (cleanScoreData.value == '') || (cleanScoreData.value == null)) {
                        scope.scoreCardErrorHandler(cleanScoreData.value);
                        return;
                    }
                    resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'cleanScoreTag'}, function(cleanScoreTagData) {
                        console.log('Clean Score Tag : ', cleanScoreTagData);
                        if((cleanScoreTagData.value == undefined) || (cleanScoreTagData.value == '') || (cleanScoreTagData.value == null)) {
                            scope.scoreCardErrorHandler(cleanScoreData.value);
                            return;
                        }
                        setTimeout(() => {
                            scope.scoreCardScreen = true;
                            scope.scoreCardUpdateImageSrc = scoreCardObj[count].scImg;
                            scope.scoreCardBorderStyle = {"border-left" : scoreCardObj[count].scBorderLeft};
                            scope.scoreCardHeading = scoreCardObj[count].scHeading + ' ' + cleanScoreTagData.value + ' ( ' + cleanScoreData.value + ' score ) '; 
                            scope.scoreCardSubHeading = scoreCardObj[count].scSubHeading;
                            scope.$apply();
                            return;
                        }, 5000);
                    },
                    function(error) {
                        scope.scoreCardErrorHandler(error);
                    });
                },
                function(error) {
                    scope.scoreCardErrorHandler(error);
                });
                return;
            }

            scope.scoreCardErrorHandler = function(error) {
                console.log('Error Logged :', error);
                scope.scoreCardViewButton = true;
                scope.scoreCardScreen = false;
                scope.scoreCardErrorText = true;
                return;
            }

            scope.fetchData = function() {
                if(scope.isTaskCompleted()) {
                    scope.scoreCardUpdateImageSrc = '';
                    scope.scoreCardBorderStyle = '';
                    scope.scoreCardHeading = '';
                    count = 1;
                    resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'cleanScore'}, function(cleanScoreData) {
                        console.log('cleanScore Get', cleanScoreData);
                        if(cleanScoreData.value < scope.scoreCardRange.sc1) {
                            count = 4;
                        } else if((cleanScoreData.value >= scope.scoreCardRange.sc1) && (cleanScoreData.value < scope.scoreCardRange.sc2)) {
                            count = 3;
                        } else if((cleanScoreData.value >= scope.scoreCardRange.sc2) && (cleanScoreData.value < scope.scoreCardRange.sc3)) {
                            count = 2;
                        } else if((cleanScoreData.value >= scope.scoreCardRange.sc3) && (cleanScoreData.value < scope.scoreCardRange.sc4)) {
                            count = 1;
                        } else if(cleanScoreData.value > scope.scoreCardRange.sc4) {
                            count = 1;
                        } else if((cleanScoreData.value == undefined) || (cleanScoreData.value == '') || (cleanScoreData.value == null)) {
                            scope.scoreCardRetryBtn = true;
                            scope.scoreCardRetryText = true;
                            scope.scoreCardScreen = false;
                            scope.scoreCardEvents = {"pointer-events" : "none"};
                            return;
                        }
                        resourceFactory.loanAppScoreCardResource.get({loanAppId: scope.loanAppId, scoreKey: 'cleanScoreTag'}, function(cleanScoreTagData) {
                            console.log('Clean Score Tag : ', cleanScoreTagData);
                            if((cleanScoreTagData.value == undefined) || (cleanScoreTagData.value == '') || (cleanScoreTagData.value == null)) {
                                scope.scoreCardRetryBtn = true;
                                scope.scoreCardRetryText = true;
                                scope.scoreCardScreen = false;
                                scope.scoreCardEvents = {"pointer-events" : "none"};
                                return;
                            }
                                scope.scoreCardScreen = true;
                                scope.scoreCardUpdateImageSrc = scoreCardObj[count].scImg;
                                scope.scoreCardBorderStyle = {"border-left" : scoreCardObj[count].scBorderLeft};
                                scope.scoreCardHeading = scoreCardObj[count].scHeading + ' ' + cleanScoreTagData.value + ' ( ' + cleanScoreData.value + ' score ) '; 
                                scope.scoreCardSubHeading = scoreCardObj[count].scSubHeading;
                        },
                        function(error) {
                            scope.scoreCardErrorHandler(error);
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
    mifosX.ng.application.controller('rcCleanScoreActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', mifosX.controllers.rcCleanScoreActivityController]).run(function ($log) {
        $log.info("rcCleanScoreActivityController initialized");
    });
}(mifosX.controllers || {}));