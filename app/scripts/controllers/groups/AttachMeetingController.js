(function (module) {
    mifosX.controllers = _.extend(module, {
        AttachMeetingController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.repeatsOnDayOfMonthOptions = [];
            scope.selectedOnDayOfMonthOptions = [];
            for (var i = 1; i <= 28; i++) {
                scope.repeatsOnDayOfMonthOptions.push(i);
            }
            resourceFactory.attachMeetingResource.get({groupOrCenter: routeParams.entityType, groupOrCenterId: routeParams.id,
                templateSource: 'template'}, function (data) {
                scope.entityType = routeParams.entityType;
                scope.groupOrCenterId = routeParams.id;
                scope.groupCenterData = data;
                scope.restrictDate = new Date();
                scope.first = {};
                scope.periodValue = "day(s)";
                scope.repeatsOptions = [
                    {id: 1, value: "daily"},
                    {id: 2, value: "weekly"},
                    {id: 3, value: "monthly"},
                    {id: 4, value: "yearly"}
                ];
                scope.repeatsEveryOptions = ["1", "2", "3"];
                //to display default in select boxes
                scope.formData = {
                    repeating: 'true',
                    frequency: '0',
                    interval: '1'
                }
            });
            scope.meetingtime = new Date();
            scope.selectedPeriod = function (period) {
                if (period == 1) {
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                    scope.periodValue = "day(s)"
                }
                if (period == 2) {
                    scope.repeatsEveryOptions = ["1", "2", "3","4","5"];
                    scope.formData.repeatsOnDay = '1';
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
                        {name: "MON", value: "1"},
                        {name: "TUE", value: "2"},
                        {name: "WED", value: "3"},
                        {name: "THU", value: "4"},
                        {name: "FRI", value: "5"},
                        {name: "SAT", value: "6"},
                        {name: "SUN", value: "7"}
                    ];
                }
                if (period == 4) {
                    scope.periodValue = "year(s)";
                    scope.repeatsEveryOptions = ["1", "2", "3"];
                }
            }

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.startDate = reqDate;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.typeId = "1";
                this.formData.timeFormat='HH:mm:ss';
                this.formData.location=scope.formData.location;
                this.formData.meetingtime = dateFilter(scope.meetingtime,'HH:mm');
               this.formData.meetingtime = this.formData.meetingtime.concat(":00"); // setting the second portion of the time to zero
                if (routeParams.entityType == "groups") {
                    this.formData.title = "groups_" + routeParams.id + "_CollectionMeeting";
                    scope.r = "viewgroup/";
                }
                else if (routeParams.entityType == "centers") {
                    this.formData.title = "centers_" + routeParams.id + "_CollectionMeeting";
                    scope.r = "viewcenter/";
                }

                scope.formData.repeatsOnDayOfMonth = scope.selectedOnDayOfMonthOptions;

                resourceFactory.attachMeetingResource.save({groupOrCenter: routeParams.entityType, groupOrCenterId: routeParams.id}, this.formData, function (data) {
                    location.path(scope.r + routeParams.id);
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
    mifosX.ng.application.controller('AttachMeetingController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.AttachMeetingController]).run(function ($log) {
        $log.info("AttachMeetingController initialized");
    });
}(mifosX.controllers || {}));

