(function (module) {
    mifosX.filters = _.extend(module, {
        StatusLookup: function () {
            return function (input) {

                var cssClassNameLookup = {
                    "true": "statusactive",
                    "false": "statusdeleted",
                    "Active": "statusactive",
                    "loanStatusType.submitted.and.pending.approval": "statuspending",
                    "loanStatusType.approved": "statusApproved",
                    "loanStatusType.active": "statusactive",
                    "loanStatusType.overpaid": "statusoverpaid",
                    "savingsAccountStatusType.submitted.and.pending.approval": "statuspending",
                    "savingsAccountStatusType.approved": "statusApproved",
                    "savingsAccountStatusType.active": "statusactive",
                    "savingsAccountStatusType.activeInactive": "statusactiveoverdue",
                    "savingsAccountStatusType.activeDormant": "statusactiveoverdue",
                    "savingsAccountStatusType.matured": "statusmatured",
                    "loanProduct.active": "statusactive",
                    "clientStatusType.pending": "statuspending",
                    "clientStatusType.closed":"statusclosed",
                    "clientStatusType.rejected":"statusrejected",
                    "clientStatusType.withdraw":"statuswithdraw",
                    "clientStatusType.active": "statusactive",
                    "clientStatusType.submitted.and.pending.approval": "statuspending",
                    "clientStatusTYpe.approved": "statusApproved",
                    "clientStatusType.transfer.in.progress": "statustransferprogress",
                    "clientStatusType.transfer.on.hold": "statustransferonhold",
                    "groupingStatusType.active": "statusactive",
                    "groupingStatusType.pending": "statuspending",
                    "groupingStatusType.submitted.and.pending.approval": "statuspending",
                    "groupingStatusType.approved": "statusApproved",
                    "VillageStatusType.active": "statusactive",
                    "VillageStatusType.pending": "statuspending",
                    "VillageStatusType.submitted.and.pending.approval": "statuspending",
                    "VillageStatusType.approved": "statusApproved",
                    "pledgeStatusType.initiated" : "statusInitiated",
                    "pledgeStatusType.active" : "statusactive",
                    "pledgeStatusType.closed" : "statusclosed",
                    "shareAccountStatusType.submitted.and.pending.approval": "statuspending",
                    "shareAccountStatusType.approved": "statusApproved",
                    "shareAccountStatusType.active": "statusactive",
                    "shareAccountStatusType.rejected": "statusrejected",
                    "purchasedSharesStatusType.applied": "statuspending",
                    "purchasedSharesStatusType.approved": "statusApproved",
                    "purchasedSharesStatusType.rejected": "statusrejected",
                    "loanApplication.created": "statuscreated",
                    "loanApplication.in.approve.stage" : "statuspending",
                    "loanApplication.approved": "statusApproved",
                    "loanApplication.active": "statusactive",
                    "loanApplication.rejected":"statusrejected",
                    "smartCardStatusType.active": "statusactive",
                    "smartCardStatusType.inactive": "statusclosed",
                    "smartCardStatusType.pending" : "statuspending",
                    "CgtStatusType.new" : "statusnew",
                    "CgtStatusType.in.progress" : "statusinprocess",
                    "CgtStatusType.complete" : "statuscompleted",
                    "CgtStatusType.reject" : "statusreject",
                    "bucket5" : "statusbucket5",
                    "bucket4" : "statusbucket4",
                    "bucket3" : "statusbucket3",
                    "bucket2" : "statusbucket2",
                    "bucket1" : "statusbucket1",
                    "eligibilityStatus.tobereviewed": "statuspending",
                    "eligibilityStatus.approved": "statusgood",
                    "eligibilityStatus.rejected": "statusbad",
                    "officeStatus.rejected":"statusrejected",
                    "officeStatus.active": "statusactive",
                    "officeStatus.pending": "statuspending",
                    "districtStatus.rejected":"statusrejected",
                    "districtStatus.active": "statusactive",
                    "districtStatus.pending": "statuspending"
                }

                return cssClassNameLookup[input];
            }
        }
    });
    mifosX.ng.application.filter('StatusLookup', [mifosX.filters.StatusLookup]).run(function ($log) {
        $log.info("StatusLookup filter initialized");
    });
}(mifosX.filters || {}));
