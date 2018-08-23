(function (module) {
    mifosX.directives = _.extend(module, {
        LoanHeaderDetailsDirective: function ($compile) {
            return {
                restrict: 'E',
                require: '?ngmodel',
                link: function (scope, elm, attr, ctrl) {
                    var template = '<div data-ng-show="loandetails" class="span gray-head" style="margin-left:0%;">'
                        + '<span style="margin-left: 10px;font-size:20px">'
                        + '<strong>' + '<i ng-hide="loandetails.inArrears" class="icon-stop {{getStatusCode() | StatusLookup}}"></i>'
                        + '<i ng-show="loandetails.inArrears" class="icon-stop {{getStatusCode() | StatusLookup}}overdue"></i>' + '&nbsp;{{loandetails.loanProductName}}(#{{loandetails.accountNo}})' + '</strong>'
                        + ' ' + '<small>{{loandetails.clientName}}</small>'
                        + '</span></div>';
                    elm.html('').append($compile(template)(scope));
                }
            };
        }
    });
}(mifosX.directives || {}));

mifosX.ng.application.directive("loanHeaderDetails", ['$compile', mifosX.directives.LoanHeaderDetailsDirective]).run(function ($log) {
    $log.info("LoanHeaderDetailsDirective initialized");
});