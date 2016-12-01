(function (module) {
    mifosX.controllers = _.extend(module, {
        updateCgtDayController: function (scope, resourceFactory, location, dateFilter, routeParams, $rootScope) {
            scope.cgt = {};
            scope.formData = {};
            scope.newFormData = {};
            scope.cgtDayId = routeParams.cgtDayId;
            scope.cgtId = $rootScope.cgtId
            scope.isComplete = $rootScope.isCgtDayComplete;



            resourceFactory.cgtDaysResource.getCgtDayByCgtId({id: scope.cgtId, cgtDayId: scope.cgtDayId}, function (data) {
                scope.cgtdays = data;
                var scheduledDate = dateFilter(data.scheduledDate, scope.df);
                scope.formData.scheduledDate = new Date(scheduledDate);
                scope.formData.loanOfficerId = data.loanOfficer.id;
                scope.formData.location = data.location;
            });


            scope.cancel = function () {
                location.path('/viewcgt/'+scope.cgtId);
            }

            scope.submit = function () {
                var scheduleStartDate = dateFilter(scope.formData.scheduledDate, scope.df);
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if (scope.isComplete) {
                    var completedDate = dateFilter(scope.formData.completedDate, scope.df);
                    this.formData.completedDate = completedDate;
                    var json = {};
                    this.formData.clientIds = [];
                    for (var i in scope.cgtdays.cgtDayClientData) {
                        json = {
                            id: scope.cgtdays.cgtDayClientData[i].clientData.id,
                            attendanceType: scope.cgtdays.cgtDayClientData[i].attendance.id
                        }
                        this.formData.clientIds.push(json);
                    }

                    angular.copy(this.formData, scope.newFormData)
                    delete this.newFormData.scheduledDate;
                    delete this.newFormData.loanOfficerId;
                    delete this.newFormData.location;
                    resourceFactory.cgtDaysResource.completeCgtDay({
                        id: scope.cgtId,
                        cgtDayId: scope.cgtDayId,
                        action: 'complete'
                    }, this.newFormData, function (data) {
                        location.path('/viewcgt/' + scope.cgtId);
                    });
                } else {
                    this.formData.scheduledDate = scheduleStartDate;
                    resourceFactory.cgtDaysResource.updateCgtDayByCgtId({
                        id: scope.cgtId,
                        cgtDayId: scope.cgtDayId
                    }, this.formData, function (data) {
                        location.path('/viewcgt/' + scope.cgtId);
                    });
                }


            };
        }
    });
    mifosX.ng.application.controller('updateCgtDayController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', '$rootScope', mifosX.controllers.updateCgtDayController]).run(function ($log) {
        $log.info("updateCgtDayController initialized");
    });
}(mifosX.controllers || {}));
