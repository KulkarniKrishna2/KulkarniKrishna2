(function (module) {
    mifosX.controllers = _.extend(module, {
        SchedulerJobsController: function (scope, resourceFactory, route, location, $modal) {
            var jobIdArray = [];
            scope.activeall = false;
            resourceFactory.jobsResource.get(function (data) {
                scope.jobs = data;
            });
            scope.isJobRunning = false;

            resourceFactory.schedulerResource.get(function (data) {
                scope.schedulerstatus = data.active === true ? 'Active' : 'Standby';
            });

            scope.selectAll = function (selectAll) {
                if(selectAll === true) {
                    for (var i = 0; i < scope.jobs.length; i++) {
                        jobIdArray.push(scope.jobs[i].jobId);
                        scope.jobs[i].checkbox = true;
                    }
                } else {
                    for (var i = 0; i < scope.jobs.length; i++) {
                        jobIdArray = _.without(jobIdArray,scope.jobs[i].jobId);
                        scope.jobs[i].checkbox = false;
                    }
                }

                jobIdArray =  _.uniq(jobIdArray);
            };

            scope.errorLog = function (id){
                scope.id = id;
                $modal.open({
                    templateUrl: 'errorlog.html',
                    controller: ErrorLogCtrl,
                    resolve: {
                        ids: function () {
                            return id;
                        }
                    }
                });
            };

            var ErrorLogCtrl = function ($scope, $modalInstance,ids) {
                for (var i in scope.jobs) {
                    if (scope.jobs[i].jobId === ids) {
                        var index = i;
                    }
                }

                $scope.error = scope.jobs[index].lastRunHistory.jobRunErrorLog;
                $scope.cancel = function () {
                    $modalInstance.dismiss('close');
                };
            };

            scope.routeTo = function (id){
                location.path('/viewschedulerjob/'+id);
            };

            scope.runJobSelected = function (jobId, checkbox) {
                
                for (var i = 0; i < scope.jobs.length; i++) {
                    if (scope.jobs[i].jobId === jobId) {
                        if (checkbox === true) {
                            scope.jobs[i].checkbox = true;
                            jobIdArray.push(jobId);
                            break;
                        } else {
                            scope.jobs[i].checkbox = false;
                            jobIdArray = _.without(jobIdArray,scope.jobs[i].jobId);
                            break;
                        }
                    }
                }

                if (jobIdArray.length === 0) {
                    scope.activeall = false;
                }
                

                jobIdArray =  _.uniq(jobIdArray);
            };

            scope.runSelectedJobs = function () {
                scope.sentForExecution = [];                
                if(jobIdArray.length>0){
                    scope.isJobRunning = true;
                }
                for (var i in jobIdArray) {
                    for (var j in scope.jobs) {
                        if (scope.jobs[j].jobId === jobIdArray[i]) {
                            scope.sentForExecution.push(scope.jobs[j].displayName);
                        }
                    }
                }

                for (var i in jobIdArray) {
                    resourceFactory.jobsResource.save({jobId: jobIdArray[i], command : 'executeJob'}, {}, function(data){
                    });
                }
            };

            scope.suspendJobs = function () {
                scope.isJobRunning = false;
                resourceFactory.schedulerResource.save({command : 'stop'}, {}, function(data) {
                    route.reload();
                });
            };

            scope.activeJobs = function () {
                scope.isJobRunning = false;
                resourceFactory.schedulerResource.save({command : 'start'}, {}, function(data) {
                    route.reload();
                });
            };

            scope.refresh = function () {
                scope.isJobRunning = false;
                route.reload();
            };
        }
    });
    mifosX.ng.application.controller('SchedulerJobsController', ['$scope', 'ResourceFactory', '$route','$location','$modal', mifosX.controllers.SchedulerJobsController]).run(function($log) {
      $log.info("SchedulerJobsController initialized");
    });
}(mifosX.controllers || {}));
