(function (module) {
    mifosX.controllers = _.extend(module, {
        EditLoanPurposeController: function (scope, routeParams, resourceFactory, location, $modal, route) {

            scope.entityType = routeParams.entityType;
            scope.formData = {};
            scope.loanPurposeGroupDatas = [];
            scope.categoryOptions = [];
            scope.classificationOptions = [];

            resourceFactory.loanPurposeGroupTemplateResource.get(function (dataType) {
                scope.categoryOptions = dataType.loanPurposeGroupTypeOptions;
                resourceFactory.loanPurposesTemplate.get(function (data) {
                    scope.loanPurposeGroupDatas = data.loanPurposeGroupDatas;
                    resourceFactory.loanPurposeResource.get({
                            loanPurposeId: routeParams.id,
                            isFetchLoanPurposeGroupDatas: true
                        },
                        function (data) {
                            scope.formData = data;
                            if (!_.isUndefined(scope.formData.loanPurposeGroupDatas)) {
                                for (var i = 0; i < scope.formData.loanPurposeGroupDatas.length; i++) {
                                    scope.categoryId = scope.formData.loanPurposeGroupDatas[i].loanPurposeGroupType.id;
                                    scope.populateClassificationOption();
                                    scope.classificationId = scope.formData.loanPurposeGroupDatas[i].id;
                                }
                                delete scope.formData.loanPurposeGroupDatas;
                            }
                        });
                });
            });

            scope.populateClassificationOption = function () {
                scope.classificationOptions = [];
                scope.classificationId = undefined;
                for(var i in scope.loanPurposeGroupDatas){
                    if(scope.loanPurposeGroupDatas[i].loanPurposeGroupType.id == scope.categoryId){
                        scope.classificationOptions.push(scope.loanPurposeGroupDatas[i]);
                    }
                }
            };

            scope.submit = function () {
                scope.formData.loanPurposeGroupIds = [];
                if (scope.formData) {
                    delete scope.formData.id;
                }
                if (scope.classificationId != null && !angular.isUndefined(scope.classificationId)) {
                    scope.formData.loanPurposeGroupIds.push(scope.classificationId);
                }
                if (scope.formData.loanPurposeGroupIds.length == 0) {
                    delete scope.formData.loanPurposeGroupIds;
                }
                if(scope.formData.systemCode){
                    delete scope.formData.systemCode;
                }
                scope.formData.locale = "en";
                resourceFactory.loanPurposeResource.update({loanPurposeId: routeParams.id},
                    scope.formData, function (data) {
                        location.path('/loanpurpose/');
                    });
            };
        }
    });
    mifosX.ng.application.controller('EditLoanPurposeController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$modal', '$route', mifosX.controllers.EditLoanPurposeController]).run(function ($log) {
        $log.info("EditLoanPurposeController initialized");
    });
}(mifosX.controllers || {}));
