(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewAllCollectionsController: function (scope,  $q, $timeout, location, resourceFactory, dateFilter, paginatorUsingOffsetService, route, $modal, $rootScope){
            scope.offices = [];
            scope.centers = [];
            scope.groups = [];
            scope.searchConditions = {};
            scope.requestoffset=0;
            scope.limit = 10;
            scope.isSearch = false;
            scope.init = function(){
                resourceFactory.collectionSheetResource.getAllCollections({
                    offset: scope.requestoffset,
                    limit: scope.limit,
                    isTemplate: 'true'
                }, function(data){
                    scope.allCollectionsData = data;
                    for(var i in data){
                        scope.allCollectionsData[i].meetingDate = dateFilter(new Date(data[i].meetingDate),scope.df);
                }
                });
            }
            scope.init();
            scope.collectionsDataRequests = function(){
                scope.isSearch = true;
                resourceFactory.collectionSheetResource.getAllCollections({
                    searchConditions: scope.searchConditions,
                    offset: scope.requestoffset,
                    limit: scope.limit,
                    isTemplate: 'false'
                },function(data){
                    scope.allCollectionsData = data;
                    for(var i in data){
                        scope.allCollectionsData[i].meetingDate = dateFilter(new Date(data[i].meetingDate),scope.df);
                    }
                });
            }
            
            resourceFactory.officeResource.getAllOffices(function (data) {
                scope.offices = data;
                if (scope.currentSession.user.officeId) {
                    for (var i = 0; i < scope.offices.length; i++) {
                        if (scope.offices[i].id === scope.currentSession.user.officeId) {
                            scope.officeId = scope.offices[i].id;
                            break;
                        }
                    }
                    scope.officeSelected(scope.officeId);
                }
            });

            scope.officeSelected = function (officeId) {
                scope.officeId = officeId;
                scope.searchConditions.officeId = officeId;
                if (officeId) {
                    var searchConditions = {};
                    searchConditions.officeId = officeId;
                    resourceFactory.employeeResource.getAllEmployees({officeId: scope.officeId, status: 'active'}, function (loanOfficerData) {
                        scope.loanOfficers = loanOfficerData.pageItems;
                    });
                    resourceFactory.centerSearchResource.getAllCenters({searchConditions: searchConditions, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (centersData) {
                        scope.centers = centersData;
                    });
                    resourceFactory.groupResource.getAllGroups({officeId: scope.officeId,status:'active', orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (groupsData) {
                        scope.groups = groupsData;
                    });
                }
            };

            scope.loanOfficerSelected = function (loanOfficerId) {
                if (loanOfficerId) {
                    var searchConditions = {};
                    searchConditions.officeId = scope.searchConditions.officeId;
                    searchConditions.staffId = loanOfficerId;
                    resourceFactory.centerSearchResource.getAllCenters({searchConditions: searchConditions, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.centers = data;
                    });
    
                    resourceFactory.groupResource.getAllGroups({officeId: scope.officeId,status:'active', staffId: loanOfficerId, orderBy: 'name', sortOrder: 'ASC', limit: -1}, function (data) {
                        scope.groups = data;
                    });
                } else {
                    scope.centers = '';
                    scope.groups = '';
                }
            };
    
            scope.centerSelected = function (centerId) {
                if (centerId) {
                    scope.collectionsheetdata = "";
                    resourceFactory.centerResource.get({'centerId': centerId, associations: 'groupMembers,collectionMeetingCalendar' }, function (data) {
                        scope.centerdetails = data;
                        if (data.groupMembers.length > 0) {
                            for(var i=0;i<data.groupMembers.length;i++){
                                if(data.groupMembers[i].status.code== "groupingStatusType.closed" || data.groupMembers[i].status.code== "groupingStatusType.rejected"){
                                    data.groupMembers.splice(i,1);
                                }                         
                            }  
                            scope.groups = data.groupMembers;                      
                        }
    
                        if (data.collectionMeetingCalendar && data.collectionMeetingCalendar.recentEligibleMeetingDate) {
                            if (!scope.date.transactionDate) {
                                scope.date.transactionDate = new Date(dateFilter(data.collectionMeetingCalendar.recentEligibleMeetingDate, scope.df));
                            }
                        }
                        if (data.collectionMeetingCalendar) {
                            scope.calendarId = data.collectionMeetingCalendar.id;
                        }
                        centerOrGroupResource = "centerResource";
                    });
                }
            };
    
            scope.groupSelected = function (groupId) {
                if (groupId) {
                    scope.collectionsheetdata = "";
                    resourceFactory.groupResource.get({'groupId': groupId, associations: 'collectionMeetingCalendar'}, function (data) {
                    scope.groupdetails = data.pageItems;
                        if (data.collectionMeetingCalendar) {
                            scope.calendarId = data.collectionMeetingCalendar.id;
                        }
                        if (data.collectionMeetingCalendar && data.collectionMeetingCalendar.recentEligibleMeetingDate) {
                            if (!scope.date.transactionDate) {
                                scope.date.transactionDate = new Date(dateFilter(data.collectionMeetingCalendar.recentEligibleMeetingDate, scope.df));
    
                            }
                        }
                        centerOrGroupResource = "groupResource";
                    });
                } else if (scope.centerId) {
                    centerOrGroupResource = "centerResource";
                }
            };
    
            scope.previousCollectionsDataRequest= function(){
                if(scope.requestoffset != 0){
                    scope.requestoffset = scope.requestoffset - scope.limit;
                    if(scope.requestoffset <= 0){
                        scope.requestoffset = 0;
                    }
                    if(scope.isSearch){
                        scope.collectionsDataRequests();
                    }else{
                        scope.init();
                    }
                }
            } 

            scope.nextCollectionsDataRequest= function(){
                if(scope.allCollectionsData.length == scope.limit){
                    scope.requestoffset = scope.requestoffset + scope.limit;
                    if(scope.isSearch){
                        scope.collectionsDataRequests();
                    }else{
                        scope.init();
                    }
                }
            } 

            scope.routeToTransactions = function(collectionSheetId){
                location.path('/viewallcollections/'+collectionSheetId);
            }  
        }
    });
    mifosX.ng.application.controller('ViewAllCollectionsController', ['$scope', '$q', '$timeout', '$location', 'ResourceFactory', 'dateFilter', 'PaginatorUsingOffsetService', '$route', '$modal', '$rootScope', mifosX.controllers.ViewAllCollectionsController]).run(function ($log) {
        $log.info("ViewAllCollectionsController initialized");
    });
}(mifosX.controllers || {}));