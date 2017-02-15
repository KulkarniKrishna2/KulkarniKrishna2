(function (module) {
    mifosX.controllers = _.extend(module, {
        ClientActionsController: function (scope, resourceFactory, location, routeParams, dateFilter) {

            scope.action = routeParams.action || "";
            scope.clientId = routeParams.id;
            scope.formData = {};
            scope.restrictDate = new Date();
            scope.taskPermissionName = 'ALL_FUNCTIONS';
            scope.forcedSubmit = false;
            scope.forceActivateClientPermission = 'FORCE_ACTIVATE_CLIENT';
            scope.loanApplicationReferenceId = routeParams.loanApplicationReferenceId;

            // Transaction UI Related

            switch (scope.action) {
                case "activate":
                    resourceFactory.clientResourceTemplate.getActivateTemplate({clientId: routeParams.id, command : 'activate'}, function (data) {
                        scope.client = data;
                        if (data.timeline.submittedOnDate) {
                            scope.mindate = new Date(data.timeline.submittedOnDate);
                        }
                        if(scope.client.possibleClientMatches){
                            resourceFactory.clientIdenfierResource.getAll({clientId:scope.client.id}, function(data){
                                if(data){
                                    scope.clientIdentities = data.sort(function(a,b) {
                                        return (a.documentType.id > b.documentType.id) ? 1
                                            : ((b.documentType.id > a.documentType.id) ? -1 : 0);} );
                                    scope.client.identitiesCompiled = compileDocuments(scope.clientIdentities);
                                }
                            });
                        }
                    });
                    scope.labelName = 'label.input.activationdate';
                    scope.breadcrumbName = 'label.anchor.activate';
                    scope.modelName = 'activationDate';
                    scope.showActivationDateField = true;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'ACTIVATE_CLIENT';
                    break;
                case "assignstaff":
                    scope.breadcrumbName = 'label.anchor.assignstaff';
                    scope.labelName = 'label.input.staff';
                    scope.staffField = true;
                    resourceFactory.clientResource.get({clientId: routeParams.id, template: 'true',staffInSelectedOfficeOnly:true}, function (data) {
                        if (data.staffOptions) {
                            scope.staffOptions = data.staffOptions;
                            scope.formData.staffId = scope.staffOptions[0].id;
                        }
                    });
                    scope.taskPermissionName = 'ASSIGNSTAFF_CLIENT';
                    break;
                case "close":
                    scope.labelName = 'label.input.closuredate';
                    scope.labelNamereason = 'label.input.closurereason';
                    scope.breadcrumbName = 'label.anchor.close';
                    scope.modelName = 'closureDate';
                    scope.reasonmodelName = 'closureReasonId';
                    scope.reasonField = true;
                    scope.showDateField = true;
                    resourceFactory.clientResource.get({anotherresource: 'template', commandParam: 'close'}, function (data) {
                        scope.reasons = data.narrations;
                        scope.formData.reasonId = scope.narrations[0].id;
                    });
                    scope.taskPermissionName = 'CLOSE_CLIENT';
                    break;
                case "delete":
                    scope.breadcrumbName = 'label.anchor.delete';
                    scope.labelName = 'label.areyousure';
                    scope.showDeleteClient = true;
                    scope.taskPermissionName = 'DELETE_CLIENT';
                    break;
                case "unassignstaff":
                    scope.labelName = 'label.heading.unassignstaff';
                    scope.breadcrumbName = 'label.anchor.activate';
                    scope.showDeleteClient = true;
                    scope.taskPermissionName = 'UNASSIGNSTAFF_CLIENT';
                    break;
                case "updatedefaultaccount":
                    scope.breadcrumbName = 'label.anchor.updatedefaultaccount';
                    scope.labelName = 'label.input.savingsaccount';
                    scope.savingsField = false;
                    resourceFactory.clientResource.get({clientId: routeParams.id, template: 'true'}, function (data) {
                        if (data.savingAccountOptions) {
                            scope.savingsField = true;
                            scope.savingAccountOptions = data.savingAccountOptions;
                            scope.formData.savingsAccountId = scope.savingAccountOptions[0].id;
                            if(data.savingsAccountId){
                                scope.formData.savingsAccountId = data.savingsAccountId;
                            }
                            
                        }
                    });
                    break;
                case "acceptclienttransfer":
                    scope.breadcrumbName = 'label.anchor.acceptclienttransfer';
                    scope.showNoteField = true;
                    scope.taskPermissionName = 'ACCEPTTRANSFER_CLIENT';
                    break;
                case "rejecttransfer":
                    scope.breadcrumbName = 'label.anchor.rejecttransfer';
                    scope.showNoteField = true;
                    scope.taskPermissionName = 'REJECTTRANSFER_CLIENT';
                    break;
                case "undotransfer":
                    scope.breadcrumbName = 'label.anchor.undotransfer';
                    scope.showNoteField = true;
                    scope.taskPermissionName = 'WITHDRAWTRANSFER_CLIENT';
                    break;
                case "reject":
                    scope.labelName = 'label.input.rejectiondate';
                    scope.labelNamereason = 'label.input.rejectionreason';
                    scope.breadcrumbName = 'label.anchor.reject';
                    scope.modelName = 'rejectionDate';
                    scope.reasonmodelName = 'rejectionReasonId';
                    scope.reasonField = true;
                    scope.showDateField = true;
                    resourceFactory.clientResource.get({anotherresource: 'template', commandParam: 'reject'}, function (data) {
                        scope.reasons = data.narrations;
                        if(data.narrations != "") {
                            scope.formData.rejectionReasonId = data.narrations[0].id;
                        }
                    });
                    scope.taskPermissionName = 'REJECT_CLIENT';
                    break;
                case "withdraw":
                    scope.labelName = 'label.input.withdrawaldate';
                    scope.labelNamereason = 'label.input.withdrawalreason';
                    scope.breadcrumbName = 'label.anchor.withdraw';
                    scope.modelName = 'withdrawalDate';
                    scope.reasonmodelName = 'withdrawalReasonId';
                    scope.reasonField = true;
                    scope.showDateField = true;
                    resourceFactory.clientResource.get({anotherresource: 'template', commandParam: 'withdraw'}, function (data) {
                        scope.reasons = data.narrations;
                        if(data.narrations != "") {
                            scope.formData.withdrawalReasonId = data.narrations[0].id;
                        }
                    });
                    scope.taskPermissionName = 'WITHDRAW_CLIENT';
                    break;
                case "reactivate":
                    resourceFactory.clientResource.get({clientId: routeParams.id}, function (data) {
                        scope.client = data;
                        if (data.timeline.submittedOnDate) {
                            scope.mindate = new Date(data.timeline.submittedOnDate);
                        }
                    });
                    scope.labelName = 'label.input.reactivationdate';
                    scope.breadcrumbName = 'label.anchor.reactivate';
                    scope.modelName = 'reactivationDate';
                    scope.showActivationDateField = true;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'REACTIVATE_CLIENT';
                    break;
                case "undoReject":
                    resourceFactory.clientResource.get({clientId: routeParams.id}, function (data) {
                        scope.client = data;
                        if (data.timeline.submittedOnDate) {
                            scope.mindate = new Date(data.timeline.submittedOnDate);
                        }
                    });
                    scope.labelName = 'label.input.reopeneddate';
                    scope.breadcrumbName = 'label.anchor.undoReject';
                    scope.modelName = 'reopenedDate';
                    scope.showActivationDateField = true;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'UNDOREJECT_CLIENT';
                    break;
                case "undoWithdrawn":
                    resourceFactory.clientResource.get({clientId: routeParams.id}, function (data) {
                        scope.client = data;
                        if (data.timeline.submittedOnDate) {
                            scope.mindate = new Date(data.timeline.submittedOnDate);
                        }
                    });
                    scope.labelName = 'label.input.reopeneddate';
                    scope.breadcrumbName = 'label.anchor.undoWithdrawn';
                    scope.modelName = 'reopenedDate';
                    scope.showActivationDateField = true;
                    scope.showDateField = false;
                    scope.taskPermissionName = 'UNDOWITHDRAWAL_CLIENT';
                    break;

            }
            scope.cancel = function () {
                location.path('/viewclient/' + routeParams.id);
            }

            scope.matchClient = function(clientId){
                if(scope.client.possibleClientMatches){
                    var len = scope.client.possibleClientMatches.length;
                    for(var i=0; i<len; i++){
                        if(scope.client.possibleClientMatches[i].id === clientId){
                            scope.possibleMatch = scope.client.possibleClientMatches[i];
                            break;
                        }
                    }
                }
                if(scope.possibleMatch){
                    scope.client.identitiesCompiled = compileDocuments(scope.clientIdentities);
                    resourceFactory.clientIdenfierResource.getAll({clientId:scope.possibleMatch.id}, function(data){
                        if(data){
                            scope.possibleMatchIdentities = data.sort(function(a,b) {
                                return (a.documentType.id > b.documentType.id) ? 1
                                    : ((b.documentType.id > a.documentType.id) ? -1 : 0);} );
                            scope.possibleMatch.identitiesCompiled = "";
                            var len = scope.possibleMatchIdentities.length;
                            for(var i=0; i<scope.clientIdentities.length; i++){
                                var index = containsDocumentType(scope.possibleMatchIdentities,scope.clientIdentities[i]);
                                if(index < 0){
                                    scope.possibleMatch.identitiesCompiled += "&nbsp;<br/>";
                                }else{
                                    scope.possibleMatch.identitiesCompiled = scope.possibleMatch.identitiesCompiled
                                        .concat('<b>',scope.possibleMatchIdentities[index].documentType.name, '</b> : ',
                                            scope.possibleMatchIdentities[index].documentKey, '<br/>');
                                    scope.possibleMatchIdentities.splice(index,1);
                                }
                            }
                            scope.possibleMatch.identitiesCompiled += compileDocuments(scope.possibleMatchIdentities);
                            for(var i=0; i < scope.clientIdentities.length; i++){
                                if(scope.possibleMatch.identitiesCompiled.indexOf(scope.clientIdentities[i].documentKey) >= 0){
                                    scope.possibleMatch.identitiesCompiled = scope.possibleMatch.identitiesCompiled
                                        .replace(scope.clientIdentities[i].documentKey,
                                        '<span class=highlight>'+scope.clientIdentities[i].documentKey+'</span>');
                                    scope.client.identitiesCompiled = scope.client.identitiesCompiled
                                        .replace(scope.clientIdentities[i].documentKey,
                                        '<span class=highlight>'+scope.clientIdentities[i].documentKey+'</span>');
                                }
                            }
                        }
                    });
                }
            }

            function compileDocuments(data) {
                var len = data.length;
                var str = "";
                for (var i = 0; i < len; i++) {
                    str = str.concat('<b>', data[i].documentType.name, '</b> : ', data[i].documentKey,'<br/>');
                }
                return str;
            }

            function containsDocumentType(a, obj) {
                for (var i = 0; i < a.length; i++) {
                    if (a[i].documentType.id === obj.documentType.id) {
                        return i;
                    }
                }
                return -1;
            }

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                if (this.formData[scope.modelName]) {
                    this.formData[scope.modelName] = dateFilter(this.formData[scope.modelName], scope.df);
                }

                if (scope.action == "activate") {
                    var queryParams = {clientId: routeParams.id, command: 'activate'};
                    if(scope.forcedSubmit || scope.forceActivate){
                        queryParams = {clientId: routeParams.id, command: 'forceActivate'};
                    }
                    resourceFactory.clientResource.save(queryParams, this.formData, function (data) {
                        if(scope.loanApplicationReferenceId){
                            location.path('/managecoapplicants/' + scope.loanApplicationReferenceId);
                        }else{
                            location.path('/viewclient/' + data.clientId);
                        }
                    },
                        function(data){
                            if(data.data.errors[0].userMessageGlobalisationCode == "error.msg.duplicate.client.entry") {
                                scope.forcedSubmit = true;
                            }
                        });
                }
                if (scope.action == "assignstaff") {
                    delete this.formData.locale;
                    delete this.formData.dateFormat;
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'assignStaff'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "unassignstaff") {
                    delete this.formData.locale;
                    delete this.formData.dateFormat;
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'unassignstaff'}, {staffId: routeParams.staffId}, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "close") {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'close'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "reject") {

                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'reject'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "withdraw") {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'withdraw'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "reactivate") {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'reactivate'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "undoReject") {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'undoRejection'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "undoWithdrawn") {
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'undoWithdrawal'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "acceptclienttransfer") {
                    delete this.formData.locale;
                    delete this.formData.dateFormat;
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'acceptTransfer'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "rejecttransfer") {
                    delete this.formData.locale;
                    delete this.formData.dateFormat;
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'rejectTransfer'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "undotransfer") {
                    delete this.formData.locale;
                    delete this.formData.dateFormat;
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'withdrawTransfer'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
                if (scope.action == "updatedefaultaccount") {
                    delete this.formData.locale;
                    delete this.formData.dateFormat;
                    resourceFactory.clientResource.save({clientId: routeParams.id, command: 'updateSavingsAccount'}, this.formData, function (data) {
                        location.path('/viewclient/' + data.clientId);
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('ClientActionsController', ['$scope', 'ResourceFactory', '$location', '$routeParams', 'dateFilter', mifosX.controllers.ClientActionsController]).run(function ($log) {
        $log.info("ClientActionsController initialized");
    });
}(mifosX.controllers || {}));
