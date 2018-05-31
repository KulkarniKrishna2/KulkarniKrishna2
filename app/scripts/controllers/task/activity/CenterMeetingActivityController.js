(function (module) {
    mifosX.controllers = _.extend(module, {
        CenterMeetingActivityController: function ($controller, scope, resourceFactory, location, routeParams, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', { $scope: scope }));
            scope.groupOrCenterId = scope.taskconfig.centerId;
            scope.tempFormData = {};
            scope.entityType = "centers"
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            scope.isCenterMeetingAttached = false;
            scope.isCenterMeetingEdit = false;
            scope.showAsTextBox = true;
            scope.formData = {};
            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }
            resourceFactory.centerWorkflowResource.get({ centerId: scope.groupOrCenterId, associations: 'groupMembers, loanaccounts, collectionMeetingCalendar' }, function (data) {
                scope.centerMeetingData = data;
                for (var i in scope.centerMeetingData.subGroupMembers) {
                    for (var j in scope.centerMeetingData.subGroupMembers[i].memberData) {
                        if (scope.centerMeetingData.subGroupMembers[i].memberData[j].loanAccountBasicData && scope.centerMeetingData.subGroupMembers[i].memberData[j].loanAccountBasicData.expectedDisbursementOnDate) {
                            scope.expecteddisbursementon = scope.centerMeetingData.subGroupMembers[i].memberData[j].loanAccountBasicData.expectedDisbursementOnDate;
                            break;
                        }
                    }

                }
                if (scope.centerMeetingData && scope.centerMeetingData.collectionMeetingCalendar && scope.centerMeetingData.collectionMeetingCalendar.calendarInstanceId) {
                    scope.isCenterMeetingAttached = true;
                    scope.isCenterMeetingEdit = false;
                    var today = new Date();
                    if (scope.centerMeetingData.collectionMeetingCalendar.meetingTime) {
                        scope.meetingTime = new Date(scope.centerMeetingData.collectionMeetingCalendar.meetingTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                    }
                }
                if (scope.expecteddisbursementon) {
                    var twoWeeks = 1000 * 60 * 60 * 24 * 14;
                    scope.minMeetingDate = new Date(dateFilter(scope.expecteddisbursementon,scope.df));
                    var date = new Date(dateFilter(scope.expecteddisbursementon,scope.df));
                    scope.maxMeetingDate = new Date(date.getTime()+twoWeeks);
                }
            });
            resourceFactory.attachMeetingResource.get({
                groupOrCenter: scope.entityType, groupOrCenterId: scope.groupOrCenterId,
                templateSource: 'template'
            }, function (data) {
                scope.groupCenterData = data;
                scope.restrictDate = new Date();
                scope.first = {};
                scope.periodValue = "day(s)";
                scope.repeatsOptions = [
                    { id: 1, value: "daily" },
                    { id: 2, value: "weekly" },
                    { id: 3, value: "monthly" },
                    { id: 4, value: "yearly" }
                ];
                scope.repeatsEveryOptions = ["1", "2", "3", "4", "5"];
                //to display default in select boxes
                scope.formData = {
                    repeating: true,
                    frequency: '0',
                    interval: '1'
                }
                scope.formData.frequency = scope.repeatsOptions[1].id;
                scope.formData.interval = '2';
                scope.periodValue = "week(s)";
                scope.showAsTextBox = false;
               
                scope.repeatsOnOptions = [
                    { name: "MON", value: "1" },
                    { name: "TUE", value: "2" },
                    { name: "WED", value: "3" },
                    { name: "THU", value: "4" },
                    { name: "FRI", value: "5" },
                    { name: "SAT", value: "6" },
                    { name: "SUN", value: "7" }
                ]
                scope.tempFormData.meetingTime = new Date();
            });
            scope.selectedPeriod = function (period) {
                if (period == 1) {
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.periodValue = "day(s)"
                    scope.showAsTextBox = true;
                }
                if (period == 2) {
                    scope.repeatsEveryOptions = ["1", "2", "3", "4", "5"];
                    scope.formData.repeatsOnDay = '2';
                    scope.periodValue = "week(s)";
                    scope.repeatsOnOptions = [
                        { name: "MON", value: "1" },
                        { name: "TUE", value: "2" },
                        { name: "WED", value: "3" },
                        { name: "THU", value: "4" },
                        { name: "FRI", value: "5" },
                        { name: "SAT", value: "6" },
                        { name: "SUN", value: "7" }
                    ]
                    scope.showAsTextBox = false;
                }
                if (period == 3) {
                    scope.periodValue = "month(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
                    scope.frequencyNthDayOptions = [
                        { id: 1, value: "first" },
                        { id: 2, value: "second" },
                        { id: 3, value: "third" },
                        { id: 4, value: "fourth" },
                        { id: -1, value: "last" },
                        { id: -2, value: "on day" }
                    ];
                    scope.frequencyDayOfWeekOptions = [
                        { name: "MON", value: "1" },
                        { name: "TUE", value: "2" },
                        { name: "WED", value: "3" },
                        { name: "THU", value: "4" },
                        { name: "FRI", value: "5" },
                        { name: "SAT", value: "6" },
                        { name: "SUN", value: "7" }
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
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.typeId = "1";
                this.formData.timeFormat = 'HH:mm:ss';
                this.formData.location = scope.formData.location;
                this.formData.meetingtime = dateFilter(new Date(scope.tempFormData.meetingTime), 'HH:mm');
                this.formData.meetingtime = this.formData.meetingtime.concat(":00"); // setting the second portion of the time to zero
                scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;
                if (scope.isCenterMeetingEdit) {
                    this.formData.title = scope.calendarData.title;
                    this.formData.repeating = true;
                    if (this.formData.interval < 0) {
                        scope.formData.interval = Math.abs(this.formData.interval);
                    }
                    resourceFactory.attachMeetingResource.update({
                        groupOrCenter: scope.entityType,
                        groupOrCenterId: scope.groupOrCenterId, templateSource: scope.calendarId
                    }, this.formData, function (data) {
                        scope.getCenterMeeting();
                    });
                } else {
                    if (scope.entityType == "groups") {
                        this.formData.title = "groups_" + scope.groupOrCenterId + "_CollectionMeeting";
                    }
                    else if (scope.entityType == "centers") {
                        this.formData.title = "centers_" + scope.groupOrCenterId + "_CollectionMeeting";
                    }
                    resourceFactory.attachMeetingResource.save({ groupOrCenter: scope.entityType, groupOrCenterId: scope.groupOrCenterId }, this.formData, function (data) {
                        scope.getCenterMeeting();
                    });
                }

            };
            scope.cancel = function () {
                scope.isCenterMeetingAttached = true;
                scope.isCenterMeetingEdit = false;
                var today = new Date();
                if (scope.centerMeetingData.collectionMeetingCalendar.meetingTime) {
                    scope.meetingTime = new Date(scope.centerMeetingData.collectionMeetingCalendar.meetingTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                }
            }
            scope.getCenterMeeting = function () {
                resourceFactory.centerWorkflowResource.get({ centerId: scope.groupOrCenterId, associations: 'collectionMeetingCalendar' }, function (data) {
                    scope.centerMeetingData = data;
                    if (scope.centerMeetingData && scope.centerMeetingData.collectionMeetingCalendar && scope.centerMeetingData.collectionMeetingCalendar.calendarInstanceId) {
                        scope.isCenterMeetingAttached = true;
                        scope.isCenterMeetingEdit = false;
                        var today = new Date();
                        if (scope.centerMeetingData.collectionMeetingCalendar.meetingTime) {
                            scope.meetingTime = new Date(scope.centerMeetingData.collectionMeetingCalendar.meetingTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                        }
                    }
                });
            }
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

            scope.sortNumber = function (a, b) {
                return a - b;
            };

            scope.updateMeeting = function (data) {
                scope.isCenterMeetingEdit = true;
                scope.isCenterMeetingAttached = false;
                scope.calendarId = data.id;
                scope.calendarData = data;
                scope.first = { date: new Date(data.startDate) };
                scope.location = data.location;
                var today = new Date();
                scope.formData = {
                    repeating: scope.calendarData.repeating,
                    frequency: scope.calendarData.frequency.id,
                    interval: Math.abs(scope.calendarData.interval),
                    location: scope.calendarData.location
                }
                if (data.meetingTime == undefined) {
                    scope.tempFormData.meetingTime = new Date();
                }
                if (data.meetingTime != undefined) {
                    scope.tempFormData.meetingTime = new Date(data.meetingTime.iLocalMillis + (today.getTimezoneOffset() * 60 * 1000));
                }
                scope.repeatsEveryOptions = [1, 2, 3];
                scope.selectedPeriod(scope.calendarData.frequency.id);
                //to display default in select boxes

                for (var i in scope.repeatsEveryOptions) {
                    if (scope.formData.interval == scope.repeatsEveryOptions[i]) {
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
            }
        }
    });
    mifosX.ng.application.controller('CenterMeetingActivityController', ['$controller', '$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.CenterMeetingActivityController]).run(function ($log) {
        $log.info("CenterMeetingActivityController initialized");
    });
}(mifosX.controllers || {}));

