(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanUtilizationCheckController: function (scope, routeParams, resourceFactory, location, $modal, route, dateFilter) {
            scope.styleHalfScreenWidth = {"width" : parseFloat(window.innerWidth/2).toFixed(0)+"px"};
            scope.entityType = routeParams.entityType;
            scope.entityId = routeParams.entityId;
            scope.loanId = routeParams.loanId;
            scope.utilizationCheckId = routeParams.utilizationCheckId;
            scope.formData = {};
            if (scope.entityType === "center") {
                resourceFactory.loanPurposeResource.getAll(function (data) {
                    scope.loanPurposes = data;
                    if (scope.loanPurposes) {
                        resourceFactory.loanUtilizationCheck.get({
                            loanId: scope.loanId,
                            utilizationCheckId: scope.utilizationCheckId
                        }, function (data) {
                            scope.loanUtilizationCheckData = data;
                            scope.loanUtilizationCheckData.auditDoneOn = dateFilter(new Date(scope.loanUtilizationCheckData.auditDoneOn),scope.df);
                            scope.loanCenterTemplate = [];
                            scope.loanCenterTemplate.push(scope.loanUtilizationCheckData);
                        });
                    }
                });
            };

            if (scope.entityType === "group") {
                resourceFactory.loanPurposeResource.getAll(function (data) {
                    scope.loanPurposes = data;
                    if (scope.loanPurposes) {
                        resourceFactory.loanUtilizationCheck.get({
                            loanId: scope.loanId,
                            utilizationCheckId: scope.utilizationCheckId
                        }, function (data) {
                            scope.loanUtilizationCheckData = data;
                            scope.loanUtilizationCheckData.auditDoneOn = dateFilter(new Date(scope.loanUtilizationCheckData.auditDoneOn),scope.df);
                            scope.formData.auditDoneOn = scope.loanUtilizationCheckData.auditDoneOn;
                            scope.loanCenterTemplate = [];
                            scope.loanCenterTemplate.push(scope.loanUtilizationCheckData);
                        });
                    }
                });
            };

            scope.percentail = function () {
                if (scope.loanCenterTemplate[0] && scope.loanCenterTemplate[0].loanUtilizationCheckDetailData && !angular.isUndefined(scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData)) {
                    if (!angular.isUndefined(scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData)) {
                        if (!angular.isUndefined(scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData.amount)) {
                            var principalAmount = scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.principalAmount;
                            var uamount = scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData.amount;
                            var percentailOfUsage = 0.00;
                            if(principalAmount != undefined && uamount != undefined && principalAmount != "" && uamount != "" && !isNaN(principalAmount) && !isNaN(uamount)){
                                percentailOfUsage = parseFloat(parseFloat(uamount) / parseFloat(principalAmount) * 100.00).toFixed(2);
                            }
                            scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData.percentailOfUsage = percentailOfUsage;
                            return percentailOfUsage;
                        }
                    }
                }
            };

            scope.submit = function () {
                if(scope.loanCenterTemplate[0] && scope.loanCenterTemplate[0].loanUtilizationCheckDetailData){
                    var loanUtilizationCheckData = {};
                    loanUtilizationCheckData.loanId = scope.loanCenterTemplate[0].loanId;
                    loanUtilizationCheckData.auditDoneById = scope.currentSession.user.userId;
                    loanUtilizationCheckData.auditDoneOn = dateFilter(new Date(scope.loanUtilizationCheckData.auditDoneOn), scope.df);
                    if(scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData != undefined){
                        var utilizationDetailsDataObj = scope.loanCenterTemplate[0].loanUtilizationCheckDetailData.utilizationDetailsData;
                        loanUtilizationCheckData.utilizationDetails = {};
                        var utilizationDetailsData = {};
                        utilizationDetailsData.loanPurposeId = utilizationDetailsDataObj.loanPurposeData.id;
                        utilizationDetailsData.isSameAsOriginalPurpose = utilizationDetailsDataObj.isSameAsOroginalPurpose;
                        if(utilizationDetailsDataObj.amount){
                            utilizationDetailsData.amount = utilizationDetailsDataObj.amount;
                            delete utilizationDetailsDataObj.percentailOfUsage;
                        }
                        utilizationDetailsData.comment = utilizationDetailsDataObj.comment;
                        utilizationDetailsData.locale = scope.optlang.code;
                        utilizationDetailsData.dateFormat = scope.df;
                        loanUtilizationCheckData.utilizationDetails = utilizationDetailsData;
                    }
                    loanUtilizationCheckData.locale = scope.optlang.code;
                    loanUtilizationCheckData.dateFormat = scope.df;
                    scope.formData= loanUtilizationCheckData;
                }
                scope.formData.locale = scope.optlang.code;
                scope.formData.dateFormat = scope.df;

                //console.log(JSON.stringify(scope.formData));

                if (scope.entityType === "center") {
                    resourceFactory.loanUtilizationCheck.update({
                        loanId: scope.loanId,
                        utilizationCheckId: scope.utilizationCheckId
                    }, scope.formData, function (data) {
                        location.path('/viewcenter/' + scope.entityId);
                    });
                }
                if (scope.entityType === "group") {
                    resourceFactory.loanUtilizationCheck.update({
                        loanId: scope.loanId,
                        utilizationCheckId: scope.utilizationCheckId
                    }, scope.formData, function (data) {
                        location.path('/group/' + scope.entityId + '/listgrouploanutillization/');
                    });
                }
            };
        }
    });
    mifosX.ng.application.controller('EditLoanUtilizationCheckController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', 'dateFilter', mifosX.controllers.EditLoanUtilizationCheckController]).run(function ($log) {
        $log.info("EditLoanUtilizationCheckController initialized");
    });

}(mifosX.controllers || {}));