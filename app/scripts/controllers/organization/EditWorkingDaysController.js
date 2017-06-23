(function (module) {
    mifosX.controllers = _.extend(module, {
        EditWorkingDaysController: function (scope, routeParams, resourceFactory, location, dateFilter, $filter) {
            scope.workingDays = [];
            scope.selectedRepaymentType = "";
            scope.advancedRescheduleDetail = [];
            scope.deletedRescheduleDetail = [];
            scope.fromWeekDay = "";
            scope.advancedRepaymentRescheduleType = "";
            scope.toWeekDay = "";
            scope.isShowAdvancedSettingForWorkingDays=true;
            scope.compareWith = [
                {name: "MO", value: "Monday", code: "day.monday"},
                {name: "TU", value: "Tuesday", code: "day.tuesday"},
                {name: "WE", value: "Wednesday", code: "day.wednesday"},
                {name: "TH", value: "Thursday", code: "day.thursday"},
                {name: "FR", value: "Friday", code: "day.friday"},
                {name: "SA", value: "Saturday", code: "day.saturday"},
                {name: "SU", value: "Sunday", code: "day.sunday"}
            ];

            resourceFactory.workingDaysResource.get(function(data){
                scope.repaymentRescheduleTypes = [{
                    id: data.repaymentRescheduleType.id,
                    value:data.repaymentRescheduleType.value,
                    code :data.repaymentRescheduleType.code
                }];
                scope.selectedRepaymentType = scope.repaymentRescheduleTypes[0].id;
                scope.extendTermForDailyRepayments = data.extendTermForDailyRepayments;
                var temp = data.recurrence.split("=");
                var days = temp[3].split(",");

                for(var i in scope.compareWith){
                    if(days.indexOf(scope.compareWith[i].name.toString()) > -1){
                        scope.workingDays.push({
                            day : scope.compareWith[i].value,
                            code : scope.compareWith[i].code,
                            name : scope.compareWith[i].name,
                            value : true
                        });
                    }
                    else{
                        scope.workingDays.push({
                            day : scope.compareWith[i].value,
                            code : scope.compareWith[i].code,
                            name : scope.compareWith[i].name,
                            value : false
                        });
                    }
                }
                scope.advancedRescheduleDetail = data.advancedRescheduleDetail;
            });
            resourceFactory.workingDaysResourceTemplate.get(function(data){
                scope.repaymentRescheduleOptions = data.repaymentRescheduleOptions;
                scope.repaymentRescheduleOptionsForAdvancedReschedule = data.repaymentRescheduleOptionsForAdvancedReschedule;
            });

            scope.showLabel = function(day){
                if(day != "Monday"){
                    return true;
                }
                return false;
            };
            scope.submit = function () {
                this.formData = {};
                var stringFormat = "FREQ=WEEKLY;INTERVAL=1;BYDAY=";
                var selectedDays = "";
                for(var i in scope.workingDays) {
                    if (scope.workingDays[i].value == true &&
                        scope.workingDays[i].day.indexOf(scope.compareWith[i].value.toString()) > -1) {
                        if (selectedDays != "") {
                            selectedDays = selectedDays + ",";
                        }
                        selectedDays = selectedDays.concat(scope.compareWith[i].name);
                    }
                }
                this.formData.advancedRescheduleDetail = [];
                for(var i in scope.advancedRescheduleDetail){
                    var advancedDetail = scope.advancedRescheduleDetail[i];
                    var detail = {};
                    if(advancedDetail.id){
                        detail.id = advancedDetail.id;
                    }
                    detail.fromWeekDay = advancedDetail.fromWeekDay;
                     // repaymentRescheduleType=6 :Move to Next Working Week Day
                     // repaymentRescheduleType=7 :Move to Previous Working Week Day
                    if(advancedDetail.repaymentReschedulingType){
                        detail.repaymentRescheduleType = advancedDetail.repaymentReschedulingType.id;
                        if(detail.repaymentRescheduleType == 6 || detail.repaymentRescheduleType == 7) {
                            detail.toWeekDay = advancedDetail.toWeekDay;
                        }
                    }
                    this.formData.advancedRescheduleDetail.push(detail);
                }

                for(var i in scope.deletedRescheduleDetail){
                    var deleteDetail = scope.deletedRescheduleDetail[i];
                    this.formData.advancedRescheduleDetail.push(deleteDetail);   
                }

                if(selectedDays == ""){
                    selectedDays = ",";
                }
                this.formData.recurrence = 	stringFormat.concat(selectedDays);
                this.formData.locale = scope.optlang.code;
                this.formData.repaymentRescheduleType = scope.selectedRepaymentType;
                this.formData.extendTermForDailyRepayments = scope.extendTermForDailyRepayments;
                resourceFactory.workingDaysResource.put(this.formData, function(data){
                    location.path('/organization/');
                })
            }
            scope.addAdvancedDetail = function(){

                var detail = {};
                detail.fromWeekDay = scope.fromWeekDay;
                detail.toWeekDay = scope.toWeekDay;
                detail.repaymentReschedulingType = scope.advancedRepaymentRescheduleType;
                scope.advancedRescheduleDetail.push(detail);

                scope.fromWeekDay = "";
                scope.advancedRepaymentRescheduleType = "";
                scope.toWeekDay = "";
            }

            scope.displayValue = function(weekday){
                 for(var i in scope.compareWith){
                    if(weekday.indexOf(scope.compareWith[i].name.toString()) > -1){
                        return scope.compareWith[i].value;
                    }
                    
                 }
            }

            scope.deleteDetail = function(index){
                var detail = scope.advancedRescheduleDetail[index];
                if(detail.id){
                    var deletedDetail = {};
                    deletedDetail.id = detail.id;
                    deletedDetail.delete = true;    
                    scope.deletedRescheduleDetail.push(deletedDetail);
                }
                scope.advancedRescheduleDetail.splice(index, 1);
            }

            scope.showOrHideAdvancedSettings = function () {

                if (scope.isShowAdvancedSettingForWorkingDays) {
                    scope.isShowAdvancedSettingForWorkingDays = false;
                } else{
                    scope.isShowAdvancedSettingForWorkingDays = true;
                }
            };
        }
    });
    mifosX.ng.application.controller('EditWorkingDaysController', ['$scope', '$routeParams', 'ResourceFactory', '$location', 'dateFilter', '$filter',  mifosX.controllers.EditWorkingDaysController]).run(function ($log) {
        $log.info("EditWorkingDaysController initialized");
    });
}(mifosX.controllers || {}));