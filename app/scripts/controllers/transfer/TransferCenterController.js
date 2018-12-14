(function (module) {
    mifosX.controllers = _.extend(module, {
        TransferCenterController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $modal, $rootScope) {
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
                if (scope.fromOfficeId) {
                    resourceFactory.centerDropDownResource.getAllCenters({ officeId: scope.fromOfficeId, limit:-1, paged:false}, function (data) {
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
                scope.unCheckSelectedCenter(scope.fromCenters,scope.dataList[index]);
                scope.dataList.splice(index, 1);
            };
            scope.cancel = function(){
                location.path('/transfer/viewcentertransfer');
            }
            scope.deleteSubmitDetails = function(){
                scope.unCheckSelectedCenter(scope.fromCenters,scope.dataList)
                scope.dataList = [];
            }

            scope.submitDetails = function () {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.data = scope.dataList;
                scope.formData.transferType = scope.centerToOfficeTransferType;
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
                        location.path('/transfer/viewcentertransfer');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.unCheckSelectedCenter = function(centers,dataList){
                if(angular.isArray(dataList)){
                    for(var i in dataList){
                        if (dataList[i].centers) {
                            for (var j in dataList[i].centers) {
                                for(var k in centers)
                                    if (dataList[i].centers[j].id == centers[k].id) {
                                        centers[k].checked = false;
                                    }
                            }
                        }
                    }
                }else{
                    if(dataList){
                        if (dataList.centers) {
                            for (var j in dataList.centers) {
                                for(var k in centers)
                                    if (dataList.centers[j].id == centers[k].id) {
                                        centers[k].checked = false;
                                    }
                            }
                        }
                    }

                }

            }
        }
    });
    mifosX.ng.application.controller('TransferCenterController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$modal', '$rootScope', mifosX.controllers.TransferCenterController]).run(function ($log) {
        $log.info("TransferCenterController initialized");
    });
}(mifosX.controllers || {}));