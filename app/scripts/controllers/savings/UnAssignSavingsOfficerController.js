(function (module) {
    mifosX.controllers = _.extend(module, {
        UnAssignSavingsOfficerController: function (scope, resourceFactory, routeParams, location, dateFilter) {

            scope.loanOfficers = [];
            scope.formData = {};
            scope.staffData = {};
            scope.accountId = routeParams.id;
            scope.depositType ;

            resourceFactory.savingsResource.get({accountId: routeParams.id, template: 'true'}, function (data) {
                scope.data = data;
                scope.depositType = data.depositType.id;
            });

            scope.cancel = function () {
                if(scope.data.depositType.id == 100)
                    location.path('/viewsavingaccount/' + scope.accountId);
                else if(scope.data.depositType.id == 200)
                    location.path('/viewfixeddepositaccount/' + scope.accountId);
                else if(scope.data.depositType.id == 300)
                    location.path('/viewrecurringdepositaccount/' + scope.accountId);
            };

            scope.submit = function () {
                scope.staffData.staffId = scope.formData.fieldOfficerId;
                this.formData.locale = scope.optlang.code;
                this.formData.dateFormat = scope.df;
                this.formData.unassignedDate = dateFilter(this.formData.unassignedDate, scope.df);
                resourceFactory.savingsResource.save({accountId: routeParams.id, command:'unassignSavingsOfficer'}, this.formData, function (data) {
                    if(scope.depositType == 100){
                        location.path('/viewsavingaccount/' + scope.accountId);}
                    else if(scope.depositType == 200){
                        location.path('/viewfixeddepositaccount/' + scope.accountId);}
                    else if(scope.depositType == 300){
                        location.path('/viewrecurringdepositaccount/' + scope.accountId);}
                });

            };

        }
    });
    mifosX.ng.application.controller('UnAssignSavingsOfficerController', ['$scope', 'ResourceFactory', '$routeParams', '$location', 'dateFilter', mifosX.controllers.UnAssignSavingsOfficerController]).run(function ($log) {
        $log.info("UnAssignSavingsOfficerController initialized");
    });
}(mifosX.controllers || {}));

