(function (module) {
    mifosX.controllers = _.extend(module, {
        BulkLoanReassignmentController: function (scope, resourceFactory, route, dateFilter, $rootScope) {
            scope.offices = [];
            scope.accounts = {};
            scope.selectLoan = {};
            scope.officeIdTemp = {};
            scope.first = {};
            scope.toOfficers = [];
            scope.first.date = new Date();
            var loanAccounts = [];
            scope.centerData =[];
            scope.groupMemberData = [];
            scope.clientMemberData = [];

            resourceFactory.officeResource.getAllOffices(function (data) {
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
                    scope.allChecks = scope.centersDataList;
                    scope.groups = data.accountSummaryCollection.groups;
                    scope.clients = data.accountSummaryCollection.clients;
                    scope.accountSummaryCollection = scope.centersDataList;
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

            scope.centerLevel = function(value,id){
                for(var b =0 ; b < scope.centersDataList.length ; b++) {
                    if (scope.centersDataList[b].id == id) {
                        scope.centerData = scope.centersDataList[b].groupMembers;
                        break
                    }
                }
                if(value){
                    for(var i = 0; i < scope.centerData.length; i++){
                        scope.groupMemberData = scope.centerData[i].clientMembers;
                        scope.centerData[i].checked = true;
                        for(var a = 0; a < scope.groupMemberData.length; a++){
                            scope.clientMemberData = scope.groupMemberData[a].loanAccountSummaryDatas;
                            scope.groupMemberData[a].checked = true;
                            for(var x = 0; x < scope.clientMemberData.length; x++){
                                scope.clientMemberData[x].checked = true;
                                loanAccounts.push(scope.clientMemberData[x].id);
                            }
                        }
                    }
                } else{
                    scope.centerSelected = false;
                    for(var i = 0; i < scope.centerData.length; i++){
                        scope.groupMemberData = scope.centerData[i].clientMembers;
                        scope.centerData[i].checked = false;
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

            scope. accounts= function(value, loanId){
                if(value){
                    loanAccounts.push(loanId);
                }else{
                    var indexOfLoanId = loanAccounts.indexOf(loanId);
                    if(indexOfLoanId){
                        loanAccounts.splice(indexOfLoanId, 1);
                    }
                }
            }

            scope.submit = function () {
                var reqDate = dateFilter(scope.first.date, scope.df);
                this.formData.assignmentDate = reqDate;
                this.formData.dateFormat = scope.df;
                this.formData.locale = scope.optlang.code;
                this.formData.loans = loanAccounts;
                resourceFactory.loanReassignmentResource.save(this.formData, function (data) {
                    route.reload();
                });

            };

        }
    });
    mifosX.ng.application.controller('BulkLoanReassignmentController', ['$scope', 'ResourceFactory', '$route', 'dateFilter', '$rootScope', mifosX.controllers.BulkLoanReassignmentController]).run(function ($log) {
        $log.info("BulkLoanReassignmentController initialized");
    });
}(mifosX.controllers || {}));
