'use strict';
/*global _ */
/*global mifosX */

(function (module) {
    mifosX.controllers = _.extend(module, {
        CollectionSheetController: function (scope, resourceFactory, location, routeParams, dateFilter, localStorageService, route, $timeout) {
            scope.offices = [];
            scope.centers = [];
            scope.groups = [];
            scope.clientsAttendance = [];
            scope.calendarId = '';
            scope.formData = {};
            scope.centerId = '';
            scope.groupId = '';
            scope.date = {};
            scope.newGroupTotal = {};
            scope.savingsGroupsTotal = [];
			scope.date.transactionDate = new Date();
            scope.date.newtransactionDate = '';
            scope.isHiddenNewTransactionDate = true;
            scope.paymentTypeOptions = [];
            var centerOrGroupResource = '';
            scope.isWithDrawForSavingsIncludedInCollectionSheet = false;
            scope.forcedSubmit=false;
            scope.isStaffMandotory = false;
            scope.productiveCollctionSheetSearchParams = {};
            scope.reasonAttendenceList = [];
            scope.collectionAttendenceList = [];
            scope.attendenceListForReason = [2,4];            
            scope.loanRejectReason = {};
            scope.showText = false;
            scope.showRejectReason = false;
            scope.isShowReasonDropDown = false;
            scope.isRejectReasonMandatory = false;
            
            scope.showAllAttendanceTypes = true;
            resourceFactory.configurationResource.get({configName:'reason-code-allowed'}, function (data) {
                scope.showRejectReason = data.enabled;
            });
            if(scope.response){
                scope.isRecieptNumbermandatory = scope.response.uiDisplayConfigurations.paymentDetails.isMandatory.receiptNumber;
                scope.hideLoanAccountNumber = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.loanAccountNumber;
                scope.hideSavingsAccountNumber = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.savingsAccountNumber;
                scope.hideClientForNoRepayments = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.clientForNoRepayments;
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.collectionSheet) {
                if(scope.response.uiDisplayConfigurations.collectionSheet.attendanceType){
                    scope.defaultAttendanceValue = scope.response.uiDisplayConfigurations.collectionSheet.attendanceType.defaultValue; 
                    scope.showAllAttendanceTypes = scope.response.uiDisplayConfigurations.collectionSheet.attendanceType.showAllAttendanceTypes;
                }
                if(scope.response.uiDisplayConfigurations.collectionSheet.isAutoPopulate){
                    scope.showEmiAmountOverTotalDue = scope.response.uiDisplayConfigurations.collectionSheet.isAutoPopulate.showEmiAmount; 
                }
                if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild){
                    scope.EmiAmountTotalDueToggleButton = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.ToggleButton; 
                }
            }
            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                scope.response.uiDisplayConfigurations.workflow.isMandatory){
                if(scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason){
                   scope.isRejectReasonMandatory = scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason; 
                }
            }
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                if (scope.currentSession.user.officeId) {
                    for (var i = 0; i < scope.offices.length; i++) {
                        if (scope.offices[i].id === scope.currentSession.user.officeId) {
                            scope.officeId = scope.offices[i].id;
                            break;
                        }
                    }
                    scope.officeSelected(scope.officeId);
                }
            });


            resourceFactory.codeHierarchyResource.get({codeName: 'Reject Reason',childCodeName:'AttendanceReason'}, function (data) {
                scope.reasonAttendenceList = data;
            });

            resourceFactory.codeHierarchyResource.get({codeName: 'Reject Reason',childCodeName:'CollectionReason'}, function (data) {
                scope.collectionReasonList = data;
            });

            scope.setvalues = function(clientId){
                scope.groups = scope.savingsgroups;
                var gl = scope.groups.length;
                for (var i = 0; i < gl; i++) {
                    scope.clients = scope.groups[i].clients;
                    var cl = scope.clients.length;
                    for (var j = 0; j < cl; j++) {
                        scope.client = scope.clients[j];
                        if(scope.client.clientId == clientId){
                            scope.client.reasonId = undefined;
                            scope.client.codeValueOptions = undefined;
                            scope.client.reason = undefined;
                        }
                    }
                }
            };

            scope.clientsAttendanceList = function (groups) {
                var gl = groups.length;
                for (var i = 0; i < gl; i++) {
                    scope.clients = groups[i].clients;
                    var cl = scope.clients.length;
                    for (var j = 0; j < cl; j++) {
                        scope.client = scope.clients[j];
                        if (scope.client.attendanceType.id === 0) {
                            scope.client.attendanceType = 1;
                        }else{
                            scope.client.attendanceType = scope.client.attendanceType.id;
                        }
                    }
                }
            };

            scope.isTextAvailable = function(data){
                if(data && data.codeReasonId && data.reasonId){
                    for(var i in scope.reasonAttendenceList){
                        if(scope.reasonAttendenceList[i].id==data.codeReasonId && scope.reasonAttendenceList[i].name =='Others(attendence)'){
                            for(var j in scope.reasonAttendenceList[i].values){
                                if(scope.reasonAttendenceList[i].values[j].id==data.reasonId && scope.reasonAttendenceList[i].values[j].name =='Others'){
                                    return true;
                                }
                            }
                        }
                    }
                }else{
                    return false;
                }
            }

            scope.getValues = function (clientId, codeId) {
                for (var i in scope.reasonAttendenceList) {
                    if (scope.reasonAttendenceList[i].id == codeId) {
                        scope.groups = scope.savingsgroups;
                        var gl = scope.groups.length;
                        for (var j = 0; j < gl; j++) {
                            scope.clients = scope.groups[j].clients;
                            var cl = scope.clients.length;
                            for (var k = 0; k < cl; k++) {
                                scope.client = scope.clients[k];
                                if (scope.client.clientId == clientId) {
                                    scope.client.codeValueOptions = scope.reasonAttendenceList[i].values;
                                }
                            }
                        }
                    }
                }
                return [];
            };


            scope.productiveCollectionSheet = function () {
                for (var i = 0; i < scope.offices.length; i++) {
                    if (scope.offices[i].id === scope.officeId) {
                        scope.officeName = scope.offices[i].name;
                    }
                }
                scope.meetingDate = dateFilter(scope.date.transactionDate, scope.df);
                if(!scope.loanOfficerId){
                    scope.isStaffMandotory = true;
                }
                if(scope.officeId &&  scope.meetingDate && scope.loanOfficerId){
                location.path('/productivesheet/' + scope.officeId + '/' + scope.officeName + '/' + scope.meetingDate + '/' + scope.loanOfficerId);
            }
            };

            if(scope.response != undefined){
                scope.isHiddenNewTransactionDate = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.newtransactionDate;
            }

            scope.officeSelected = function (officeId) {
                scope.officeId = officeId;
                if (officeId) {
                    var searchConditions = {};
                    searchConditions.officeId = officeId;
                    resourceFactory.employeeResource.getAllEmployees({officeId: scope.officeId, status: 'active'}, function (loanOfficerData) {
                        scope.loanOfficers = loanOfficerData.pageItems;
                    });
                    resourceFactory.centerSearchResource.getAllCenters({searchConditions: searchConditions, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (centersData) {
                        scope.centers = centersData;
                    });
                    resourceFactory.groupResource.getAllGroups({officeId: scope.officeId,status:'active', orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (groupsData) {
                        scope.groups = groupsData;
                    });
                }
            };

            if (localStorageService.getFromLocalStorage('Success') === 'true') {
                scope.savesuccess = true;
                localStorageService.removeFromLocalStorage('Success');
                scope.val = true;
                $timeout(function () {
                    scope.val = false;
                }, 3000);
            }

            scope.loanOfficerSelected = function (loanOfficerId) {
                if (loanOfficerId) {
                    var searchConditions = {};
                    searchConditions.officeId = scope.officeId;
                    searchConditions.staffId = loanOfficerId;
                    resourceFactory.centerSearchResource.getAllCenters({searchConditions: searchConditions, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data;
                    });

                    resourceFactory.groupResource.getAllGroups({officeId: scope.officeId,status:'active', staffId: loanOfficerId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
                    });
                } else {
                    scope.centers = '';
                    scope.groups = '';
                }
            };

            scope.centerSelected = function (centerId) {
                if (centerId) {
                    scope.collectionsheetdata = "";
                    resourceFactory.centerResource.get({'centerId': centerId, associations: 'groupMembers,collectionMeetingCalendar' }, function (data) {
                        scope.centerdetails = data;
                        if (data.groupMembers.length > 0) {
                            for(var i=0;i<data.groupMembers.length;i++){
                                if(data.groupMembers[i].status.code== "groupingStatusType.closed" || data.groupMembers[i].status.code== "groupingStatusType.rejected"){
                                    data.groupMembers.splice(i,1);
                                }                         
                            }  
                            scope.groups = data.groupMembers;                      
                        }

                        if (data.collectionMeetingCalendar && data.collectionMeetingCalendar.recentEligibleMeetingDate) {
                            if (!scope.date.transactionDate) {
                                scope.date.transactionDate = new Date(dateFilter(data.collectionMeetingCalendar.recentEligibleMeetingDate, scope.df));
                            }
                        }
                        if (data.collectionMeetingCalendar) {
                            scope.calendarId = data.collectionMeetingCalendar.id;
                        }
                        centerOrGroupResource = "centerResource";
                    });
                }
            };

            scope.groupSelected = function (groupId) {
                if (groupId) {
                    scope.collectionsheetdata = "";
                    resourceFactory.groupResource.get({'groupId': groupId, associations: 'collectionMeetingCalendar'}, function (data) {
                        scope.groupdetails = data.pageItems;
                        if (data.collectionMeetingCalendar) {
                            scope.calendarId = data.collectionMeetingCalendar.id;
                        }
                        if (data.collectionMeetingCalendar && data.collectionMeetingCalendar.recentEligibleMeetingDate) {
                            if (!scope.date.transactionDate) {
                                scope.date.transactionDate = new Date(dateFilter(data.collectionMeetingCalendar.recentEligibleMeetingDate, scope.df));

                            }
                        }
                        centerOrGroupResource = "groupResource";
                    });
                } else if (scope.centerId) {
                    centerOrGroupResource = "centerResource";
                }
            };

            scope.showPaymentDetailsFn = function () {
                scope.paymentDetail = {};
                scope.showPaymentDetails = true;
                if(scope.response && scope.response.uiDisplayConfigurations.collectionSheet.isAutoPopulate.paymentTypeOption){
                    for(var i in scope.paymentTypeOptions){
                        if(scope.response.uiDisplayConfigurations.collectionSheet.isAutoPopulate.cashPaymentType && scope.paymentTypeOptions[i].isCashPayment){
                            scope.paymentDetail.paymentTypeId = scope.paymentTypeOptions[i].id;
                            break;
                        }
                    }
                }else{
                    scope.paymentDetail.paymentTypeId = "";
                }
                if(scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.paymentTypeId) {
                    scope.formData.paymentTypeId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.paymentTypeId;
                }

                scope.paymentDetail.accountNumber = "";
                scope.paymentDetail.checkNumber = "";
                scope.paymentDetail.routingCode = "";
                scope.paymentDetail.receiptNumber = "";
                scope.paymentDetail.bankNumber = "";
            };

            scope.previewCollectionSheet = function () {
                scope.isStaffMandotory = false;
                scope.formData = {};
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                scope.formData.calendarId = scope.calendarId;
                scope.showPaymentDetails = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.paymentDetails;
                if (scope.date.transactionDate) {
                    scope.formData.transactionDate = dateFilter(scope.date.transactionDate, scope.df);
                }
                if (centerOrGroupResource === "centerResource" && scope.calendarId !== "") {
                    var searchParameters = {officeId : scope.officeId, transactionDate : scope.formData.transactionDate, staffId : scope.loanOfficerId, centerId : scope.centerId,
                        locale :scope.optlang.code, dateFormat : scope.df};
                    scope.productiveCollctionSheetSearchParams = searchParameters;
                    resourceFactory.centerResource.save({'centerId': scope.centerId, command: 'generateCollectionSheet'}, scope.formData, function (data) {
                        if (data.groups && data.groups.length > 0) {
                            scope.originalCollectionsheetData = scope.parseClientCharge(data);
                            scope.paymentTypeOptions = data.paymentTypeOptions;
                            if(scope.collectionsheetdata != ""){
                                scope.showPaymentDetails = true;
                                scope.showPaymentDetailsFn();
                            }
                            scope.clientsAttendanceList(data.groups);
                            updateAttendanceTypeOptions();
                            //scope.total(data);
                            scope.colectionsSheetsCopy = [];
                            scope.savingsgroups = data.groups;
                            angular.copy(scope.savingsgroups,scope.colectionsSheetsCopy);
                            scope.collectionsheetdata = angular.copy(scope.originalCollectionsheetData);
                            if(scope.showEmiAmountOverTotalDue){
                                scope.populateEmiAmount(scope.collectionsheetdata);
                            }
                            scope.sumTotalDueCollection();
                            scope.isWithDrawForSavingsIncludedInCollectionSheet = data.isWithDrawForSavingsIncludedInCollectionSheet;
                            scope.isClientChargesIncludedInCollectoonSheet = data.isClientChargesIncludedInCollectoonSheet;
                        } else {
                            scope.noData = true;
                            $timeout(function () {
                                scope.noData = false;
                            }, 3000);
                        }

                    });
                } else if (centerOrGroupResource === "groupResource" && scope.calendarId !== "") {
                    var searchParameters = {officeId : scope.officeId, transactionDate : scope.formData.transactionDate, staffId : scope.loanOfficerId,
                        groupId : scope.groupId, locale :scope.optlang.code, dateFormat : scope.df};
                    scope.productiveCollctionSheetSearchParams = searchParameters;
                    resourceFactory.groupResource.save({'groupId': scope.groupId, command: 'generateCollectionSheet'}, scope.formData, function (data) {
                        if (data.groups && data.groups.length > 0) {
                            scope.originalCollectionsheetData = scope.parseClientCharge(data);
                            scope.paymentTypeOptions = data.paymentTypeOptions;
                            if(scope.collectionsheetdata != ""){
                                scope.showPaymentDetails = true;
                                scope.showPaymentDetailsFn();
                            }
                            scope.clientsAttendanceList(data.groups);
                            updateAttendanceTypeOptions();
                            //scope.total(data);
                            scope.colectionsSheetsCopy = [];
                            scope.savingsgroups = data.groups;
                            angular.copy(scope.savingsgroups,scope.colectionsSheetsCopy);
                            scope.collectionsheetdata = angular.copy(scope.originalCollectionsheetData);
                            if(scope.showEmiAmountOverTotalDue){
                                scope.populateEmiAmount(scope.collectionsheetdata);
                            }
                            scope.isWithDrawForSavingsIncludedInCollectionSheet = data.isWithDrawForSavingsIncludedInCollectionSheet;
                            scope.isClientChargesIncludedInCollectoonSheet = data.isClientChargesIncludedInCollectoonSheet;
                            scope.sumTotalDueCollection();
                        } else {
                            scope.noData = true;
                            $timeout(function () {
                                scope.noData = false;
                            }, 3000);
                        }
                    });
                } else {
                    resourceFactory.groupResource.save({'groupId': 0, command: 'generateCollectionSheet'}, scope.formData, function (data) {
                        scope.collectionsheetdata = data;
                        updateAttendanceTypeOptions();
                        scope.paymentTypeOptions = data.paymentTypeOptions;
                    });
                }
            };

            var updateAttendanceTypeOptions = function() {
                scope.attendanceTypeOptions = scope.response.uiDisplayConfigurations.attendanceTypeOptions;
                if (!_.isUndefined(scope.attendanceTypeOptions)) {
                    scope.originalCollectionsheetData.attendanceTypeOptions = scope.attendanceTypeOptions;
                }
                if(!scope.showAllAttendanceTypes){
                    var allowedAttendanceTypeOptions = ['Present','Absent'];
                    var temp = angular.copy(scope.collectionsheetdata.attendanceTypeOptions);
                    for (var i in temp) {
                        if (allowedAttendanceTypeOptions.indexOf(temp[i].value) <= -1) {
                            var index = scope.collectionsheetdata.attendanceTypeOptions.findIndex(x => x.value==temp[i].value);
                            scope.collectionsheetdata.attendanceTypeOptions.splice(index, 1);
                        }
                    }
                }
            };

            scope.parseClientCharge = function (data) {
                scope.groups = data.groups;
                if (angular.isNumber(scope.defaultAttendanceValue)) {
                    scope.defaultClientAttendanceType =  scope.defaultAttendanceValue;
                } else {
                    scope.defaultClientAttendanceType = data.attendanceTypeOptions[0].id
                }
                scope.groupsTotalClientcharges = 0;
                angular.forEach(data.groups, function (group) {
                    group.totalClientCharges = 0;
                    for (var i in group.clients) {
                        group.clients[i].totalCharges = 0;
                        group.clients[i].id = [];
                        group.clients[i].amountArray = [];
                        group.clients[i].charge = 0;
                        for (var j in data.clientCharges) {
                            if (group.clients[i].clientId == data.clientCharges[j].clientId) {
                                group.clients[i].chargeId = data.clientCharges[j].id;
                                group.clients[i].id.push(data.clientCharges[j].id);
                                group.clients[i].amountArray.push(data.clientCharges[j].amountOutstanding);

                                group.clients[i].totalCharges = group.clients[i].totalCharges + data.clientCharges[j].amountOutstanding;
                            }
                        }
                        group.clients[i].charge = group.clients[i].totalCharges;
                        group.totalClientCharges = group.totalClientCharges + group.clients[i].charge;
                    }
                    scope.groupsTotalClientcharges = scope.groupsTotalClientcharges + group.totalClientCharges;


                });
                return data;
            };
            /**
             * Sum of loans and savings due for collection group by currency
             */
            scope.sumTotalDueCollection = function () {
                scope.totalDueCollection = [];
                scope.sumGroupDueCollection();
                scope.sumSavingsDueCollection();
                scope.sumLoansTotal();
                scope.sumLoansDueByCurrency();
                scope.sumSavingsDueByCurrency();
                scope.sumSavingWithdrawByCurrency();
                scope.addClientChargeTotalDue();
                scope.calculateTotalCollectionDue();
            };

            scope.addClientChargeTotalDue = function(){
                var existing = _.findWhere(scope.totalDueCollection, {currencyCode: scope.currencyCode});
                var clientChargeAmount = Number(scope.groupsTotalClientcharges);
                if (isNaN(clientChargeAmount)) {
                    clientChargeAmount = 0;
                }
                if (existing == undefined || !(_.isObject(existing))) {
                    var gp = {
                        currencyCode: scope.currencyCode,
                        currencySymbol:  scope.currencySymbol,
                        clientChargeAmount: clientChargeAmount
                    };
                    scope.totalDueCollection.push(gp);
                } else {
                    if (isNaN( existing.clientChargeAmount)) {
                        existing.clientChargeAmount = 0;
                    }
                    existing.clientChargeAmount = Number(clientChargeAmount);
                }
            };

            scope.sumTotalChargeCollection = function (client,group) {
                if (isNaN(client.charge)) {
                    client.charge = 0;

                }
                var diff = group.totalClientCharges;
                group.totalClientCharges =0;
                for(var i in group.clients){
                    group.totalClientCharges = Math.ceil((Number( group.totalClientCharges) + Number(group.clients[i].charge)) * 100) / 100;
                }
                scope.groupsTotalClientcharges = Math.ceil((Number(scope.groupsTotalClientcharges) + Number(group.totalClientCharges) - Number(diff)) * 100) / 100;
                if(scope.groupsTotalClientcharges == undefined){
                    scope.groupsTotalClientcharges = 0;
                }
                scope.sumTotalDueCollection();
            };

            scope.reset = function () {
                scope.totalDueCollection = [];
            }

            scope.sumLoansDueByCurrency = function () {
                _.each(scope.loansTotal, function (loan) {
                    scope.currencyCode = loan.currencyCode;
                    scope.currencySymbol = loan.currencySymbol;
                    var existing = _.findWhere(scope.totalDueCollection, {currencyCode: loan.currencyCode});
                    var dueAmount = loan.dueAmount;
                    if (isNaN(dueAmount)) {
                        dueAmount = 0;
                    }
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            currencyCode: loan.currencyCode,
                            currencySymbol: loan.currencySymbol,
                            dueAmount: dueAmount
                        };
                        scope.totalDueCollection.push(gp);
                    } else {
                        existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                    }
                });
            };

            scope.sumSavingsDueByCurrency = function () {
                _.each(scope.savingsTotal, function (saving) {
                    scope.currencyCode = saving.currencyCode;
                    scope.currencySymbol = saving.currencySymbol;
                    var existing = _.findWhere(scope.totalDueCollection, {currencyCode: saving.currencyCode});
                    var dueAmount = saving.dueAmount;
                    if (isNaN(dueAmount)) {
                        dueAmount = 0;
                    }
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            currencyCode: saving.currencyCode,
                            currencySymbol: saving.currencySymbol,
                            dueAmount: dueAmount
                        };
                        scope.totalDueCollection.push(gp);
                    } else {
                        existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                    }
                });
            };

            scope.sumSavingWithdrawByCurrency = function () {
                _.each(scope.savingsTotal, function (saving) {
                    var existing = _.findWhere(scope.totalDueCollection, {currencyCode: saving.currencyCode});
                    var withdrawAmount = saving.withdrawAmount;
                    if (isNaN(withdrawAmount)) {
                        withdrawAmount = 0;
                    }
                    var netAmount= 0;
                    netAmount = netAmount - withdrawAmount
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            currencyCode: saving.currencyCode,
                            currencySymbol: saving.currencySymbol,
                            withdrawAmount: withdrawAmount
                        };
                        scope.totalDueCollection.push(gp);
                    } else {
                        var existingWithdrawAmount =existing.withdrawAmount;
                        if (isNaN(existingWithdrawAmount)) {
                            existingWithdrawAmount = 0;
                        }
                        existing.withdrawAmount = Math.ceil((Number(existingWithdrawAmount) + Number(withdrawAmount)) * 100) / 100;
                    }
                });
            };

            /**
             * Sum of loan dues and Savings dues group by group and product
             */
            scope.sumGroupDueCollection = function () {
                scope.savingsGroupsTotal = [];
                scope.loanGroupsTotal = [];
                _.each(scope.collectionsheetdata.groups, function (group) {
                        _.each(group.clients, function (client) {
                            _.each(client.savings, function (saving) {
                                scope.sumGroupSavingsDueCollection(group, saving);
                            });
                            _.each(client.loans, function (loan) {
                                scope.sumGroupLoansDueCollection(group, loan);
                            });
                        });
                    }
                );
            };

            /**
             * Sum of savings dues group by group id and savings product id
             * @param group
             * @param saving
             */
            scope.sumGroupSavingsDueCollection = function (group, saving) {
                scope.currencyCode = saving.currency.code;
                scope.currencySymbol = saving.currency.displaySymbol;
                var existing = _.findWhere(scope.savingsGroupsTotal, {groupId: group.groupId, productId: saving.productId});
                var dueAmount = saving.dueAmount;
                var withdrawAmount = saving.withdrawAmount;
                if (isNaN(dueAmount)) {
                    dueAmount = 0;
                }
                if(isNaN(withdrawAmount)){
                    withdrawAmount = 0;
                }
                if (existing == undefined || !(_.isObject(existing))) {
                    var gp = {
                        groupId: group.groupId,
                        productId: saving.productId,
                        dueAmount: dueAmount,
                        withdrawAmount:withdrawAmount,
                        currencyCode: saving.currency.code,
                        currencySymbol: saving.currency.displaySymbol
                    };
                    scope.savingsGroupsTotal.push(gp);
                } else {
                    existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                    existing.withdrawAmount = Math.ceil((Number(existing.withdrawAmount)+Number(withdrawAmount))*100)/100;
                }
            };

            /**
             * Sum of loans dues group by group id and loan product id
             * @param group
             * @param loan
             */
            scope.sumGroupLoansDueCollection = function (group, loan) {
                var existing = _.findWhere(scope.loanGroupsTotal, {groupId: group.groupId, productId: loan.productId});
                //alert(_.isObject(existing));
                var totalDue = scope.getLoanTotalDueAmount(loan);
                if (existing == undefined || !(_.isObject(existing))) {
                    var gp = {
                        groupId: group.groupId,
                        productId: loan.productId,
                        dueAmount: totalDue,
                        //chargesDue: loan['chargesDue'],
                        currencyCode: loan.currency.code,
                        currencySymbol: loan.currency.displaySymbol
                    };
                    scope.loanGroupsTotal.push(gp);
                } else {
                    existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(totalDue)) * 100) / 100;
                }
            };

            scope.getLoanTotalDueAmount = function(loan){
                var principalInterestDue = loan.totalDue;
                if (isNaN(principalInterestDue)) {
                    principalInterestDue = 0;
                }
                return Math.ceil((Number(principalInterestDue)) * 100) / 100;
            };
            /**
             * Sum of savings dues across all groups group by savings product id
             */
            scope.sumSavingsDueCollection = function () {
                scope.savingsTotal = [];
                _.each(scope.savingsGroupsTotal, function (group) {
                    var dueAmount = group.dueAmount;
                    var withdrawAmount = group.withdrawAmount;
                    if (isNaN(dueAmount)) {
                        dueAmount = 0;
                    }
                    if(isNaN(withdrawAmount)){
                        withdrawAmount = 0;
                    }
                    var existing = _.findWhere(scope.savingsTotal, {productId: group.productId});
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            productId: group.productId,
                            currencyCode: group.currencyCode,
                            currencySymbol: group.currencySymbol,
                            dueAmount: dueAmount,
                            withdrawAmount: withdrawAmount
                        };
                        scope.savingsTotal.push(gp);
                    } else {
                        existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                        existing.withdrawAmount = Math.ceil((Number(existing.withdrawAmount)+Number(withdrawAmount))*100)/100;
                    }
                });
            };

            /**
             * Sum of loans dues across all groups group by loan product id
             */
            scope.sumLoansTotal = function () {
                scope.loansTotal = [];
                _.each(scope.loanGroupsTotal, function (group) {
                    var dueAmount = group.dueAmount;
                    if (isNaN(dueAmount)) {
                        dueAmount = 0;
                    }
                    var existing = _.findWhere(scope.loansTotal, {productId: group.productId});
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            productId: group.productId,
                            currencyCode: group.currencyCode,
                            currencySymbol: group.currencySymbol,
                            dueAmount: dueAmount
                        };
                        scope.loansTotal.push(gp);
                    } else {
                        existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                    }
                });
            };

            scope.constructBulkLoanAndSavingsRepaymentTransactions = function(){
                if(!_.isUndefined(scope.collectionsheetdata.groups)){
                    scope.bulkRepaymentTransactions = [];
                    scope.bulkSavingsTransactions = [];
                    _.each(scope.collectionsheetdata.groups, function (group) {
                        _.each(group.clients, function (client) {
                            _.each(client.savings, function (saving) {
                                var dueAmount = saving.dueAmount;
                                var withdrawAmount = saving.withdrawAmount;
                                if (isNaN(dueAmount)) {
                                    dueAmount = 0;
                                }
                                var savingsTransaction = {
                                    savingsId:saving.savingsId,
                                    transactionAmount:dueAmount,
                                    withdrawAmount: withdrawAmount
                                };
                                scope.bulkSavingsTransactions.push(savingsTransaction);
                            });

                            _.each(client.loans, function (loan) {
                                var totalDue = scope.getLoanTotalDueAmount(loan);
                                var loanTransaction = {
                                    loanId:loan.loanId,
                                    transactionAmount:totalDue
                                };
                                scope.bulkRepaymentTransactions.push(loanTransaction);
                            });
                        });
                    }
                );
                }
            };

            scope.constructClientChargesPayment = function(){
                scope.chargeTransactions = [];
                _.each(scope.groups, function (group) {
                    _.each(group.clients, function (client) {
                        var totalchargeEntered = client.charge;
                        var clientChargeAmount;
                        for(var i in client.id) {
                            if (client.id[i]) {
                                if(client.amountArray[i] <= totalchargeEntered) {
                                    clientChargeAmount =client.amountArray[i];
                                    totalchargeEntered = totalchargeEntered -client.amountArray[i];
                                }else{
                                    clientChargeAmount = totalchargeEntered;
                                }
                                var chargeTransaction = {
                                    groupId: group.groupId,
                                    clientId: client.clientId,
                                    chargeId: client.id[i],
                                    transactionAmount: clientChargeAmount
                                };
                                scope.chargeTransactions.push(chargeTransaction);
                            }
                        }


                    });
                });

            };

            scope.resetCollectionReasons = function(amount, index){
                if(amount>0 && index>=0 && scope.loanRejectReason && scope.loanRejectReason.length>0){
                    scope.loanRejectReason[index].codeReasonId = undefined;
                    scope.loanRejectReason[index].reasonId = undefined;
                    scope.loanRejectReason[index].reason = undefined;
                    scope.isDescriptionAvailable(scope.loanRejectReason[index]);
                }
            };

            scope.calculateTotalCollectionDue = function(){
                if(scope.totalDueCollection.length > 0) {
                    for (var i in scope.totalDueCollection) {
                        var dueAmount = scope.totalDueCollection[i].dueAmount;
                        var clientChargeAmount = scope.totalDueCollection[i].clientChargeAmount;
                        var withdrawAmount = scope.totalDueCollection[i].withdrawAmount;
                        if (isNaN(dueAmount)) {
                            dueAmount = 0;
                        }
                        if (isNaN(clientChargeAmount)) {
                            clientChargeAmount = 0;
                        }
                        if (isNaN(withdrawAmount)) {
                            withdrawAmount = 0;
                        }
                        scope.totalDueCollection[i].totalDue = Math.ceil((Number(dueAmount) + Number(clientChargeAmount) - Number(withdrawAmount)) * 100) / 100;
                    }
                }
            }

            scope.submit = function () {
                
                if (scope.showPaymentDetails && scope.isRecieptNumbermandatory){
                    if((scope.paymentDetail.receiptNumber == null || scope.paymentDetail.receiptNumber == "")){
                        scope.setErrorMessage('error.msg.receipt.number.mandatory');
                        return;
                    }
                    if((_.isUndefined(scope.paymentDetail.paymentTypeId) || scope.paymentDetail.paymentTypeId == null || scope.paymentDetail.paymentTypeId == "")){
                        scope.setErrorMessage('error.msg.payment.type.mandatory');
                        return;
                    }

                }

                scope.formData.calendarId = scope.calendarId;
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;

                if (scope.date.newtransactionDate) {
                    scope.formData.transactionDate = dateFilter(scope.date.newtransactionDate, scope.df);
                    scope.formData.isTransactionDateOnNonMeetingDate = true;
                }else{
                    scope.formData.transactionDate = dateFilter(scope.date.transactionDate, scope.df);
                    scope.formData.isTransactionDateOnNonMeetingDate = false;
                }

                scope.formData.actualDisbursementDate = this.formData.transactionDate;
                
                _.each(scope.savingsgroups, function (group) {
                    _.each(group.clients, function (client) {
                        var clientAttendanceDetails = {
                            clientId: client.clientId,
                            attendanceType: client.attendanceType.id
                        };
                        scope.clientsAttendance.push(clientAttendanceDetails);
                    });
                });
                scope.updateAttendenceData();

                if(scope.showPaymentDetails && scope.paymentDetail && scope.paymentDetail.paymentTypeId != ""){
                    scope.formData.paymentTypeId = scope.paymentDetail.paymentTypeId;
                    scope.formData.accountNumber = scope.paymentDetail.accountNumber;
                    scope.formData.checkNumber = scope.paymentDetail.checkNumber;
                    scope.formData.routingCode =scope.paymentDetail.routingCode;
                    scope.formData.receiptNumber = scope.paymentDetail.receiptNumber;
                    scope.formData.bankNumber = scope.paymentDetail.bankNumber;
                }

                scope.formData.bulkDisbursementTransactions = [];
                //construct loan repayment and savings due transactions
                scope.constructBulkLoanAndSavingsRepaymentTransactions();
                scope.constructClientChargesPayment();
                scope.updatebulkRepaymentTransactionsWithReason();
                scope.formData.bulkRepaymentTransactions = scope.bulkRepaymentTransactions;
                scope.formData.bulkSavingsTransactions = scope.bulkSavingsTransactions;
                scope.formData.clientChargeTransactions = scope.chargeTransactions;
                if (scope.forcedSubmit == true) {
                    scope.formData.forcedSubmitOfCollectionSheet = true;
                }
                if (scope.productiveCollctionSheetSearchParams.transactionDate != undefined && scope.productiveCollctionSheetSearchParams.transactionDate != null) {
                    scope.formData.searchParams = scope.productiveCollctionSheetSearchParams;
                }
                if(scope.errorDetails){
                    delete scope.errorDetails;

                }
                if (centerOrGroupResource === "centerResource") {
                    resourceFactory.centerV2Resource.save({'centerId': scope.centerId, command: 'saveCollectionSheet'}, scope.formData, function (data) {
                        location.path('/viewallcollections');
                    },
                        function(data){
                            if(data.data.errors[0].userMessageGlobalisationCode == "error.msg.Collection.has.already.been.added") {
                                scope.forcedSubmit = true;
                                scope.formData.forcedSubmitOfCollectionSheet = true;
                                scope.collectionsheetdata = "";
                            }
                            scope.setErrorMessage(data.data.errors[0].userMessageGlobalisationCode);
                        });
                } else if (centerOrGroupResource === "groupResource") {
                    resourceFactory.groupV2Resource.save({'groupId': scope.groupId, command: 'saveCollectionSheet'}, scope.formData, function (data) {
                        location.path('/viewallcollections');
                    },
                        function(data){
                            if(data && data.data && data.data.errors[0].userMessageGlobalisationCode) {
                                if(data.data.errors[0].userMessageGlobalisationCode == "error.msg.Collection.has.already.been.added"){
                                    scope.forcedSubmit = true;
                                    scope.formData.forcedSubmitOfCollectionSheet = true;
                                    scope.collectionsheetdata = "";
                                }
                                scope.setErrorMessage(data.data.errors[0].userMessageGlobalisationCode);
                            }
                        });
                }

            };

            scope.setErrorMessage = function(errorMessage){
                scope.errorDetails = [];
                var errorObj = new Object();
                errorObj.args = {
                    params: []
                };
                errorObj.args.params.push({value: errorMessage});
                scope.errorDetails.push(errorObj);
            };

            scope.updateAttendenceData = function () {
                var clientsAttendanceDetails =[];
                if(scope.collectionsheetdata.groups){
                    scope.groups = scope.collectionsheetdata.groups;
                    var gl = scope.groups.length;
                    for (var i = 0; i < gl; i++) {
                        scope.clients = scope.groups[i].clients;
                        var cl = scope.clients.length;
                        for (var j = 0; j < cl; j++) {
                            var attendence = {};
                            attendence.clientId = scope.clients[j].clientId;
                            attendence.reasonId = scope.clients[j].reasonId;
                            attendence.reason = scope.clients[j].reason;
                            attendence.attendanceType = scope.clients[j].attendanceType;
                            if (attendence.clientId) {
                                clientsAttendanceDetails.push(attendence);
                            }
                        }
                    };
                }
                scope.formData.clientsAttendance = clientsAttendanceDetails;
            };

            scope.updatebulkRepaymentTransactionsWithReason = function(){
                for(var i in scope.bulkRepaymentTransactions){
                    var loanId = scope.bulkRepaymentTransactions[i].loanId;                    
                    if(scope.loanRejectReason[loanId]){
                        if(scope.loanRejectReason[loanId].reasonId){
                            scope.bulkRepaymentTransactions[i].reasonId = scope.loanRejectReason[loanId].reasonId;
                        }
                        if(scope.loanRejectReason[loanId].reason){
                            scope.bulkRepaymentTransactions[i].reason = scope.loanRejectReason[loanId].reason;
                        }

                    }
                }
            };

            scope.getLoanSubReasonValues = function(loanId, codeId){

                if(loanId != undefined && codeId!= undefined){
                    scope.loanRejectReason[loanId].reasonId = undefined;
                    scope.loanRejectReason[loanId].reason = undefined;
                    for(var i in scope.collectionReasonList){
                        if(scope.collectionReasonList[i].id==codeId){
                            scope.loanRejectReason[loanId].codeValueOptions =  scope.collectionReasonList[i].values;
                        }
                    }
                }
            };
           scope.isFDAccount = function(savings){
             return (savings.depositAccountType.code == "depositAccountType.fixedDeposit");              
            }
            scope.isDescriptionAvailable = function(data){
                scope.showText = false;
                if(data && data.reasonId && data.codeReasonId){
                    for(var i in scope.collectionReasonList){
                        if(scope.collectionReasonList[i].id==data.codeReasonId && scope.collectionReasonList[i].name =='Others(collections)'){
                            for(var j in scope.collectionReasonList[i].values){
                                if(scope.collectionReasonList[i].values[j].id==data.reasonId && scope.collectionReasonList[i].values[j].name =='Others'){
                                    scope.showText = true;
                                }
                            }
                        }
                    }
                } 
                return scope.showText;
            };
            scope.validateAmount = function(groupIndex,clientIndex,loanIndex,updateLoanAmount){
                var loanAmount = scope.colectionsSheetsCopy[groupIndex].clients[clientIndex].loans[loanIndex].totalDue;
                if(!_.isUndefined(loanAmount) && (loanAmount != updateLoanAmount)){
                    scope.savingsgroups[groupIndex].clients[clientIndex].loans[loanIndex].isShowReasonDropDown = true;
                }else{
                    scope.savingsgroups[groupIndex].clients[clientIndex].loans[loanIndex].isShowReasonDropDown = false;
                }
            }

            scope.populateEmiAmount = function(data){
                scope.showEmiAmountOverTotalDue = true;
                _.each(data.groups, function (group) {
                    _.each(group.clients,function(client){
                        _.each(client.loans,function(loan){
                            if(!_.isUndefined(loan.installmentAmount) && loan.totalDue > 0 && !loan.lastPayment){
                                loan.totalDue = loan.installmentAmount;
                            }
                        });
                    });
                });
                scope.sumTotalDueCollection();
            }
            scope.populateTotalDue = function(){
                scope.showEmiAmountOverTotalDue = false;
                scope.collectionsheetdata = angular.copy(scope.originalCollectionsheetData);
                scope.sumTotalDueCollection();
            }
        }
    })
    ;
    mifosX.ng.application.controller('CollectionSheetController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', 'localStorageService',
            '$route', '$timeout', mifosX.controllers.CollectionSheetController]).run(function ($log) {
            $log.info("CollectionSheetController initialized");
        });
}
    (mifosX.controllers || {})
    )
;
