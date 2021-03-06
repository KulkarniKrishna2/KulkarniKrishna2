/**
 * Created by conflux37 on 8/31/2016.
 */
(function (module) {
    mifosX.controllers = _.extend(module, {
        EditTransactionAuthentication: function (scope, routeParams, resourceFactory, location, $modal, route) {
            /*
             scope.formData = {};*/
            scope.transactionAuthenticationAppliesTo = [];
            scope.paymentOptions = [];
            scope.loanTransactionTypeOptions = [];
            scope.savingsTransactionTypeoptions = [];
            scope.availableAuthenticationServices = [];
            scope.paymentOptions = [];
            scope.transactionTypeOptions = [];
            scope.productOptions = [];
            scope.productTypeOptions = [];
            scope.identificationTypeOptions =[];



            resourceFactory.transactionAuthenticationResource.getByTransactionAuthenticationId({transactionAuthenticationId: routeParams.id}, function (data) {
                scope.formData = {
                    portfolioTypeId: data.portfolioTypeId,
                    transactionTypeId: data.transactionTypeId,
                    paymentTypeId: data.paymentTypeId,
                    amount : data.amount,
                    authenticationTypeId: data.authenticationTypeId,
                    productId: data.productId,
                    identificationTypeId : data.identificationType.id
                };

                resourceFactory.transactionAuthenticationTemplateResource.getTemplate({},function(data) {
                    scope.transactionAuthenticationAppliesTo = data.transactionAuthenticationAppliesTo;
                    scope.paymentOptions = data.paymentOptions;
                    scope.loanTransactionTypeOptions = data.loanTransactionTypeOptions;
                    scope.savingsTransactionTypeoptions = data.savingsTransactionTypeoptions;
                    scope.availableAuthenticationServices = data.availableAuthenticationServices;
                    scope.transactionId = scope.formData.transactionTypeId;
                    scope.productOptions = data.productOptions;
                    scope.identificationTypeOptions = data.identificationTypeOptions;

                    Object.keys(scope.transactionAuthenticationAppliesTo).forEach(function(key){
                        console.log(key, scope.transactionAuthenticationAppliesTo[key]);
                        var obj = scope.transactionAuthenticationAppliesTo[key];
                        if(scope.formData.portfolioTypeId == obj.id ) {
                            if (obj.value == "Loans") {
                                scope.transactionTypeOptions = scope.loanTransactionTypeOptions;
                                scope.productTypeOptions = scope.productOptions;
                            }
                            if(obj.value == "Savings"){
                                scope.transactionTypeOptions = scope.savingsTransactionTypeoptions;
                                scope.productTypeOptions = [];
                            }
                        }
                    });
                });

            });

            scope.transactionTypeAppliesToSelected = function (transactionTypeAppliesTo) {
                switch(transactionTypeAppliesTo) {
                    case 1:
                        scope.transactionTypeOptions = scope.loanTransactionTypeOptions;
                        scope.productTypeOptions = scope.productOptions;
                        break ;
                    case 2:
                        scope.transactionTypeOptions = scope.savingsTransactionTypeoptions;
                        scope.productTypeOptions = [];
                        break ;
                }
            }

            scope.submit = function () {
                this.formData.locale = scope.optlang.code;
                resourceFactory.transactionAuthenticationResource.update({transactionAuthenticationId: routeParams.id},this.formData, function (data) {
                    location.path('/viewtransactionauthentication/');
                });
            };

        }
    });
    mifosX.ng.application.controller('EditTransactionAuthentication', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.EditTransactionAuthentication]).run(function ($log) {
        $log.info("EditTransactionAuthentication initialized");
    });
}(mifosX.controllers || {}));
