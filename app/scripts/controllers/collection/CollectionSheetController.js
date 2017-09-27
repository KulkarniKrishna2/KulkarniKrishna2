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
            scope.isRecieptNumbermandatory = scope.response.uiDisplayConfigurations.paymentDetails.isMandatory.receiptNumber;
            scope.hideLoanAccountNumber = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.loanAccountNumber;
            scope.hideSavingsAccountNumber = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.savingsAccountNumber;
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
                    resourceFactory.employeeResource.getAllEmployees({officeId: officeId, status: 'active'}, function (data) {
                        scope.loanOfficers = data.pageItems;
                    });

                    resourceFactory.centerResource.getAllCenters({officeId: scope.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data;
                    });

                    resourceFactory.groupResource.getAllGroups({officeId: scope.officeId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
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
                    scope.loanOfficerId = loanOfficerId;
                    resourceFactory.centerResource.getAllCenters({officeId: scope.officeId, staffId: loanOfficerId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data;
                    });

                    resourceFactory.groupResource.getAllGroups({officeId: scope.officeId, staffId: loanOfficerId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
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
                        if(angular.lowercase(scope.paymentTypeOptions[i].name) == 'cash'){
                            scope.paymentDetail.paymentTypeId = scope.paymentTypeOptions[i].id;
                            break;
                        }
                    }
                }else{
                    scope.paymentDetail.paymentTypeId = "";
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
                scope.showPaymentDetails = false;
                if (scope.date.transactionDate) {
                    scope.formData.transactionDate = dateFilter(scope.date.transactionDate, scope.df);
                }
                if (centerOrGroupResource === "centerResource" && scope.calendarId !== "") {
                    var searchParameters = {officeId : scope.officeId, transactionDate : scope.formData.transactionDate, staffId : scope.loanOfficerId, centerId : scope.centerId,
                        locale :scope.optlang.code, dateFormat : scope.df};
                    scope.productiveCollctionSheetSearchParams = searchParameters;
                    resourceFactory.centerResource.save({'centerId': scope.centerId, command: 'generateCollectionSheet'}, scope.formData, function (data) {
                        if (data.groups.length > 0) {
                            scope.collectionsheetdata = scope.parseClientCharge(data);
                            scope.paymentTypeOptions = data.paymentTypeOptions;
                            if(scope.collectionsheetdata != "" && scope.isRecieptNumbermandatory){
                                scope.showPaymentDetails = true;
                                scope.showPaymentDetailsFn();
                            }
                            scope.clientsAttendanceArray(data.groups);
                            //scope.total(data);
                            scope.savingsgroups = data.groups;
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
                        if (data.groups.length > 0) {
                            scope.collectionsheetdata = scope.parseClientCharge(data);
                            scope.paymentTypeOptions = data.paymentTypeOptions;
                            if(scope.collectionsheetdata != "" && scope.isRecieptNumbermandatory){
                                scope.showPaymentDetails = true;
                                scope.showPaymentDetailsFn();
                            }
                            scope.clientsAttendanceArray(data.groups);
                            //scope.total(data);
                            scope.savingsgroups = data.groups;
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
                        scope.paymentTypeOptions = data.paymentTypeOptions;
                    });
                }
            };

            scope.parseClientCharge = function (data) {
                scope.groups = data.groups;
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
                scope.addClientChargeTotalDue();
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
                _.each(scope.savingsgroups, function (group) {
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

            scope.clientsAttendanceArray = function (groups) {
                var gl = groups.length;
                for (var i = 0; i < gl; i++) {
                    scope.clients = groups[i].clients;
                    var cl = scope.clients.length;
                    for (var j = 0; j < cl; j++) {
                        scope.client = scope.clients[j];
                        if (scope.client.attendanceType.id === 0) {
                            scope.client.attendanceType.id = 1;
                        }
                    }
                }
            };

            scope.constructBulkLoanAndSavingsRepaymentTransactions = function(){
                scope.bulkRepaymentTransactions = [];
                scope.bulkSavingsTransactions = [];
                _.each(scope.savingsgroups, function (group) {
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

                if (scope.showPaymentDetails && scope.isRecieptNumbermandatory && (scope.paymentDetail.receiptNumber == null || scope.paymentDetail.receiptNumber == "")){
                    scope.setErrorMessage('error.msg.receipt.number.mandatory');
                    return;
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
                scope.formData.clientsAttendance = scope.clientsAttendance;

                if(scope.showPaymentDetails && scope.paymentDetail.paymentTypeId != ""){
                    scope.formData.paymentTypeId = scope.paymentDetail.paymentTypeId;
                    scope.formData.accountNumber = scope.paymentDetail.accountNumber;
                    scope.formData.checkNumber = scope.paymentDetail.checkNumber;
                    scope.formData.routingCode =scope.paymentDetail.routingCode;
                    scope.formData.receiptNumber = scope.paymentDetail.receiptNumber;
                    scope.formData.bankNumber = scope.paymentDetail.bankNumber;
                }
                if(scope.response && scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.paymentTypeId) {
                    scope.formData.paymentTypeId = scope.response.uiDisplayConfigurations.loanAccount.isDefaultValue.paymentTypeId;
                }
                scope.formData.bulkDisbursementTransactions = [];
                //construct loan repayment and savings due transactions
                scope.constructBulkLoanAndSavingsRepaymentTransactions();
                scope.constructClientChargesPayment();
                scope.formData.bulkRepaymentTransactions = scope.bulkRepaymentTransactions;
                scope.formData.bulkSavingsTransactions = scope.bulkSavingsTransactions;
                scope.formData.clientChargeTransactions = scope.chargeTransactions;
                if (scope.forcedSubmit == true) {
                    scope.formData.forcedSubmitOfCollectionSheet = true;
                }
                if (scope.productiveCollctionSheetSearchParams.transactionDate != undefined && scope.productiveCollctionSheetSearchParams.transactionDate != null) {
                    scope.formData.searchParams = scope.productiveCollctionSheetSearchParams;
                }
                if (centerOrGroupResource === "centerResource") {
                    resourceFactory.centerResource.save({'centerId': scope.centerId, command: 'saveCollectionSheet'}, scope.formData, function (data) {
                        localStorageService.addToLocalStorage('Success', true);
                        route.reload();
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
                    resourceFactory.groupResource.save({'groupId': scope.groupId, command: 'saveCollectionSheet'}, scope.formData, function (data) {
                        localStorageService.addToLocalStorage('Success', true);
                        route.reload();
                    },
                        function(data){
                            if(data.data.errors[0].userMessageGlobalisationCode == "error.msg.Collection.has.already.been.added") {
                                scope.forcedSubmit = true;
                                scope.formData.forcedSubmitOfCollectionSheet = true;
                                scope.collectionsheetdata = "";
                            }
                            scope.setErrorMessage(data.data.errors[0].userMessageGlobalisationCode);
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
