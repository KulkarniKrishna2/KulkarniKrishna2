(function (module) {
    mifosX.controllers = _.extend(module, {
        clientLimitsManagementActivityController: function ($controller, scope, resourceFactory, API_VERSION, location, http, routeParams, API_VERSION, $upload, $rootScope, commonUtilService, popUpUtilService) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            function initTask(){
                scope.clientId = scope.taskconfig['clientId'];
                getClientIdentifiers();
            };
            initTask();
            scope.displayAddButton = true;
            scope.isUpdate = false;
            scope.formData = {};
            scope.documenttypes = [];
            scope.statusTypes =[];
            function getClientIdentifiers() {
                resourceFactory.clientIdenfierTemplateResource.get({clientId: scope.clientId}, function (data) {
                    scope.documenttypes = data.allowedDocumentTypes;
                    scope.formData.documentTypeId = data.allowedDocumentTypes[0].id;
                    scope.statusTypes = data.clientIdentifierStatusOptions;
                });
            };

            // Newly Added.
            scope.getClientLimits = function () {
                // scope.clientId = routeParams.id;
                resourceFactory.clientLimitsResource.get({clientId: scope.clientId}, function (data) {
                           scope.clientLimits = data;
                           if(!_.isUndefined(scope.clientLimits.superlimit) && scope.clientLimits.superlimit != 0){
                              scope.displayAddButton = false;
                              scope.isUpdate = true;
                           }
                       });
               }

               scope.getClientLimits();

               scope.createSuperLimit = function() {
                var templateUrl = 'views/clients/addsuperlimit.html';
                var controller = 'AddSuperLimitController';
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
                scope.submitLimit() ? scope.displayAddButton = false : scope.displayAddButton = true;
            }

            scope.editSuperLimit = function() {
                var templateUrl = 'views/clients/editwfsuperlimit.html';
                var controller = 'EditWfSuperLimitController';
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.createProductCategoryLimit = function() {
                var templateUrl = 'views/clients/addproductcategorylimit.html';
                var controller = 'AddProductCategoryLimitController';
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.editProductCategoryLimit = function(limitValue) {
                var templateUrl = 'views/clients/editproductcategorylimit.html';
                var controller = 'EditProductCategoryLimitController';
                scope.limitValue = limitValue;
                popUpUtilService.openDefaultScreenPopUp(templateUrl, controller, scope);
            }

            scope.submitLimit = function () {
                scope.entityType = "clients";
                scope.smartformData.locale = scope.optlang.code;
                scope.smartformData.dateFormat = scope.df;
                scope.smartformData.cardNumber = scope.smartCard.cardNumber;
                resourceFactory.smartCardDataResource.update({entityId: routeParams.id, entityType: scope.entityType, command: 'inactivate' },scope.smartformData, function (response) {
                    if(response != null) {
                        route.reload();
                    }
                });
            };


        }
    });
    mifosX.ng.application.controller('clientLimitsManagementActivityController', ['$controller','$scope', 'ResourceFactory', 'API_VERSION', '$location', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', 'CommonUtilService', 'PopUpUtilService', mifosX.controllers.clientLimitsManagementActivityController]).run(function ($log) {
        $log.info("clientLimitsManagementActivityController initialized");
    });
}(mifosX.controllers || {}));