(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferClientWhileActivationController: function (scope, resourceFactory, location, dateFilter, http, routeParams, $modal, $rootScope) {
            scope.toCenters = [];
            scope.offices = [];
            scope.formData = {
                locale: scope.optlang.code,
                dateFormat: scope.df,
                clientId: routeParams.clientId
            };
            scope.restrictDate = new Date();
            scope.clientId = routeParams.clientId;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getToCenters = function () {
                if (scope.toOfficeId) {
                    resourceFactory.centerDropDownResource.getAllCenters({ officeId: scope.toOfficeId, limit: -1, paged: false, excludeStatus:'600,700'  }, function (data) {
                        scope.toCenters = data;
                    });
                } else {
                    scope.toCenters = [];
                }

            };

            scope.getAllGroups = function () {
                scope.groups = [];
                if (scope.toCeneterId) {
                    resourceFactory.centerLookupResource.get({ centerId: scope.toCeneterId }, function (data) {
                        scope.groups = [];
                        for(var i in data){
                            if(data[i].status && (data[i].status.code !='groupingStatusType.closed' && data[i].status.code != 'groupingStatusType.rejected')){
                                scope.groups.push(data[i]);
                            }
                        }
                    });
                }
            };
            scope.getClientLimit = function(group){
                if (group.activeClientMembers) {
                    return  scope.maxClientLimit  - group.activeClientMembers.length;
                } 
                return scope.maxClientLimit;
            } 

            scope.submit = function () {
                this.formData.activationDate = dateFilter(scope.formData.activationDate, scope.df);
                resourceFactory.ClientActivateAndTransfer.save(scope.formData, function (data) {
                    location.path('/viewclient/' + routeParams.clientId);
                });

            }

        }
    });
    mifosX.ng.application.controller('TransferClientWhileActivationController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', '$modal', '$rootScope', mifosX.controllers.TransferClientWhileActivationController]).run(function ($log) {
        $log.info("TransferClientWhileActivationController initialized");
    });
}(mifosX.controllers || {}));