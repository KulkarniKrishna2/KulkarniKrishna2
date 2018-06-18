(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkRescheduleSavingsAccountInstallmentController: function (scope,location, resourceFactory, dateFilter) {
            scope.offices = [];
            scope.accounts = {};
            scope.first = {};
            scope.second = {};
            scope.third = {};
            scope.first.date = new Date();
            scope.second.date = new Date();
            scope.third.date = new Date();
            scope.savingsAccounts = [];
            scope.centerData ={};
            scope.groupMemberData = [];
            scope.clientMemberData = [];
            scope.groupMemberLoanData=[];
            scope.centerData.groupMembers = [];
            scope.centerData.clientMembers = [];
            scope.reschedule = false;
            scope.noDataFound = false;

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.getOfficers = function () {
                scope.isOfficeSelected = true;
                resourceFactory.fieldOfficersResource.retrievefieldOfficers({officeId: scope.officeId}, function (data) {
                    scope.officers = data;
                });
            };
            
            scope.retrieveSavingsInstallmentRescheduleData = function () {
                scope.savingsAccounts = [];
                scope.selectAll.checked = false;
                resourceFactory.savingsInstallmentRescheduleResource.get({officeId: scope.officeId, officerId: scope.fieldOfficerId, rescheduleFromDate: dateFilter(scope.first.date, scope.df)}, function (data) {
                    scope.accountSummaryCollection = data.accountSummaryCollection;
                    scope.centers = scope.accountSummaryCollection.centerDataList;
                    scope.groups = scope.accountSummaryCollection.groups;
                    scope.clients = scope.accountSummaryCollection.clients;
                    scope.codes = data.rescheduleReasons;
                    if(scope.centers.length > 0 || scope.groups.length > 0 || scope.clients.length > 0){
                        scope.noDataFound = false;
                        scope.reschedule = true; 
                    }else{
                        scope.noDataFound = true;
                        scope.reschedule = false;
                    }
                });
            };
  
            scope.expandAll = function (center, expanded) {
                center.isExpanded = expanded;
            };

            scope.expandGroup = function (group, expanded) {
                group.isExpanded = expanded;
            };
            scope.expandClient = function (client, expanded) {
                client.isExpanded = expanded;
            };

            scope.selectAll = function(value){
                scope.reschedule = true;
                for(var i =0 ; i < scope.centers.length ; i++) {
                    scope.centers[i].checked = value;
                    scope.centerLevel(value,scope.centers[i].id);     
                }
                for(var i =0 ; i < scope.groups.length ; i++){
                    scope.groups[i].checked = value;
                    scope.groupLevel(value,scope.groups[i].id);
                }
                for(var i=0; i<scope.clients.length; i++){
                    scope.clients[i].checked = value;
                    scope.officeClientLevel(value, scope.clients[i].id);
    
                }
            };
            
            scope.centerLevel = function(value,id){
                var centerIndex = scope.centers.findIndex(x => x.id == id);
                scope.centerData.groupMembers = scope.centers[centerIndex].groupMembers;
                scope.centerData.clientMembers = scope.centers[centerIndex].clientMembers;
                       
                if(value){
                    for(var i = 0; i < scope.centerData.groupMembers.length; i++){
                        scope.groupMemberData = scope.centerData.groupMembers[i].clientMembers;
                        scope.centerData.groupMembers[i].checked = true;
                        for(var j = 0; j < scope.groupMemberData.length; j++){
                            scope.clientMemberData = scope.groupMemberData[j].savingsAccountSummaryDatas;
                            scope.groupMemberData[j].checked = true;
                            for(var k = 0; k < scope.clientMemberData.length; k++){
                                scope.clientMemberData[k].checked = true;
                                scope.savingsAccounts.push(scope.clientMemberData[k].id);
                            }
                        }  
                    }

                    for(var i = 0; i < scope.centerData.clientMembers.length; i++){
                        scope.clientMemberData = scope.centerData.clientMembers[i].savingsAccountSummaryDatas;
                        scope.centerData.clientMembers[i].checked = true;
                        for(var j = 0; j < scope.clientMemberData.length; j++){
                            scope.clientMemberData[j].checked = true;
                            scope.savingsAccounts.push(scope.clientMemberData[j].id);
                        }
                    }

                } else{

                    for(var i = 0; i < scope.centerData.groupMembers.length; i++){
                        scope.groupMemberData = scope.centerData.groupMembers[i].clientMembers;
                        scope.centerData.groupMembers[i].checked = false;
                        for(var j = 0; j < scope.groupMemberData.length; j++){
                            scope.clientMemberData = scope.groupMemberData[j].savingsAccountSummaryDatas;
                            scope.groupMemberData[j].checked = false;
                            for(var k = 0; k < scope.clientMemberData.length; k++){
                                scope.clientMemberData[k].checked = false;
                                var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[k].id);
                                if(indexOfSavingsId >= 0){
                                    scope.savingsAccounts.splice(indexOfSavingsId, 1);
                                }
                            }
                        }  
                    }

                    for(var i = 0; i < scope.centerData.clientMembers.length; i++){
                        scope.clientMemberData = scope.centerData.clientMembers[i].savingsAccountSummaryDatas;
                        scope.centerData.clientMembers[i].checked = false;
                        for(var j = 0; j < scope.clientMemberData.length; j++){
                            scope.clientMemberData[j].checked = false;
                            var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[j].id);
                            if(indexOfSavingsId >= 0){
                                scope.savingsAccounts.splice(indexOfSavingsId, 1);
                            }
                        }
                    }
                }
            };

            scope.clientUnderCenterLevel = function(value, centerId, clientId){

                var centerClientIndex = scope.centers.findIndex(x => x.id == centerId);           
                scope.centerData.clientMembers = scope.centers[centerClientIndex].clientMembers;
                scope.clientMemberData = scope.centerData.clientMembers[scope.centerData.clientMembers.findIndex(x => x.id == clientId)].savingsAccountSummaryDatas;

                if(value){
                    for(var i= 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = true;
                        scope.savingsAccounts.push(scope.clientMemberData[i].id);
                    }
                } else{
                    for(var i = 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = false;
                        var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[i].id);
                        if(indexOfSavingsId >= 0){
                            scope.savingsAccounts.splice(indexOfSavingsId, 1);
                        }
                    }
                }
            };

            scope.centerGroupLevel = function(value, centerId, groupId){
                var centerIndex = scope.centers.findIndex(x => x.id == centerId);
                scope.centerData.groupMembers = scope.centers[centerIndex].groupMembers;
                var groupIndex = scope.centerData.groupMembers.findIndex(x => x.id == groupId);
                scope.groupMemberData = scope.centerData.groupMembers[groupIndex].clientMembers;

                if(value){
                    for(var i = 0; i < scope.groupMemberData.length; i++){
                        scope.clientMemberData = scope.groupMemberData[i].savingsAccountSummaryDatas;
                        scope.groupMemberData[i].checked = true;
                        for(var j = 0; j < scope.clientMemberData.length; j++){
                            scope.clientMemberData[j].checked = true;
                            scope.savingsAccounts.push(scope.clientMemberData[j].id);
                        }
                    }
                        
                }else{
                    for(var i = 0; i < scope.groupMemberData.length; i++){
                        scope.clientMemberData = scope.groupMemberData[i].savingsAccountSummaryDatas;
                        scope.groupMemberData[i].checked = false;
                        for(var j = 0; j < scope.clientMemberData.length; j++){
                            scope.clientMemberData[j].checked = false;
                            var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[j].id);
                            if(indexOfSavingsId >= 0){
                                scope.savingsAccounts.splice(indexOfSavingsId, 1);
                            }
                        }
                    }
                }
            };

            scope.centerGroupClientLevel = function(value, centerId, groupId, clientId){
                scope.centerData.groupMembers = scope.centers[scope.centers.findIndex(x => x.id == centerId)].groupMembers;
                scope.groupMemberData = scope.centerData.groupMembers[scope.centerData.groupMembers.findIndex(x => x.id == groupId)].clientMembers;   
                scope.clientMemberData = scope.groupMemberData[scope.groupMemberData.findIndex(x => x.id == clientId)].savingsAccountSummaryDatas;

                if(value){
                    for(var i = 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = true;
                        scope.savingsAccounts.push(scope.clientMemberData[i].id);
                    }
                } else{
                    for(var i = 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = false;
                        var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[i].id);
                        if(indexOfSavingsId >= 0){
                            scope.savingsAccounts.splice(indexOfSavingsId, 1);
                        }
                    }
                }
            };

            scope.centerGroupClientAccountLevel = function(value, centerId, groupId, clientId, accountId){
                scope.centerData.groupMembers = scope.centers[scope.centers.findIndex(x => x.id == centerId)].groupMembers;
                scope.groupMemberData = scope.centerData.groupMembers[scope.centerData.groupMembers.findIndex(x => x.id == groupId)].clientMembers;   
                scope.clientMemberData = scope.groupMemberData[scope.groupMemberData.findIndex(x => x.id == clientId)].savingsAccountSummaryDatas;
                scope.savingsData = scope.clientMemberData[scope.clientMemberData.findIndex(x => x.id == accountId)];
                if(value){
                    scope.savingsAccounts.push(scope.savingsData.id);
                }else{
                    var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.savingsData.id);
                    if(indexOfSavingsId >= 0){
                        scope.savingsAccounts.splice(indexOfSavingsId, 1);
                    }
                }   
            };


            scope.officeClientLevel = function(value, clientId){
                var officeClientIdex = scope.clients.findIndex(x => x.id == clientId);           
                scope.clientMemberData = scope.clients[scope.clients.findIndex(x => x.id == clientId)].savingsAccountSummaryDatas;
                if(value){
                    for(var i= 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = true;
                        scope.savingsAccounts.push(scope.clientMemberData[i].id);
                    }
                } else{
                    for(var i = 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = false;
                        var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[i].id);
                        if(indexOfSavingsId >= 0){
                            scope.savingsAccounts.splice(indexOfSavingsId, 1);
                        }
                    }
                }
            };          

            scope.groupLevel = function(value,groupId){
                var groupIndex = scope.groups.findIndex(x => x.id == groupId);
                scope.groupMemberData = scope.groups[groupIndex].clientMembers;
               
                if(value){
                    for(var i= 0; i < scope.groupMemberData.length; i++){
                        scope.clientMemberData = scope.groupMemberData[i].savingsAccountSummaryDatas;
                        scope.groupMemberData[i].checked = true;
                        for(var j = 0; j < scope.clientMemberData.length; j++){
                            scope.clientMemberData[j].checked = true;
                            scope.savingsAccounts.push(scope.clientMemberData[j].id);
                        }
                    }         
                }else{
                    for(var i = 0; i < scope.groupMemberData.length; i++){
                        scope.clientMemberData = scope.groupMemberData[i].savingsAccountSummaryDatas;
                        scope.groupMemberData[i].checked = false;
                        for(var j = 0; j < scope.clientMemberData.length; j++){
                            scope.clientMemberData[j].checked = false;
                            var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[j].id);
                            if(indexOfSavingsId >= 0){
                                scope.savingsAccounts.splice(indexOfSavingsId, 1);
                            }
                        }
                    }
                }
            };

            scope.groupClientLevel = function(value, groupId, clientId){
                var groupIndex = scope.groups.findIndex(x => x.id == groupId);
                scope.groupMemberData = scope.groups[groupIndex].clientMembers;

                var clientIndex = scope.groupMemberData.findIndex(x => x.id == clientId);
                scope.clientMemberData = scope.groupMemberData[clientIndex].savingsAccountSummaryDatas;

                if(value){
                    for(var i = 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = true;
                        scope.savingsAccounts.push(scope.clientMemberData[i].id);
                    }
                } else{
                    for(var i = 0; i < scope.clientMemberData.length; i++){
                        scope.clientMemberData[i].checked = false;
                        var indexOfSavingsId = scope.savingsAccounts.indexOf(scope.clientMemberData[i].id);
                        if(indexOfSavingsId >= 0){
                            scope.savingsAccounts.splice(indexOfSavingsId, 1);
                        }
                    }
                }
            };

            scope.accounts = function(value, accountId){
                if(value){
                    scope.savingsAccounts.push(accountId);
                }else{
                    var indexOfAcountId = scope.savingsAccounts.indexOf(10);
                    if(indexOfAcountId >= 0){
                        scope.savingsAccounts.splice(indexOfAcountId, 1);
                    }
                }
            };

            scope.submitDetails = function () {
                var rescheduleFromdate = dateFilter(scope.first.date, scope.df);
                this.formData.rescheduleFromDate = rescheduleFromdate;
                var rescheduledTodate = dateFilter(scope.second.date, scope.df);
                this.formData.adjustedDueDate = rescheduledTodate;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.savingsAccounts = scope.savingsAccounts;
                this.formData.rescheduleReasonDescription = scope.comments;
                resourceFactory.rescheduleSavingsInstallments.reschedule(this.formData, function (data) {
                	location.path('/bulkreschedule')
                });
            };

        }
    });
    mifosX.ng.application.controller('BulkRescheduleSavingsAccountInstallmentController', ['$scope' , '$location', 'ResourceFactory', 'dateFilter', mifosX.controllers.BulkRescheduleSavingsAccountInstallmentController]).run(function ($log) {
        $log.info("BulkRescheduleSavingsAccountInstallmentController initialized");
    });
}(mifosX.controllers || {}));
