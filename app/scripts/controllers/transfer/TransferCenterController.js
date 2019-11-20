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
            scope.referenceNumber = false;
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.viewCenter && scope.response.uiDisplayConfigurations.viewCenter.isHiddenField){
               if(scope.response.uiDisplayConfigurations.viewCenter.isHiddenField.referenceNo){
                scope.referenceNumber = scope.response.uiDisplayConfigurations.viewCenter.isHiddenField.referenceNo;
               } 
            }
            
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                scope.toOffices = data;
            });
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.centerTransfer
                && scope.response.uiDisplayConfigurations.centerTransfer.isMandatory) {
                scope.isToVillageMandatory = scope.response.uiDisplayConfigurations.centerTransfer.isMandatory.toVillage;
                scope.isToStaffMandatory = scope.response.uiDisplayConfigurations.centerTransfer.isMandatory.toStaff;
            }

            scope.fetchCenters = function () {
                scope.sameOfficeError = false;
                if (scope.fromOfficeId) {
                    resourceFactory.centerDropDownResource.getAllCenters({ officeId: scope.fromOfficeId, staffId: scope.fromStaffId, villageId: scope.fromVillageId, limit: -1, paged: false }, function (data) {
                        scope.fromCenters = data;
                    });
                }
                else {
                    scope.fromCenters = [];
                }
            };

            scope.fromOfficeChange = function () {
                scope.fromStaffs = [];
                scope.fromVillages = [];
                if (scope.fromOfficeId) {
                    resourceFactory.centerTemplateResource.get({ officeId: scope.fromOfficeId, villagesInSelectedOfficeOnly: true, villageStatus: 'active', staffInSelectedOfficeOnly: true }, function (data) {
                        scope.fromStaffs = data.staffOptions;
                        scope.fromVillages = data.villageOptions;
                    });
                }
            };

            scope.toOfficeChange = function () {
                scope.sameOfficeError = false;
                scope.toStaffs = [];
                scope.toVillages = [];
                if (scope.toOffice && scope.toOffice.id) {
                    resourceFactory.centerTemplateResource.get({ officeId: scope.toOffice.id, villagesInSelectedOfficeOnly: true, villageStatus: 'active', staffInSelectedOfficeOnly: true }, function (data) {
                        scope.toStaffs = data.staffOptions;
                        scope.toVillages = data.villageOptions;
                    });
                }
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
                scope.toVillageMandatoryError = false;
                scope.toStaffMandatoryError = false;
                scope.noCentersSelectedError = false;
                if (scope.selectedCenters.length > 0 && scope.toOffice) {
                    if (scope.toOffice.id != scope.fromOfficeId) {
                        if (!scope.createWithoutVillage && scope.isToVillageMandatory && !scope.toVillage) {
                            scope.toVillageMandatoryError = true;
                        }
                        if (scope.isToStaffMandatory && !scope.toStaff) {
                            scope.toStaffMandatoryError = true;
                        }
                        if(scope.toVillageMandatoryError || scope.toStaffMandatoryError){
                            return;
                        }
                        var office = {
                            id: scope.toOffice.id,
                            name: scope.toOffice.name
                        };
                        if (scope.toOffice.referenceNumber) {
                            office.name = office.name + "(" + scope.toOffice.referenceNumber + ")";
                        }
                        var village = {};
                        var staff = {};
                        if (scope.toVillage) {
                            var toVillageObject = angular.fromJson(scope.toVillage);
                            village.id = toVillageObject.villageId;
                            village.name = toVillageObject.villageName;
                        }
                        if (scope.toStaff) {
                            var toStaffObject = angular.fromJson(scope.toStaff);
                            staff.id = toStaffObject.id;
                            staff.name = toStaffObject.displayName;
                        }
                        var data = {
                            centers: scope.selectedCenters,
                            office: office,
                            village: village,
                            staff: staff
                        };
                        scope.dataList.push(data);
                        scope.selectedCenters = [];
                        delete scope.toOffice;
                        delete scope.toStaff;
                        delete scope.toVillage;
                        scope.toOffices = [];
                        scope.toStaffs = [];
                        scope.toVillages = [];
                        setTimeout(function () {
                            scope.toOffices = scope.offices;
                        }, 500);
                    } else {
                        scope.sameOfficeError = true;
                    }
                } else {
                    scope.noCentersSelectedError = true;
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
                scope.formData.fromOfficeId = scope.fromOfficeId;
                scope.formData.fromStaffId = scope.fromStaffId;
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