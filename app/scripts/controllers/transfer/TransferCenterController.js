(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferCenterController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            scope.fromCenters = [];
            scope.toCenters = [];
            scope.offices = [];
            scope.members = [];
            scope.availableSlots = [];
            scope.selectedCenters = [];
            scope.dataList = [];
            scope.isClientExceedingLimit = false;
            scope.centerToOfficeTransferType = 300;
            scope.maxLimitForCenterSelection = 10;
            scope.sameOfficeError = false;
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getFromCenters = function () {
                scope.sameOfficeError = false;
                if (fromOfficeId) {
                    resourceFactory.centerResource.getAllCenters({ officeId: scope.fromOfficeId }, function (data) {
                        scope.fromCenters = data;
                    });
                } else {
                    scope.fromCenters = [];
                }

            };

            scope.toOfficeChange = function () {
                scope.sameOfficeError = false;
            }

            scope.isCenterSelected = function (id) {
                for (var i in scope.dataList) {
                    if (scope.dataList[i].centers) {
                        for (var j in scope.dataList[i].centers) {

                            if (scope.dataList[i].centers[j].id == id) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };

            scope.selectCenters = function (center) {
                if (center.checked == true) {
                    if (scope.selectedCenters.length != scope.maxLimitForCenterSelection) {
                        var member = {};
                        member.id = center.id;
                        member.name = center.name;
                        if (center.referenceNumber) {
                            member.name = center.name + "-(" + center.referenceNumber + ")";
                        }
                        scope.selectedCenters.push(member);
                    } else {
                        center.checked = false;
                    }

                } else {
                    for (var i in scope.selectedCenters) {
                        if (scope.selectedCenters[i].id == center.id) {
                            scope.selectedCenters.splice(i, 1);
                        }
                    }
                }

            };

            scope.addCentersToTransfer = function () {
                scope.sameOfficeError = false;
                if (scope.selectedCenters.length > 0 && scope.toOffice) {
                    if (scope.toOffice.id != scope.fromOfficeId) {
                        var data = {};
                        data.centers = scope.selectedCenters;
                        var office = {};
                        office.id = scope.toOffice.id;
                        office.name = scope.toOffice.name;
                        if (scope.toOffice.referenceNumber) {
                            office.name = office.name + "(" + scope.toOffice.referenceNumber + ")"
                        }
                        data.office = office;
                        scope.dataList.push(data);
                        for (var j in scope.selectedCenters.centers) {
                            for (var i in scope.fromCenters) {
                                if (scope.selectedCenters[j].id == scope.fromCenters[i].id) {
                                    scope.fromCenters[i].checked = false;
                                }

                            }
                        }
                        scope.selectedCenters = [];
                        scope.toOfficeId = undefined;

                    } else {
                        scope.sameOfficeError = true;
                    }


                }

            };

            scope.remove = function (index) {
                scope.dataList.splice(index, 1)
            };

            scope.submitDetails = function () {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.data = scope.dataList;
                scope.formData.transferType = scope.centerToOfficeTransferType;
                resourceFactory.bulkTransferResource.save({}, scope.formData, function (data) {
                    location.path('/transfer/viewcentertransfer');
                });
            };
        }
    });
    mifosX.ng.application.controller('TransferCenterController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.TransferCenterController]).run(function ($log) {
        $log.info("TransferCenterController initialized");
    });
}(mifosX.controllers || {}));