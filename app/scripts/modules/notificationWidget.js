/* Copyright (c) 2012-2013 Coding Smackdown TV, http://codingsmackdown.tv

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

'use strict';
// Declare module which depends on filters, and services
angular.module('notificationWidget', [])
    // set up the interceptor
    .config(['$httpProvider',  function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q, $injector, $location, $rootScope,$timeout) {
            var notificationChannel, $http;
            $rootScope.requestsInProgressAPIs = {};
            function removeErrors() {
                var $inputs = $(':input');
                $inputs.each(function () {
                    $(this).removeClass("validationerror");
                });
            }

            function error(rejection) {
                $rootScope.errorDetails = [];
                //works with batch requests as well
                //now our data array will hold the return response
                //either it's a batch response or a normal response
                var data = [];
                if (rejection.config.url.indexOf('batches') > 0) {
                    data = rejection.data;
                }
                else {
                    //just push a single response into data
                    var res = {};
                    res.body = JSON.stringify(rejection.data);
                    data.push(res);
                }

                if (rejection.status != 2010) {
                    setTimer(rejection.config.method + rejection.config.url);
                }

                if (rejection.status === 0) {
                    $rootScope.errorStatus = 'No connection. Verify application is running.';
                } else if (rejection.status == 401) {
                    $rootScope.errorStatus = 'Unauthorized';
                    $rootScope.$broadcast("UnauthorizedRequest", rejection.data);
                } else if (rejection.status == 405) {
                    $rootScope.errorStatus = 'HTTP verb not supported [405]';
                } else if (rejection.status == 500) {
                    $rootScope.errorStatus = 'Internal Server Error [500].';
                } else if (rejection.status == 2010) {
                    $rootScope.errorStatus = 'Duplicate request';
                } else {
                    for (var i = 0; i < data.length; i++) {
                        var jsonErrors = JSON.parse(data[i].body);
                        var valErrors = jsonErrors.errors;
                        var errorArray = new Array();
                        var arrayIndex = 0;
                        if (valErrors) {
                            for (var j in valErrors) {
                                var temp = valErrors[j];
                                // add error class to input in dialog
                                var fieldId = '#' + temp.parameterName;
                                $(fieldId).addClass("validationerror");

                                // for views using ui add the classes instead of ids
                                var fieldClass = "." + temp.parameterName;
                                $(fieldClass).eq(data[i].requestId).addClass("validationerror");

                                var errorObj = new Object();
                                errorObj.field = temp.parameterName;
                                errorObj.code = temp.userMessageGlobalisationCode;
                                errorObj.body = jsonErrors;
                                errorObj.args = {params: []};
                                for (var k in temp.args) {
                                    errorObj.args.params.push({value: temp.args[k].value});
                                }
                                errorArray[arrayIndex] = errorObj;
                                arrayIndex++;
                            }
                            ;
                        } else {
                            /***
                             * Update user password api call won't return errors array,
                             * if user enters a password which is used previously
                             */
                            if (jsonErrors.userMessageGlobalisationCode) {
                                var errorObj = new Object();
                                errorObj.code = jsonErrors.userMessageGlobalisationCode;
                                errorArray[arrayIndex] = errorObj;
                                arrayIndex++;
                            }
                        }
                        $rootScope.errorDetails.push(errorArray);
                    }
                }
                return $q.reject(rejection);
            }

            var setTimer = function(url){
                $timeout(function(){ 
                    if($rootScope.requestsInProgressAPIs[url]){
                        delete $rootScope.requestsInProgressAPIs[url];
                    }
                }, 1 * 1200);
            };

            return {
                request: function (config) {
                    $rootScope.blockUI = true;

                    // get requestNotificationChannel via $injector because of circular dependency problem
                    notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');

                    if ($rootScope.isUserSwitched && $rootScope.proxyToken) {
                        config.headers['X-PROXY-TOKEN'] = $rootScope.proxyToken;
                    }

                    if($rootScope.requestsInProgressAPIs[config.method + config.url]){
                        var rejectreq = {};
                        rejectreq.config = config;
                        rejectreq.status = 2010;
                        rejectreq.desc = 'duplicate request';
                        return $q.reject(rejectreq);
                    }

                    if(config.method != 'GET' && config.method != 'OPTION'){
                        $rootScope.requestsInProgressAPIs[config.method + config.url] = true;
                     }

                    // send a notification requests are complete
                    notificationChannel.requestStarted();
                    // do something on success
                    return config || $q.when(config);
                },
                requestError: function (rejection) {
                    $rootScope.blockUI = false;

                    // get $http via $injector because of circular dependency problem
                    $http = $http || $injector.get('$http');
                    // don't send notification until all requests are complete
                    if ($http.pendingRequests.length < 1) {
                        // get requestNotificationChannel via $injector because of circular dependency problem
                        notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                        // send a notification requests are complete
                        notificationChannel.requestEnded();
                    }
                     setTimer(rejection.config.method + rejection.config.url);
                    return $q.reject(rejection);
                },
                response: function (response) {
                    $rootScope.blockUI = false;
                    // clear previous errors for a success request.
                    delete $rootScope.errorStatus;
                    delete $rootScope.errorDetails;
                    var modalStack = $injector.get("$modalStack");
                    removeErrors();

                    //contains the responses successful and failed responses
                    $rootScope.successfulResponses = [];
                    $rootScope.failedResponses = [];

                    //check for batch API errors
                    if (response.config.url.indexOf &&
                        response.config.url.indexOf('batches') > 0) {

                        for (var i = 0; i < response.data.length; i++) {
                            var currResponse = response.data[i];
                            if (currResponse.statusCode == 200) {
                                $rootScope.successfulResponses.push(currResponse);
                            } else {
                                $rootScope.failedResponses.push(currResponse);
                            }
                        }

                        //pass failed responses to error function
                        if ($rootScope.failedResponses.length > 0) {
                            var errResponse = response;
                            errResponse.data = $rootScope.failedResponses;
                            error(errResponse);

                            //set the value of response only to successful responses
                            response.data = $rootScope.successfulResponses;
                        }

                    }
                    setTimer(response.config.method + response.config.url);

                    // get $http via $injector because of circular dependency problem
                    $http = $http || $injector.get('$http');
                    // don't send notification until all requests are complete
                    if ($http.pendingRequests.length < 1) {
                        // get requestNotificationChannel via $injector because of circular dependency problem
                        notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                        // send a notification requests are complete
                        notificationChannel.requestEnded();
                    }
                    if (response.config && response.config.method == "GET") {
                        return response || $q.when(response);
                    } else {
                        if (response.data && response.data.commandId) {
                            //Maker checker is enabled or performing actions of maker checker
                            if (response.config.url.indexOf('makercheckers/') > 0) {
                                //return response for maker checker actions(approve or delete)
                                return response || $q.when(response);
                            } else {
                                //redirect if maker checker is enabled
                                modalStack.dismissAll('close');
                                $location.path('/viewMakerCheckerTask/' + response.data.commandId);
                            }
                        } else {
                            //when no maker checker enabled
                            return response || $q.when(response);
                        }
                    }
                },
                responseError: function (rejection) {
                    $rootScope.blockUI = false;
                    delete $rootScope.errorStatus;
                    delete $rootScope.errorDetails;
                    removeErrors();
                   
                    // get $http via $injector because of circular dependency problem
                    //console.log(response.data);

                    $http = $http || $injector.get('$http');
                    // don't send notification until all requests are complete
                    if ($http.pendingRequests.length < 1) {
                        // get requestNotificationChannel via $injector because of circular dependency problem
                        notificationChannel = notificationChannel || $injector.get('requestNotificationChannel');
                        // send a notification requests are complete
                        notificationChannel.requestEnded();
                    }

                   return error(rejection);
                }
            }
        })
    }])
    // declare the notification pub/sub channel
    .factory('requestNotificationChannel', ['$rootScope', function ($rootScope) {
        // private notification messages
        var _START_REQUEST_ = '_START_REQUEST_';
        var _END_REQUEST_ = '_END_REQUEST_';
        // publish start request notification
        var requestStarted = function () {
            $rootScope.$broadcast(_START_REQUEST_);
        };
        // publish end request notification
        var requestEnded = function () {
            $rootScope.$broadcast(_END_REQUEST_);
        };
        // subscribe to start request notification
        var onRequestStarted = function ($scope, handler) {
            $scope.$on(_START_REQUEST_, function (event) {
                handler();
            });
        };
        // subscribe to end request notification
        var onRequestEnded = function ($scope, handler) {
            $scope.$on(_END_REQUEST_, function (event) {
                handler();
            });
        };
        return {
            requestStarted: requestStarted,
            requestEnded: requestEnded,
            onRequestStarted: onRequestStarted,
            onRequestEnded: onRequestEnded
        };
    }]);
