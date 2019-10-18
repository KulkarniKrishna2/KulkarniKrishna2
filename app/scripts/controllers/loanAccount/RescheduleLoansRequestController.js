(function (module) {
    mifosX.controllers = _.extend(module, {
        RescheduleLoansRequestController: function (scope, resourceFactory, routeParams, rootScope, location, dateFilter, loanDetailsService) {
            scope.loandetails = rootScope.headerLoanDetails;
            delete rootScope.headerLoanDetails;
            scope.loanId = routeParams.loanId;
            scope.formData = {};
            scope.rejectData = {};
            scope.formData.submittedOnDate = new Date();
            scope.isGLIM = false;
            scope.isLoanCalendarAttached = false;
            scope.editLoanCalendar = false;
            scope.editLoanCalendarData = {};
            scope.restrictDate = new Date();
            resourceFactory.loanRescheduleResource.template({scheduleId:'template', loanId:scope.loanId},function(data){
                if (data.length > 0) {
                    scope.formData.rescheduleReasonId = data.rescheduleReasons[0].id;
                }
                scope.codes = data.rescheduleReasons;
                if(data.isLoanCalendarAttached){
                    scope.isLoanCalendarAttached = data.isLoanCalendarAttached;
                    scope.constructCalendarData(data.calendarData);
                }
            });
            scope.cancel = function () {
                location.path('/viewloanaccount/' + scope.loanId);
            };

            resourceFactory.glimResource.getAllByLoan({loanId: scope.loanId}, function (glimData) {
                scope.isGLIM = (glimData != undefined && glimData.length > 0 && glimData[0].isActive);
            });

            scope.changeSpecificInstallment = function(specificInstallment){
                scope.specificToInstallment = specificInstallment;
            }

            scope.submit = function () {
                this.formData.loanId = scope.loanId;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.rescheduleFromDate = dateFilter(this.formData.rescheduleFromDate, scope.df);
                this.formData.adjustedDueDate = dateFilter(this.formData.adjustedDueDate, scope.df);
                this.formData.submittedOnDate = dateFilter(this.formData.submittedOnDate, scope.df);
                this.formData.rescheduleReasonComment = scope.comments;
                this.formData.specificToInstallment = scope.specificToInstallment;
                resourceFactory.loanRescheduleResource.put(this.formData, function (data) {
                    scope.requestId = data.resourceId;
                    location.path('/loans/' + scope.loanId + '/viewreschedulerequest/'+ data.resourceId);
                });
            };

            scope.getStatusCode = function () {
                return loanDetailsService.getStatusCode(scope.loandetails);
            };


            
            scope.constructCalendarData = function(data){
                scope.calendarData = data;
                scope.calendarId = data.id;
                scope.restrictDate = new Date();
                scope.first = {date: new Date()};
                scope.repeatsOptions = [
                    {id: 1, value: "daily"},
                    {id: 2, value: "weekly"},
                    {id: 3, value: "monthly"},
                    {id: 4, value: "yearly"}
                ];
                scope.location=data.location;
                var today  =  new Date();
                if(data.meetingTime == undefined){
                    scope.meetingtime = new Date();
                }
                if(data.meetingTime != undefined) {
                    scope.meetingtime = new Date(data.meetingTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                }
                scope.repeatsEveryOptions = [1, 2, 3];
                scope.selectedPeriod(scope.calendarData.frequency.id);
                //to display default in select boxes
                scope.editLoanCalendarData = {
                    repeating: scope.calendarData.repeating,
                    frequency: scope.calendarData.frequency.id,
                    interval: Math.abs(scope.calendarData.interval)
                }
                for(var i in scope.repeatsEveryOptions){
                    if (scope.editLoanCalendarData.interval == scope.repeatsEveryOptions[i]){
                        scope.editLoanCalendarData.interval = scope.repeatsEveryOptions[i];
                    }
                }
                //update interval option
                for (var i in scope.repeatsEveryOptions) {
                    if (scope.repeatsEveryOptions[i] == scope.calendarData.interval) {
                        scope.editLoanCalendarData.interval = scope.repeatsEveryOptions[i];
                    }
                }
                //update radio button option
                if (scope.editLoanCalendarData.frequency == 2) {
                    scope.editLoanCalendarData.repeatsOnDay = scope.calendarData.repeatsOnDay.id.toString();
                } else if (scope.editLoanCalendarData.frequency == 3) {
                    scope.editLoanCalendarData.repeatsOnNthDayOfMonth = scope.calendarData.repeatsOnNthDayOfMonth.id;
                    if (scope.calendarData.repeatsOnDay) {
                        scope.editLoanCalendarData.repeatsOnLastWeekdayOfMonth = scope.calendarData.repeatsOnDay.id;
                    }
                    if (scope.calendarData.repeatsOnDayOfMonth) {
                        scope.selectedOnDayOfMonthOptions = scope.calendarData.repeatsOnDayOfMonth;
                    }
                }
            }

            scope.updateLoanCalendar = function(){
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.editLoanCalendarData.startDate = reqDate;
                this.editLoanCalendarData.title = scope.calendarData.title;
                this.editLoanCalendarData.locale = scope.optlang.code;
                this.editLoanCalendarData.repeating = true;
                this.editLoanCalendarData.dateFormat = scope.df;
                this.editLoanCalendarData.timeFormat='HH:mm:ss';
                this.editLoanCalendarData.typeId = "1";
                this.editLoanCalendarData.location=scope.location;
                this.editLoanCalendarData.meetingtime = dateFilter(scope.meetingtime ,'HH:mm');
                this.editLoanCalendarData.meetingtime = this.editLoanCalendarData.meetingtime.concat(":00"); // setting the second portion of the time to zero
                if (this.editLoanCalendarData.interval < 0) {
                    scope.editLoanCalendarData.interval = Math.abs(this.editLoanCalendarData.interval);
                }
                scope.editLoanCalendarData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                resourceFactory.attachMeetingResource.update({groupOrCenter: 'loans',
                    groupOrCenterId: scope.loanId, templateSource: scope.calendarId}, this.editLoanCalendarData, function (data) {
                    var destURI = "viewloanaccount/" + routeParams.loanId;
                    location.path(destURI);
                });
            }

            scope.selectedPeriod = function (period) {
                if (period == 1) {
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.periodValue = "day(s)"
                }
                if (period == 2) {
                    scope.repeatsEveryOptions = ["1", "2", "3","4","5"];
                    scope.editLoanCalendarData.repeatsOnDay = "1";
                    scope.periodValue = "week(s)";
                    scope.repeatsOnOptions = [
                        {name: "MON", value: "1"},
                        {name: "TUE", value: "2"},
                        {name: "WED", value: "3"},
                        {name: "THU", value: "4"},
                        {name: "FRI", value: "5"},
                        {name: "SAT", value: "6"},
                        {name: "SUN", value: "7"}
                    ]
                }
                if (period == 3) {
                    scope.periodValue = "month(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
                    scope.frequencyNthDayOptions = [
                        {id: 1, value: "first"},
                        {id: 2, value: "second"},
                        {id: 3, value: "third"},
                        {id: 4, value: "fourth"},
                        {id: -1, value: "last"},
                        {id: -2, value: "on day"}
                    ];
                    scope.frequencyDayOfWeekOptions = [
                        {name: "MON", value: 1},
                        {name: "TUE", value: 2},
                        {name: "WED", value: 3},
                        {name: "THU", value: 4},
                        {name: "FRI", value: 5},
                        {name: "SAT", value: 6},
                        {name: "SUN", value: 7}
                    ];
                }
                if (period == 4) {
                    scope.periodValue = "year(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                }
            }



        }
        
    });
    mifosX.ng.application.controller('RescheduleLoansRequestController', ['$scope', 'ResourceFactory', '$routeParams', '$rootScope', '$location', 'dateFilter' , 'LoanDetailsService' , mifosX.controllers.RescheduleLoansRequestController]).run(function ($log) {
        $log.info("RescheduleLoansRequestController initialized");
    });
}(mifosX.controllers || {}));