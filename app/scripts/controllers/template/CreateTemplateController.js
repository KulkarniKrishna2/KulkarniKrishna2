/*global mifosX _  CKEDITOR */
(function (module) {
    mifosX.controllers = _.extend(module, {
        CreateTemplateController: function (scope, resourceFactory, location, $rootScope) {
            scope.mappers = [];
            scope.formData = {};
            resourceFactory.templateResource.getTemplateDetails({resourceType: 'template'}, function (data) {
                scope.template = data;
                scope.advanceOption = 'false';
                scope.oneAtATime = 'true';
                scope.formData.entity = data.entities[0].id;
                scope.formData.type = data.types[0].id;
                scope.templateKeyEntity = "Client";
                scope.clientKeys();
                scope.mappers.push({
                    mappersorder: 0,
                    mapperskey: "client",
                    mappersvalue: "clients/{{clientId}}",
                    defaultAddIcon: 'true'
                });
            });

            scope.clientKeys = function () {
                scope.clientTemplateKeys = ["{{client.accountNo}}", "{{client.status.value}}",
                    "{{client.displayName}}", "{{client.officeName}}"];
                scope.groupTemplateKeys = ["{{#client.groups }}{{name}}{{/client.groups}}","{{#client.groups }}{{accountNo}}{{/client.groups}}"];
                scope.templateEntity = [
                    {"entityName": "Client",
                        "templateKeys": scope.clientTemplateKeys
                    },
                    {"entityName": "Group",
                        "templateKeys": scope.groupTemplateKeys
                    }

                ];
                CKEDITOR.instances.templateeditor.setData('');
            };

            scope.loanKeys = function () {
                CKEDITOR.instances.templateeditor.setData('');
                scope.loanTemplateKeys = ["{{loan.accountNo}}", "{{loan.status.value}}", "{{loan.loanProductId}}",
                    "{{loan.loanProductName}}", "{{loan.loanProductDescription}}"];
                scope.repaymentTemplateKeys = ["{{loan.repaymentSchedule.loanTermInDays}}", "{{loan.repaymentSchedule.totalPrincipalDisbursed}}",
                    "{{loan.repaymentSchedule.totalPrincipalExpected}}", "{{loan.repaymentSchedule.totalPrincipalPaid}}",
                    "{{loan.repaymentSchedule.totalInterestCharged}}", "{{loan.repaymentSchedule.totalFeeChargesCharged}}",
                    "{{loan.repaymentSchedule.totalPenaltyChargesCharged}}", "{{loan.repaymentSchedule.totalWaived}}",
                    "{{loan.repaymentSchedule.totalWrittenOff}}", "{{loan.repaymentSchedule.totalRepaymentExpected}}",
                    "{{loan.repaymentSchedule.totalRepayment}}", "{{loan.repaymentSchedule.totalPaidInAdvance}}",
                    "{{loan.repaymentSchedule.totalPaidLate}}", "{{loan.repaymentSchedule.totalOutstanding}}"];
                scope.templateEntity = [
                    {"entityName": "Loan",
                        "templateKeys": scope.loanTemplateKeys
                    },
                    {"entityName": "Repayment Schedule",
                        "templateKeys": scope.repaymentTemplateKeys
                    }
                ];
            };

            scope.entityChange = function (entityId) {
                scope.mappers.splice(0, 1);
                if (entityId !== 0) {
                    scope.mappers.push({
                        mappersorder: 0,
                        mapperskey: "loan",
                        mappersvalue: "loans/{{loanId}}?associations=all",
                        defaultAddIcon: 'true'
                    });
                    scope.loanKeys();
                    scope.templateKeyEntity = "Loan";
                } else {
                    scope.templateKeyEntity = "Client";
                    scope.mappers.push({
                        mappersorder: 0,
                        mapperskey: "client",
                        mappersvalue: "clients/{{clientId}}",
                        defaultAddIcon: 'true'
                    });
                    scope.clientKeys();
                }
            };

            scope.templateKeySelected = function (templateKey) {
                CKEDITOR.instances.templateeditor.insertText(templateKey);
            };

            scope.addMapperKeyValue = function () {
                scope.mappers.push({
                    mappersorder: scope.mappers.length,
                    mapperskey: "",
                    mappersvalue: ""
                });
            };

            scope.deleteMapperKeyValue = function (index) {
                scope.mappers.splice(index, 1);
            };

            scope.advanceOptionClick = function () {
                if (scope.advanceOption == 'false') {
                    scope.advanceOption = 'true';
                } else {
                    scope.advanceOption = 'false';
                }
            };

            scope.submit = function () {
                for (var i in scope.mappers) {
                    delete scope.mappers[i].defaultAddIcon;
                }
                this.formData.mappers = scope.mappers;
                this.formData.text = CKEDITOR.instances.templateeditor.getData();
                resourceFactory.templateResource.save(this.formData, function (data) {
                    location.path('/viewtemplate/' + data.resourceId);
                });
            };


        }
    });
    mifosX.ng.application.controller('CreateTemplateController', ['$scope', 'ResourceFactory', '$location', '$rootScope', mifosX.controllers.CreateTemplateController]).run(function ($log) {
        $log.info("CreateTemplateController initialized");
    });
}(mifosX.controllers || {}));
