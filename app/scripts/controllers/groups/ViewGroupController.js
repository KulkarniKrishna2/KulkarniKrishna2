(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewGroupController: function (scope, routeParams, route, location, resourceFactory, dateFilter, $modal, $rootScope) {
            scope.group = [];
            scope.template = [];
            scope.formData = {};
            scope.choice = 0;
            scope.staffData = {};
            scope.openLoan = true;
            scope.openSaving = true;
            scope.editMeeting = false;
            scope.sections = [];
            scope.allowBankAccountForGroups = scope.isSystemGlobalConfigurationEnabled('allow-bank-account-for-groups');
            scope.isHideAccountNumber = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.accountNo;
            scope.isHideReferenceNumber = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.referenceNo;
            scope.isWorkflowEnabled = scope.isSystemGlobalConfigurationEnabled('work-flow');
            scope.hideManageMember = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.createGroup;
            scope.isShowMeetingDetails = !scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.meeting;
            scope.isHideJlgLoan = scope.response.uiDisplayConfigurations.createJlgLoan.isHiddenField.jlgLoan;
            scope.isHideCreateEntity = false;
            if(scope.isWorkflowEnabled && scope.hideManageMember){
                scope.isHideCreateEntity = true;
            }
            scope.exceedMaxLimit = false;
            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };
            scope.routeToSaving = function (id) {
                location.path('/viewsavingaccount/' + id);
            };
            scope.routeToMem = function (id) {
                location.path('/viewclient/' + id);
            };
            scope.defaultEntityType = "group";
            resourceFactory.groupResource.get({groupId: routeParams.id, associations: 'all'}, function (data) {
                scope.group = data;
                $rootScope.groupNameDataParameter = data.name;
                $rootScope.groupName = data.centerName;
                $rootScope.groupOfficeId = data.officeId;
                $rootScope.groupOfficeName = data.officeName;
                scope.isClosedGroup = scope.group.status.value == 'Closed';
                scope.staffData.staffId = data.staffId;
                if(data.collectionMeetingCalendar) {
                    scope.entityId = data.id;
                    scope.entityType = data.collectionMeetingCalendar.entityType.value;

                    if(scope.entityType == "GROUPS" && data.hierarchy == "."+ data.id + "." && scope.group.status.value != "Closed"){
                        scope.editMeeting = true;
                    }
                }

            });
            resourceFactory.runReportsResource.get({reportSource: 'GroupSummaryCounts', genericResultSet: 'false', R_groupId: routeParams.id}, function (data) {
                scope.summary = data[0];
            });
            resourceFactory.groupAccountResource.get({groupId: routeParams.id}, function (data) {
                scope.groupAccounts = data;
            });
            resourceFactory.groupNotesResource.getAllNotes({groupId: routeParams.id}, function (data) {
                scope.groupNotes = data;
            });
            scope.delrole = function (id) {
                resourceFactory.groupResource.save({groupId: routeParams.id, command: 'unassignRole', roleId: id}, {}, function (data) {
                    resourceFactory.groupResource.get({groupId: routeParams.id}, function (data) {
                        route.reload();
                    });
                });
            };
            scope.deleteGroup = function () {
                $modal.open({
                    templateUrl: 'deletegroup.html',
                    controller: GroupDeleteCtrl
                });
            };
            scope.unassignStaffGroup = function () {
                $modal.open({
                    templateUrl: 'groupunassignstaff.html',
                    controller: GroupUnassignCtrl
                });
            };
            var GroupUnassignCtrl = function ($scope, $modalInstance) {
                $scope.unassign = function () {
                    resourceFactory.groupResource.save({groupId: routeParams.id, command: 'unassignstaff'}, scope.staffData, function (data) {
                        $modalInstance.close('unassign');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var GroupDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.groupResource.delete({groupId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('delete');
                        location.path('/groups');
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.cancel = function (id) {
                resourceFactory.groupResource.get({groupId: id}, function (data) {
                    route.reload();
                });
            };
            scope.viewDataTable = function (registeredTableName,data){
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/"+registeredTableName+"/"+scope.group.id+"/"+data.row[0].value);
                }else{
                    location.path("/viewsingledatatableentry/"+registeredTableName+"/"+scope.group.id);
                }
            };
            scope.saveNote = function () {
                resourceFactory.groupResource.save({groupId: routeParams.id, anotherresource: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.groupNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            };
            scope.isLoanClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.setLoan = function () {
                if (scope.openLoan) {
                    scope.openLoan = false
                } else {
                    scope.openLoan = true;
                }
            };
            scope.setSaving = function () {
                if (scope.openSaving) {
                    scope.openSaving = false;
                } else {
                    scope.openSaving = true;
                }
            };
            scope.isSavingClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return true;
                } else {
                    return false;
                }
            };
            scope.isLoanNotClosed = function (loanaccount) {
                if (loanaccount.status.code === "loanStatusType.closed.written.off" ||
                    loanaccount.status.code === "loanStatusType.closed.obligations.met" ||
                    loanaccount.status.code === "loanStatusType.closed.reschedule.outstanding.amount" ||
                    loanaccount.status.code === "loanStatusType.withdrawn.by.client" ||
                    loanaccount.status.code === "loanStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.isSavingNotClosed = function (savingaccount) {
                if (savingaccount.status.code === "savingsAccountStatusType.withdrawn.by.applicant" ||
                    savingaccount.status.code === "savingsAccountStatusType.closed" ||
                    savingaccount.status.code === "savingsAccountStatusType.rejected") {
                    return false;
                } else {
                    return true;
                }
            };

            scope.isActiveMember = function (status) {
                if (status == 'clientStatusType.active') {
                    return true;
                } else {
                    return false;
                }
            };

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_group', isFetchBasicData: true}, function (data) {
                scope.datatables = data;
            });

            scope.dataTableChange = function (datatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: datatable.registeredTableName, entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.datatabledetails.isColumnData = data.columnData.length > 0 ? true : false;
                    scope.showDataTableAddButton = !scope.datatabledetails.isData || scope.datatabledetails.isMultirow;
                    scope.showDataTableEditButton = scope.datatabledetails.isData && !scope.datatabledetails.isMultirow;
                    scope.singleRow = [];
                    scope.isSectioned = false;
                    scope.sections = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                                for(var m in data.columnData){
                                    for(var n in data.columnData[m].row){
                                        if(data.columnData[m].row[n].columnName == scope.datatabledetails.columnHeaders[i].columnName && data.columnData[m].row[n].value == scope.datatabledetails.columnHeaders[i].columnValues[j].id){
                                            data.columnData[m].row[n].value = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if(data.sectionedColumnList != null && data.sectionedColumnList !=undefined && data.sectionedColumnList.length > 0){
                        scope.isSectioned = true;
                    }
                    
                    if (scope.datatabledetails.isColumnData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                row.key = data.columnHeaders[i].columnName;
                                for(var j in data.columnData[0].row){
                                    if(data.columnHeaders[i].columnName == data.columnData[0].row[j].columnName){
                                       row.value = data.columnData[0].row[j].value;
                                       break;
                                    }
                                }
                                scope.singleRow.push(row);
                            }
                            var index = scope.datatabledetails.columnData[0].row.findIndex(x => x.columnName==data.columnHeaders[i].columnName);
                            if(index > 0 ){
                                if(data.columnHeaders[i].displayName != undefined && data.columnHeaders[i].displayName != 'null') {
                                    scope.datatabledetails.columnData[0].row[index].displayName = data.columnHeaders[i].displayName;
                                } 
                            }
                        }
                    }
                    for(var l in data.sectionedColumnList){
                        var tempSection = {
                            displayPosition:data.sectionedColumnList[l].displayPosition,
                            displayName: data.sectionedColumnList[l].displayName,
                            cols: []
                        }
                        scope.sections.push(tempSection);
                    }
                    if(scope.isSectioned){
                        if (scope.datatabledetails.isColumnData) {
                            for(var l in data.sectionedColumnList){
                                for (var i in data.sectionedColumnList[l].columns) {
                                    for (var j in data.columnHeaders) {
                                        if(data.sectionedColumnList[l].columns[i].columnName == data.columnHeaders[j].columnName ){
                                            var index = scope.sections.findIndex(x => x.displayName==data.sectionedColumnList[l].displayName);
                                            if (!scope.datatabledetails.isMultirow) {
                                                var row = {};
                                                if(data.columnHeaders[j].displayName != undefined && data.columnHeaders[j].displayName != 'null') {
                                                    row.key = data.columnHeaders[j].displayName;
                                                } else {
                                                    row.key = data.columnHeaders[j].columnName;
                                                }
                                                row.columnDisplayType = data.columnHeaders[j].columnDisplayType;
                                                for(var k in data.columnData[0].row){
                                                    if(data.columnHeaders[j].columnName == data.columnData[0].row[k].columnName){
                                                        row.value = data.columnData[0].row[k].value;
                                                        break;
                                                    }
                                                }
                                                scope.sections[index].cols.push(row);
                                            }
                                        } 
                                    }
                                }
                            }
                        }
                    }
                });
            };

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.isLoanApplication = scope.isSystemGlobalConfigurationEnabled('loan-application');

            function getprofileRating(){
                resourceFactory.profileRating.get({entityType: 2,entityId : routeParams.id}, function (data) {
                    scope.profileRatingData = data;
                });
            };
            getprofileRating();
            scope.reComputeProfileRating = function () {
                scope.profileRatingData = {};
                resourceFactory.computeProfileRatingTemplate.get(function (response) {
                    for(var i in response.scopeEntityTypeOptions){
                        if(response.scopeEntityTypeOptions[i].value === 'OFFICE'){
                            scope.profileRatingData.scopeEntityType = response.scopeEntityTypeOptions[i].id;
                            scope.profileRatingData.scopeEntityId =  scope.group.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'GROUP'){
                            scope.profileRatingData.entityType = response.entityTypeOptions[i].id;
                            scope.profileRatingData.entityId =  routeParams.id;
                            break;
                        }
                    }
                    scope.profileRatingData.locale = "en";
                    resourceFactory.computeProfileRating.save(scope.profileRatingData, function (response) {
                        getprofileRating();
                    });
                });
            };

            scope.isRefundOption = function(loanaccount){
                return (loanaccount.status.value =='Overpaid' && loanaccount.loanType.value != 'GLIM');
            };

            scope.isDisburseOption = function(loanaccount){
                return (!loanaccount.status.pendingApproval && !loanaccount.status.active && loanaccount.status.value !='Overpaid');
            };

            scope.isGlimOverpaidOption = function(loanaccount){
                return (loanaccount.status.value =='Overpaid' && loanaccount.loanType.value == 'GLIM');
            };

            var activeMembers = 0;
            var getActiveMembers = function(){
                if(scope.group.clientMembers){
                    for(var i in scope.group.clientMembers){
                        if(scope.group.clientMembers[i].status.value =='Active' || scope.group.clientMembers[i].status.value == 'Transfer in progress'){
                            activeMembers = activeMembers + 1;
                        }
                    }
                }
            }

            scope.addMember = function(){
                scope.exceedMaxLimit = false;
                getActiveMembers();
                if(scope.isMaxClientInGroupEnable && scope.group.clientMembers && (scope.maxClientLimit <= activeMembers)){
                    scope.exceedMaxLimit = true;
                }else{
                    location.path('/addmember').search({
                        groupId:scope.group.id,
                        officeId:scope.group.officeId,
                        staffId:scope.group.staffId,
                        centerId:scope.group.centerId
                    });
                }
            }  

            scope.initiateWorkflow = function(){
                resourceFactory.initiateGroupWorkflowResource.save({groupId: routeParams.id, command: 'initiateworkflow'}, this.formData, function (data) {
                    location.path("/grouponboarding/" + routeParams.id +"/workflow");
                });
            }
        }
    });
    mifosX.ng.application.controller('ViewGroupController', ['$scope', '$routeParams', '$route', '$location', 'ResourceFactory', 'dateFilter', '$modal', '$rootScope', mifosX.controllers.ViewGroupController]).run(function ($log) {
        $log.info("ViewGroupController initialized");
    });
}(mifosX.controllers || {}));
