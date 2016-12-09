(function (module) {
    mifosX.controllers = _.extend(module, {
        CgtCreationController: function (scope, resourceFactory, location, dateFilter, routeParams, $rootScope) {
            scope.cgt = {};
            scope.formData = {};
            scope.formData.expectedStartDate = new Date();
            scope.formData.expectedEndDate = new Date ();
            scope.centerId = $rootScope.centerId;
            scope.clientMembers = [];
            scope.clientNotInCgt = [];
            scope.formData.clientIds = [];
            scope.entityTypeId = 2;
            scope.iscenter = ((location.path()+'').indexOf('viewcenter')>-1);
            if(!scope.iscenter) {
                scope.entityTypeId = 1;
            }

            resourceFactory.cgtTemplateResource.get({entityId: scope.centerId, entityType: scope.entityTypeId}, function (data) {
                scope.cgt = data;
                scope.clientMembers = data.clientMembers;
                scope.formData.loanOfficerId = data.primaryLoanOfficer.id;
            });



            scope.addClient = function () {
                for (var i in this.availableClients) {
                    for (var j in scope.clientNotInCgt) {
                        if (scope.clientNotInCgt[j].id == this.availableClients) {
                            var temp = {};
                            temp.id = this.clientNotInCgt[j].id;
                            temp.displayName = this.clientNotInCgt[j].displayName;
                            scope.clientMembers.push(temp);
                            scope.clientNotInCgt.splice(j, 1);
                        }
                    }
                }
            };

            scope.removeClient = function () {
                for (var i in this.selectedClients) {
                    for (var j in scope.clientMembers) {
                        if (scope.clientMembers[j].id == this.selectedClients) {
                            var temp = {};
                            temp.id = this.clientMembers[j].id;
                            temp.displayName = this.clientMembers[j].displayName;
                            scope.clientNotInCgt.push(temp);
                            scope.clientMembers.splice(j, 1);
                        }
                    }
                }
            };

            scope.cancel = function () {
                location.path('/viewcenter/'+scope.centerId);
            }

            scope.submit = function () {
                var expectedStartDate = dateFilter(scope.formData.expectedStartDate, scope.df);
                var expectedEndDate = dateFilter(scope.formData.expectedEndDate, scope.df);

                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.expectedStartDate = expectedStartDate;
                this.formData.expectedEndDate = expectedEndDate;
                this.formData.entityId =  scope.centerId;
                this.formData.entityType = 2;

                if (scope.clientMembers) {
                    for (var i in scope.clientMembers) {
                        this.formData.clientIds.push(scope.clientMembers[i].id);
                    }
                }

                resourceFactory.cgtResource.save(this.formData, function (data) {
                    location.path('/viewcgt/'+data.resourceIdentifier);
                });
            };
        }
    });
    mifosX.ng.application.controller('CgtCreationController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$routeParams', '$rootScope', mifosX.controllers.CgtCreationController]).run(function ($log) {
        $log.info("CgtCreationController initialized");
    });
}(mifosX.controllers || {}));
