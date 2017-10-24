(function (module) {
    mifosX.controllers = _.extend(module, {
        WorkFlowStepDashboardController: function (scope, resourceFactory, location,$modal) {
            scope.entityType = undefined;
            scope.entityId = undefined;
            scope.officeId = undefined;
            scope.entityTypeArray = [];
            scope.isEntityPresent = false;

            scope.getWorkFlowTaskSummary = function() {
                scope.products = [];
                resourceFactory.workFlowStepSummaryResource.get({entityType: scope.entityType,entityId: scope.entityId,
                    officeId: scope.officeId}, function(data) {
                scope.WorkFlowSummary = data;
                for (var i in scope.WorkFlowSummary) {
                    if (scope.entityTypeArray.length > 0) {
                            scope.isEntityPresent = false;
                        for (var j in scope.entityTypeArray) {
                            if (scope.entityTypeArray[j] == scope.WorkFlowSummary[i].entityType) {
                                scope.isEntityPresent = true;
                                break;
                            }
                        }
                    }
                    if (!scope.isEntityPresent) {
                        if (scope.entityTypeArray.length < scope.WorkFlowSummary.length) {
                            scope.entityTypeArray.push(scope.WorkFlowSummary[i].entityType);
                        }
                    }
                    scope.workflows = scope.WorkFlowSummary[i].workflowEntities;
                    if (scope.workflows) {
                        for (var p in scope.workflows) {
                            scope.ProductWorkFlowSummary = scope.workflows[p];
                            if (scope.ProductWorkFlowSummary && scope.ProductWorkFlowSummary.offices) {
                                scope.ProductWorkFlowSummary.totalWorkFlowSummaries = [];
                                for (var j in scope.ProductWorkFlowSummary.offices) {
                                    var office = scope.ProductWorkFlowSummary.offices[j];
                                    for (var k in office.workFlowSummaries) {
                                        var stepName = office.workFlowSummaries[k].stepName;
                                        var isTotalDataFound = false;
                                        for (var l in scope.ProductWorkFlowSummary.totalWorkFlowSummaries) {
                                            if (scope.ProductWorkFlowSummary.totalWorkFlowSummaries[l].stepName === stepName) {
                                                isTotalDataFound = true;
                                                var noOfCount = scope.ProductWorkFlowSummary.totalWorkFlowSummaries[l].noOfCount;
                                                noOfCount = office.workFlowSummaries[k].noOfCount;
                                                scope.ProductWorkFlowSummary.totalWorkFlowSummaries[l].noOfCount = noOfCount;
                                                break;
                                            }
                                        }
                                        if (isTotalDataFound == false) {
                                            var totalWorkFlowSummary = {};
                                            totalWorkFlowSummary.stepName = stepName;
                                            totalWorkFlowSummary.noOfCount = office.workFlowSummaries[k].noOfCount;
                                            scope.ProductWorkFlowSummary.totalWorkFlowSummaries.push(totalWorkFlowSummary);
                                        }
                                    }
                                }

                            }
                            scope.products.push(scope.ProductWorkFlowSummary);
                        }
                    }
                }
            });
        };

        scope.getWorkFlowTaskSummary();

        scope.goTotasks = function(productIndex,officeIndex,workFlowIndex){
            var productObj = scope.products[productIndex];
            var parentConfigId = productObj.entityId;
            var officeObj = productObj.offices[officeIndex];
            var officeId = officeObj.id;
            var childConfigId = officeObj.workFlowSummaries[workFlowIndex].stepConfigId;
            location.path('/tasklist/' + parentConfigId + "/" + officeId + "/" + childConfigId);
        }


            resourceFactory.loanProductResource.getAllLoanProducts(function (data) {
                scope.loanproducts = data;
            });

            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
            });

        scope.constructIndividualStepSummaryDetails = function(productIndex,officeIndex,workFlowIndex) {
                var productObj  = scope.products[productIndex];
                var officeObj = productObj.offices[officeIndex];
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
                        if(stepSummaries[i].taskStatus !== 'INACTIVE'){
                            html += '<tr>';
                            html += '<td>';
                            html += stepSummaries[i].taskStatus;
                            html += '</td>';
                            html += '<td>';
                            html += stepSummaries[i].noOfCount;
                            html += '</td>';
                            html += '</tr>';

                            data += stepSummaries[i].taskStatus + " : " + stepSummaries[i].noOfCount + " ,";
                        }

                    }
                    html += '</tbody>';
                    html += '</table>';
                    html += '</div>';

                    if(data != ""){
                        scope.products[productIndex].offices[officeIndex].workFlowSummaries[workFlowIndex].stepSummaryData = data;
                    }
                }
            };
        }
    });
    mifosX.ng.application.controller('WorkFlowStepDashboardController', ['$scope', 'ResourceFactory','$location','$modal', mifosX.controllers.WorkFlowStepDashboardController]).run(function ($log) {
        $log.info("WorkFlowStepDashboardController initialized");
    });
}(mifosX.controllers || {}));