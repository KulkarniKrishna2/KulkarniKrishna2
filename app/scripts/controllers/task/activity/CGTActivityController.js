(function(module) {
    mifosX.controllers = _.extend(module, {
        CGTActivityController: function($controller, scope, routeParams, location, resourceFactory, dateFilter) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.groupId = scope.taskconfig['groupId'];
            scope.viewCreateCGT = false;
            scope.viewSummaryCGT = false;
            scope.viewDetailCGT = false;

            function hideAll() {
                scope.viewCreateCGT = false;
                scope.viewSummaryCGT = false;
                scope.viewDetailCGT = false;
            };

            function init() {
                resourceFactory.cgtResource.getAll({entityId: scope.groupId}, function(data) {
                    scope.cgt = data;
                    if (data.length > 0) {
                        angular.forEach(scope.cgt, function(cgt) {
                            if (cgt.status != undefined && (cgt.status.value == 'IN PROGRESS' || cgt.status.value == 'NEW')) {
                                hideAll();
                                scope.viewSummaryCGT = true;
                            }
                        });
                    }
                });
            };

            init();

            scope.createCGT = function() {
                hideAll();
                scope.viewCreateCGT = true;
                scope.isCenter = false;
                scope.cgt = {};
                scope.formData = {};
                scope.formData.expectedStartDate = new Date();
                scope.formData.expectedEndDate = new Date();
                scope.centerId = scope.groupId;
                scope.clientMembers = [];
                scope.clientNotInCgt = [];
                scope.formData.clientIds = [];
                scope.entityTypeId = 2; 

                if (!scope.isCenter) {
                    scope.entityTypeId = 1;
                }

                resourceFactory.cgtTemplateResource.get({entityId: scope.centerId,entityType: scope.entityTypeId}, function(data) {
                    scope.cgt = data;
                    scope.clientMembers = data.clientMembers;
                    scope.formData.loanOfficerId = data.primaryLoanOfficer.id;
                });
            };

            scope.addClient = function() {
                for (var i in this.availableClients) {
                    for (var j in scope.clientNotInCgt) {
                        if (scope.clientNotInCgt[j].id == this.availableClients[i]) {
                            var temp = {};
                            temp.id = this.clientNotInCgt[j].id;
                            temp.displayName = this.clientNotInCgt[j].displayName;
                            scope.clientMembers.push(temp);
                            scope.clientNotInCgt.splice(j, 1);
                        }
                    }
                }
            };

            scope.removeClient = function() {
                for (var i in this.selectedClients) {
                    for (var j in scope.clientMembers) {
                        if (scope.clientMembers[j].id == this.selectedClients[i]) {
                            var temp = {};
                            temp.id = this.clientMembers[j].id;
                            temp.displayName = this.clientMembers[j].displayName;
                            scope.clientNotInCgt.push(temp);
                            scope.clientMembers.splice(j, 1);
                        }
                    }
                }
            };

            scope.back = function() {
                init();
            }
            scope.cancel = function() {
                location.path('/viewcenter/' + scope.centerId);
            }

            scope.submit = function() {
                var expectedStartDate = dateFilter(scope.formData.expectedStartDate, scope.df);
                var expectedEndDate = dateFilter(scope.formData.expectedEndDate, scope.df);

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.expectedStartDate = expectedStartDate;
                this.formData.expectedEndDate = expectedEndDate;
                this.formData.entityId = scope.centerId;
                this.formData.entityType = 2;

                if (scope.clientMembers) {
                    for (var i in scope.clientMembers) {
                        this.formData.clientIds.push(scope.clientMembers[i].id);
                    }
                }

                resourceFactory.cgtResource.save(this.formData, function(data) {
                    init();
                });
            };

            scope.routeToCGT = function(id) {
                scope.cgt = {};
                scope.cgtId = id;
                scope.isCgtDayComplete = false;
                scope.isCgtComplete = false;

                resourceFactory.cgtResource.getCgtById({id: id}, function(data) {
                    scope.cgt = data;
                    scope.cgt.entityId = data.entityId;
                    hideAll();
                    scope.viewDetailCGT = true;
                });
            };

            scope.createCgtDays = function(cgtDayCreationType) {
                var json = {
                    cgtDayCreationType: cgtDayCreationType
                };
                resourceFactory.cgtDaysResource.save({id: routeParams.cgtId}, json, function(data) {
                    $route.reload();
                });
            }

            scope.canCgtBeCompleted = function() {
                var isAllCgtDaysCompleted = true;
                if (scope.cgt.dayDatas) {
                    for (var i = 0; i < scope.cgt.dayDatas.length; i++) {
                        if (scope.cgt.dayDatas[i].status == "NEW") {
                            isAllCgtDaysCompleted = false;
                            break;
                        } else {
                            isAllCgtDaysCompleted = true;
                        }
                    }
                }
                if (scope.cgt.status.value == "NEW" || scope.cgt.status.value == 'COMPLETE' || scope.cgt.status.value == 'REJECT') {
                    isAllCgtDaysCompleted = false;
                }
                return isAllCgtDaysCompleted;
            }

            scope.completeCgtDay = function(cgtDayId) {
                scope.isCgtDayComplete = true;
                location.path("/updatecgtdays/" + cgtDayId);
            }

            scope.completeCgt = function(cgtId) {
                scope.isCgtComplete = true;
                location.path("/completecgt/" + cgtId);
            }

            scope.rejectCgt = function(cgtId) {
                scope.isCgtComplete = false;
                location.path("/rejectcgt/" + cgtId);
            }

            scope.allowView = function(){
                return (scope.viewSummaryCGT && scope.viewCreateCGT && scope.viewDetailCGT);
            };
        }
    });
    mifosX.ng.application.controller('CGTActivityController', ['$controller', '$scope', '$routeParams', '$location', 'ResourceFactory', 'dateFilter', mifosX.controllers.CGTActivityController]).run(function($log) {
        $log.info("CGTActivityController initialized");
    });
}(mifosX.controllers || {}));