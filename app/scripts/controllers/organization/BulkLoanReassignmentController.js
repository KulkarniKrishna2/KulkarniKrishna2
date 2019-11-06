(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkLoanReassignmentController: function (scope,location, resourceFactory, route, dateFilter, $rootScope) {
            scope.offices = [];
            scope.accounts = {};
            scope.selectLoan = {};
            scope.officeIdTemp = {};
            scope.first = {};
            scope.second = {};
            scope.third = {};
            scope.toOfficers = [];
            scope.first.date = new Date();
            scope.second.date = new Date();
            scope.third.date = new Date();
            var loanAccounts = [];
            var centers = [];
            var groups = [];
            var clients = [];
            scope.centerData =[];
            scope.groupMemberData = [];
            scope.clientMemberData = [];
            scope.groupMemberLoanData=[];
            scope.formData = {};
            scope.restrictDate = new Date();

            resourceFactory.officeResource.getAllOffices({onlyActive: true}, function (data) {
                scope.offices = data;
            });
            scope.getOfficers = function () {
                scope.officerChoice = true;
                resourceFactory.loanReassignmentResource.get({templateSource: 'template', officeId: scope.officeIdTemp}, function (data) {
                    scope.officers = data.loanOfficerOptions;

                });
            };


            scope.getOfficerClients = function () {
                var toOfficers = angular.copy(scope.officers);
                loanAccounts=[];
                scope.selectAll.checked=false;
                for (var i in toOfficers) {
                    if (toOfficers[i].id == this.formData.fromLoanOfficerId) {
                        var index = i;
                    }
                }
                toOfficers.splice(index, 1);
                scope.toOfficers = toOfficers;
                resourceFactory.loanReassignmentResource.get({templateSource: 'template', officeId: scope.officeIdTemp, fromLoanOfficerId: scope.formData.fromLoanOfficerId}, function (data) {
                    scope.accountSummaryCollection = data.accountSummaryCollection.centerDataList;
                    scope.centersDataList = scope.accountSummaryCollection;
                    scope.groups = data.accountSummaryCollection.groups;
                    scope.clients = data.accountSummaryCollection.clients;
                    scope.accountSummaryCollection = scope.centersDataList;

                });
            };
            
            scope.getOfficerClientsForRescheduling = function () {
                loanAccounts=[];
                scope.selectAll.checked=false;
                scope.reschedule = true;
                resourceFactory.loanRepaymentRescheduleResource.get({templateSource: 'template', officeId: scope.officeIdTemp, loanOfficerId: scope.loanOfficerId, rescheduleFromDate: dateFilter(scope.first.date, scope.df)}, function (data) {
                    scope.accountSummaryCollection = data.accountSummaryCollection.centerDataList;
                    scope.centersDataList = scope.accountSummaryCollection;
                    scope.groups = data.accountSummaryCollection.groups;
                    scope.clients = data.accountSummaryCollection.clients;
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
                if(value){
                        for(var b =0 ; b < scope.centersDataList.length ; b++) {
                            scope.centerData = scope.centersDataList[b].groupMembers;
                            var centerId = scope.centersDataList[b].id;
                            scope.addEntityId(centers, centerId);
                            scope.centersDataList[b].checked = true;
                            for(var i = 0; i < scope.centerData.length; i++){
                                scope.groupMemberData = scope.centerData[i].clientMembers;
                                var groupId = scope.centerData[i].id;
                                scope.addEntityId(groups, groupId);
                                scope.groupMemberLoanData=scope.centerData[i].loanAccountSummaryDatas;
                                scope.centerData[i].checked = true;
                                for(var a = 0; a < scope.groupMemberData.length; a++){
                                    scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                                    var clientId = scope.groupMemberData[a].id;
                                    scope.addEntityId(clients, clientId);
                                    scope.groupMemberData[a].checked = true;
                                    for(var x = 0; x < scope.clientMemberData.length; x++){
                                        scope.clientMemberData[x].checked = true;
                                        var loanId = scope.clientMemberData[x].id;
                                        scope.addEntityId(loanAccounts, loanId);
                                    }
                                }
                                if(scope.groupMemberLoanData !=  undefined){
                                for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                                    scope.groupMemberLoanData[a].checked=true;
                                    var loanId = scope.groupMemberLoanData[a].id;
                                    scope.addEntityId(loanAccounts, loanId);
                                }
                            }

                            }
                        }
                        
                        /*
                         * Group Level data*/
                        for(var c =0 ; c < scope.groups.length ; c++){
                        	scope.groupMemberData = scope.groups[c].clientMembers;
                            scope.groupMemberLoanData=scope.groups[c].loanAccountSummaryDatas;
                            scope.groups[c].checked = true;
                            var groupId =  scope.groups[c].id;
                            scope.addEntityId(groups, groupId);
                            for(var i=0; i<scope.groupMemberData.length; i++){
                            	scope.clientMemberData = scope.groupMemberData[i].loanAccountSummaryDatas;
                            	scope.groupMemberData[i].checked = true;
                                var clientId = scope.groupMemberData[i].id;
                                scope.addEntityId(clients, clientId);
                            	for(var x=0; x < scope.clientMemberData.length; x++){
                            		scope.clientMemberData[x].checked = true;
                                    var loanId = scope.clientMemberData[x].id;
                                    scope.addEntityId(loanAccounts, loanId);
                            	}
                            	
                            }
                            if(scope.groupMemberLoanData != undefined){
                            	for(var a=0; a<scope.groupMemberLoanData.length;a++){
                            		scope.groupMemberLoanData[a].checked=true;
                                    var loanId = scope.groupMemberLoanData[a].id;
                                    scope.addEntityId(loanAccounts, loanId);
                            	}
                            }
                           
                        }
                        
                        /*
                         * Client Level Data selection
                         * */
                        
                        for(var i=0; i<scope.clients.length; i++){
                        	//scope.clientMemberData = scope.clients[i].loans;
                            clientId = scope.clients[i].id;
                            scope.addEntityId(clients, clientId);
                        	scope.clientMemberData = scope.clients[i].loanAccountSummaryDatas;
                        	//scope.clients[i].checked = true;
                        	for(var j=0; j < scope.clientMemberData.length; j++){
                        		scope.clientMemberData[j].checked = true;
                                var loanId = scope.clientMemberData[j].id;
                                scope.addEntityId(loanAccounts, loanId);
                        	}
                        	
                        }
                    }else{
                        for(var b =0 ; b < scope.centersDataList.length ; b++) {
                            scope.centerData = scope.centersDataList[b].groupMembers;
                            scope.centersDataList[b].checked = false;
                            for(var i = 0; i < scope.centerData.length; i++){
                                scope.groupMemberData = scope.centerData[i].clientMembers;
                                scope.groupMemberLoanData=scope.centerData[i].loanAccountSummaryDatas;
                                scope.centerData[i].checked = false;
                                for(var a = 0; a < scope.groupMemberData.length; a++){
                                    scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                                    scope.groupMemberData[a].checked = false;
                                    for(var x = 0; x < scope.clientMemberData.length; x++){
                                        var loanId = (scope.clientMemberData[x].id);
                                        scope.clientMemberData[x].checked = false;
                                    }
                                }
                                if(scope.groupMemberLoanData != undefined){
                                for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                                    scope.groupMemberLoanData[a].checked=false;

                                }
                            }
                            }
                        }
                        /*
                         * Group Level data*/
                        for(var c =0 ; c < scope.groups.length ; c++){
                        	scope.groupMemberData = scope.groups[c].clientMembers;
                            scope.groupMemberLoanData=scope.groups[c].loanAccountSummaryDatas;
                            scope.groups[c].checked = false;
                            for(var i=0; i<scope.groupMemberData.length; i++){
                            	scope.clientMemberData = scope.groupMemberData[i].loanAccountSummaryDatas;
                            	scope.groupMemberData[i].checked = false;
                            	for(var x=0; x < scope.clientMemberData.length; x++){
                            		scope.clientMemberData[x].checked = false;
                            }

                        }
                            if(scope.groupMemberLoanData != undefined){
                            	for(var a=0; a<scope.groupMemberLoanData.length;a++){
                            		scope.groupMemberLoanData[a].checked=false;
                            	}
                            }
                           
                        }
                        /*
                         * Client Level Data selection
                         * */
                        
                        for(var i=0; i<scope.clients.length; i++){
                        	scope.clientMemberData = scope.clients[i].loanAccountSummaryDatas;
                        	scope.clients[i].checked = false;
                        	for(var j=0; j < scope.clientMemberData.length; j++){
                        		scope.clientMemberData[j].checked = false;
                        	}
                        	
                        }
                        loanAccounts = [];
                        centers = [];
                        groups = [];
                        clients = [];
                    }
                };

            scope.addEntityId = function (entityArray, entityId) {
                if (!scope.isDuplicateEntityIdEntry(entityArray, entityId)) {
                    entityArray.push(entityId);
                }
            }

            scope.removeEntityId = function (entityArray, entityId) {
                if (entityArray.length > 0) {
                    var index = entityArray.indexOf(entityId);
                    if (index != undefined) {
                        entityArray.splice(index, 1);
                    }
                }
            }

            scope.isDuplicateEntityIdEntry = function (entityArray, entityId) {
                if (entityArray.length > 0) {
                    var index = entityArray.indexOf(entityId);
                    if (index > 0) {
                        return true;
                    }
                }
                return false;
            }

            scope.centerLevel = function(value,id){
                for(var b =0 ; b < scope.centersDataList.length ; b++) {
                    if (scope.centersDataList[b].id == id) {
                        scope.centerData = scope.centersDataList[b].groupMembers;
                        break
                    }
                }
                if(value){
                    scope.addEntityId(centers, id);
                    for(var i = 0; i < scope.centerData.length; i++){
                        scope.groupMemberData = scope.centerData[i].clientMembers;
                        var groupId = scope.centerData[i].id;
                        scope.addEntityId(groups, groupId);
                        scope.groupMemberLoanData=scope.centerData[i].loanAccountSummaryDatas;
                        scope.centerData[i].checked = true;
                        for(var a = 0; a < scope.groupMemberData.length; a++){
                            scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                            var clientId = scope.groupMemberData[a].id;
                            scope.addEntityId(clients, clientId);
                            scope.groupMemberData[a].checked = true;
                            for(var x = 0; x < scope.clientMemberData.length; x++){
                                scope.clientMemberData[x].checked = true;
                                var loanId = scope.clientMemberData[x].id;
                                scope.addEntityId(loanAccounts, loanId);
                            }
                        }
                        if(scope.groupMemberLoanData !=  undefined){
                        for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                            scope.groupMemberLoanData[a].checked = true;
                                var loanId =  scope.groupMemberLoanData[a].id;
                                scope.addEntityId(loanAccounts, loanId);
                        }
                    }
                    }
                } else{
                    scope.removeEntityId(centers, id);
                    for(var i = 0; i < scope.centerData.length; i++){
                        scope.groupMemberData = scope.centerData[i].clientMembers;
                        var groupId = scope.centerData[i].id;
                        scope.removeEntityId(groups, groupId);
                        scope.groupMemberLoanData=scope.centerData[i].loanAccountSummaryDatas;
                        scope.centerData[i].checked = false;
                        var centerId =  scope.centerData[i].id;
                        for(var a = 0; a < scope.groupMemberData.length; a++){
                            scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                            var clientId = scope.groupMemberData[a].id;
                            scope.removeEntityId(clients, clientId);
                            scope.groupMemberData[a].checked = false;
                            for(var x = 0; x < scope.clientMemberData.length; x++){
                                var loanId = (scope.clientMemberData[x].id);
                                scope.clientMemberData[x].checked = false;
                                scope.removeEntityId(loanAccounts, loanId);
                            }
                        }
                        if(scope.groupMemberLoanData !=  undefined){
                        for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                                var loanId = (scope.groupMemberLoanData[a].id);
                                scope.groupMemberLoanData[a].checked=false;
                                scope.removeEntityId(loanAccounts, loanId);
                            }
                        }
                    }
                }
            };

            scope.groupLevel = function(value, centerId, groupId){
                for(var b =0 ; b < scope.centersDataList.length ; b++) {
                    if (scope.centersDataList[b].id == centerId) {
                        scope.centerData = scope.centersDataList[b].groupMembers;
                        break;
                    }
                }
                for(var c =0 ; c < scope.centerData.length ; c++){
                    if(scope.centerData[c].id == groupId){
                        scope.groupMemberData = scope.centerData[c].clientMembers;
                        scope.groupMemberLoanData=scope.centerData[c].loanAccountSummaryDatas;
                        break;
                    }
                }
                if(value){
                    scope.addEntityId(groups, groupId);
                    for(var a = 0; a < scope.groupMemberData.length; a++){
                            scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                            var clientId = scope.groupMemberData[a].id;
                            scope.addEntityId(clients, clientId);
                            scope.groupMemberData[a].checked = true;
                            for(var x = 0; x < scope.clientMemberData.length; x++){
                                scope.clientMemberData[x].checked = true;
                                var loanId = scope.clientMemberData[x].id;
                                scope.addEntityId(loanAccounts, loanId);
                            }
                        }
                    if (scope.groupMemberLoanData != undefined) {
                        for (var a = 0; a < scope.groupMemberLoanData.length; a++) {
                            scope.groupMemberLoanData[a].checked = true;
                            var loanId = scope.groupMemberLoanData[a].id;
                            scope.addEntityId(loanAccounts, loanId);
                        }
                    }
                }else{
                    scope.removeEntityId(groups, groupId);
                    for(var a = 0; a < scope.groupMemberData.length; a++){
                        scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                        var clientId = scope.groupMemberData[a].id;
                        scope.removeEntityId(clients, clientId);
                        scope.groupMemberData[a].checked = false;
                        for(var x = 0; x < scope.clientMemberData.length; x++){
                            var loanId = (scope.clientMemberData[x].id);
                            scope.clientMemberData[x].checked = false;
                            scope.removeEntityId(loanAccounts, loanId);
                        }
                    }
                    if(scope.groupMemberLoanData !=  undefined){
                    for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                        var loanId = (scope.groupMemberLoanData[a].id);
                            scope.groupMemberLoanData[a].checked = false;
                            scope.removeEntityId(loanAccounts, loanId);
                        }
                    }
                }
            };
            scope.clientLevel = function(value, centerId, groupId, clientId){
                for(var b =0 ; b < scope.centersDataList.length ; b++) {
                    if (scope.centersDataList[b].id == centerId) {
                        scope.centerData = scope.centersDataList[b].groupMembers;
                        break;
                    }
                }
                for(var c =0 ; c < scope.centerData.length ; c++){
                    if(scope.centerData[c].id == groupId){
                        scope.groupMemberData = scope.centerData[c].clientMembers;
                        break;
                    }
                }

                for(var i =0; i < scope.groupMemberData.length; i++){
                    if(scope.groupMemberData[i].id == clientId){
                        scope.clientMemberData = scope.groupMemberData[i].loanAccountSummaryDatas;
                        break;
                    }
                }

                if(value){
                    scope.addEntityId(clients, clientId);
                    for(var x = 0; x < scope.clientMemberData.length; x++){
                        scope.clientMemberData[x].checked = true;
                        var loanId = scope.clientMemberData[x].id;
                        scope.addEntityId(loanAccounts, loanId);
                    }
                } else{
                    scope.removeEntityId(clients, clientId);
                    for(var x = 0; x < scope.clientMemberData.length; x++){
                        var loanId = (scope.clientMemberData[x].id);
                        scope.clientMemberData[x].checked = false;
                        scope.removeEntityId(loanAccounts, loanId);
                    }
                }
            };
            scope.loanAccountLevel = function(value, centerId, groupId, clientId, loanId){
                for(var b =0 ; b < scope.centersDataList.length ; b++) {
                    if (scope.centersDataList[b].id == centerId) {
                        scope.centerData = scope.centersDataList[b].groupMembers;
                        break;
                    }
                }
                for(var c =0 ; c < scope.centerData.length ; c++){
                    if(scope.centerData[c].id == groupId){
                        scope.groupMemberData = scope.centerData[c].clientMembers;
                        break;
                    }
                }

                for(var i =0; i < scope.groupMemberData.length; i++){
                    if(scope.groupMemberData[i].id == clientId){
                        scope.clientMemberData = scope.groupMemberData[i].loanAccountSummaryDatas;
                        break;
                    }
                }

                for(var x = 0; x <  scope.clientMemberData.length ; x++){
                    if(scope.clientMemberData[x].id == loanId){
                        if(value){
                            scope.addEntityId(loanAccounts, loanId);
                        }else{
                            scope.removeEntityId(loanAccounts, loanId);
                        }
                    }
                }
            };

            scope.loanAccountLevel1 = function(value, groupId, clientId, loanId){
                for(var c =0 ; c < scope.groups.length ; c++){
                    if(scope.groups[c].id == groupId){
                        scope.groupMemberData = scope.groups[c].clientMembers;
                        break;
                    }
                }

                for(var i =0; i < scope.groupMemberData.length; i++){
                    if(scope.groupMemberData[i].id == clientId){
                        scope.clientMemberData = scope.groupMemberData[i].loanAccountSummaryDatas;
                        break;
                    }
                }

                for(var x = 0; x <  scope.clientMemberData.length ; x++){
                    if(scope.clientMemberData[x].id == loanId){
                        if(value){
                            scope.addEntityId(loanAccounts, loanId);
                        }else{
                            scope.removeEntityId(loanAccounts, loanId);
                        }
                    }
                }
            };

            
            
            scope.loanAccountLevel2 = function(value, clientId, loanId){
                for(var i =0; i < scope.clients.length; i++){
                    if(scope.clients[i].id == clientId){
                        scope.clientMemberData = scope.clients[i].loans;
                        break;
                    }
                }

                for(var x = 0; x <  scope.clientMemberData.length ; x++){
                    if(scope.clientMemberData[x].id == loanId){
                        if(value){
                            loanAccounts.push(loanId);
                        }else{
                            var indexOfLoanId = loanAccounts.indexOf(loanId);
                            if(indexOfLoanId){
                                loanAccounts.splice(indexOfLoanId, 1);
                            }
                        }
                    }
                }
            };
            
            
            scope.loanAccountLevelOnlyGroup = function(value, centerId, groupId,loanId){
                for(var b =0 ; b < scope.centersDataList.length ; b++) {
                    if (scope.centersDataList[b].id == centerId) {
                        scope.centerData = scope.centersDataList[b].groupMembers;
                        break;
                    }
                }
                for(var c =0 ; c < scope.centerData.length ; c++){
                    if(scope.centerData[c].id == groupId){
                        scope.groupMemberData = scope.centerData[c].clientMembers;
                        break;
                    }
                }

                for(var x = 0; x <  scope.groupMemberData.length ; x++){
                    if(scope.groupMemberData[x].id == loanId){
                        if(value){
                            scope.addEntityId(loanAccounts, loanId);
                        }else{
                            scope.removeEntityId(loanAccounts, loanId);
                        }
                    }
                }
            };

            scope. accounts= function(value, loanId){
                if(value){
                    scope.addEntityId(loanAccounts, loanId);
                }else{
                    scope.removeEntityId(loanAccounts, loanId);
                }
            }
            
            scope.clientLevel1 = function(value, groupId, clientId){
                for(var c =0 ; c < scope.groups.length ; c++){
                    if(scope.groups[c].id == groupId){
                        scope.groupMemberData = scope.groups[c].clientMembers;
                        break;
                    }
                }

                for(var i =0; i < scope.groupMemberData.length; i++){
                    if(scope.groupMemberData[i].id == clientId){
                        scope.clientMemberData = scope.groupMemberData[i].loanAccountSummaryDatas;
                        break;
                    }
                }

                if(value){
                    scope.addEntityId(clients, clientId);
                    for(var x = 0; x < scope.clientMemberData.length; x++){
                        scope.clientMemberData[x].checked = true;
                        scope.addEntityId(loanAccounts, loanId);
                    }
                } else{
                    scope.removeEntityId(clients, clientId);
                    for(var x = 0; x < scope.clientMemberData.length; x++){
                        var loanId = (scope.clientMemberData[x].id);
                        scope.clientMemberData[x].checked = false;
                        scope.removeEntityId(loanAccounts, loanId);
                    }
                }
            };
            
            scope.clientLevel2 = function(value, clientId){
                for(var c =0 ; c < scope.clients.length ; c++){
                    if(scope.clients[c].id == clientId){
                        scope.clientMemberData = scope.clients[c].loans;
                        break;
                    }
                }


                if(value){
                    for(var x = 0; x < scope.clientMemberData.length; x++){
                        scope.clientMemberData[x].checked = true;
                        loanAccounts.push(scope.clientMemberData[x].id);
                    }
                } else{
                    for(var x = 0; x < scope.clientMemberData.length; x++){
                        var loanId = (scope.clientMemberData[x].id);
                        scope.clientMemberData[x].checked = false;
                        var indexOfLoanId = loanAccounts.indexOf(loanId);
                        if(indexOfLoanId){
                            loanAccounts.splice(indexOfLoanId, 1);
                        }
                    }
                }
            };
            
            scope.groupLevel1 = function(value,groupId){
                for(var c =0 ; c < scope.groups.length ; c++){
                    if(scope.groups[c].id == groupId){
                        scope.groupMemberData = scope.groups[c].clientMembers;
                        scope.groupMemberLoanData=scope.groups[c].loanAccountSummaryDatas;
                        break;
                    }
                }
                if(value){
                    for(var a = 0; a < scope.groupMemberData.length; a++){
                            scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                            scope.groupMemberData[a].checked = true;
                            for(var x = 0; x < scope.clientMemberData.length; x++){
                                scope.clientMemberData[x].checked = true;
                                loanAccounts.push(scope.clientMemberData[x].id);
                            }
                        }
                        if(scope.groupMemberLoanData !=  undefined){
                    for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                            scope.groupMemberLoanData[a].checked = true;
                                loanAccounts.push(scope.groupMemberLoanData[a].id);
                        }
                    }
                }else{
                    for(var a = 0; a < scope.groupMemberData.length; a++){
                        scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                        scope.groupMemberData[a].checked = false;
                        for(var x = 0; x < scope.clientMemberData.length; x++){
                            var loanId = (scope.clientMemberData[x].id);
                            scope.clientMemberData[x].checked = false;
                            var indexOfLoanId = loanAccounts.indexOf(loanId);
                            if(indexOfLoanId){
                                loanAccounts.splice(indexOfLoanId, 1);
                            }
                        }
                    }
                    if(scope.groupMemberLoanData !=  undefined){
                    for(var a = 0; a < scope.groupMemberLoanData.length; a++){
                        var loanId = (scope.groupMemberLoanData[a].id);
                            scope.groupMemberLoanData[a].checked = false;
                            var indexOfLoanId = loanAccounts.indexOf(loanId);
                            if(indexOfLoanId){
                                loanAccounts.splice(indexOfLoanId, 1);
                            }
                        }
                    }
                }
            };

           scope.loanAccountLevelOnlyGroup1 = function(value,groupId,loanId){
                for(var c =0 ; c < scope.groups.length ; c++){
                    if(scope.groups[c].id == groupId){
                        scope.groupMemberData = scope.groups[c].clientMembers;
                        break;
                    }
                }

                for(var x = 0; x <  scope.groupMemberData.length ; x++){
                    if(scope.groupMemberData[x].id == loanId){
                        if(value){
                            loanAccounts.push(loanId);
                        }else{
                            var indexOfLoanId = loanAccounts.indexOf(loanId);
                            if(indexOfLoanId){
                                loanAccounts.splice(indexOfLoanId, 1);
                            }
                        }
                    }
                }
            };
            resourceFactory.loanRescheduleResource.template({scheduleId:'template'},function(data){
                if (data.length > 0) {
                    scope.formData.rescheduleReasonId = data.rescheduleReasons[0].id;
                }
                scope.codes = data.rescheduleReasons;
            });

            scope.submitDetails = function () {
                var rescheduleFromdate = dateFilter(scope.first.date, scope.df);
                this.formData.rescheduleFromDate = rescheduleFromdate;
                var rescheduledTodate = dateFilter(scope.second.date, scope.df);
                this.formData.adjustedDueDate = rescheduledTodate;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loans = loanAccounts;
                this.formData.specificToInstallment = scope.specificToInstallment;
                this.formData.rescheduleReasonComment = scope.comments;
                var submittedOn = dateFilter(scope.third.date, scope.df);
                this.formData.submittedOnDate = submittedOn;
                delete this.formData.loanOfficerId;
                delete this.formData.assignmentDate;
                resourceFactory.loanRescheduleResource.put({command:'bulkcreateandapprove'},this.formData, function (data) {
                	location.path('/organization')
                });
            };
            
            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.assignmentDate = reqDate;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loans = loanAccounts;
                this.formData.centers = centers;
                this.formData.groups = groups;
                this.formData.clients =  clients;
                resourceFactory.loanReassignmentResource.save(this.formData, function (data) {
                    location.path('/organization')
                });

            };

        }
    });
    mifosX.ng.application.controller('BulkLoanReassignmentController', ['$scope' , '$location', 'ResourceFactory', '$route', 'dateFilter', '$rootScope', mifosX.controllers.BulkLoanReassignmentController]).run(function ($log) {
        $log.info("BulkLoanReassignmentController initialized");
    });
}(mifosX.controllers || {}));
