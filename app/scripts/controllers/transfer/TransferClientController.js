(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferClientController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.fromCenters = [];
            scope.toCenters = [];
            scope.offices = [];
            scope.members = [];
            scope.availableSlots = [];
            scope.selectedClients = [];
            scope.dataList = [];
            scope.isClientExceedingLimit = false;
            scope.clientToGroupTransferType = 200;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getFromCenters = function () {
                if (fromOfficeId) {
                    resourceFactory.centerResource.getAllCenters({ officeId: scope.fromOfficeId }, function (data) {
                        scope.fromCenters = data;
                    });
                } else {
                    scope.fromCenters = [];
                }

            };

            scope.getToCenters = function () {
                if (scope.toOfficeId) {
                    resourceFactory.centerResource.getAllCenters({ officeId: scope.toOfficeId }, function (data) {
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
                        scope.groups = data;
                    });
                }
            };

            scope.getAllMembers = function () {
                scope.members = [];
                if (scope.fromCeneterId) {
                    resourceFactory.centerLookupResource.get({ centerId: scope.fromCeneterId }, function (data) {
                        for (var i in data) {
                            if (data[i].activeClientMembers) {
                                scope.members = scope.members.concat(data[i].activeClientMembers);
                            }
                        }
                    });
                }

            };
            scope.isClientSelected = function (id) {
                for (var i in scope.dataList) {
                    if (scope.dataList[i].clients) {
                        for (var j in scope.dataList[i].clients) {

                            if (scope.dataList[i].clients[j].id == id) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };
            scope.selectClients = function (client) {
                scope.isClientExceedingLimit = false;
                scope.clientRemaining = '';
                if (client.checked == true) {
                    var member = {};
                    member.id = client.id;
                    member.name = client.displayName;
                    if (client.referenceNumber) {
                        member.name = client.displayName + "-(" + client.referenceNumber + ")";
                    }
                    scope.selectedClients.push(member);
                } else {
                    for (var i in scope.selectedClients) {
                        if (scope.selectedClients[i].id == client.id) {
                            scope.selectedClients.splice(i, 1);
                        }
                    }
                }
            };

            scope.addGroup = function (id, name) {
                scope.isClientExceedingLimit = false;
                scope.clientRemaining = '';
                if (id && name) {
                    scope.selectedGroup = { 'id': id, 'name': name };
                } else {
                    scope.selectedGroup = undefined;
                }
            };

            scope.add = function () {
                scope.isClientExceedingLimit = false;
                scope.clientRemaining = '';
                if (scope.selectedGroup != undefined && scope.selectedGroup.id != undefined && scope.selectedClients.length > 0) {
                    if (scope.isMaxClientInGroupEnable) {
                        var availableClientLimit = scope.getAvailableMemberLimit(scope.selectedGroup.id);
                        if (scope.selectedClients.length > availableClientLimit) {
                            scope.isClientExceedingLimit = true;
                            scope.clientRemaining = availableClientLimit;
                        } else {
                            scope.addMemberToTransfer();
                        }
                    } else {
                        scope.addMemberToTransfer();
                    }
                }
            };

            scope.getAvailableMemberLimit = function (id) {
                var availableClient = scope.maxClientLimit;
                for (var i in scope.groups) {
                    if (scope.groups[i].id == id) {
                        if (scope.groups[i].activeClientMembers) {
                            availableClient = availableClient - scope.groups[i].activeClientMembers.length;
                        }
                    }
                }
                return availableClient;
            };

            scope.addMemberToTransfer = function () {
                var data = {};
                data.group = scope.selectedGroup;
                data.clients = scope.selectedClients;
                scope.dataList.push(data);
                for (var j in scope.selectedClients) {
                    for (var i in scope.members) {
                        if (scope.selectedClients[j].id == scope.members[i].id) {
                            scope.members[i].checked = false;
                        }

                    }
                }
                scope.selectedClients = [];
            };

            scope.remove = function (index) {
                scope.dataList.splice(index, 1)
            };

            scope.submitDetails = function () {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.data = scope.dataList;
                scope.formData.transferType = scope.clientToGroupTransferType;
                resourceFactory.bulkTransferResource.save({}, scope.formData, function (data) {
                    location.path('/transfer/viewclienttransfer');
                });
            };

        }
    });
    mifosX.ng.application.controller('TransferClientController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.TransferClientController]).run(function ($log) {
        $log.info("TransferClientController initialized");
    });
}(mifosX.controllers || {}));