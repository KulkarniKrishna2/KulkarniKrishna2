(function (module) {
    mifosX.controllers = _.extend(module, {
        groupmembersActivityController: function ($q, $controller, scope, resourceFactory, location, dateFilter, http, routeParams, API_VERSION, $upload, $rootScope) {
            angular.extend(this, $controller('defaultActivityController', {$scope: scope}));
            scope.formData = {};
            scope.viewSummary=true;
            scope.viewAddMember = false;


            function populateDetails(){
                resourceFactory.groupResource.get({groupId: scope.groupId, associations: 'clientMembers'}, function (data) {
                    scope.group = data;
                    $rootScope.groupNameDataParameter = data.name;
                    $rootScope.groupName = data.centerName;
                    $rootScope.groupOfficeId = data.officeId;
                    $rootScope.groupOfficeName = data.officeName;
                    scope.isClosedGroup = scope.group.status.value == 'Closed';
                    showSummaryView();
                });
            }

            scope.showAddMemberView = function () {
                scope.viewSummary=false;
                scope.viewAddMember = true;
            };

            function showSummaryView() {
                scope.viewSummary=true;
                scope.viewAddMember = false;
            }

            scope.addMember = function () {
                if(scope.client != undefined){
                    scope.associate = {};
                    scope.associate.clientMembers = [];
                    scope.associate.clientMembers[0] = scope.client.id;
                    resourceFactory.groupResource.save({groupId: scope.groupId, command: 'associateClients'}, scope.associate, function (data) {
                        scope.client = undefined;
                        showSummaryView();
                        populateDetails();
                    });
                }
            };

            scope.delete = function () {
                resourceFactory.bankAccountDetailResource.delete({entityType: scope.entityType,entityId: scope.entityId}, function (data) {
                    populateDetails();
                    scope.createDetail = true;
                });
            };

            scope.cancel = function (){
                showSummaryView();
            };

            scope.viewClient = function (item) {
                scope.client = item;
            };

            scope.clientOptions = function(value){
                var deferred = $q.defer();
                resourceFactory.clientResource.getAllClientsWithoutLimit({displayName: value, orderBy : 'displayName', officeId : scope.group.officeId,
                    sortOrder : 'ASC', orphansOnly : true}, function (data) {
                    deferred.resolve(data.pageItems);
                });
                return deferred.promise;
            };

            function initTask() {
                scope.groupId = scope.taskconfig['groupId'];
                populateDetails();
            };

            initTask();
        }
    });
    mifosX.ng.application.controller('groupmembersActivityController', ['$q','$controller','$scope', 'ResourceFactory', '$location', 'dateFilter', '$http', '$routeParams', 'API_VERSION', '$upload', '$rootScope', mifosX.controllers.groupmembersActivityController]).run(function ($log) {
        $log.info("groupmembersActivityController initialized");
    });
}(mifosX.controllers || {}));
