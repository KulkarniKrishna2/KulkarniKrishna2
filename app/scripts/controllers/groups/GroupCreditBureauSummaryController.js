(function (module) {
    mifosX.controllers = _.extend(module, {
        GroupCreditBureauSummaryController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            scope.groupId = routeParams.groupId;
            resourceFactory.runReportsResource.get({reportSource: 'GroupClientsCBReport', R_groupId: scope.groupId, genericResultSet: false}, function (groupClientsCBDatas) {
                customaziedGroupClientsCBFunction(groupClientsCBDatas);
            });

            function customaziedGroupClientsCBFunction (datas) {
                var clientId = undefined;
                scope.groupClientsCBDatas= [];
                var clientData = {};
                var clientIndex = -1;
                for(var i in datas){
                    var cbData = {};
                    if(clientId != datas[i].clientId){
                        clientId = datas[i].clientId;
                        clientIndex++;
                        clientData = {};
                        clientData.clientId = datas[i].clientId;
                        clientData.clientName = datas[i].clientName;
                        clientData.cbDetails = [];
                        scope.groupClientsCBDatas.push(clientData);
                    }
                    cbData.lenderName = datas[i].lenderName;
                    cbData.approvedAmount = datas[i].approvedAmount;
                    cbData.installmentAmount = datas[i].installmentAmount;
                    cbData.frequency = datas[i].frequency;
                    cbData.totalOutstandingAmount = datas[i].totalOutstandingAmount;
                    cbData.totalAmountOverDue = datas[i].totalAmountOverDue;
                    cbData.disbursement_date = datas[i].disbursement_date;
                    scope.groupClientsCBDatas[clientIndex].cbDetails.push(cbData);
                }
            };

            scope.creditBureauReportView = function (clientId) {
                resourceFactory.creditBureauReportFileContentResource.get({
                    entityType: 'client',
                    entityId: clientId
                }, function (fileContentData) {
                    if (fileContentData.reportFileType.value == 'HTML') {
                        var result = "";
                        for (var i = 0; i < fileContentData.fileContent.length; ++i) {
                            result += (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var popupWin = window.open('', '_blank', 'width=1000,height=500');
                        popupWin.document.open();
                        popupWin.document.write(result);
                        popupWin.document.close();
                    }else if (fileContentData.reportFileType.value == 'XML') {
                        var result = "";
                        for (var i = 0; i < fileContentData.fileContent.length; ++i) {
                            result += (String.fromCharCode(fileContentData.fileContent[i]));
                        }
                        var newWindow = window.open('', '_blank', 'toolbar=0, location=0, directories=0, status=0, scrollbars=1, resizable=1, copyhistory=1, menuBar=1, width=640, height=480, left=50, top=50', true);
                        var preEl = newWindow.document.createElement("pre");
                        var codeEl = newWindow.document.createElement("code");
                        codeEl.appendChild(newWindow.document.createTextNode(result));
                        preEl.appendChild(codeEl);
                        newWindow.document.body.appendChild(preEl);
                    }
                });
            };
            scope.routeTo = function (id) {
                location.path('/viewclient/' + id);
            };

        }
    });
    mifosX.ng.application.controller('GroupCreditBureauSummaryController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.GroupCreditBureauSummaryController]).run(function ($log) {
        $log.info("GroupCreditBureauSummaryController initialized");
    });

}(mifosX.controllers || {}));