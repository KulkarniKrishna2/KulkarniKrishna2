(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewCenterController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
            scope.uiData = {};
            scope.center = [];
            scope.staffData = {};
            scope.formData = {};
            scope.report = false;
            scope.hidePentahoReport = true;
            scope.groupMemberAccountList = [];
            scope.showCreateCgt = true;
            scope.isConfiguredClientCenterAssociation = scope.isSystemGlobalConfigurationEnabled('center-client-association');
            scope.isLoanApplication = scope.isSystemGlobalConfigurationEnabled('loan-application');
            $rootScope.centerId = routeParams.id
            scope.sections = [];
            scope.isHideAccountNumber = scope.response.uiDisplayConfigurations.viewCenter.isHiddenField.accountNo;
            scope.isHideReferenceNumber = scope.response.uiDisplayConfigurations.viewCenter.isHiddenField.referenceNo;
            scope.isWorkflowEnabled = scope.isSystemGlobalConfigurationEnabled('work-flow');
            scope.hideManageGroup = scope.response.uiDisplayConfigurations.viewGroup.isHiddenField.createGroup;
            scope.isHideJlgLoan = scope.response.uiDisplayConfigurations.createJlgLoan.isHiddenField.jlgLoan;
            scope.showProductShortName = scope.response.uiDisplayConfigurations.viewLoanAccountDetails.isHiddenFeild.showProductShortName;
            scope.showUnAssignStaffButton = !scope.response.uiDisplayConfigurations.viewCenter.isHiddenField.unassignStaffCenter;
            scope.isHideCreateEntity = false;
            if(scope.isWorkflowEnabled && scope.hideManageGroup){
                scope.isHideCreateEntity = true;
            }
            scope.exceedMaxLimit = false;
            scope.routeToLoan = function (id) {
                location.path('/viewloanaccount/' + id);
            };
            scope.routeToGroup = function (id) {
                location.path('/viewgroup/' + id);
            };
            scope.routeToClient = function (id) {
                location.path('/viewclient/' + id);
            };
            scope.isActiveMember = function (status) {
                if (status == 'clientStatusType.active') {
                    return true;
                } else {
                    return false;
                }
            };
            scope.loanUtilizationChecks = [];
            scope.centerId = routeParams.id;

            scope.routeToCGT = function (id) {
                location.path('/viewcgt/' + id);
            };
            scope.entityType = "center";
            resourceFactory.centerResource.get({centerId: routeParams.id, associations: 'groupMembers,hierarchyLookup,collectionMeetingCalendar,clientMembers'}, function (data) {
                scope.center = data;
                if(scope.center.isWorkflowEnabled){
                    fetchAllConfiguredWorkFlows();
                }
                scope.groupMemberAccountList = data.groupMembers;
                $rootScope.officeName = data.officeName;
                $rootScope.officeId = data.officeId;
                $rootScope.centerName=data.name;
                scope.isClosedCenter = scope.center.status.value == 'Closed';
                scope.staffData.staffId = data.staffId;
                if(data.collectionMeetingCalendar) {
                    scope.meeting = data.collectionMeetingCalendar;
                }
                var today  =  new Date();
                if(data.collectionMeetingCalendar && data.collectionMeetingCalendar.meetingTime){
                    scope.meetingtime=   new Date(data.collectionMeetingCalendar.meetingTime.iLocalMillis + (today.getTimezoneOffset() * 60*1000) );
                }
                //scope.meetingtime=   new Date(data.collectionMeetingCalendar.meetingTime);
            });

            function fetchAllConfiguredWorkFlows() {
                scope.uiData.isNewLoanCycle = true;
                resourceFactory.entityWorkflowResource.getWorkflows({
                    entityType: scope.entityType,
                    entityId: routeParams.id
                }, function (workFlows) {
                    scope.workFlows = workFlows;
                    for (var i in scope.workFlows) {
                        if (scope.workFlows[i] && scope.workFlows[i].status) {
                            if (scope.workFlows[i].status.value == 'initiated') {
                                if (scope.uiData.isNewLoanCycle && scope.workFlows[i].eventType.systemCode == 'loancycle') {
                                    scope.uiData.isNewLoanCycle = false;
                                }
                                if (scope.workFlows[i].eventType.systemCode == 'create') {
                                    scope.uiData.isNewLoanCycle = false;
                                }
                            } else if (scope.workFlows[i].status.value == 'completed') {
                                scope.uiData.isCompletedWorkflows = true;
                            }
                        }
                    }
                });
            };

            resourceFactory.cgtResource.getAll({entityId: routeParams.id}, function(data) {
                scope.cgt = data;
                for (var i in scope.cgt) {
                    if(scope.cgt[i].status != undefined && (scope.cgt[i].status.value == 'IN PROGRESS'
                        || scope.cgt[i].status.value == 'New')) {
                        scope.showCreateCgt = false;
                        break;
                    }
                }
            });

            scope.routeTo = function (id) {
                location.path('/viewsavingaccount/' + id);
            };
            resourceFactory.runReportsResource.get({reportSource: 'GroupSummaryCounts', genericResultSet: 'false', R_groupId: routeParams.id}, function (data) {
                scope.summary = data[0];
            });

            resourceFactory.centerAccountResource.get({centerId: routeParams.id}, function (data) {
                scope.accounts = data;
            });
            resourceFactory.groupNotesResource.getAllNotes({groupId: routeParams.id}, function (data) {
                scope.notes = data;
            });

            scope.deleteCenter = function () {
                $modal.open({
                    templateUrl: 'delete.html',
                    controller: CenterDeleteCtrl
                });
            };
            scope.unassignStaffCenter = function () {
                $modal.open({
                    templateUrl: 'unassignstaff.html',
                    controller: CenterUnassignCtrl
                });
            };
            var CenterDeleteCtrl = function ($scope, $modalInstance) {
                $scope.delete = function () {
                    resourceFactory.centerResource.delete({centerId: routeParams.id}, {}, function (data) {
                        $modalInstance.close('activate');
                        location.path('/centers');
                    });

                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            var CenterUnassignCtrl = function ($scope, $modalInstance) {
                $scope.unassign = function () {
                    resourceFactory.groupResource.save({groupId: routeParams.id, command: 'unassignStaff'}, scope.staffData, function (data) {
                        $modalInstance.close('activate');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };
            scope.saveNote = function () {
                resourceFactory.groupNotesResource.save({groupId: routeParams.id}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.notes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            }

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_center', isFetchBasicData: true}, function (data) {
                scope.datatables = data;
            });
            scope.viewDataTable = function (registeredTableName,data){
                if (scope.datatabledetails.isMultirow) {
                    location.path("/viewdatatableentry/"+registeredTableName+"/"+scope.center.id+"/"+data.row[0].value);
                }else{
                    location.path("/viewsingledatatableentry/"+registeredTableName+"/"+scope.center.id);
                }
            };

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
            //viewStaffAssignmentHistory [Report]
            scope.viewStaffAssignmentHistory = function () {
                //alert("center id : "+ scope.center.id);
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'HTML';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Staff Assignment History");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier+"&locale="+scope.optlang.code;
                //alert("url: "+ scope.baseURL);
                var reportParams = "";
                var paramName = "R_centerId";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.center.id);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                scope.baseURL = $sce.trustAsResourceUrl(scope.baseURL);

            };

            resourceFactory.centerLoanUtilizationCheck.getAll({centerId: routeParams.id}, function (data) {
                scope.loanUtilizationChecks = data;
            });

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            function getprofileRating(){
                resourceFactory.profileRating.get({entityType: 3,entityId : routeParams.id}, function (data) {
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
                            scope.profileRatingData.scopeEntityId =  scope.center.officeId;
                            break;
                        }
                    }
                    for(var i in response.entityTypeOptions){
                        if(response.entityTypeOptions[i].value === 'CENTER'){
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

            scope.viewLoanUtilizationCheck = function(loanId, utilizationCheckId){
                location.path("/center/"+routeParams.id+"/loans/"+loanId+"/viewloanutilization/"+utilizationCheckId);
            }

            var activeGroupMembers = 0;
            var getActiveGroupMembers = function(){
                if(scope.center.groupMembers){
                    for(var i in scope.center.groupMembers){
                        if(scope.center.groupMembers[i].status.value =='Active'){
                            activeGroupMembers = activeGroupMembers + 1;
                        }
                    }
                }
            }
            scope.addgroup = function(){
                scope.exceedMaxLimit = false;
                getActiveGroupMembers();
                if(scope.isMaxGroupInCenterEnable && scope.center.groupMembers && (scope.maxGroupLimit <= activeGroupMembers)){
                    scope.exceedMaxLimit = true;
                }else{
                    location.path('/addgroup').search({
                        centerId:scope.center.id,
                        officeId:scope.center.officeId,
                        staffId:scope.center.staffId
                });
                }    
            }

            scope.initiateNewWorkFlow = function(eventType){
                resourceFactory.initiateWorkflowResource.initiateWorkflow({
                    entityType: "center",
                    eventType : eventType,
                    entityId: routeParams.id
                }, function(data) {
                    location.path('/centeronboarding/'+eventType+'/'+ routeParams.id+'/workflow');
                });
            };

            scope.viewCenterWorkflow =  function(workFlow){
                location.path('/centeronboarding/'+workFlow.eventType.systemCode+'/'+ routeParams.id+'/workflow');
            };

            scope.getLoanStatusCode = function (loan) {
                if (loan.status) {
                    if (loan.subStatus && loan.subStatus.code != 'loanSubStatusType.invalid') {
                        return loan.status.code + "." + loan.subStatus.code;
                    }
                    return loan.status.code;
                }
            };

            scope.getLoanStatusValue = function (loan, subStatusRequested) {
                if (loan.status) {
                    if (loan.subStatus && loan.subStatus.code != 'loanSubStatusType.invalid' && subStatusRequested) {
                        return loan.subStatus.value;
                    }
                    return loan.status.value;
                }
            };

        }
    });

    mifosX.ng.application.controller('ViewCenterController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.ViewCenterController]).run(function ($log) {
        $log.info("ViewCenterController initialized");
    });
}(mifosX.controllers || {}));
