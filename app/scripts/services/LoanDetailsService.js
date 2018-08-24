(function (module) {
    mifosX.services = _.extend(module, {
        LoanDetailsService: function () {
            this.getStatusCode = function (loandetails) {
                if (loandetails && loandetails.status) {
                    if (loandetails.subStatus) {
                        return loandetails.status.code + "." + loandetails.subStatus.code;
                    } else {
                        return loandetails.status.code;
                    }
                }
            };
        }
    });
    mifosX.ng.services.service('LoanDetailsService', [mifosX.services.LoanDetailsService]).run(function ($log) {
        $log.info("LoanDetailsService initialized");
    });
}(mifosX.services || {}));


