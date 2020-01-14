(function (module) {
    mifosX.controllers = _.extend(module, {
        VillageTransferController: function (scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $modal, $rootScope) {
            scope.fromCenters = [];
            scope.toCenters = [];
            scope.offices = [];
            scope.members = [];
            scope.availableSlots = [];
            scope.selectedVillages = [];
            scope.dataList = [];
            scope.isClientExceedingLimit = false;
            scope.villageToOfficeTransferType = 500;
            scope.sameOfficeError = false;
            
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.toOffices = data;
            });

            scope.fetchVillages = function () {
                scope.sameOfficeError = false;
                scope.selectedVillages = [];
                if (scope.fromOfficeId) {
                    resourceFactory.villageResource.getAllVillages({ officeId: scope.fromOfficeId,limit: -1, paged: false }, function (data) {
                        scope.villages = data;
                    });
                }
                else {
                    scope.villages = [];
                }
            };

            scope.fromOfficeChange = function () {
                scope.villages = [];
                if (scope.fromOfficeId) {
                    resourceFactory.villageResource.getAllVillages({ officeId: scope.fromOfficeId,limit: -1, paged: false}, function (data) {
                        scope.villages = data;
                    });
                }
            };

            scope.toOfficeChange = function () {
                scope.sameOfficeError = false;
                scope.toStaff = null;
                if (scope.toOffice && scope.toOffice.id) {
                    resourceFactory.fieldOfficersResource.retrievefieldOfficers({ officeId: scope.toOffice.id,staffInSelectedOfficeOnly: true }, function (data) {
                        scope.toStaffs = data;
                    });
                }
            }

            scope.isVillageSelected = function (id) {
                for (var i in scope.dataList) {
                    if (scope.dataList[i].villages) {
                        for (var j in scope.dataList[i].villages) {

                            if (scope.dataList[i].villages[j].id == id) {
                                return false;
                            }
                        }
                    }
                }
                return true;
            };

            scope.selectVillages = function (village) {
                if (village.checked == true) {
                        var member = {};
                        member.id = village.villageId;
                        member.name = village.villageName;
                        scope.selectedVillages.push(member);

                } else {
                    for (var i in scope.selectedVillages) {
                        if (scope.selectedVillages[i].id == village.villageId) {
                            scope.selectedVillages.splice(i, 1);
                        }
                    }
                }

            };

            scope.addVillagesToTransfer = function () {
                scope.sameOfficeError = false;
                scope.toVillageMandatoryError = false;
                scope.toStaffMandatoryError = false;
                scope.noVillagesSelectedError = false;
                scope.toOfficeMandatoryError = false;
                if (scope.selectedVillages.length > 0) {
                    if(scope.toOffice){
                       if (scope.toOffice.id != scope.fromOfficeId) {
                            if (!scope.toStaff) {
                                scope.toStaffMandatoryError = true;
                                return;
                            }
                            var office = {
                                id: scope.toOffice.id,
                                name: scope.toOffice.name
                            };
                            if (scope.toOffice.referenceNumber) {
                                office.name = office.name + "(" + scope.toOffice.referenceNumber + ")";
                            }
                            var staff = {};
                            if (scope.toStaff) {
                            var toStaffObject = angular.fromJson(scope.toStaff);
                            staff.id = toStaffObject.id;
                            staff.name = toStaffObject.displayName;
                            }
                            var data = {
                            villages: scope.selectedVillages,
                            office: office,
                            staff: staff
                            };
                            scope.dataList.push(data);
                            scope.selectedVillages = [];
                            delete scope.toOffice;
                            delete scope.toStaff;
                            scope.toOffices = [];
                            scope.toStaffs = [];
                            setTimeout(function () {
                                scope.toOffices = scope.offices;
                            }, 500);
                        } else {
                            scope.sameOfficeError = true;
                        } 
                    }else{
                        scope.toOfficeMandatoryError = true; 
                    }                    
                } else {
                    scope.noVillagesSelectedError = true;
                }
            };

            scope.remove = function (index) {
                scope.unCheckSelectedVillage(scope.villages,scope.dataList[index]);
                scope.dataList.splice(index, 1);
            };
            scope.cancel = function(){
                location.path('/transfer/viewvillagetransfer');
            }
            scope.deleteSubmitDetails = function(){
                scope.unCheckSelectedVillage(scope.villages,scope.dataList)
                scope.dataList = [];
            }

            scope.submitDetails = function () {
                scope.formData = {};
                scope.formData.locale = scope.optlang.code;
                scope.formData.data = scope.dataList;
                scope.formData.transferType = scope.villageToOfficeTransferType;
                scope.formData.fromOfficeId = scope.fromOfficeId;
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
                        location.path('/transfer/viewvillagetransfer');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.unCheckSelectedVillage = function(villages,dataList){
                if(angular.isArray(dataList)){
                    for(var i in dataList){
                        if (dataList[i].villages) {
                            for (var j in dataList[i].villages) {
                                for(var k in centers)
                                    if (dataList[i].villages[j].id == villages[k].villageId) {
                                        villages[k].checked = false;
                                    }
                            }
                        }
                    }
                }else{
                    if(dataList){
                        if (dataList.villages) {
                            for (var j in dataList.villages) {
                                for(var k in villages)
                                    if (dataList.villages[j].id == villages[k].villageId) {
                                        villages[k].checked = false;
                                    }
                            }
                        }
                    }

                }

            }
        }
    });
    mifosX.ng.application.controller('VillageTransferController', ['$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$modal', '$rootScope', mifosX.controllers.VillageTransferController]).run(function ($log) {
        $log.info("VillageTransferController initialized");
    });
}(mifosX.controllers || {}));