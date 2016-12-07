(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkFlowStepDashboardController: function (scope, resourceFactory, location,$modal) {
            scope.loanProductId = undefined;
            scope.officeId = undefined;
            scope.getWorkFlowTaskSummary = function () {
                resourceFactory.workFlowStepSummaryResource.get({loanProductId : scope.loanProductId,officeId : scope.officeId}, function (data) {
                    scope.loanProductWorkFlowSummary = data;
                    for(var i in scope.loanProductWorkFlowSummary){
                        var loanProduct = scope.loanProductWorkFlowSummary[i];
                        if(loanProduct.loanProductWorkFlowSummary && loanProduct.loanProductWorkFlowSummary.offices){
                            scope.loanProductWorkFlowSummary[i].loanProductWorkFlowSummary.totalWorkFlowSummaries = [];
                            for(var j in loanProduct.loanProductWorkFlowSummary.offices){
                                var office = loanProduct.loanProductWorkFlowSummary.offices[j];
                                for(var k in office.workFlowSummaries){
                                    var stepName = office.workFlowSummaries[k].stepName;
                                    var isTotalDataFound = false;
                                    for(var l in scope.loanProductWorkFlowSummary[i].loanProductWorkFlowSummary.totalWorkFlowSummaries){
                                        if(scope.loanProductWorkFlowSummary[i].loanProductWorkFlowSummary.totalWorkFlowSummaries[l].stepName === stepName){
                                            isTotalDataFound = true;
                                            var noOfCount = scope.loanProductWorkFlowSummary[i].loanProductWorkFlowSummary.totalWorkFlowSummaries[l].noOfCount;
                                            noOfCount += office.workFlowSummaries[k].noOfCount;
                                            scope.loanProductWorkFlowSummary[i].loanProductWorkFlowSummary.totalWorkFlowSummaries[l].noOfCount = noOfCount;
                                            break;
                                        }
                                    }
                                    if(isTotalDataFound == false){
                                        var totalWorkFlowSummary = {};
                                        totalWorkFlowSummary.stepName = stepName;
                                        totalWorkFlowSummary.noOfCount = office.workFlowSummaries[k].noOfCount;
                                        scope.loanProductWorkFlowSummary[i].loanProductWorkFlowSummary.totalWorkFlowSummaries.push(totalWorkFlowSummary);
                                    }
                                }
                            }
                        }
                    }
                });
            };

            scope.getWorkFlowTaskSummary();

            resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
                scope.loanproducts = data;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

            scope.constructIndividualStepSummaryDetails = function(loanProductIndex,officeIndex,workFlowIndex) {
                var loanProductObj = scope.loanProductWorkFlowSummary[loanProductIndex];
                var officeObj = loanProductObj.loanProductWorkFlowSummary.offices[officeIndex];
                var workFlowSummaryObj = officeObj.workFlowSummaries[workFlowIndex];
                var stepSummaries = officeObj.workFlowSummaries[workFlowIndex].stepSummaries;
                var html = "";
                if(stepSummaries.length > 0){
                    html += '<div class="modal-header silver">';
                    html += '<h3 class="bolder">';
                    html += workFlowSummaryObj.stepName;
                    html += '</h3>';
                    html += '</div>';
                    html += '<div class="modal-body "><api-validate></api-validate><br>';
                    html += '<table class="table">';
                    html += '<thead>';
                    html += '<tr class="graybg">';
                    html += '<th>Status</th>';
                    html += '<th>Total Count</th>';
                    html += '</tr>';
                    html += '</thead>';
                    html += '<tbody>';
                    var data = "";
                    for(var i in stepSummaries){
                        if(stepSummaries[i].stepStatus !== 'INACTIVE'){
                            html += '<tr>';
                            html += '<td>';
                            html += stepSummaries[i].stepStatus;
                            html += '</td>';
                            html += '<td>';
                            html += stepSummaries[i].noOfCount;
                            html += '</td>';
                            html += '</tr>';

                            data += stepSummaries[i].stepStatus + " : " + stepSummaries[i].noOfCount + " ,";
                        }

                    }
                    html += '</tbody>';
                    html += '</table>';
                    html += '</div>';

                    if(data != ""){
                        scope.loanProductWorkFlowSummary[loanProductIndex].loanProductWorkFlowSummary.offices[officeIndex].workFlowSummaries[workFlowIndex].stepSummaryData = data;
                    }
                }
            };
        }
    });
    mifosX.ng.application.controller('WorkFlowStepDashboardController', ['$scope', 'ResourceFactory','$location','$modal', mifosX.controllers.WorkFlowStepDashboardController]).run(function ($log) {
        $log.info("WorkFlowStepDashboardController initialized");
    });
}(mifosX.controllers || {}));