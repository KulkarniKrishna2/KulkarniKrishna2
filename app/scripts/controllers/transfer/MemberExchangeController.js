(function (module) {
    mifosX.controllers = _.extend(module, {
        MemberExchangeController: function (scope, resourceFactory, location, dateFilter, http, routeParams, $modal, $rootScope) {
            scope.offices = [];
            scope.centers = [];
            scope.clientToGroupTransferType = 400;
            scope.dataList = [];
            scope.groups = [];
            scope.fromClients = [];
            scope.toClients = [];
            scope.errMsg = "";
            scope.isError = false;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getCenters = function (officeId) {
                scope.centers = [];
                scope.groups = [];
                scope.clients = [];
                if (officeId) {
                    resourceFactory.centerResource.getAllCenters({ officeId: scope.fromOfficeId}, function (data) {
                        scope.centers = data.pageItems;
                    });
                }
            }

            scope.getGroupDetails = function (centerId) {
                scope.groups = [];
                scope.clients = [];
                if (centerId) {
                    resourceFactory.centerResource.get({ centerId: centerId, associations: 'groupMembers' }, function (data) {
                        scope.groups = data.groupMembers;
                    });
                }

            };


            scope.remove = function (index) {
                scope.dataList.splice(index, 1)
            };

            scope.cancel = function () {
                location.path('/transfer/viewmemberexchange');
            }

            scope.deleteSubmitDetails = function () {
                scope.dataList = [];
            }



            scope.getClients = function (clients) {
                scope.clients = [];
                if (clients) {
                    scope.clients = clients;
                }
            };

            scope.addDetails = function (fromGroup, toGroup) {
                scope.validateData(fromGroup, toGroup);
                if (scope.isError) {
                    return;
                    scope.isError = false;
                }
            };

            scope.validateData = function (fromGroup, toGroup) {
                scope.isError = false;
                if (fromGroup && toGroup) {
                    if (fromGroup.id == toGroup.id) {
                        scope.errMsg = 'err.msg.same.group.can.not.be.selected';
                        scope.isError = true;
                    } else {
                        var fromClients = scope.getSelectedClients(fromGroup.activeClientMembers);
                        var toClients = scope.getSelectedClients(toGroup.activeClientMembers);

                        if (fromClients.length == 0 || toClients.length == 0) {
                            scope.errMsg = 'err.msg.select.one.member';
                            scope.isError = true;
                        } else if (fromClients.length != toClients.length) {
                            scope.errMsg = 'err.msg.member.count.must.be.same.in.both.groups';
                            scope.isError = true;
                        } else {
                            var data = {};
                            data.fromGroup = { 'id': fromGroup.id, 'name': fromGroup.name, 'clients': fromClients };
                            data.toGroup = { 'id': toGroup.id, 'name': toGroup.name, 'clients': toClients };
                            scope.dataList.push(data);
                            scope.errMsg = "";
                            scope.isError = false;
                        }
                    }
                }
            }

            scope.getSelectedClients = function (clients) {
                var members = [];
                for (var i in clients) {
                    if (clients[i].checked == true) {
                        var member = {};
                        member.id = clients[i].id;
                        member.name = clients[i].displayName;
                        if (clients[i].referenceNumber) {
                            member.name = clients[i].displayName + "-(" + clients[i].referenceNumber + ")";
                        }
                        members.push(member);
                    }
                }
                return members;
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
                        location.path('/transfer/viewmemberexchange');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

        }
    });
    mifosX.ng.application.controller('MemberExchangeController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', '$modal', '$rootScope', mifosX.controllers.MemberExchangeController]).run(function ($log) {
        $log.info("MemberExchangeController initialized");
    });
}(mifosX.controllers || {}));