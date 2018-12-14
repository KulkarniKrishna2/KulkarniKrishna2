(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferClientController: function (scope, resourceFactory, location, dateFilter, http, routeParams, $modal,$rootScope) {
            scope.fromCenters = [];
            scope.toCenters = [];
            scope.offices = [];
            scope.members = [];
            scope.availableSlots = [];
            scope.selectedClients = [];
            scope.dataList = [];
            scope.isClientExceedingLimit = false;
            scope.clientToGroupTransferType = 200;
            scope.destGroup = {};
            scope.isTransaferToSameGroup = false;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getFromCenters = function () {
                if (scope.fromOfficeId) {
                    resourceFactory.centerDropDownResource.getAllCenters({ officeId: scope.fromOfficeId , limit:-1, paged:false}, function (data) {
                        scope.fromCenters = data;
                    });
                } else {
                    scope.fromCenters = [];
                }

            };

            scope.getToCenters = function () {
                if (scope.toOfficeId) {
                    resourceFactory.centerDropDownResource.getAllCenters({ officeId: scope.toOfficeId , limit:-1, paged:false}, function (data) {
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
            scope.isClientSelected = function (id,subStatus) {
                if(subStatus && subStatus.code=='clientSubStatusType.deceased'){
                    return false;
                }
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
                        if (scope.dataList.length > (availableClientLimit -1)  || scope.selectedClients.length > availableClientLimit) {
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
                for(var i in data.clients){
                    var index = data.clients[i].name.indexOf(data.group.name);
                    if(index>-1){
                        scope.isTransaferToSameGroup = true;
                    }
                }
                if(!scope.isTransaferToSameGroup){
                    scope.dataList.push(data);
                    for (var j in scope.selectedClients) {
                        for (var i in scope.members) {
                            if (scope.selectedClients[j].id == scope.members[i].id) {
                                scope.members[i].checked = false;
                            }

                        }
                    }
                    scope.selectedClients = [];
                }
            };

            scope.remove = function (index) {
                scope.dataList.splice(index, 1)
            };

            scope.cancel = function(){
                location.path('/transfer/viewclienttransfer');
            }

            scope.deleteSubmitDetails = function(){
                scope.dataList = [];
            }

            scope.submitDetails = function () {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.data = scope.dataList;
                scope.formData.transferType = scope.clientToGroupTransferType;
                $modal.open({
                    templateUrl: 'submitdetail.html',
                    controller: SubmitCtrl,
                    resolve: {
                        data: function () {
                            return scope.formData;
                        }
                    }
                });
            };

            var SubmitCtrl = function ($scope, $modalInstance, data) {
                $scope.df = scope.df;
                $scope.confirm = function () {
                    resourceFactory.bulkTransferResource.save({}, data, function (data) {
                        $modalInstance.dismiss('cancel');
                        location.path('/transfer/viewclienttransfer');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('TransferClientController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', '$modal', '$rootScope', mifosX.controllers.TransferClientController]).run(function ($log) {
        $log.info("TransferClientController initialized");
    });
}(mifosX.controllers || {}));