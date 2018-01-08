(function (module) {
    mifosX.controllers = _.extend(module, {
        GroupCreditBureauSummaryController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            scope.groupId = routeParams.groupId;
            resourceFactory.runReportsResource.get({reportSource: 'GroupClientsCBReport', R_groupId: scope.groupId, genericResultSet: false}, function (groupClientsCBDatas) {
                scope.groupClientsCBDatas = groupClientsCBDatas;          
            });

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