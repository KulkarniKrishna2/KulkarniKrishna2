(function (module) {
    mifosX.controllers = _.extend(module, {
        EditMeetingBasedOnMeetingDatesController: function (scope, resourceFactory, location, routeParams, dateFilter) {
            scope.formData = {};
            scope.formData.presentMeetingDate = {};
            scope.formData.newMeetingDate = {};
            scope.showToday = false;

            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewCenter
                && scope.response.uiDisplayConfigurations.viewCenter.editCenterMeeting) {
                scope.editMeetingConfig = scope.response.uiDisplayConfigurations.viewCenter.editCenterMeeting.config;
                scope.showAllMeetingDates = scope.editMeetingConfig.showAllMeetingDates;
                scope.meetingDatesCount = scope.editMeetingConfig.count;
            }

            resourceFactory.attachMeetingResource.get({groupOrCenter: routeParams.entityType, groupOrCenterId: routeParams.groupOrCenterId,
                templateSource: routeParams.calendarId, template: 'true'}, function (data) {
                scope.entityType = routeParams.entityType;
                scope.groupOrCenterId = routeParams.groupOrCenterId;
                scope.calendarData = data;
                scope.formData = {};
                scope.allMeetingDateArray = [];
                scope.presentmeetingdates = [];
                for (var i in data.nextTenRecurringDates) {
                        scope.allMeetingDateArray.push(dateFilter(new Date(data.nextTenRecurringDates[i]), scope.df));
                }
                if (scope.showAllMeetingDates) {
                    angular.copy(scope.allMeetingDateArray,scope.presentmeetingdates)   
                }else {
                    if(_.isUndefined(scope.meetingDatesCount) || !angular.isNumber(scope.meetingDatesCount)){
                        scope.meetingDatesCount = data.nextTenRecurringDates.length;
                    }
                    for (var i = 0; i <= scope.meetingDatesCount - 1; i++) {
                        scope.presentmeetingdates.push(scope.allMeetingDateArray[i]);
                    }
                }
                scope.formData.presentMeetingDate = scope.presentmeetingdates[0];
                scope.setRangeForNewMeetingDate(scope.formData.presentMeetingDate);
            });

            scope.submit = function () {

                this.formData.reschedulebasedOnMeetingDates = true;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.changeMeetingDate = true;

                this.formData.presentMeetingDate = dateFilter(this.formData.presentMeetingDate, scope.df);
                this.formData.newMeetingDate = dateFilter(this.formData.newMeetingDate, scope.df);

                resourceFactory.attachMeetingResource.update({groupOrCenter: routeParams.entityType, groupOrCenterId: routeParams.groupOrCenterId,
                    templateSource: routeParams.calendarId, isUpdateFutureMeeting : true},this.formData, function (data) {
                    if(data.changes != null) {
                        var destURI = "";
                        if (routeParams.entityType == "groups") {
                            destURI = "viewgroup/" + routeParams.groupOrCenterId;
                        }
                        else if (routeParams.entityType == "centers") {
                            destURI = "viewcenter/" + routeParams.groupOrCenterId;
                        }
                        location.path(destURI);
                    }
                });
            };
            scope.setRangeForNewMeetingDate = function(meetingDate){
                scope.mindate = null;
                scope.maxdate = null;
                var meetingStratDate = new Date();
                meetingStratDate.setDate(meetingStratDate.getDate() + 1)
                if(!_.isUndefined(scope.formData.newMeetingDate)){
                    delete scope.formData.newMeetingDate;
                }
                var index = scope.allMeetingDateArray.findIndex( record => record === meetingDate);
                scope.mindate = _.isUndefined(scope.allMeetingDateArray[index-1]) ? meetingStratDate : scope.allMeetingDateArray[index-1];
                scope.maxdate = _.isUndefined(scope.allMeetingDateArray[index+1]) ? meetingDate : scope.allMeetingDateArray[index+1];
                if(scope.excludeMeetingDateForPreponeOrPostponeDate){
                    var dayCount = 1000 * 60 * 60 * 24;
                    if(!_.isUndefined(scope.allMeetingDateArray[index-1])){
                        scope.mindate = dateFilter(new Date(new Date(scope.mindate).getTime() + dayCount),scope.df);
                    }
                    if(!_.isUndefined(scope.allMeetingDateArray[index+1])){
                        scope.maxdate  = dateFilter(new Date(new Date(scope.maxdate).getTime() - dayCount),scope.df);
                    }     
                }
            }
        }
    });
    mifosX.ng.application.controller('EditMeetingBasedOnMeetingDatesController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.EditMeetingBasedOnMeetingDatesController]).run(function ($log) {
        $log.info("EditMeetingBasedOnMeetingDatesController initialized");
    });
}(mifosX.controllers || {}));


