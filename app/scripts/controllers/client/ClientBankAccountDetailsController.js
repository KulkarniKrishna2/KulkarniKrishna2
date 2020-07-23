(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientBankAccountDetailsController: function (scope, routeParams, resourceFactory, location, route) {
            scope.entityType = "clients";
            scope.entityId = routeParams.clientId;
            scope.clientId = routeParams.clientId;
            scope.formData = {};
            scope.bankAccountDetails = [];
            scope.groupData = {};
            scope.isActiveBankAccountDetails = true;
            scope.showAddBankAccountsButton = true;
            scope.allowMultipleBankAccountsForClient = scope.isSystemGlobalConfigurationEnabled('allow-multiple-bank-accounts-to-clients');
            scope.bankAccountDetailsStatusList = ['active','all'];

            scope.populateDetails = function (status) {
                resourceFactory.bankAccountDetailsResource.getAll({ entityType: scope.entityType, entityId: scope.entityId, status: status }, function (data) {
                    scope.bankAccountDetails = [];
                    if (status != undefined && status != null && status == 'active') {
                        data.sort(function(a, b){
                            var comparatorValue = new Date(a.lastModifiedDate) - new Date(b.lastModifiedDate);
                            return (comparatorValue * -1);
                        });
                        scope.bankAccountDetails = data;
                    } else {
                        var orderByStatus = [200, 100, -1];
                        var activeStatusBankAccountDetails = [];
                        var initiatedStatusBankAccountDetails = [];
                        var otherStatusBankAccountDetails = [];

                        for (var i in orderByStatus) {
                            var orderByStatusId = orderByStatus[i];
                            for (var j in data) {
                                if (!_.isUndefined(data[j].status)) {
                                    var statusId = data[j].status.id;
                                    if (orderByStatusId < 0 && statusId > 200) {
                                        otherStatusBankAccountDetails.push(data[j]);
                                    } else if (orderByStatusId == statusId) {
                                        if(statusId == 200){
                                            activeStatusBankAccountDetails.push(data[j]);
                                        }else{
                                            initiatedStatusBankAccountDetails.push(data[j]);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    activeStatusBankAccountDetails.sort(function(a, b){
                        var comparatorValue = new Date(a.lastModifiedDate) - new Date(b.lastModifiedDate);
                        return (comparatorValue * -1);
                    });
                    _.each(activeStatusBankAccountDetails, function(obj){
                        scope.bankAccountDetails.push(obj);
                    });

                    initiatedStatusBankAccountDetails.sort(function(a, b){
                        var comparatorValue = new Date(a.lastModifiedDate) - new Date(b.lastModifiedDate);
                        return (comparatorValue * -1);
                    });
                    _.each(initiatedStatusBankAccountDetails, function(obj){
                        scope.bankAccountDetails.push(obj);
                    });

                    otherStatusBankAccountDetails.sort(function(a, b){
                        var comparatorValue = new Date(a.lastModifiedDate) - new Date(b.lastModifiedDate);
                        return (comparatorValue * -1);
                    });
                    _.each(otherStatusBankAccountDetails, function(obj){
                        scope.bankAccountDetails.push(obj);
                    });

                    scope.showAddButton(scope.bankAccountDetails);
                    /*if(status === 'active'){
                        scope.isActiveBankAccountDetails = true;
                    }else{
                        scope.isActiveBankAccountDetails = false;
                    }*/
                });
            };

            scope.populateDetails(null);

            scope.routeTo = function (bankAccountRecord) {
                location.path('/' + scope.entityType + '/' + scope.entityId + '/bankaccountdetails/' + bankAccountRecord.id);
            };

            scope.showAddButton = function (data) {
                if (scope.allowMultipleBankAccountsForClient) {
                    scope.showAddBankAccountsButton = true;
                } else {
                    for (var i in data) {
                        if (data[i] && data[i].status && (data[i].status.id == 100 || data[i].status.id == 200)) {
                            scope.showAddBankAccountsButton = false;
                            break;
                        }
                    }
                }
            }
        }
    });
    mifosX.ng.application.controller('ClientBankAccountDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', mifosX.controllers.ClientBankAccountDetailsController]).run(function ($log) {
        $log.info("ClientBankAccountDetailsController initialized");
    });
}(mifosX.controllers || {}));