(function (module) {
    mifosX.controllers = _.extend(module, {
        ProductiveCollectionSheetController: function (scope, routeParams, resourceFactory, dateFilter, location) {
            var params = {};
            params.locale = scope.optlang.code;
            params.dateFormat = scope.df;
            params.meetingDate = routeParams.meetingDate;
            params.officeId = routeParams.officeId;
            params.staffId = routeParams.staffId;
            if (params.staffId === "undefined") {
                params.staffId = null;
            }
            var centerIdArray = [];
            scope.submitNextShow = true;
            scope.submitShow = false;
            scope.forcedSubmit=false;
            scope.completedCenter = false;
            scope.officeName = routeParams.officeName;
            scope.meetingDate = routeParams.meetingDate;
            var submittedStaffId = [];
            scope.details = false;
            scope.clientsAttendance = [];
            scope.reasonAttendenceList = [];
            scope.absentAttendenceType = 4;
            scope.leaveAttendenceType = 2;
            scope.attendenceListForReason = [scope.absentAttendenceType,scope.leaveAttendenceType];
            scope.loanRejectReason = {};
            scope.showText = false;
            scope.productiveCollctionSheetSearchParams = {};
            scope.collectionReasonList = [];
            scope.showRejectReason = false;
            scope.isRejectReasonMandatory = false;
            scope.requiredFieldErrorMessage = "Required field";
            scope.savingsGroupsTotal = [];
            scope.isWithDrawForSavingsIncludedInCollectionSheet = false;


            resourceFactory.configurationResource.get({configName:'reason-code-allowed'}, function (data) {
                scope.showRejectReason = data.enabled;
            });

            if(scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.workflow &&
                scope.response.uiDisplayConfigurations.workflow.isMandatory){
                if(scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason){
                   scope.isRejectReasonMandatory = scope.response.uiDisplayConfigurations.workflow.isMandatory.rejectReason; 
                }
            }
            if (scope.response && scope.response.uiDisplayConfigurations && scope.response.uiDisplayConfigurations.collectionSheet && scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild) {
                scope.hideSavingsAccountNumber = scope.response.uiDisplayConfigurations.collectionSheet.isHiddenFeild.savingsAccountNumber;
            }
            resourceFactory.centerResource.getAllMeetingFallCenters(params, function (data) {
                if (data[0]) {
                    scope.staffCenterData = data[0].meetingFallCenters;
                    for (var i = 0; i < scope.staffCenterData.length; i++) {
                        centerIdArray.push({id: scope.staffCenterData[i].id, calendarId: scope.staffCenterData[i].collectionMeetingCalendar.id});
                    }
                    scope.getAllGroupsByCenter(data[0].meetingFallCenters[0].id, data[0].meetingFallCenters[0].collectionMeetingCalendar.id);
                }
            });

            resourceFactory.codeHierarchyResource.get({codeName: 'Reject Reason',childCodeName:'AttendanceReason'}, function (data) {
                scope.reasonAttendenceList = data;
            });

            resourceFactory.codeHierarchyResource.get({codeName: 'Reject Reason',childCodeName:'CollectionReason'}, function (data) {
                scope.collectionReasonList = data;
            });

            scope.setvalues = function(index){
                scope.clientsAttendance[index].codeReasonId = undefined;
                scope.clientsAttendance[index].codeValueOptions = undefined;
                scope.clientsAttendance[index].reason = undefined;
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
                }else{
                    scope.loanRejectReason[loanId].reasonId = undefined;
                    scope.loanRejectReason[loanId].reason = undefined;
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
                            if(index){
                                scope.clientsAttendance[index].codeValueOptions =  scope.reasonAttendenceList[i].values;
                            }                            
                        }
                    }
                }else{
                    return false;
                }
            }

            scope.getValues = function(index, codeId){
                for(var i in scope.reasonAttendenceList){
                    if(scope.reasonAttendenceList[i].id==codeId){
                        scope.clientsAttendance[index].codeValueOptions =  scope.reasonAttendenceList[i].values;
                    }
                }
                return [];
            };

            scope.getLoanReasons = function(loanId, codeId){
                for(var i in scope.reasonAttendenceList){
                    if(scope.reasonAttendenceList[i].id==codeId){
                        scope.clientsAttendance[index].codeValueOptions =  scope.reasonAttendenceList[i].values;
                    }
                }
                return [];
            };

            scope.detailsShow = function() {
                if (scope.details) {
                    scope.details = false;
                } else {
                    scope.details = true;
                }
            }

            scope.getAllGroupsByCenter = function (centerId, calendarId) {
                scope.clientsAttendance = [];
                scope.submitNextShow = true;
                scope.submitShow = false;
                scope.forcedSubmit=false;
                if (centerIdArray.length-1 === submittedStaffId.length || centerIdArray.length === 1) {
                    scope.submitNextShow = false;
                    scope.submitShow = true;
                    scope.forcedSubmit=false;
                }
                scope.selectedTab = centerId;
                scope.centerId = centerId;
                scope.calendarId = calendarId;
                scope.formData = {};
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                scope.formData.calendarId = scope.calendarId;
                scope.formData.transactionDate = routeParams.meetingDate;
                for (var i = 0; i < submittedStaffId.length; i++) {
                    if (centerId == submittedStaffId[i].id) {
                        scope.submitNextShow = false;
                        scope.submitShow = false;
                        scope.forcedSubmit=false;
                        break;
                    }
                }
                

                resourceFactory.centerResource.save({'centerId': scope.centerId, command: 'generateCollectionSheet'}, scope.formData, function (data) {
                    scope.collectionsheetdata = data;
                    scope.attendanceTypeOptions = scope.response.uiDisplayConfigurations.attendanceTypeOptions;

                    if (!_.isUndefined(scope.attendanceTypeOptions)) {
                        scope.collectionsheetdata.attendanceTypeOptions = scope.attendanceTypeOptions;
                    }
                    scope.savingsgroups = data.groups;
                    scope.isWithDrawForSavingsIncludedInCollectionSheet = data.isWithDrawForSavingsIncludedInCollectionSheet;
                    scope.clientsAttendanceArray(data.groups);
                    scope.clientsAttendanceList(data.groups);
                    scope.sumTotalDueCollection();
                });
            };

            scope.resetCollectionReasons = function(amount , index){
                if(amount>0 && index>=0){
                    scope.loanRejectReason[index].codeReasonId = undefined;
                    scope.loanRejectReason[index].reasonId = undefined;
                    scope.loanRejectReason[index].reason = undefined;
                    scope.isDescriptionAvailable(scope.loanRejectReason[index]);
                }
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

            scope.clientsAttendanceList = function (groups) {
                var gl = groups.length;
                var count = 0;
                for (var i = 0; i < gl; i++) {
                    scope.clients = groups[i].clients;
                    var cl = scope.clients.length;
                    for (var j = 0; j < cl; j++) {
                        scope.clientsAttendance[count] = {};
                        scope.client = scope.clients[j];
                        if (scope.client.attendanceType.id === 0) {
                            scope.clientsAttendance[count].attendanceType = 1;
                        }
                        scope.clientsAttendance[count].clientId = scope.client.clientId;
                        count = count+1;
                    }
                }
            };

            function deepCopy(obj) {
                if (Object.prototype.toString.call(obj) === '[object Array]') {
                    var out = [], i = 0, len = obj.length;
                    for (; i < len; i++) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                if (typeof obj === 'object') {
                    var out = {}, i;
                    for (i in obj) {
                        out[i] = arguments.callee(obj[i]);
                    }
                    return out;
                }
                return obj;
            }

            scope.viewFullScreen = function () {
                var element = document.getElementById("productive_sheet");
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            };

            scope.submit = function () {
                
                scope.formData.calendarId = scope.calendarId;
                scope.formData.dateFormat = scope.df;
                scope.formData.locale = scope.optlang.code;
                scope.formData.transactionDate = dateFilter(routeParams.meetingDate, scope.df);
                scope.updateAttendenceData();
                scope.formData.bulkDisbursementTransactions = [];
                scope.updatebulkRepaymentTransactionsWithReason();
                scope.constructBulkLoanAndSavingsRepaymentTransactions();
                scope.formData.bulkRepaymentTransactions = scope.bulkRepaymentTransactions;
                scope.formData.bulkSavingsTransactions = scope.bulkSavingsTransactions;
                scope.formData.forcedSubmitOfCollectionSheet=false;
                if (scope.forcedSubmit == true) {
                    scope.formData.forcedSubmitOfCollectionSheet = true;
                }
                scope.forcedSubmit = false;
                var searchParameters = {transactionDate : scope.formData.transactionDate,locale :scope.optlang.code, dateFormat : scope.df};
                if(params.officeId){
                    searchParameters.officeId = params.officeId
                }
                if(params.officeId){
                    searchParameters.staffId = params.staffId
                }
                if(scope.centerId){
                    searchParameters.centerId = params.centerId
                }
                scope.productiveCollctionSheetSearchParams = searchParameters;
                if (scope.productiveCollctionSheetSearchParams.transactionDate != undefined && scope.productiveCollctionSheetSearchParams.transactionDate != null) {
                    scope.formData.searchParams = scope.productiveCollctionSheetSearchParams;
                }
                if(scope.isRejectReasonMandatory==true){
                    if(scope.collectionReasonList.length>0){
                        var isValid = scope.validateForMandatoryCollectionReason(scope.formData.bulkRepaymentTransactions);
                        if(isValid==false){
                            return isValid;
                        }
                    }
                    if(scope.reasonAttendenceList.length>0){
                        var isValid = scope.validateForMandatoryAttendenceReason(scope.formData.clientsAttendance);
                        if(isValid==false){
                            return isValid;
                        }
                    }
                    
                }
                resourceFactory.centerResource.save({'centerId': scope.centerId, command: 'saveCollectionSheet'}, scope.formData, function (data) {
                    for (var i = 0; i < centerIdArray.length; i++) {
                        if (scope.centerId === centerIdArray[i].id && centerIdArray.length >= 1) {
                            scope.staffCenterData[i].submitted = true;
                            submittedStaffId.push({id: scope.staffCenterData[i].id});
                        }
                    }

                    if (centerIdArray.length === submittedStaffId.length) {
                        location.path('/entercollectionsheet');
                    }

                    if (centerIdArray.length-1 === submittedStaffId.length) {
                        scope.submitNextShow = false;
                        scope.submitShow = true;
                        scope.forcedSubmit=false;
                    }
                    for (var i = 0; i < centerIdArray.length; i++) {
                        if (!scope.staffCenterData[i].submitted) {
                            scope.getAllGroupsByCenter(deepCopy(scope.staffCenterData[i].id), deepCopy(scope.staffCenterData[i].collectionMeetingCalendar.id));
                            break;
                        }
                    }
                }, function(data){
                    if(data.data.errors[0].userMessageGlobalisationCode == "error.msg.Collection.has.already.been.added") {
                        scope.forcedSubmit = true;
                        scope.submitShow = false;
                        scope.submitNextShow = false;
                        scope.formData.forcedSubmitOfCollectionSheet = true;
                    }
                });
            };

            scope.validateForMandatoryAttendenceReason = function(data){                
                for(var i in data){

                    if(scope.attendenceListForReason.indexOf(data[i].attendanceType)>-1){
                        if(data[i].reasonId==undefined){
                            scope.clientsAttendance[i].error = scope.requiredFieldErrorMessage;
                            return false;
                        }else{
                           var isTextRequired = scope.isTextAvailable(scope.clientsAttendance[i]);
                                if(isTextRequired==true && data[i].reason == undefined){
                                    scope.clientsAttendance[i].error = scope.requiredFieldErrorMessage;
                                    return false;
                                }else{
                                    scope.clientsAttendance[i].error = undefined;
                                }
                        }
                    }
                }
                return true;
            };

            scope.validateForMandatoryCollectionReason = function(data){                
                for(var i in data){
                    if(data[i].transactionAmount==0){
                        if(data[i].reasonId==undefined){
                            if(scope.loanRejectReason[data[i].loanId]==undefined){
                                scope.loanRejectReason[data[i].loanId] = {};                                
                            }
                            scope.loanRejectReason[data[i].loanId].error = scope.requiredFieldErrorMessage;
                            return false;
                        }else{
                            scope.isDescriptionAvailable(scope.loanRejectReason[data[i].loanId]);
                                if(scope.showText==true && data[i].reason == undefined){
                                    scope.loanRejectReason[data[i].loanId].error = scope.requiredFieldErrorMessage;
                                    return false;
                                }else{
                                    scope.loanRejectReason[data[i].loanId].error = undefined;
                                }
                        }

                    }
                }
                return true;
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

            scope.updateAttendenceData = function(){
                var clientsAttendanceDetails =[];
                for (var i in scope.clientsAttendance) {
                    var attendence = {};
                    attendence.clientId = scope.clientsAttendance[i].clientId;
                    attendence.reasonId = scope.clientsAttendance[i].reasonId;
                    attendence.reason = scope.clientsAttendance[i].reason;
                    attendence.attendanceType = scope.clientsAttendance[i].attendanceType;
                    if(attendence.clientId) {
                        clientsAttendanceDetails.push(attendence);
                    }
                };
                scope.formData.clientsAttendance = clientsAttendanceDetails;
            };

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
            };
            scope.sumTotalDueCollection = function () {
                scope.totalDueCollection = [];
                scope.sumGroupDueCollection();
                scope.sumSavingsDueCollection();
                scope.sumLoansTotal();
                scope.sumLoansDueByCurrency();
                scope.sumSavingsDueByCurrency();
                scope.sumSavingWithdrawByCurrency();
                scope.calculateTotalSavingsDue();
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
                    if (isNaN(withdrawAmount)) {
                        withdrawAmount = 0;
                    }
                    var existing = _.findWhere(scope.savingsTotal, { productId: group.productId });
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            productId: group.productId,
                            currencyCode: group.currencyCode,
                            currencySymbol: group.currencySymbol,
                            dueAmount: dueAmount,
                            withdrawAmount: withdrawAmount,
                            totalsavings: dueAmount - withdrawAmount
                        };
                        scope.savingsTotal.push(gp);
                    } else {
                        existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                        existing.withdrawAmount = Math.ceil((Number(existing.withdrawAmount) + Number(withdrawAmount)) * 100) / 100;
                        existing.totalsavings = Math.ceil((Number(existing.totalsavings) + Number(totalsavings)) * 100) / 100;
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
                    var existing = _.findWhere(scope.loansTotal, { productId: group.productId });
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


            scope.sumLoansDueByCurrency = function () {
                _.each(scope.loansTotal, function (loan) {
                    scope.currencyCode = loan.currencyCode;
                    scope.currencySymbol = loan.currencySymbol;
                    var existing = _.findWhere(scope.totalDueCollection, { currencyCode: loan.currencyCode });
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
                    var existing = _.findWhere(scope.totalDueCollection, { currencyCode: saving.currencyCode });
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
                    var existing = _.findWhere(scope.totalDueCollection, { currencyCode: saving.currencyCode });
                    var withdrawAmount = saving.withdrawAmount;
                    if (isNaN(withdrawAmount)) {
                        withdrawAmount = 0;
                    }
                    var netAmount = 0;
                    netAmount = netAmount - withdrawAmount
                    if (existing == undefined || !(_.isObject(existing))) {
                        var gp = {
                            currencyCode: saving.currencyCode,
                            currencySymbol: saving.currencySymbol,
                            withdrawAmount: withdrawAmount
                        };
                        scope.totalDueCollection.push(gp);
                    } else {
                        var existingWithdrawAmount = existing.withdrawAmount;
                        if (isNaN(existingWithdrawAmount)) {
                            existingWithdrawAmount = 0;
                        }
                        existing.withdrawAmount = Math.ceil((Number(existingWithdrawAmount) + Number(withdrawAmount)) * 100) / 100;
                    }
                });
            };

            scope.calculateTotalSavingsDue = function () {
                if (scope.totalDueCollection.length > 0) {
                    for (var i in scope.totalDueCollection) {
                        var dueAmount = scope.totalDueCollection[i].dueAmount;
                        var withdrawAmount = scope.totalDueCollection[i].withdrawAmount;
                        if (isNaN(dueAmount)) {
                            dueAmount = 0;
                        }
                        if (isNaN(withdrawAmount)) {
                            withdrawAmount = 0;
                        }
                        scope.totalDueCollection[i].totalDue = Math.ceil((Number(dueAmount) - Number(withdrawAmount)) * 100) / 100;
                    }
                }
            };
            /**
             * Sum of savings dues group by group id and savings product id
             * @param group
             * @param saving
             */
            scope.sumGroupSavingsDueCollection = function (group, saving) {
                scope.currencyCode = saving.currency.code;
                scope.currencySymbol = saving.currency.displaySymbol;
                var existing = _.findWhere(scope.savingsGroupsTotal, { groupId: group.groupId, productId: saving.productId });
                var dueAmount = saving.dueAmount;
                var withdrawAmount = saving.withdrawAmount;
                if (isNaN(dueAmount)) {
                    dueAmount = 0;
                }
                if (isNaN(withdrawAmount)) {
                    withdrawAmount = 0;
                }
                if (existing == undefined || !(_.isObject(existing))) {
                    var gp = {
                        groupId: group.groupId,
                        productId: saving.productId,
                        dueAmount: dueAmount,
                        withdrawAmount: withdrawAmount,
                        currencyCode: saving.currency.code,
                        currencySymbol: saving.currency.displaySymbol
                    };
                    scope.savingsGroupsTotal.push(gp);
                } else {
                    existing.dueAmount = Math.ceil((Number(existing.dueAmount) + Number(dueAmount)) * 100) / 100;
                    existing.withdrawAmount = Math.ceil((Number(existing.withdrawAmount) + Number(withdrawAmount)) * 100) / 100;
                }
            };
            /**
        * Sum of loans dues group by group id and loan product id
        * @param group
        * @param loan
        */
            scope.sumGroupLoansDueCollection = function (group, loan) {
                var existing = _.findWhere(scope.loanGroupsTotal, { groupId: group.groupId, productId: loan.productId });
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

            scope.isFDAccount = function (savings) {
                return (savings.depositAccountType.code == "depositAccountType.fixedDeposit");
            }
            scope.getLoanTotalDueAmount = function (loan) {
                var principalInterestDue = loan.totalDue;
                if (isNaN(principalInterestDue)) {
                    principalInterestDue = 0;
                }
                return Math.ceil((Number(principalInterestDue)) * 100) / 100;
            };
            scope.constructBulkLoanAndSavingsRepaymentTransactions = function () {
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
                                savingsId: saving.savingsId,
                                transactionAmount: dueAmount,
                                withdrawAmount: withdrawAmount
                            };
                            scope.bulkSavingsTransactions.push(savingsTransaction);
                        });

                        _.each(client.loans, function (loan) {
                            var totalDue = scope.getLoanTotalDueAmount(loan);
                            var loanTransaction = {
                                loanId: loan.loanId,
                                transactionAmount: totalDue
                            };
                            scope.bulkRepaymentTransactions.push(loanTransaction);
                        });
                    });
                }
                );
            };
        }
    });
    mifosX.ng.application.controller('ProductiveCollectionSheetController', ['$scope', '$routeParams', 'ResourceFactory', 'dateFilter', '$location', mifosX.controllers.ProductiveCollectionSheetController]).run(function ($log) {
        $log.info("ProductiveCollectionSheetController initialized");
    });
}(mifosX.controllers || {}));
