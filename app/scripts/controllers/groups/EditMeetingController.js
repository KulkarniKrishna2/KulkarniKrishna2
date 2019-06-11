(function (module) {
    mifosX.controllers = _.extend(module, {
        EditMeetingController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.formData = {};
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.showAsTextBox = false;
            var hideRepeatsOptionsList = ['daily','yearly'];
            scope.showAllMeetingReccurenceOptions = true;
            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }
            if (scope.response && scope.response.uiDisplayConfigurations) {
                if (scope.response.uiDisplayConfigurations.editCalendar.editableFields) {
                    scope.repeat = scope.response.uiDisplayConfigurations.editCalendar.editableFields.repeat;
                    scope.repeatsevery = scope.response.uiDisplayConfigurations.editCalendar.editableFields.repeatsevery;
                    scope.repeatson = scope.response.uiDisplayConfigurations.editCalendar.editableFields.repeatson;
                    scope.meetStartDate = scope.response.uiDisplayConfigurations.editCalendar.editableFields.meetStartDate;
                }
                if (scope.response.uiDisplayConfigurations.meeting) {
                    scope.showAllMeetingReccurenceOptions = scope.response.uiDisplayConfigurations.meeting.showAllRepeatsOptions;
                }
            }
            resourceFactory.attachMeetingResource.get({groupOrCenter: routeParams.entityType, groupOrCenterId: routeParams.groupOrCenterId,
                templateSource: routeParams.calendarId, template: 'true'}, function (data) {
                scope.entityType = routeParams.entityType;
                scope.calendarId = routeParams.calendarId;
                scope.groupOrCenterId = routeParams.groupOrCenterId;
                scope.calendarData = data;
                scope.restrictDate = new Date();
                scope.first = {date: new Date(data.startDate)};
                scope.repeatsOptions = [
                    {id: 1, value: "daily"},
                    {id: 2, value: "weekly"},
                    {id: 3, value: "monthly"},
                    {id: 4, value: "yearly"}
                ];
                if (!scope.showAllMeetingReccurenceOptions) {
                    var temp = scope.repeatsOptions;
                    for (var i in temp) {
                        if (hideRepeatsOptionsList.indexOf(temp[i].value) >= 0) {
                            scope.repeatsOptions.splice(i, 1);
                        }
                    }
                }
                scope.locationOptions = data.meetingLocations;
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
                scope.formData = {
                    repeating: scope.calendarData.repeating,
                    frequency: scope.calendarData.frequency.id,
                    interval: Math.abs(scope.calendarData.interval)
                }
                for(var i in scope.repeatsEveryOptions){
                    if (scope.formData.interval == scope.repeatsEveryOptions[i]){
                        scope.formData.interval = scope.repeatsEveryOptions[i];
                    }
                }
                //update interval option
                for (var i in scope.repeatsEveryOptions) {
                    if (scope.repeatsEveryOptions[i] == scope.calendarData.interval) {
                        scope.formData.interval = scope.repeatsEveryOptions[i];
                    }
                }
                //update radio button option
                if (scope.formData.frequency == 2) {
                    scope.formData.repeatsOnDay = scope.calendarData.repeatsOnDay.id.toString();
                } else if (scope.formData.frequency == 3) {
                    scope.formData.repeatsOnNthDayOfMonth = scope.calendarData.repeatsOnNthDayOfMonth.id;
                    if (scope.calendarData.repeatsOnDay) {
                        scope.formData.repeatsOnLastWeekdayOfMonth = scope.calendarData.repeatsOnDay.id;
                    }
                    if (scope.calendarData.repeatsOnDayOfMonth) {
                        scope.selectedOnDayOfMonthOptions = scope.calendarData.repeatsOnDayOfMonth;
                    }
                }
                if(data.locationId != undefined){
                    scope.formData.locationId = data.locationId;
                }
            });

            scope.selectedPeriod = function (period) {
                if (period == 1) {
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.periodValue = "day(s)"
                    scope.showAsTextBox = true;
                }
                if (period == 2) {
                    scope.repeatsEveryOptions = ["1", "2", "3","4","5"];
                    scope.formData.repeatsOnDay = "1";
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
                    scope.showAsTextBox = false;
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
                    scope.showAsTextBox = false;
                }
                if (period == 4) {
                    scope.periodValue = "year(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.showAsTextBox = true;
                }
            }

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.startDate = reqDate;
                this.formData.title = scope.calendarData.title;
                this.formData.locale = scope.optlang.code;
                this.formData.repeating = true;
                this.formData.dateFormat = scope.df;
                this.formData.timeFormat='HH:mm:ss';
                this.formData.typeId = "1";
                this.formData.meetingtime = dateFilter(scope.meetingtime ,'HH:mm');
                this.formData.meetingtime = this.formData.meetingtime.concat(":00"); // setting the second portion of the time to zero
                if (this.formData.interval < 0) {
                    scope.formData.interval = Math.abs(this.formData.interval);
                }
                scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                resourceFactory.attachMeetingResource.update({groupOrCenter: routeParams.entityType,
                    groupOrCenterId: routeParams.groupOrCenterId, templateSource: routeParams.calendarId}, this.formData, function (data) {
                    var destURI = "";
                    if (routeParams.entityType == "groups") {
                        destURI = "viewgroup/" + routeParams.groupOrCenterId;
                    }
                    else if (routeParams.entityType == "centers") {
                        destURI = "viewcenter/" + routeParams.groupOrCenterId;
                    }
                    location.path(destURI);
                });
            };

            scope.addMonthDay = function () {
                for (var i in this.available) {
                    for (var j in scope.repeatsOnDayOfMonthOptions) {
                        if (scope.repeatsOnDayOfMonthOptions[j] == this.available[i]) {
                            scope.selectedOnDayOfMonthOptions.push(this.available[i]);
                            scope.repeatsOnDayOfMonthOptions.splice(j, 1);
                            break;
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove available items in above loop, all items will not be moved to selectedRoles
                scope.available = [];
                scope.selectedOnDayOfMonthOptions.sort(scope.sortNumber);
            };

            scope.removeMonthDay = function () {
                for (var i in this.selected) {
                    for (var j in scope.selectedOnDayOfMonthOptions) {
                        if (scope.selectedOnDayOfMonthOptions[j] == this.selected[i]) {
                            scope.repeatsOnDayOfMonthOptions.push(this.selected[i]);
                            scope.selectedOnDayOfMonthOptions.splice(j, 1);
                            break;
                        }
                    }
                }
                //We need to remove selected items outside of above loop. If we don't remove, we can see empty item appearing
                //If we remove available items in above loop, all items will not be moved to selectedRoles
                scope.selected = [];
                scope.repeatsOnDayOfMonthOptions.sort(scope.sortNumber);
            };

            scope.sortNumber = function(a,b)
            {
                return a - b;
            };
        }
    });
    mifosX.ng.application.controller('EditMeetingController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditMeetingController]).run(function ($log) {
        $log.info("EditMeetingController initialized");
    });
}(mifosX.controllers || {}));

